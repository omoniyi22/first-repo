import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

const Privacy = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    navigate(-1);
  };
  const { language } = useLanguage();

  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <>
      <div className="container mx-auto px-6 py-12 prose prose-purple max-w-4xl">
        <h1>
          {language === "en" ? "Privacy Policy" : "Política de Privacidad"}
        </h1>
        <h2>
          {language === "en"
            ? "AI Dressage Trainer"
            : "Entrenador de doma de IA"}
        </h2>
        <p>
          <strong>
            {language === "en"
              ? "Last Updated: April 24, 2025"
              : "Última actualización: 24 de abril de 2025"}
          </strong>
        </p>
      </div>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleClose();
        }}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-purple-800">
              {language === "en" ? "Privacy Policy" : "política de privacidad"}
            </DialogTitle>
            <DialogDescription className="text-lg font-serif text-purple-700">
              {language === "en"
                ? "AI Dressage Trainer"
                : "Entrenador de doma de IA"}
            </DialogDescription>
          </DialogHeader>

          <div className="prose prose-purple">
            <p>
              <strong>
                {language === "en"
                  ? "Last Updated: April 24, 2025"
                  : "Última Actualización: 24 de Abril, 2025"}
              </strong>
            </p>

            <p>
              {language === "en"
                ? 'This Privacy Policy describes how AI Dressage Trainer ("we," "us," or "our") collects, uses, and discloses your personal information when you use our website, mobile application, and services (collectively, the "Service").'
                : 'Esta Política de Privacidad describe cómo AI Dressage Trainer ("nosotros", "nos" o "nuestro") recopila, usa y divulga tu información personal cuando usas nuestro sitio web, aplicación móvil y servicios (colectivamente, el "Servicio").'}
            </p>

            <h3>
              {language === "en"
                ? "1. Information We Collect"
                : "1. Información que Recopilamos"}
            </h3>
            <h4>
              {language === "en"
                ? "1.1 Information You Provide to Us"
                : "1.1 Información que nos Proporcionas"}
            </h4>
            <p>
              {language === "en"
                ? "We collect information you provide directly to us when you:"
                : "Recopilamos información que nos proporcionas directamente cuando:"}
            </p>
            <ul>
              <li>
                {language === "en"
                  ? "Create an account or user profile"
                  : "Creas una cuenta o perfil de usuario"}
              </li>
              <li>
                {language === "en"
                  ? "Upload dressage test score sheets"
                  : "Subes hojas de puntuación de pruebas de doma"}
              </li>
              <li>
                {language === "en"
                  ? "Set up horse profiles"
                  : "Configuras perfiles de caballos"}
              </li>
              <li>
                {language === "en"
                  ? "Subscribe to our service"
                  : "Te suscribes a nuestro servicio"}
              </li>
              <li>
                {language === "en"
                  ? "Contact customer support"
                  : "Contactas soporte al cliente"}
              </li>
              <li>
                {language === "en"
                  ? "Participate in surveys or promotions"
                  : "Participas en encuestas o promociones"}
              </li>
            </ul>

            <p>
              {language === "en"
                ? "This information may include:"
                : "Esta información puede incluir:"}
            </p>
            <ul>
              <li>
                {language === "en"
                  ? "Contact information (name, email address, phone number)"
                  : "Información de contacto (nombre, dirección de correo electrónico, número de teléfono)"}
              </li>
              <li>
                {language === "en"
                  ? "Account credentials (username, password)"
                  : "Credenciales de cuenta (nombre de usuario, contraseña)"}
              </li>
              <li>
                {language === "en"
                  ? "Payment information (processed by secure third-party payment processors)"
                  : "Información de pago (procesada por procesadores de pago seguros de terceros)"}
              </li>
              <li>
                {language === "en"
                  ? "Profile information (your photo, horse details, trainer information)"
                  : "Información de perfil (tu foto, detalles del caballo, información del entrenador)"}
              </li>
              <li>
                {language === "en"
                  ? "Dressage test score sheets and related performance data"
                  : "Hojas de puntuación de pruebas de doma y datos de rendimiento relacionados"}
              </li>
              <li>
                {language === "en"
                  ? "Communications with us"
                  : "Comunicaciones con nosotros"}
              </li>
            </ul>

            <h4>
              {language === "en"
                ? "1.2 Information We Collect Automatically"
                : "1.2 Información que Recopilamos Automáticamente"}
            </h4>
            <p>
              {language === "en"
                ? "When you use our Service, we automatically collect certain information, including:"
                : "Cuando usas nuestro Servicio, recopilamos automáticamente cierta información, incluyendo:"}
            </p>
            <ul>
              <li>
                {language === "en"
                  ? "Usage data (features accessed, buttons clicked, time spent on pages)"
                  : "Datos de uso (características accedidas, botones clicados, tiempo pasado en páginas)"}
              </li>
              <li>
                {language === "en"
                  ? "Device information (IP address, browser type, operating system)"
                  : "Información del dispositivo (dirección IP, tipo de navegador, sistema operativo)"}
              </li>
              <li>
                {language === "en"
                  ? "Location information (based on IP address or GPS with your consent)"
                  : "Información de ubicación (basada en dirección IP o GPS con tu consentimiento)"}
              </li>
              <li>
                {language === "en"
                  ? "Cookies and similar tracking technologies"
                  : "Cookies y tecnologías de seguimiento similares"}
              </li>
            </ul>

            <h3>
              {language === "en"
                ? "2. How We Use Your Information"
                : "2. Cómo Usamos tu Información"}
            </h3>
            <p>
              {language === "en"
                ? "We use the information we collect to:"
                : "Usamos la información que recopilamos para:"}
            </p>
            <ul>
              <li>
                {language === "en"
                  ? "Provide, maintain, and improve our Service"
                  : "Proporcionar, mantener y mejorar nuestro Servicio"}
              </li>
              <li>
                {language === "en"
                  ? "Process your score sheets and generate personalized recommendations"
                  : "Procesar tus hojas de puntuación y generar recomendaciones personalizadas"}
              </li>
              <li>
                {language === "en"
                  ? "Process payments and administer your subscription"
                  : "Procesar pagos y administrar tu suscripción"}
              </li>
              <li>
                {language === "en"
                  ? "Send administrative messages, updates, and promotional content"
                  : "Enviar mensajes administrativos, actualizaciones y contenido promocional"}
              </li>
              <li>
                {language === "en"
                  ? "Respond to your comments, questions, and customer service requests"
                  : "Responder a tus comentarios, preguntas y solicitudes de servicio al cliente"}
              </li>
              <li>
                {language === "en"
                  ? "Monitor and analyze usage patterns and trends"
                  : "Monitorear y analizar patrones de uso y tendencias"}
              </li>
              <li>
                {language === "en"
                  ? "Detect, prevent, and address technical issues and fraudulent activities"
                  : "Detectar, prevenir y abordar problemas técnicos y actividades fraudulentas"}
              </li>
              <li>
                {language === "en"
                  ? "Improve our AI algorithms and training models through anonymized data"
                  : "Mejorar nuestros algoritmos de IA y modelos de entrenamiento a través de datos anonimizados"}
              </li>
            </ul>

            <h3>
              {language === "en"
                ? "3. How We Share Your Information"
                : "3. Cómo Compartimos tu Información"}
            </h3>
            <p>
              {language === "en"
                ? "We may share your personal information in the following circumstances:"
                : "Podemos compartir tu información personal en las siguientes circunstancias:"}
            </p>

            <h4>
              {language === "en"
                ? "3.1 With Your Consent"
                : "3.1 Con tu Consentimiento"}
            </h4>
            <p>
              {language === "en"
                ? "We may share your information when you direct us to do so or provide explicit consent."
                : "Podemos compartir tu información cuando nos instruyas hacerlo o proporciones consentimiento explícito."}
            </p>

            <h4>
              {language === "en"
                ? "3.2 Service Providers"
                : "3.2 Proveedores de Servicios"}
            </h4>
            <p>
              {language === "en"
                ? "We may share your information with third-party vendors, service providers, and other business partners who need access to such information to carry out work on our behalf, such as:"
                : "Podemos compartir tu información con proveedores externos, proveedores de servicios y otros socios comerciales que necesitan acceso a dicha información para llevar a cabo trabajo en nuestro nombre, tales como:"}
            </p>
            <ul>
              <li>
                {language === "en"
                  ? "Cloud storage providers"
                  : "Proveedores de almacenamiento en la nube"}
              </li>
              <li>
                {language === "en"
                  ? "Payment processors"
                  : "Procesadores de pago"}
              </li>
              <li>
                {language === "en"
                  ? "Customer service providers"
                  : "Proveedores de servicio al cliente"}
              </li>
              <li>
                {language === "en"
                  ? "Analytics providers"
                  : "Proveedores de análisis"}
              </li>
            </ul>

            <h4>
              {language === "en"
                ? "3.3 Legal Requirements"
                : "3.3 Requisitos Legales"}
            </h4>
            <p>
              {language === "en"
                ? "We may disclose your information if required to do so by law or in response to valid legal requests, such as subpoenas, court orders, or government regulations."
                : "Podemos divulgar tu información si es requerido por ley o en respuesta a solicitudes legales válidas, como citaciones, órdenes judiciales o regulaciones gubernamentales."}
            </p>

            <h4>
              {language === "en"
                ? "3.4 Business Transfers"
                : "3.4 Transferencias Comerciales"}
            </h4>
            <p>
              {language === "en"
                ? "If we are involved in a merger, acquisition, financing, or sale of business assets, your information may be transferred as part of that transaction."
                : "Si estamos involucrados en una fusión, adquisición, financiamiento o venta de activos comerciales, tu información puede ser transferida como parte de esa transacción."}
            </p>

            <h4>
              {language === "en"
                ? "3.5 Anonymized and Aggregated Data"
                : "3.5 Datos Anonimizados y Agregados"}
            </h4>
            <p>
              {language === "en"
                ? "We may share anonymized, aggregated information that cannot reasonably be used to identify you with third parties for research, development, and marketing purposes."
                : "Podemos compartir información anonimizada y agregada que no puede ser razonablemente usada para identificarte con terceros para propósitos de investigación, desarrollo y marketing."}
            </p>

            <h3>
              {language === "en"
                ? "4. Data Retention"
                : "4. Retención de Datos"}
            </h3>
            <p>
              {language === "en"
                ? "We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need to use your information, we will take reasonable steps to remove it from our systems and records."
                : "Retenemos tu información personal durante el tiempo necesario para cumplir los propósitos descritos en esta Política de Privacidad, a menos que un período de retención más largo sea requerido o permitido por ley. Cuando ya no necesitemos usar tu información, tomaremos medidas razonables para eliminarla de nuestros sistemas y registros."}
            </p>

            <h3>
              {language === "en" ? "5. Data Security" : "5. Seguridad de Datos"}
            </h3>
            <p>
              {language === "en"
                ? "We implement appropriate technical and organizational security measures designed to protect your personal information from unauthorized access, disclosure, alteration, and destruction. However, no internet or email transmission is ever fully secure or error-free, so we cannot guarantee absolute security."
                : "Implementamos medidas de seguridad técnicas y organizacionales apropiadas diseñadas para proteger tu información personal de acceso no autorizado, divulgación, alteración y destrucción. Sin embargo, ninguna transmisión por internet o correo electrónico es completamente segura o libre de errores, por lo que no podemos garantizar seguridad absoluta."}
            </p>

            <h3>
              {language === "en"
                ? "6. Your Data Protection Rights"
                : "6. Tus Derechos de Protección de Datos"}
            </h3>
            <p>
              {language === "en"
                ? "Depending on your location, you may have certain rights regarding your personal information, including:"
                : "Dependiendo de tu ubicación, puedes tener ciertos derechos respecto a tu información personal, incluyendo:"}
            </p>
            <ul>
              <li>
                <strong>{language === "en" ? "Access" : "Acceso"}</strong>:{" "}
                {language === "en"
                  ? "Request access to your personal information"
                  : "Solicitar acceso a tu información personal"}
              </li>
              <li>
                <strong>
                  {language === "en" ? "Correction" : "Corrección"}
                </strong>
                :{" "}
                {language === "en"
                  ? "Request correction of inaccurate personal information"
                  : "Solicitar corrección de información personal inexacta"}
              </li>
              <li>
                <strong>
                  {language === "en" ? "Deletion" : "Eliminación"}
                </strong>
                :{" "}
                {language === "en"
                  ? "Request deletion of your personal information"
                  : "Solicitar eliminación de tu información personal"}
              </li>
              <li>
                <strong>
                  {language === "en" ? "Portability" : "Portabilidad"}
                </strong>
                :{" "}
                {language === "en"
                  ? "Request transfer of your personal information"
                  : "Solicitar transferencia de tu información personal"}
              </li>
              <li>
                <strong>
                  {language === "en" ? "Restriction" : "Restricción"}
                </strong>
                :{" "}
                {language === "en"
                  ? "Object to or request restriction of processing"
                  : "Objetar o solicitar restricción del procesamiento"}
              </li>
              <li>
                <strong>
                  {language === "en"
                    ? "Withdrawal of Consent"
                    : "Retiro de Consentimiento"}
                </strong>
                :{" "}
                {language === "en"
                  ? "Withdraw consent where processing is based on consent"
                  : "Retirar consentimiento donde el procesamiento se base en consentimiento"}
              </li>
            </ul>

            <p>
              {language === "en"
                ? 'To exercise these rights, please contact us using the information provided in the "Contact Us" section.'
                : 'Para ejercer estos derechos, por favor contáctanos usando la información proporcionada en la sección "Contáctanos".'}
            </p>

            <h3>
              {language === "en"
                ? "7. Children's Privacy"
                : "7. Privacidad de Menores"}
            </h3>
            <p>
              {language === "en"
                ? "Our Service is not directed to children under the age of 16, and we do not knowingly collect personal information from children under 16. If we learn we have collected personal information from a child under 16, we will delete that information as quickly as possible. If you believe a child under 16 has provided us with personal information, please contact us."
                : "Nuestro Servicio no está dirigido a menores de 16 años, y no recopilamos conscientemente información personal de menores de 16 años. Si nos enteramos de que hemos recopilado información personal de un menor de 16 años, eliminaremos esa información tan rápido como sea posible. Si crees que un menor de 16 años nos ha proporcionado información personal, por favor contáctanos."}
            </p>

            <h3>
              {language === "en"
                ? "8. International Data Transfers"
                : "8. Transferencias Internacionales de Datos"}
            </h3>
            <p>
              {language === "en"
                ? "Your information may be transferred to, and processed in, countries other than the country in which you reside. These countries may have data protection laws that are different from the laws of your country. We take steps to ensure that your personal information receives an adequate level of protection in the countries in which we process it."
                : "Tu información puede ser transferida a, y procesada en, países diferentes al país en el que resides. Estos países pueden tener leyes de protección de datos que son diferentes a las leyes de tu país. Tomamos medidas para asegurar que tu información personal reciba un nivel adecuado de protección en los países en los que la procesamos."}
            </p>

            <h3>
              {language === "en"
                ? "9. Cookies and Tracking Technologies"
                : "9. Cookies y Tecnologías de Seguimiento"}
            </h3>
            <p>
              {language === "en"
                ? "We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service."
                : "Usamos cookies y tecnologías de seguimiento similares para rastrear actividad en nuestro Servicio y mantener cierta información. Puedes instruir a tu navegador para rechazar todas las cookies o para indicar cuando se está enviando una cookie. Sin embargo, si no aceptas cookies, puede que no puedas usar algunas partes de nuestro Servicio."}
            </p>

            <h3>
              {language === "en"
                ? "10. Third-Party Services"
                : "10. Servicios de Terceros"}
            </h3>
            <p>
              {language === "en"
                ? "Our Service may contain links to third-party websites, services, or applications that are not operated by us. We have no control over and assume no responsibility for the privacy practices of these third parties. We encourage you to review the privacy policies of every third-party service that you visit or use."
                : "Nuestro Servicio puede contener enlaces a sitios web, servicios o aplicaciones de terceros que no son operados por nosotros. No tenemos control sobre y no asumimos responsabilidad por las prácticas de privacidad de estos terceros. Te animamos a revisar las políticas de privacidad de cada servicio de terceros que visites o uses."}
            </p>

            <h3>
              {language === "en"
                ? "11. AI Data Processing"
                : "11. Procesamiento de Datos de IA"}
            </h3>
            <h4>
              {language === "en"
                ? "11.1 Training Data"
                : "11.1 Datos de Entrenamiento"}
            </h4>
            <p>
              {language === "en"
                ? "We use anonymized and aggregated user data to train and improve our AI algorithms. This process removes personally identifiable information and combines data from multiple users to ensure privacy."
                : "Usamos datos de usuario anonimizados y agregados para entrenar y mejorar nuestros algoritmos de IA. Este proceso elimina información personalmente identificable y combina datos de múltiples usuarios para asegurar privacidad."}
            </p>

            <h4>
              {language === "en"
                ? "11.2 Score Sheet Analysis"
                : "11.2 Análisis de Hojas de Puntuación"}
            </h4>
            <p>
              {language === "en"
                ? "When you upload dressage test score sheets, our AI processes the information to provide personalized recommendations. The original score sheets and analysis results are stored securely and associated with your account."
                : "Cuando subes hojas de puntuación de pruebas de doma, nuestra IA procesa la información para proporcionar recomendaciones personalizadas. Las hojas de puntuación originales y los resultados del análisis se almacenan de forma segura y se asocian con tu cuenta."}
            </p>

            <h4>
              {language === "en"
                ? "11.3 User Control"
                : "11.3 Control del Usuario"}
            </h4>
            <p>
              {language === "en"
                ? "You can delete uploaded score sheets from your account at any time. Once deleted, the original sheets will no longer be accessible, though anonymized insights may remain part of our aggregated training data."
                : "Puedes eliminar hojas de puntuación subidas de tu cuenta en cualquier momento. Una vez eliminadas, las hojas originales ya no serán accesibles, aunque insights anonimizados pueden permanecer como parte de nuestros datos agregados de entrenamiento."}
            </p>

            <h3>
              {language === "en"
                ? "12. Marketing Communications"
                : "12. Comunicaciones de Marketing"}
            </h3>
            <p>
              {language === "en"
                ? "We may use your personal information to contact you with newsletters, marketing, or promotional materials and other information that may be of interest to you. You can opt out of receiving any, or all, of these communications from us by following the unsubscribe instructions provided in any email we send or by contacting us."
                : "Podemos usar tu información personal para contactarte con boletines informativos, marketing o materiales promocionales y otra información que pueda ser de tu interés. Puedes optar por no recibir cualquiera, o todas, estas comunicaciones de nosotros siguiendo las instrucciones de cancelación de suscripción proporcionadas en cualquier correo electrónico que enviemos o contactándonos."}
            </p>

            <h3>
              {language === "en"
                ? "13. Changes to This Privacy Policy"
                : "13. Cambios a esta Política de Privacidad"}
            </h3>
            <p>
              {language === "en"
                ? 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.'
                : 'Podemos actualizar nuestra Política de Privacidad de vez en cuando. Te notificaremos de cualquier cambio publicando la nueva Política de Privacidad en esta página y actualizando la fecha de "Última Actualización". Se te aconseja revisar esta Política de Privacidad periódicamente para cualquier cambio. Los cambios a esta Política de Privacidad son efectivos cuando se publican en esta página.'}
            </p>

            <h3>{language === "en" ? "14. Contact Us" : "14. Contáctanos"}</h3>
            <p>
              {language === "en"
                ? "If you have any questions about this Privacy Policy, please contact us:"
                : "Si tienes alguna pregunta sobre esta Política de Privacidad, por favor contáctanos:"}
            </p>
            <ul>
              <li>
                {language === "en"
                  ? "By email: privacy@aidressagetrainer.com"
                  : "Por correo electrónico: privacy@aidressagetrainer.com"}
              </li>
            </ul>

            <h3>
              {language === "en"
                ? "15. Data Protection Officer"
                : "15. Oficial de Protección de Datos"}
            </h3>
            <p>
              {language === "en"
                ? "Our Data Protection Officer can be contacted at dpo@aidressagetrainer.com for any data protection related inquiries."
                : "Nuestro Oficial de Protección de Datos puede ser contactado en dpo@aidressagetrainer.com para cualquier consulta relacionada con protección de datos."}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Privacy;
