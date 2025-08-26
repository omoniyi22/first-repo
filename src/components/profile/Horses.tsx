import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ChevronRight, Edit, Trash2, Loader2, House, AlertTriangle, ArrowRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import HorseForm from "./HorseForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHorseLimits } from "@/hooks/useHorseLimits";

interface Horse {
  id: string;
  name: string;
  breed: string;
  age: number;
  sex: string;
  competition_level?: string | null;
  jumping_level?: string | null;
  dressage_type?: string | null;
  dressage_level?: string | null;
  photo_url?: string | null;
  years_owned?: number | null;
  strengths?: string | null;
  weaknesses?: string | null;
  special_notes?: string | null;
  created_at: string;
  updated_at: string;
}

const Horses = () => {
  const { user } = useAuth();
  const [showAddHorseForm, setShowAddHorseForm] = useState(false);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingHorse, setEditingHorse] = useState<Horse | null>(null);
  const [deleteHorseId, setDeleteHorseId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { language } = useLanguage();
  
  // 🎯 ADD HORSE LIMITS HOOK
  const horseLimits = useHorseLimits();

  useEffect(() => {
    if (user) {
      fetchHorses();
    }
  }, [user.id]);

  const fetchHorses = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("horses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setHorses(data || []);
    } catch (error) {
      console.error("Error fetching horses:", error);
      toast({
        title: "Failed to load horses",
        description:
          "There was an error loading your horses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 UPDATED: Check limits before showing add form
  const handleAddHorse = async () => {
    const canAdd = await horseLimits.checkAndEnforce();
    if (canAdd) {
      setShowAddHorseForm(true);
    }
  };

  const handleEditHorse = (horse: Horse) => {
    setEditingHorse(horse);
  };

  const handleDeleteClick = (horseId: string) => {
    setDeleteHorseId(horseId);
    setShowConfirmDelete(true);
  };

  const handleDeleteHorse = async () => {
    if (!deleteHorseId) return;

    try {
      setIsDeleting(true);

      const { error } = await supabase
        .from("horses")
        .delete()
        .eq("id", deleteHorseId)
        .eq("user_id", user?.id);

      if (error) {
        throw error;
      }

      setHorses(horses.filter((horse) => horse.id !== deleteHorseId));
      
      // 🎯 REFRESH LIMITS AFTER DELETION
      horseLimits.refreshLimits();

      toast({
        title: "Horse deleted",
        description: "Horse has been successfully deleted.",
      });
    } catch (error: any) {
      console.error("Error deleting horse:", error);
      toast({
        title: "Delete failed",
        description:
          error.message || "Failed to delete horse. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowConfirmDelete(false);
      setDeleteHorseId(null);
      setIsDeleting(false);
    }
  };

  const handleFormComplete = () => {
    setShowAddHorseForm(false);
    setEditingHorse(null);
    fetchHorses();
    // 🎯 REFRESH LIMITS AFTER ADDING/EDITING
    horseLimits.refreshLimits();
  };

  return (
    <div>
      {/* 🎯 NEW: Horse Limits Status Card */}
      {!horseLimits.loading && (
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <House className="h-5 w-5 text-purple-600" />
                <span className="text-lg">
                  {language === "en" ? "Horse Management" : "Gestión de Caballos"}
                </span>
              </div>
              <Badge variant="outline" className="border-purple-300 text-purple-700">
                {horseLimits.planName} {language === "en" ? "Plan" : "Plan"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {language === "en" ? "Current Horses" : "Caballos Actuales"}
                </p>
                <p className="text-2xl font-bold text-purple-700">{horseLimits.currentHorses}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {language === "en" ? "Plan Limit" : "Límite del Plan"}
                </p>
                <p className="text-2xl font-bold text-gray-700">
                  {horseLimits.maxHorses === 'unlimited' ? '∞' : horseLimits.maxHorses}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {language === "en" ? "Remaining" : "Restantes"}
                </p>
                <p className={`text-2xl font-bold ${
                  horseLimits.canAddHorse ? 'text-green-600' : 'text-red-600'
                }`}>
                  {horseLimits.remainingSlots === 'unlimited' ? '∞' : horseLimits.remainingSlots}
                </p>
              </div>
            </div>

            {/* Progress Bar (only for limited plans) */}
            {horseLimits.maxHorses !== 'unlimited' && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{language === "en" ? "Usage" : "Uso"}</span>
                  <span>{Math.round((horseLimits.currentHorses / (horseLimits.maxHorses as number)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      horseLimits.canAddHorse ? 'bg-purple-500' : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min((horseLimits.currentHorses / (horseLimits.maxHorses as number)) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Upgrade prompt if at limit */}
            {!horseLimits.canAddHorse && (
              <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800">
                    {language === "en" ? "Horse Limit Reached" : "Límite de Caballos Alcanzado"}
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    {language === "en" 
                      ? `You've reached your horse limit (${horseLimits.currentHorses}/${horseLimits.maxHorses}). Upgrade your plan to add more horses.`
                      : `Has alcanzado tu límite de caballos (${horseLimits.currentHorses}/${horseLimits.maxHorses}). Actualiza tu plan para agregar más caballos.`
                    }
                  </p>
                  <Button
                    size="sm"
                    className="mt-2 bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={() => window.location.href = '/pricing'}
                  >
                    {language === "en" ? "Upgrade Plan" : "Actualizar Plan"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif font-semibold text-gray-900">
          {language === "en" ? "My Horses" : "Mis caballos"}
        </h2>
        
        {/* 🎯 UPDATED: Conditional Add Horse Button */}
        {horseLimits.canAddHorse ? (
          <Button
            onClick={handleAddHorse}
            className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800"
            disabled={horseLimits.loading}
          >
            <Plus size={16} />
            <span>{language === "en" ? "Add Horse" : "Añadir caballo"}</span>
          </Button>
        ) : (
          <Button
            onClick={() => window.location.href = '/pricing'}
            variant="outline"
            className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <Plus size={16} />
            <span>{language === "en" ? "Upgrade to Add More" : "Actualizar para Agregar Más"}</span>
          </Button>
        )}
      </div>

      {/* Loading state */}
      {(isLoading || horseLimits.loading) && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !horseLimits.loading && horses.length === 0 && (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <House className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4 text-center">
              {language === "en"
                ? "You haven't added any horses yet."
                : "Aún no has añadido ningún caballo."}
            </p>
            {horseLimits.canAddHorse ? (
              <Button
                onClick={handleAddHorse}
                variant="outline"
                className="border-purple-300 text-purple-700"
              >
                <Plus size={16} className="mr-2" />
                {language === "en"
                  ? "Add Your First Horse"
                  : "Añade tu primer caballo"}
              </Button>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">
                  {language === "en"
                    ? "Upgrade your plan to start adding horses."
                    : "Actualiza tu plan para comenzar a agregar caballos."}
                </p>
                <Button
                  onClick={() => window.location.href = '/pricing'}
                  className="bg-purple-700 hover:bg-purple-800"
                >
                  {language === "en" ? "View Plans" : "Ver Planes"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Horses grid */}
      {!isLoading && !horseLimits.loading && horses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {horses.map((horse) => (
            <Dialog key={horse.id}>
              <DialogTrigger asChild>
                <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                  <div className="h-40 overflow-hidden bg-gray-100">
                    {horse.photo_url ? (
                      <img
                        src={horse.photo_url}
                        alt={horse.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {language === "en" ? "No Image" : "Sin imagen"}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg text-gray-900">
                          {horse.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {horse.breed} • {horse.age} yrs
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {horse.dressage_level ||
                            (language === "en"
                              ? "No level specified"
                              : "No se especifica ningún nivel")}
                        </p>
                      </div>
                      <ChevronRight className="text-gray-400" size={18} />
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-serif">
                    {language === "en"
                      ? "Horse Profile:"
                      : "Perfil del caballo:"}
                    {horse.name}
                  </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="info" className="mt-4">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="info">
                      {language === "en" ? "Info" : "Información"}
                    </TabsTrigger>
                    <TabsTrigger value="competition">
                      {language === "en" ? "Competition" : "Competencia"}
                    </TabsTrigger>
                    <TabsTrigger value="training">
                      {language === "en" ? "Training" : "Capacitación"}
                    </TabsTrigger>
                    <TabsTrigger value="health">
                      {language === "en" ? "Health" : "Salud"}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        {horse.photo_url ? (
                          <img
                            src={horse.photo_url}
                            alt={horse.name}
                            className="w-full rounded-lg"
                          />
                        ) : (
                          <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                            {language === "en" ? "No Image" : "Sin imagen"}
                          </div>
                        )}

                        <div className="flex flex-col gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center justify-center gap-2"
                            onClick={() => handleEditHorse(horse)}
                          >
                            <Edit size={14} />
                            {language === "en"
                              ? "Edit Horse"
                              : "Editar Caballo"}
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex items-center justify-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(horse.id);
                            }}
                          >
                            <Trash2 size={14} />
                            {language === "en"
                              ? "Delete Horse"
                              : "Eliminar caballo"}
                          </Button>
                        </div>
                      </div>
                      <div className="md:w-2/3">
                        <h3 className="font-semibold text-lg">
                          {language === "en" ? "Details" : "Detalles"}
                        </h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2">
                          <div>
                            <p className="text-sm text-gray-600">
                              {language === "en" ? "Breed" : "Criar"}
                            </p>
                            <p className="font-medium">{horse.breed}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              {language === "en" ? "Age" : "Edad"}
                            </p>
                            <p className="font-medium">
                              {horse.age} {language === "en" ? "years" : "años"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              {language === "en" ? "Sex" : "Sexo"}
                            </p>
                            <p className="font-medium">{horse.sex}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              {language === "en"
                                ? "Competition Level"
                                : "Nivel de competencia"}
                            </p>
                            <p className="font-medium">
                              {horse.competition_level || (language === "en"
                                ? "Not specified"
                                : "No especificado")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              {language === "en"
                                ? "Jumping Level"
                                : "Nivel de salto"}
                            </p>
                            <p className="font-medium">
                              {horse.jumping_level || (language === "en"
                                ? "Not specified"
                                : "No especificado")}
                            </p>
                          </div>
                          {horse.dressage_type && (
                            <div>
                              <p className="text-sm text-gray-600">
                                {language === "en"
                                  ? "Dressage Type"
                                  : "Tipo de doma"}
                              </p>
                              <p className="font-medium">
                                {horse.dressage_type}
                              </p>
                            </div>
                          )}
                          {horse.dressage_level && (
                            <div>
                              <p className="text-sm text-gray-600">
                                {language === "en"
                                  ? "Dressage Level"
                                  : "Nivel de doma"}
                              </p>
                              <p className="font-medium">
                                {horse.dressage_level}
                              </p>
                            </div>
                          )}
                          {horse.years_owned && (
                            <div>
                              <p className="text-sm text-gray-600">
                                {language === "en"
                                  ? "Years Owned/Ridden"
                                  : "Años de propiedad/uso"}
                              </p>
                              <p className="font-medium">{horse.years_owned}</p>
                            </div>
                          )}
                        </div>

                        {(horse.strengths ||
                          horse.weaknesses ||
                          horse.special_notes) && (
                          <div className="mt-4">
                            <h3 className="font-semibold text-lg mb-2">
                              {language === "en"
                                ? "Additional Information"
                                : "información adicional"}
                            </h3>

                            {horse.strengths && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-600">
                                  {language === "en"
                                    ? "Strengths"
                                    : "Fortalezas"}
                                </p>
                                <p>{horse.strengths}</p>
                              </div>
                            )}

                            {horse.weaknesses && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-600">
                                  {language === "en"
                                    ? "Areas for Improvement"
                                    : "Áreas de mejora"}
                                </p>
                                <p>{horse.weaknesses}</p>
                              </div>
                            )}

                            {horse.special_notes && (
                              <div>
                                <p className="text-sm text-gray-600">
                                  {language === "en"
                                    ? "Special Notes"
                                    : "Notas especiales"}
                                </p>
                                <p>{horse.special_notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="competition">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">
                        {language === "en"
                          ? "Competition History"
                          : "Historial de Competiciones"}
                      </h3>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 italic">
                          {language === "en"
                            ? "No competition history available yet."
                            : "No hay historial de competiciones disponible aún."}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="training">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">
                        {language === "en"
                          ? "Training Notes"
                          : "Notas de Entrenamiento"}
                      </h3>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 italic">
                          {language === "en"
                            ? "No training notes available yet."
                            : "No hay notas de entrenamiento disponibles aún."}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="health">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">
                        {language === "en"
                          ? "Health Records"
                          : "Registros de Salud"}
                      </h3>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 italic">
                          {language === "en"
                            ? "No health records available yet."
                            : "No hay registros de salud disponibles aún."}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}

      {/* Add Horse Dialog */}
      <Dialog open={showAddHorseForm} onOpenChange={setShowAddHorseForm}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              {language === "es"
                ? "Agregar un nuevo caballo"
                : "Add a New Horse"}
            </DialogTitle>
          </DialogHeader>
          <HorseForm onComplete={handleFormComplete} />
        </DialogContent>
      </Dialog>

      {/* Edit Horse Dialog */}
      <Dialog
        open={!!editingHorse}
        onOpenChange={(isOpen) => !isOpen && setEditingHorse(null)}
      >
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              {language === "es"
                ? `Editar caballo: ${editingHorse?.name}`
                : `Edit Horse: ${editingHorse?.name}`}
            </DialogTitle>
          </DialogHeader>
          {editingHorse && (
            <HorseForm
              onComplete={handleFormComplete}
              editingHorse={editingHorse}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <AlertDialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === "es"
                ? "¿Estás seguro de que deseas eliminar este caballo?"
                : "Are you sure you want to delete this horse?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === "es"
                ? "Esta acción no se puede deshacer. Esto eliminará permanentemente el perfil de tu caballo y todos los datos asociados."
                : "This action cannot be undone. This will permanently delete your horse's profile and all associated data."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {language === "es" ? "Cancelar" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHorse}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === "es" ? "Eliminando..." : "Deleting..."}
                </>
              ) : language === "es" ? (
                "Eliminar"
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Horses;