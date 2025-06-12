import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudUpload, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DocumentUpload from "@/components/analysis/DocumentUpload";
import DocumentAnalysisDisplay from "@/components/analysis/DocumentAnalysisDisplay";
import VideoUpload from "@/components/analysis/VideoUpload";
import VideoAnalysisDisplay from "@/components/analysis/VideoAnalysisDisplay";
import { supabase } from "@/integrations/supabase/client";
import { fetchPdfAsBase64 } from "@/utils/pdfUtils";
import { imageToBase64PDF } from "@/utils/img2pdf";
import { useViewport } from "@/hooks/use-viewport";

interface DocumentAnalysisItem {
  id: string;
  user_id: string;
  horse_id: string;
  horse_name: string;
  discipline: string;
  test_level: string | null;
  competition_type: string | null;
  document_date: string;
  document_url: string;
  file_name: string;
  file_type: string;
  status: string;
  created_at: string;
  video_type?: string | null;
}

const Analysis = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const document_id = searchParams.get("document_id");
  const view = searchParams.get("view");
  const { language, translations } = useLanguage();
  const t = translations[language];
  const { isMobile } = useViewport();

  const buttonText = {
    en: {
      pending: "Analyze Now",
      processing: "Re-analyze",
      completed: "View Analysis",
    },
    es: {
      pending: "Analizar Ahora",
      processing: "Re-analizar",
      completed: "Ver Análisis",
    },
  };

  const [activeTab, setActiveTab] = useState<string>("upload");
  const [documents, setDocuments] = useState<DocumentAnalysisItem[]>([]);
  const [videos, setVideos] = useState<DocumentAnalysisItem[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSpinnerLoading, setIsSpinnerLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [userDiscipline, setUserDiscipline] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate("/sign-in", { state: { from: "/analysis" } });
      return;
    }

    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        // Fetch user profile to get discipline
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("discipline")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError);
        } else if (profileData) {
          setUserDiscipline(profileData.discipline);
        }

        // Fetch all document analysis records for the current user
        const { data: analysisData, error } = await supabase
          .from("document_analysis")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (analysisData) {
          // Filter documents (PDFs, text files, etc.) and videos
          const docs = analysisData.filter(
            (item) => !item.file_type.startsWith("video/") && !item.video_type
          );
          const vids = analysisData.filter(
            (item) => item.file_type.startsWith("video/") || item.video_type
          );

          setDocuments(docs);
          setVideos(vids);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching analysis data:", error);
        toast.error(
          language === "en"
            ? "Failed to load your analyses"
            : "No se pudieron cargar sus análisis"
        );
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate, language]);

  useEffect(() => {
    // If document_id is present in the URL, set it as selected
    if (view) {
      view && setActiveTab("analysis-list");
    } else if (
      (document_id && videos.length > 0) ||
      (document_id && documents.length > 0)
    ) {
      documents.length > 0 && setSelectedDocumentId(document_id);

      videos.length > 0 && setSelectedVideoId(document_id);
      setActiveTab("analysis-list");
    }
  }, [videos, documents, document_id, view]);

  const fetchDocs = async () => {
    const { data: analysisData, error } = await supabase
      .from("document_analysis")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (analysisData) {
      // Filter documents (PDFs, text files, etc.) and videos
      const docs = analysisData.filter(
        (item) => !item.file_type.startsWith("video/") && !item.video_type
      );
      const vids = analysisData.filter(
        (item) => item.file_type.startsWith("video/") || item.video_type
      );

      setDocuments(docs);
      setVideos(vids);
    }
  };

  const analysisDocument = async (newDocumentId, documentURL) => {
    setIsSpinnerLoading(true);
    const canvasImage = documentURL.includes(".pdf")
      ? await fetchPdfAsBase64(documentURL)
      : await imageToBase64PDF(documentURL);
    try {
      await supabase.functions.invoke("process-document-analysis", {
        body: { documentId: newDocumentId, base64Image: canvasImage },
      });

      navigate(`/analysis?document_id=${newDocumentId}`);

      fetchDocs();
      setIsSpinnerLoading(false);
    } catch (err) {
      setIsSpinnerLoading(false);
      console.warn("Processing failed:", err);
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    const currentItems = userDiscipline === "dressage" ? documents : videos;
    if (selectedItems.length === currentItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems.map(item => item.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) return;

    setIsDeleting(true);
    try {
      // Delete from analysis_results first (if exists)
      const { error: resultsError } = await supabase
        .from("analysis_results")
        .delete()
        .in("document_id", selectedItems);

      if (resultsError) {
        console.warn("Error deleting analysis results:", resultsError);
      }

      // Delete from document_analysis
      const { error: analysisError } = await supabase
        .from("document_analysis")
        .delete()
        .in("id", selectedItems);

      if (analysisError) {
        throw analysisError;
      }

      toast.success(
        language === "en"
          ? `Successfully deleted ${selectedItems.length} item(s)`
          : `Se eliminaron ${selectedItems.length} elemento(s) exitosamente`
      );

      setSelectedItems([]);
      fetchDocs();
    } catch (error) {
      console.error("Error deleting items:", error);
      toast.error(
        language === "en"
          ? "Failed to delete selected items"
          : "No se pudieron eliminar los elementos seleccionados"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  if (isSpinnerLoading) {
    return (
      <div className="fixed w-screen flex items-center justify-center p-8 h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
      </div>
    );
  }

  // If user hasn't set their discipline, show message to complete profile
  if (!isLoading && !userDiscipline) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-6xl mx-auto">
            <Card className="p-8 text-center">
              <h1 className="text-2xl font-serif font-bold mb-4">
                {language === "en"
                  ? "Complete Your Profile"
                  : "Completa tu Perfil"}
              </h1>
              <p className="text-gray-600 mb-6">
                {language === "en"
                  ? "Please set your primary discipline in your profile to access the analysis features."
                  : "Por favor establece tu disciplina principal en tu perfil para acceder a las funciones de análisis."}
              </p>
              <Button onClick={() => navigate("/profile-setup")}>
                {language === "en" ? "Go to Profile" : "Ir al Perfil"}
              </Button>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-serif font-bold mb-6">
            {language === "en"
              ? "Equestrian AI Analysis"
              : "Análisis de IA ecuestre"}
          </h1>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList
              className={`mb-6 ${
                isMobile
                  ? "flex flex-wrap gap-1"
                  : userDiscipline === "dressage"
                  ? "grid grid-cols-2"
                  : "grid grid-cols-2"
              } w-full`}
            >
              <TabsTrigger
                value="upload"
                className={`flex justify-center items-center gap-2 ${
                  isMobile ? "flex-grow text-xs py-1 px-2 " : ""
                } data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7857eb] data-[state=active]:to-[#3b78e8] data-[state=active]:text-white`}
              >
                <CloudUpload className="h-4 w-4 text-inherit" />
                {userDiscipline === "dressage"
                  ? language === "en"
                    ? "Upload Document"
                    : "Subir Documento"
                  : language === "en"
                  ? "Upload Video"
                  : "Subir Video"}
              </TabsTrigger>
              <TabsTrigger
                value="analysis-list"
                className={`flex justify-center items-center gap-2 ${
                  isMobile ? "flex-grow text-xs py-1 px-2" : ""
                } data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#7857eb] data-[state=active]:to-[#3b78e8] data-[state=active]:text-white`}
              >
                {userDiscipline === "dressage"
                  ? language === "en"
                    ? "My Documents"
                    : "Mis Documentos"
                  : language === "en"
                  ? "My Videos"
                  : "Mis Videos"}
                <span className="h-4 w-4 bg-gradient-to-r from-[#7857eb] to-[#3b78e8] rounded-full text-white flex items-center justify-center text-xs">
                  {userDiscipline === "dressage"
                    ? documents.length
                    : videos.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              {userDiscipline === "dressage" ? (
                <DocumentUpload fetchDocs={fetchDocs} />
              ) : (
                <VideoUpload fetchDocs={fetchDocs} />
              )}
            </TabsContent>

            <TabsContent value="analysis-list">
              {isLoading ? (
                <div className="flex justify-center items-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-700 mr-2" />
                  <span>
                    {language === "en" ? "Loading..." : "Cargando..."}
                  </span>
                </div>
              ) : userDiscipline === "dressage" ? (
                // Documents view for dressage users
                documents.length > 0 ? (
                  <div className="space-y-6">
                    {selectedDocumentId ? (
                      <div>
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedDocumentId(null)}
                          className="mb-4"
                        >
                          ←{" "}
                          {language === "en"
                            ? "Back to Documents"
                            : "Volver a Documentos"}
                        </Button>
                        <DocumentAnalysisDisplay
                          documentId={selectedDocumentId}
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Selection and Delete Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleSelectAll}
                            >
                              {selectedItems.length === documents.length
                                ? language === "en"
                                  ? "Deselect All"
                                  : "Deseleccionar Todo"
                                : language === "en"
                                ? "Select All"
                                : "Seleccionar Todo"}
                            </Button>
                            {selectedItems.length > 0 && (
                              <span className="text-sm text-gray-600">
                                {selectedItems.length}{" "}
                                {language === "en" ? "selected" : "seleccionados"}
                              </span>
                            )}
                          </div>
                          {selectedItems.length > 0 && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={handleDeleteSelected}
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                              )}
                              {language === "en" ? "Delete Selected" : "Eliminar Seleccionados"}
                            </Button>
                          )}
                        </div>

                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  <input
                                    type="checkbox"
                                    checked={selectedItems.length === documents.length && documents.length > 0}
                                    onChange={handleSelectAll}
                                    className="rounded"
                                  />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {language === "en" ? "Name" : "Nombre"}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {language === "en" ? "Horse" : "Caballo"}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {language === "en" ? "Level" : "Nivel"}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {language === "en" ? "Date" : "Fecha"}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {language === "en" ? "Status" : "Estado"}
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {language === "en" ? "Action" : "Acción"}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {documents.map((doc) => (
                                <tr key={doc.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <input
                                      type="checkbox"
                                      checked={selectedItems.includes(doc.id)}
                                      onChange={() => handleSelectItem(doc.id)}
                                      className="rounded"
                                    />
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span className="text-sm font-medium text-gray-900">
                                      {doc.file_name}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {doc.horse_name}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                    {doc.test_level ||
                                      (language === "en" ? "Dressage" : "Doma")}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(doc.document_date)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span
                                      className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${
                                        doc.status === "completed"
                                          ? "bg-green-100 text-green-800"
                                          : doc.status === "pending"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : doc.status === "processing"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {doc.status === "completed"
                                        ? language === "en"
                                          ? "Completed"
                                          : "Completado"
                                        : doc.status === "pending"
                                        ? language === "en"
                                          ? "Pending"
                                          : "Pendiente"
                                        : doc.status === "processing"
                                        ? language === "en"
                                          ? "Processing"
                                          : "Procesando"
                                        : language === "en"
                                        ? "Failed"
                                        : "Fallido"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        doc.status == "completed"
                                          ? setSelectedDocumentId(doc.id)
                                          : analysisDocument(
                                              doc.id,
                                              doc.document_url
                                            );
                                      }}
                                      className="text-purple-700 border-purple-200"
                                    >
                                      {buttonText[language][doc.status]}
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Card className="p-6 text-center bg-gray-50">
                    <p className="text-gray-600 mb-4">
                      {language === "en"
                        ? "You haven't uploaded any documents for analysis yet"
                        : "Aún no has subido ningún documento para análisis"}
                    </p>
                    <Button onClick={() => setActiveTab("upload")}>
                      {language === "en"
                        ? "Upload Document"
                        : "Subir Documento"}
                    </Button>
                  </Card>
                )
              ) : // Videos view for jumping users
              videos.length > 0 ? (
                <div className="space-y-6">
                  {selectedVideoId ? (
                    <div>
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedVideoId(null)}
                        className="mb-4"
                      >
                        ←{" "}
                        {language === "en"
                          ? "Back to Videos"
                          : "Volver a Videos"}
                      </Button>
                      <VideoAnalysisDisplay videoId={selectedVideoId} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Selection and Delete Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAll}
                          >
                            {selectedItems.length === videos.length
                              ? language === "en"
                                ? "Deselect All"
                                : "Deseleccionar Todo"
                              : language === "en"
                              ? "Select All"
                              : "Seleccionar Todo"}
                          </Button>
                          {selectedItems.length > 0 && (
                            <span className="text-sm text-gray-600">
                              {selectedItems.length}{" "}
                              {language === "en" ? "selected" : "seleccionados"}
                            </span>
                          )}
                        </div>
                        {selectedItems.length > 0 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteSelected}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            {language === "en" ? "Delete Selected" : "Eliminar Seleccionados"}
                          </Button>
                        )}
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                  type="checkbox"
                                  checked={selectedItems.length === videos.length && videos.length > 0}
                                  onChange={handleSelectAll}
                                  className="rounded"
                                />
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {language === "en" ? "Name" : "Nombre"}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {language === "en" ? "Horse" : "Caballo"}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {language === "en" ? "Type" : "Tipo"}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {language === "en" ? "Date" : "Fecha"}
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {language === "en" ? "Status" : "Estado"}
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {language === "en" ? "Action" : "Acción"}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {videos.map((video) => (
                              <tr key={video.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={selectedItems.includes(video.id)}
                                    onChange={() => handleSelectItem(video.id)}
                                    className="rounded"
                                  />
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="text-sm font-medium text-gray-900">
                                    {video.file_name}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {video.horse_name}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                  {video.video_type && (
                                    <>
                                      {video.video_type === "training"
                                        ? language === "en"
                                          ? "Training"
                                          : "Entrenamiento"
                                        : language === "en"
                                        ? "Competition"
                                        : "Competición"}
                                    </>
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(video.document_date)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${
                                      video.status === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : video.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : video.status === "processing"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {video.status === "completed"
                                      ? language === "en"
                                        ? "Completed"
                                        : "Completado"
                                      : video.status === "pending"
                                      ? language === "en"
                                        ? "Pending"
                                        : "Pendiente"
                                      : video.status === "processing"
                                      ? language === "en"
                                        ? "Processing"
                                        : "Procesando"
                                      : language === "en"
                                      ? "Failed"
                                      : "Fallido"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedVideoId(video.id)}
                                    disabled={video.status !== "completed"}
                                    className="text-blue-700 border-blue-200"
                                  >
                                    {language === "en"
                                      ? "View Analysis"
                                      : "Ver Análisis"}
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Card className="p-6 text-center bg-gray-50">
                  <p className="text-gray-600 mb-4">
                    {language === "en"
                      ? "You haven't uploaded any videos for analysis yet"
                      : "Aún no has subido ningún video para análisis"}
                  </p>
                  <Button onClick={() => setActiveTab("upload")}>
                    {language === "en" ? "Upload Video" : "Subir Video"}
                  </Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Analysis;
