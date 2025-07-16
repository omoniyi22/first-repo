import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlusCircle,
  Pencil,
  Trash2,
  MoveUp,
  MoveDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  discipline: "general" | "dressage" | "jumping";
  isExpanded?: boolean;
}

const FaqContent = () => {
  const { toast } = useToast();
  const { language } = useLanguage();

  // Sample data for FAQs
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: 1,
      question:
        language === "en"
          ? "How does AI Dressage analyze my tests?"
          : "¿Cómo analiza AI Dressage mis pruebas?",
      answer:
        language === "en"
          ? "AI Dressage uses computer vision and machine learning to analyze your dressage test videos, identifying movements, transitions, and alignment issues. For scoresheets, it uses OCR technology to extract and analyze judge feedback."
          : "AI Dressage utiliza visión computacional y aprendizaje automático para analizar tus videos de pruebas de doma, identificando movimientos, transiciones y problemas de alineación. Para las hojas de puntuación, utiliza tecnología OCR para extraer y analizar la retroalimentación del juez.",
      discipline: "dressage",
      isExpanded: false,
    },
    {
      id: 2,
      question:
        language === "en"
          ? "What file formats do you support for video uploads?"
          : "¿Qué formatos de archivo soportan para la subida de videos?",
      answer:
        language === "en"
          ? "We support most common video formats including MP4, MOV, and AVI. Videos should be clear and well-lit for best results."
          : "Soportamos los formatos de video más comunes incluyendo MP4, MOV y AVI. Los videos deben ser claros y bien iluminados para obtener mejores resultados.",
      discipline: "general",
      isExpanded: false,
    },
    {
      id: 3,
      question:
        language === "en"
          ? "How does AI Jumping analyze my jumping rounds?"
          : "¿Cómo analiza AI Jumping mis rondas de salto?",
      answer:
        language === "en"
          ? "AI Jumping uses advanced computer vision to track your horse's approach, takeoff, bascule, and landing, providing detailed analysis of your jumping technique and suggestions for improvement."
          : "AI Jumping utiliza visión computacional avanzada para rastrear la aproximación, despegue, bascule y aterrizaje de tu caballo, proporcionando análisis detallado de tu técnica de salto y sugerencias de mejora.",
      discipline: "jumping",
      isExpanded: false,
    },
  ]);

  const [currentFaq, setCurrentFaq] = useState<FAQ | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDiscipline, setCurrentDiscipline] = useState<string>("all");

  const filteredFaqs =
    currentDiscipline === "all"
      ? faqs
      : faqs.filter((faq) => faq.discipline === currentDiscipline);

  const toggleFaq = (id: number) => {
    setFaqs(
      faqs.map((faq) =>
        faq.id === id ? { ...faq, isExpanded: !faq.isExpanded } : faq
      )
    );
  };

  const handleEditFaq = (faq: FAQ) => {
    setCurrentFaq(faq);
    setIsDialogOpen(true);
  };

  const handleAddFaq = () => {
    setCurrentFaq({
      id: Math.max(0, ...faqs.map((faq) => faq.id)) + 1,
      question: "",
      answer: "",
      discipline: "general",
      isExpanded: false,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteFaq = (id: number) => {
    setFaqs(faqs.filter((faq) => faq.id !== id));
    toast({
      title: "FAQ Deleted",
      description: "The FAQ has been successfully deleted.",
    });
  };

  const handleMoveFaq = (id: number, direction: "up" | "down") => {
    const currentIndex = faqs.findIndex((faq) => faq.id === id);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === faqs.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const newFaqs = [...faqs];
    const temp = newFaqs[currentIndex];
    newFaqs[currentIndex] = newFaqs[newIndex];
    newFaqs[newIndex] = temp;

    setFaqs(newFaqs);
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentFaq) return;

    if (faqs.some((faq) => faq.id === currentFaq.id)) {
      // Update existing FAQ
      setFaqs(faqs.map((faq) => (faq.id === currentFaq.id ? currentFaq : faq)));
      toast({
        title: "FAQ Updated",
        description: "The FAQ has been successfully updated.",
      });
    } else {
      // Add new FAQ
      setFaqs([...faqs, currentFaq]);
      toast({
        title: "FAQ Added",
        description: "The new FAQ has been successfully added.",
      });
    }

    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">
            {language === "en"
              ? "Frequently Asked Questions"
              : "Preguntas frecuentes"}
          </h2>
          <p className="text-gray-500 text-sm">
            {language === "en"
              ? "Manage FAQs across all disciplines"
              : "Gestionar preguntas frecuentes en todas las disciplinas"}
          </p>
        </div>
        <div className="flex gap-3">
          <Select
            value={currentDiscipline}
            onValueChange={setCurrentDiscipline}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by discipline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {language === "en"
                  ? "All Disciplines"
                  : "Todas las disciplinas"}
              </SelectItem>
              <SelectItem value="general">
                {language === "en" ? "General" : "General"}
              </SelectItem>
              <SelectItem value="dressage">
                {language === "en" ? "Dressage" : "Entrenamiento de caballos"}
              </SelectItem>
              <SelectItem value="jumping">
                {language === "en" ? "Jumping" : "Saltar"}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddFaq}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {language === "en" ? "Add FAQ" : "Agregar preguntas frecuentes"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-lg">
            {language === "en" ? "FAQ List" : "Lista de preguntas frecuentes"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredFaqs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {language === "en"
                ? "No FAQs found for the selected discipline."
                : "No se encontraron preguntas frecuentes para la disciplina seleccionada."}
            </div>
          ) : (
            <div className="divide-y">
              {filteredFaqs.map((faq) => (
                <div key={faq.id} className="p-4 px-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div
                        className="flex items-start gap-2 cursor-pointer"
                        onClick={() => toggleFaq(faq.id)}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 mt-1"
                        >
                          {faq.isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <div>
                          <h3 className="font-medium">{faq.question}</h3>
                          {faq.isExpanded && (
                            <p className="text-gray-600 mt-2">{faq.answer}</p>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {faq.discipline.charAt(0).toUpperCase() +
                              faq.discipline.slice(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveFaq(faq.id, "up")}
                        className="h-7 w-7"
                      >
                        <MoveUp className="h-4 w-4" />
                        <span className="sr-only">
                          {language === "en" ? "Move Up" : "Subir"}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveFaq(faq.id, "down")}
                        className="h-7 w-7"
                      >
                        <MoveDown className="h-4 w-4" />
                        <span className="sr-only">
                          {language === "en" ? "Move Down" : "Bajar"}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditFaq(faq)}
                        className="h-7 w-7"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">
                          {language === "en" ? "Edit" : "Editar"}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="h-7 w-7 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">
                          {language === "en" ? "Delete" : "Borrar"}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentFaq?.id ? "Edit FAQ" : "Add New FAQ"}
            </DialogTitle>
            <DialogDescription>
              {currentFaq?.id
                ? "Make changes to the FAQ here."
                : "Fill in the details to add a new FAQ."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveFaq} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Question</label>
                <Input
                  value={currentFaq?.question || ""}
                  onChange={(e) =>
                    setCurrentFaq((prev) =>
                      prev ? { ...prev, question: e.target.value } : null
                    )
                  }
                  placeholder="Enter the FAQ question"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Answer</label>
                <Textarea
                  value={currentFaq?.answer || ""}
                  onChange={(e) =>
                    setCurrentFaq((prev) =>
                      prev ? { ...prev, answer: e.target.value } : null
                    )
                  }
                  placeholder="Enter the FAQ answer"
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Discipline</label>
                <Select
                  value={currentFaq?.discipline || "general"}
                  onValueChange={(value: "general" | "dressage" | "jumping") =>
                    setCurrentFaq((prev) =>
                      prev ? { ...prev, discipline: value } : null
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="dressage">Dressage</SelectItem>
                    <SelectItem value="jumping">Jumping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FaqContent;
