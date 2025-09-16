import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Image as ImageIcon, Bell, Mail } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Event } from "@/services/eventService";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import MediaSelector from "@/components/admin/media/MediaSelector";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface EventFormProps {
  onComplete: () => void;
  event?: Event | null;
}

interface NotificationPreferences {
  threeWeeks: boolean;
  oneWeek: boolean;
  sameDay: boolean;
}

const EventForm = ({ onComplete, event }: EventFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventTitle, setEventTitle] = useState(event?.title || "");
  const [eventType, setEventType] = useState(event?.eventType || "");
  const [location, setLocation] = useState(event?.location || "");
  const [description, setDescription] = useState(event?.description || "");
  const [discipline, setDiscipline] = useState<"Jumping" | "Dressage" | "Both">(
    (event?.discipline as "Jumping" | "Dressage" | "Both") || "Dressage"
  );

  // Fix date handling to preserve time
  const [date, setDate] = useState<Date | undefined>(
    event?.eventDate ? new Date(event.eventDate) : undefined
  );
  const [time, setTime] = useState<string>(
    event?.eventDate ? format(new Date(event.eventDate), "HH:mm") : "09:00"
  );

  const [imageUrl, setImageUrl] = useState(event?.imageUrl || "");
  const [showMediaSelector, setShowMediaSelector] = useState(false);

  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>({
      threeWeeks: true,
      oneWeek: true,
      sameDay: true,
    });

  const { toast } = useToast();
  const { language } = useLanguage();
  const { user } = useAuth();

  const isEditMode = !!event?.id;

  // Helper function to calculate notification dates
  const calculateNotificationDates = (eventDate: string) => {
    const date = new Date(eventDate);
    const threeWeeksDate = new Date(date);
    threeWeeksDate.setDate(threeWeeksDate.getDate() - 21);

    const oneWeekDate = new Date(date);
    oneWeekDate.setDate(oneWeekDate.getDate() - 7);

    return {
      threeWeeks: threeWeeksDate.toLocaleDateString(),
      oneWeek: oneWeekDate.toLocaleDateString(),
      sameDay: date.toLocaleDateString(),
    };
  };

  // Service function to manage events (create and update) with notifications
  const manageEventWithNotifications = async (
    action: "create" | "update",
    eventData: any,
    eventId?: string
  ) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Authentication required");
    }

    const payload = {
      action,
      ...(eventId && { event_id: eventId }),
      ...eventData,
    };

    const response = await fetch(
      `${supabase.supabaseUrl}/functions/v1/manage-event-with-notifications`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
          apikey: supabase.supabaseKey,
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `Failed to ${action} event`);
    }

    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventTitle || !eventType || !date) {
      toast({
        title: language === "en" ? "Missing fields" : "Campos faltantes",
        description:
          language === "en"
            ? "Please fill in all required fields"
            : "Por favor complete todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title:
          language === "en"
            ? "Authentication required"
            : "Autenticación requerida",
        description:
          language === "en"
            ? "Please sign in to create events"
            : "Por favor inicie sesión para crear eventos",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time properly
      const eventDateTime = new Date(date);
      const [hours, minutes] = time.split(":");
      eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const eventData = {
        title: eventTitle,
        eventType,
        eventDate: eventDateTime.toISOString(), // This preserves the exact date and time
        location,
        description,
        discipline,
        imageUrl,
        userId: user.id,
        // Add notification preferences and user email for new events
        notification_preferences: notificationPreferences,
        user_email: user.email,
      };

      if (isEditMode && event?.id) {
        // For editing, use the unified function with update action
        const result = await manageEventWithNotifications(
          "update",
          eventData,
          event.id
        );
        toast({
          title: language === "en" ? "Event updated" : "Evento actualizado",
          description:
            language === "en"
              ? `Event updated successfully. ${
                  result.data?.notifications_updated || 0
                } notifications updated.`
              : `Evento actualizado exitosamente. ${
                  result.data?.notifications_updated || 0
                } notificaciones actualizadas.`,
          variant: "default",
        });
      } else {
        // For new events, use the unified function with create action
        const result = await manageEventWithNotifications("create", eventData);
        toast({
          title: language === "en" ? "Event created" : "Evento creado",
          description:
            language === "en"
              ? `Event created successfully. ${
                  result.data?.notifications_created || 0
                } notifications scheduled.`
              : `Evento creado exitosamente. ${
                  result.data?.notifications_created || 0
                } notificaciones programadas.`,
          variant: "default",
        });
      }

      onComplete();
    } catch (error: any) {
      console.error("Error saving event:", error);
      toast({
        title: language === "en" ? "Error" : "Error",
        description:
          error.message ||
          (language === "en"
            ? `There was an error ${
                isEditMode ? "updating" : "creating"
              } your event`
            : `Hubo un error al ${
                isEditMode ? "actualizar" : "crear"
              } su evento`),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectedMedia = (url: string) => {
    setImageUrl(url);
    setShowMediaSelector(false);
  };

  // Get formatted event date for notifications preview
  const eventDateString =
    date && time
      ? (() => {
          const eventDateTime = new Date(date);
          const [hours, minutes] = time.split(":");
          eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          return eventDateTime.toISOString();
        })()
      : "";

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="m-2">
          <Label htmlFor="event-title">
            {language === "en" ? "Event Title" : "Título del Evento"} *
          </Label>
          <Input
            id="event-title"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder={
              language === "en"
                ? "Enter event title"
                : "Ingrese el título del evento"
            }
            required
          />
        </div>

        <div className="m-2">
          <Label htmlFor="event-type">
            {language === "en" ? "Event Type" : "Tipo de Evento"} *
          </Label>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger id="event-type">
              <SelectValue
                placeholder={
                  language === "en" ? "Select type" : "Seleccionar tipo"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="competition">
                {language === "en" ? "Competition" : "Competición"}
              </SelectItem>
              <SelectItem value="training">
                {language === "en" ? "Training" : "Entrenamiento"}
              </SelectItem>
              <SelectItem value="clinic">
                {language === "en" ? "Clinic" : "Clínica"}
              </SelectItem>
              <SelectItem value="farrier">
                {language === "en" ? "Farrier" : "Herradora"}
              </SelectItem>
              <SelectItem value="worming">
                {language === "en" ? "Worming" : "Desparasitación"}
              </SelectItem>
              <SelectItem value="dentist">
                {language === "en" ? "Dentist" : "Dentista"}
              </SelectItem>
              <SelectItem value="vaccination">
                {language === "en" ? "Vaccination" : "Vacunación"}
              </SelectItem>
              <SelectItem value="other">
                {language === "en" ? "Other" : "Otro"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="m-2">
          <Label htmlFor="event-date">
            {language === "en" ? "Date" : "Fecha"} *
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? (
                  format(date, "PPP")
                ) : (
                  <span>
                    {language === "en" ? "Pick a date" : "Elegir una fecha"}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className="pointer-events-auto"
                disabled={(date) => {
                  // Disable past dates (but allow today)
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Add time picker */}
        <div className="m-2">
          <Label htmlFor="event-time">
            {language === "en" ? "Time" : "Hora"} *
          </Label>
          <Input
            id="event-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="m-2">
          <Label htmlFor="discipline">
            {language === "en" ? "Discipline" : "Disciplina"} *
          </Label>
          <Select
            value={discipline}
            onValueChange={(value: "Jumping" | "Dressage" | "Both") =>
              setDiscipline(value)
            }
          >
            <SelectTrigger id="discipline">
              <SelectValue
                placeholder={
                  language === "en"
                    ? "Select discipline"
                    : "Seleccionar disciplina"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Jumping">
                {language === "en" ? "Jumping" : "Salto"}
              </SelectItem>
              <SelectItem value="Dressage">
                {language === "en" ? "Dressage" : "Doma"}
              </SelectItem>
              <SelectItem value="Both">
                {language === "en" ? "Both" : "Ambos"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="m-2">
          <Label htmlFor="event-location">
            {language === "en" ? "Location" : "Ubicación"}
          </Label>
          <Input
            id="event-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={
              language === "en" ? "Enter location" : "Ingrese la ubicación"
            }
          />
        </div>

        <div className="m-2">
          <Label htmlFor="event-description">
            {language === "en" ? "Description" : "Descripción"}
          </Label>
          <Textarea
            id="event-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              language === "en"
                ? "Enter event description"
                : "Ingrese la descripción del evento"
            }
            rows={3}
          />
        </div>

        <div className="m-2">
          <Label htmlFor="event-image">
            {language === "en" ? "Event Image" : "Imagen del Evento"}
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="event-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder={language === "en" ? "Image URL" : "URL de la imagen"}
              readOnly
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMediaSelector(true)}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {language === "en" ? "Browse" : "Explorar"}
            </Button>
          </div>
          {imageUrl && (
            <div className="mt-2 border rounded-md overflow-hidden">
              <AspectRatio ratio={16 / 9}>
                <img
                  src={imageUrl}
                  alt={eventTitle || "Event preview"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </AspectRatio>
            </div>
          )}
        </div>

        {/* Email Notifications Section - Only show for new events */}
        {!isEditMode && (
          <div className="m-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  {language === "en"
                    ? "Email Notifications"
                    : "Notificaciones por Email"}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {language === "en"
                    ? "Get automatic reminders before your event"
                    : "Recibe recordatorios automáticos antes de tu evento"}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {eventDateString && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-700 mb-2">
                      <strong>
                        {language === "en"
                          ? "Scheduled reminders:"
                          : "Recordatorios programados:"}
                      </strong>
                    </p>
                    {(() => {
                      const dates = calculateNotificationDates(eventDateString);
                      return (
                        <div className="text-xs text-blue-600 space-y-1">
                          {notificationPreferences.threeWeeks && (
                            <div>
                              • 3{" "}
                              {language === "en"
                                ? "weeks before"
                                : "semanas antes"}
                              : {dates.threeWeeks}
                            </div>
                          )}
                          {notificationPreferences.oneWeek && (
                            <div>
                              • 1{" "}
                              {language === "en"
                                ? "week before"
                                : "semana antes"}
                              : {dates.oneWeek}
                            </div>
                          )}
                          {notificationPreferences.sameDay && (
                            <div>
                              •{" "}
                              {language === "en" ? "Same day" : "El mismo día"}:{" "}
                              {dates.sameDay}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="notification-3weeks"
                      checked={notificationPreferences.threeWeeks}
                      onCheckedChange={(checked) =>
                        setNotificationPreferences((prev) => ({
                          ...prev,
                          threeWeeks: !!checked,
                        }))
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <Label
                        htmlFor="notification-3weeks"
                        className="cursor-pointer"
                      >
                        {language === "en"
                          ? "3 weeks before event"
                          : "3 semanas antes del evento"}
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="notification-1week"
                      checked={notificationPreferences.oneWeek}
                      onCheckedChange={(checked) =>
                        setNotificationPreferences((prev) => ({
                          ...prev,
                          oneWeek: !!checked,
                        }))
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <Label
                        htmlFor="notification-1week"
                        className="cursor-pointer"
                      >
                        {language === "en"
                          ? "1 week before event"
                          : "1 semana antes del evento"}
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="notification-sameday"
                      checked={notificationPreferences.sameDay}
                      onCheckedChange={(checked) =>
                        setNotificationPreferences((prev) => ({
                          ...prev,
                          sameDay: !!checked,
                        }))
                      }
                    />
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <Label
                        htmlFor="notification-sameday"
                        className="cursor-pointer"
                      >
                        {language === "en"
                          ? "Same day as event"
                          : "El día del evento"}
                      </Label>
                    </div>
                  </div>
                </div>

                {!notificationPreferences.threeWeeks &&
                  !notificationPreferences.oneWeek &&
                  !notificationPreferences.sameDay && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-sm text-orange-700">
                        {language === "en"
                          ? "You won't receive email notifications for this event."
                          : "No recibirás notificaciones por email para este evento."}
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-end gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onComplete}
            disabled={isSubmitting}
          >
            {language === "en" ? "Cancel" : "Cancelar"}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? language === "en"
                ? "Saving..."
                : "Guardando..."
              : language === "en"
              ? isEditMode
                ? "Update Event"
                : "Save Event"
              : isEditMode
              ? "Actualizar Evento"
              : "Guardar Evento"}
          </Button>
        </div>
      </form>

      {showMediaSelector && (
        <Dialog open={showMediaSelector} onOpenChange={setShowMediaSelector}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                {language === "en" ? "Select Image" : "Seleccionar Imagen"}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] overflow-auto">
              <MediaSelector value={imageUrl} onChange={handleSelectedMedia} />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default EventForm;
