import React, { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SEO, getPageMetadata } from "@/lib/seo";
import { useLanguage } from "@/contexts/LanguageContext";

const TermsOfService = () => {
  const { language } = useLanguage();
  const seoMetadata = getPageMetadata("terms");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEO {...seoMetadata} />
      <Navbar />
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-center mb-10 text-purple-900">
            {language === "en" ? "Terms of Service" : "Términos del Servicio"}
          </h1>

          <div className="prose prose-lg max-w-none">
            <h2>{language === "en" ? "1. Introduction" : "1. Introducción"}</h2>
            <p>
              {language === "en"
                ? "Welcome to AI Equestrian. These Terms of Service govern your use of our website and services. By accessing or using our services, you agree to these terms. Please read them carefully."
                : "Bienvenido a AI Equestrian. Estos Términos del Servicio rigen el uso de nuestro sitio web y servicios. Al acceder o usar nuestros servicios, aceptas estos términos. Por favor, léelos cuidadosamente."}
            </p>

            <h2>
              {language === "en"
                ? "2. Using Our Services"
                : "2. Uso de Nuestros Servicios"}
            </h2>
            <p>
              {language === "en"
                ? "You must follow any policies made available to you within the Services. You may use our Services only as permitted by law. We may suspend or stop providing our Services to you if you do not comply with our terms or policies or if we are investigating suspected misconduct."
                : "Debes seguir todas las políticas disponibles dentro de los Servicios. Solo puedes usar nuestros Servicios según lo permitido por la ley. Podemos suspender o dejar de ofrecer nuestros Servicios si no cumples con nuestros términos o si investigamos una conducta inapropiada."}
            </p>

            <h2>
              {language === "en"
                ? "3. Your AI Equestrian Account"
                : "3. Tu Cuenta de AI Equestrian"}
            </h2>
            <p>
              {language === "en"
                ? "You may need an AI Equestrian account in order to use some of our Services. To protect your account, keep your password confidential. You are responsible for the activity that happens on or through your account."
                : "Es posible que necesites una cuenta de AI Equestrian para usar algunos de nuestros Servicios. Para proteger tu cuenta, mantén tu contraseña confidencial. Eres responsable de la actividad que ocurra en tu cuenta o a través de ella."}
            </p>

            <h2>
              {language === "en"
                ? "4. Privacy and Copyright Protection"
                : "4. Privacidad y Protección de Derechos de Autor"}
            </h2>
            <p>
              {language === "en"
                ? "Our privacy policies explain how we treat your personal data and protect your privacy when you use our Services. By using our Services, you agree that AI Equestrian can use such data in accordance with our privacy policies."
                : "Nuestras políticas de privacidad explican cómo tratamos tus datos personales y protegemos tu privacidad al usar nuestros Servicios. Al utilizar nuestros Servicios, aceptas que AI Equestrian use dichos datos de acuerdo con nuestras políticas de privacidad."}
            </p>

            <h2>
              {language === "en"
                ? "5. Your Content in Our Services"
                : "5. Tu Contenido en Nuestros Servicios"}
            </h2>
            <p>
              {language === "en"
                ? "Some of our Services allow you to upload, submit, store, send or receive content. When you upload content to our Services, you give AI Equestrian a worldwide license to use, host, store, reproduce, modify, create derivative works, communicate, publish, publicly perform, publicly display and distribute such content."
                : "Algunos de nuestros Servicios te permiten subir, enviar, almacenar, enviar o recibir contenido. Al subir contenido a nuestros Servicios, otorgas a AI Equestrian una licencia mundial para usar, alojar, almacenar, reproducir, modificar, crear obras derivadas, comunicar, publicar, presentar públicamente, mostrar públicamente y distribuir dicho contenido."}
            </p>

            <h2>
              {language === "en"
                ? "6. Modifying and Terminating Our Services"
                : "6. Modificación y Terminación de Nuestros Servicios"}
            </h2>
            <p>
              {language === "en"
                ? "We are constantly changing and improving our Services. We may add or remove functionalities or features, and we may suspend or stop a Service altogether. You can stop using our Services at any time, although we'll be sorry to see you go."
                : "Estamos constantemente mejorando nuestros Servicios. Podemos añadir o eliminar funcionalidades, o incluso suspender o finalizar un Servicio por completo. Puedes dejar de usar nuestros Servicios en cualquier momento, aunque lamentaremos que te vayas."}
            </p>

            <h2>
              {language === "en"
                ? "7. Our Warranties and Disclaimers"
                : "7. Garantías y Exenciones de Responsabilidad"}
            </h2>
            <p>
              {language === "en"
                ? "We provide our Services using a commercially reasonable level of skill and care. But there are certain things that we don't promise about our Services. Other than as expressly set out in these terms, AI Equestrian does not make any specific promises about the Services."
                : "Ofrecemos nuestros Servicios con un nivel razonable de habilidad y cuidado. Pero hay ciertas cosas que no prometemos. Salvo que se indique expresamente en estos términos, AI Equestrian no ofrece promesas específicas sobre los Servicios."}
            </p>

            <h2>
              {language === "en"
                ? "8. Liability for Our Services"
                : "8. Responsabilidad por Nuestros Servicios"}
            </h2>
            <p>
              {language === "en"
                ? "When permitted by law, AI Equestrian will not be responsible for lost profits, revenues, or data, financial losses or indirect, special, consequential, exemplary, or punitive damages. To the extent permitted by law, the total liability of AI Equestrian for any claims under these terms is limited to the amount you paid us to use the Services."
                : "Cuando la ley lo permita, AI Equestrian no será responsable de pérdidas de beneficios, ingresos o datos, pérdidas financieras o daños indirectos, especiales, consecuentes, ejemplares o punitivos. En la medida permitida por la ley, la responsabilidad total de AI Equestrian por cualquier reclamación bajo estos términos se limita al monto que hayas pagado por usar los Servicios."}
            </p>

            <h2>
              {language === "en"
                ? "9. About These Terms"
                : "9. Sobre Estos Términos"}
            </h2>
            <p>
              {language === "en"
                ? "We may modify these terms or any additional terms that apply to a Service. You should look at the terms regularly. Changes will not apply retroactively and will become effective no sooner than fourteen days after they are posted."
                : "Podemos modificar estos términos o cualquier término adicional que se aplique a un Servicio. Deberías revisar los términos con regularidad. Los cambios no serán retroactivos y entrarán en vigor no antes de catorce días después de su publicación."}
            </p>

            <p className="mt-10 text-sm text-gray-600">
              {language === "en"
                ? "Last Updated: May 10, 2025"
                : "Última actualización: 10 de mayo de 2025"}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TermsOfService;
