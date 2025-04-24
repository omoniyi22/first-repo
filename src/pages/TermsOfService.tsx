
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TermsOfService = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  // When dialog closes, navigate back to previous page
  const handleClose = () => {
    setOpen(false);
    navigate(-1);
  };

  // Ensure we use React state
  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <>
      {/* Keep standard page content for direct navigation */}
      <div className="container mx-auto px-6 py-12 prose prose-purple max-w-4xl">
        <h1>Terms of Service</h1>
        <h2>AI Dressage Trainer</h2>
        <p><strong>Last Updated: April 24, 2025</strong></p>
        {/* Content in the page */}
      </div>

      {/* Dialog that automatically opens */}
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-purple-800">Terms of Service</DialogTitle>
            <DialogDescription className="text-lg font-serif text-purple-700">
              AI Dressage Trainer
            </DialogDescription>
          </DialogHeader>
          
          <div className="prose prose-purple">
            <p><strong>Last Updated: April 24, 2025</strong></p>

            <p>Please read these Terms of Service ("Terms") carefully before using the AI Dressage Trainer website, mobile application, and services (collectively, the "Service") operated by AI Dressage Trainer ("we," "us," or "our").</p>
            
            <h3>1. Acceptance of Terms</h3>
            <p>By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the Service.</p>
            
            <h3>2. Description of Service</h3>
            <p>AI Dressage Trainer provides an artificial intelligence platform that analyzes dressage test score sheets and offers personalized training recommendations. Our Service includes:</p>
            <ul>
              <li>Score sheet analysis through image uploads</li>
              <li>Performance tracking and progress monitoring</li>
              <li>Customized training recommendations</li>
              <li>Access to training resources and exercise libraries</li>
            </ul>

            <h3>3. Account Registration</h3>
            <p>a) To use certain features of the Service, you must register for an account.</p>
            <p>b) You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>
            <p>c) You are responsible for safeguarding the password used to access the Service and for any activities or actions under your password.</p>
            <p>d) You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>

            <h3>4. Subscription Plans and Payment</h3>
            <p>a) Our Service offers various subscription plans with different features and limitations. Current pricing and plan details are available on our website.</p>
            <p>b) You agree to pay all fees associated with your selected subscription plan. All payments are non-refundable except as expressly provided in these Terms.</p>
            <p>c) Subscription fees are charged at the beginning of each billing period (monthly or annually). You authorize us to charge the payment method you provide for the subscription fees.</p>
            <p>d) You may cancel your subscription at any time. Upon cancellation, your subscription will remain active until the end of your current billing period, after which it will not renew.</p>
            <p>e) We reserve the right to change our subscription fees upon notice. Any fee changes will take effect at the start of the next billing period.</p>

            <h3>5. User Content</h3>
            <p>a) Our Service allows you to upload, store, and share content, including but not limited to dressage test score sheets, performance data, and user profiles ("User Content").</p>
            <p>b) You retain all rights to your User Content. By uploading User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display such User Content for the purpose of providing and improving the Service.</p>
            <p>c) You represent and warrant that you own or have the necessary rights to your User Content and that such content does not violate the rights of any third party.</p>
            <p>d) We reserve the right to remove any User Content that violates these Terms or that we find objectionable for any reason, without prior notice.</p>

            <h3>6. Anonymized Data Usage</h3>
            <p>a) You agree that we may collect and use anonymized, aggregated data derived from your use of the Service for improving our AI algorithms, research purposes, and general service enhancement.</p>
            <p>b) Such anonymized data will not contain personally identifiable information and will be used in compliance with our Privacy Policy.</p>

            <h3>7. Prohibited Uses</h3>
            <p>You agree not to:</p>
            <p>a) Use the Service for any illegal purpose or in violation of any local, state, national, or international law.</p>
            <p>b) Violate or infringe other's rights, including but not limited to privacy, publicity, and intellectual property rights.</p>
            <p>c) Attempt to circumvent, disable, or interfere with security-related features of the Service or features that prevent or restrict use or copying of any content.</p>
            <p>d) Use any robot, spider, crawler, scraper, or other automated means to access the Service.</p>
            <p>e) Introduce any viruses, trojan horses, worms, logic bombs, or other harmful material.</p>
            <p>f) Attempt to gain unauthorized access to, interfere with, damage, or disrupt the Service or servers or networks connected to the Service.</p>

            <h3>8. Intellectual Property Rights</h3>
            <p>a) The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of AI Dressage Trainer and its licensors.</p>
            <p>b) Our trademarks, service marks, logos, and trade names may not be used without our prior written consent.</p>

            <h3>9. Third-Party Links and Services</h3>
            <p>a) Our Service may contain links to third-party websites or services that are not owned or controlled by us.</p>
            <p>b) We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services.</p>
            <p>c) You acknowledge and agree that we shall not be responsible or liable for any damage or loss caused by use of any such third-party websites or services.</p>

            <h3>10. Termination</h3>
            <p>a) We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including but not limited to a breach of the Terms.</p>
            <p>b) Upon termination, your right to use the Service will immediately cease. All provisions of the Terms which by their nature should survive termination shall survive termination.</p>

            <h3>11. Limitation of Liability</h3>
            <p>a) In no event shall AI Dressage Trainer, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:</p>
            <ul>
              <li>Your access to or use of or inability to access or use the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Any content obtained from the Service</li>
              <li>Unauthorized access, use or alteration of your transmissions or content</li>
            </ul>
            <p>b) The limitations of liability set forth above shall apply to the fullest extent permitted by law in the applicable jurisdiction.</p>

            <h3>12. Warranty Disclaimer</h3>
            <p>The Service is provided "as is" and "as available" without warranties of any kind, either express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>

            <h3>13. Indemnification</h3>
            <p>You agree to defend, indemnify, and hold harmless AI Dressage Trainer and its licensees, licensors, and service providers from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Service.</p>

            <h3>14. Governing Law</h3>
            <p>These Terms shall be governed by the laws of [Your Jurisdiction], without regard to its conflict of law provisions.</p>

            <h3>15. Changes to Terms</h3>
            <p>We reserve the right to modify or replace these Terms at any time. We will provide notice of changes by posting the updated Terms on this page with a new effective date. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.</p>

            <h3>16. Contact Information</h3>
            <p>If you have any questions about these Terms, please contact us at support@aidressagetrainer.com.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TermsOfService;
