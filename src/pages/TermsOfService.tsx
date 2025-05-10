
import React, { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SEO, getPageMetadata } from '@/lib/seo';

const TermsOfService = () => {
  // Get page SEO metadata
  const seoMetadata = getPageMetadata('terms');

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <>
      <SEO {...seoMetadata} />
      <Navbar />
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-center mb-10 text-purple-900">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Welcome to AI Equestrian. These Terms of Service govern your use of our website and services.
              By accessing or using our services, you agree to these terms. Please read them carefully.
            </p>
            
            <h2>2. Using Our Services</h2>
            <p>
              You must follow any policies made available to you within the Services. You may use our
              Services only as permitted by law. We may suspend or stop providing our Services to you if
              you do not comply with our terms or policies or if we are investigating suspected misconduct.
            </p>
            
            <h2>3. Your AI Equestrian Account</h2>
            <p>
              You may need an AI Equestrian account in order to use some of our Services. To protect your
              account, keep your password confidential. You are responsible for the activity that happens
              on or through your account.
            </p>
            
            <h2>4. Privacy and Copyright Protection</h2>
            <p>
              Our privacy policies explain how we treat your personal data and protect your privacy when
              you use our Services. By using our Services, you agree that AI Equestrian can use such data in
              accordance with our privacy policies.
            </p>
            
            <h2>5. Your Content in Our Services</h2>
            <p>
              Some of our Services allow you to upload, submit, store, send or receive content. When you
              upload content to our Services, you give AI Equestrian a worldwide license to use, host, store,
              reproduce, modify, create derivative works, communicate, publish, publicly perform, publicly
              display and distribute such content.
            </p>
            
            <h2>6. Modifying and Terminating Our Services</h2>
            <p>
              We are constantly changing and improving our Services. We may add or remove functionalities
              or features, and we may suspend or stop a Service altogether. You can stop using our Services
              at any time, although we'll be sorry to see you go.
            </p>
            
            <h2>7. Our Warranties and Disclaimers</h2>
            <p>
              We provide our Services using a commercially reasonable level of skill and care. But there are
              certain things that we don't promise about our Services. Other than as expressly set out in
              these terms, AI Equestrian does not make any specific promises about the Services.
            </p>
            
            <h2>8. Liability for Our Services</h2>
            <p>
              When permitted by law, AI Equestrian will not be responsible for lost profits, revenues, or data,
              financial losses or indirect, special, consequential, exemplary, or punitive damages. To the
              extent permitted by law, the total liability of AI Equestrian for any claims under these terms
              is limited to the amount you paid us to use the Services.
            </p>
            
            <h2>9. About These Terms</h2>
            <p>
              We may modify these terms or any additional terms that apply to a Service. You should look at
              the terms regularly. Changes will not apply retroactively and will become effective no sooner
              than fourteen days after they are posted.
            </p>
            
            <p className="mt-10 text-sm text-gray-600">
              Last Updated: May 10, 2025
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TermsOfService;
