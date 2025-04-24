import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Privacy = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    navigate(-1);
  };

  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <>
      <div className="container mx-auto px-6 py-12 prose prose-purple max-w-4xl">
        <h1>Privacy Policy</h1>
        <h2>AI Dressage Trainer</h2>
        <p><strong>Last Updated: April 24, 2025</strong></p>
      </div>

      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-purple-800">Privacy Policy</DialogTitle>
            <DialogDescription className="text-lg font-serif text-purple-700">
              AI Dressage Trainer
            </DialogDescription>
          </DialogHeader>
          
          <div className="prose prose-purple">
            <p><strong>Last Updated: April 24, 2025</strong></p>

            <p>This Privacy Policy describes how AI Dressage Trainer ("we," "us," or "our") collects, uses, and discloses your personal information when you use our website, mobile application, and services (collectively, the "Service").</p>

            <h3>1. Information We Collect</h3>
            <h4>1.1 Information You Provide to Us</h4>
            <p>We collect information you provide directly to us when you:</p>
            <ul>
              <li>Create an account or user profile</li>
              <li>Upload dressage test score sheets</li>
              <li>Set up horse profiles</li>
              <li>Subscribe to our service</li>
              <li>Contact customer support</li>
              <li>Participate in surveys or promotions</li>
            </ul>

            <p>This information may include:</p>
            <ul>
              <li>Contact information (name, email address, phone number)</li>
              <li>Account credentials (username, password)</li>
              <li>Payment information (processed by secure third-party payment processors)</li>
              <li>Profile information (your photo, horse details, trainer information)</li>
              <li>Dressage test score sheets and related performance data</li>
              <li>Communications with us</li>
            </ul>

            <h4>1.2 Information We Collect Automatically</h4>
            <p>When you use our Service, we automatically collect certain information, including:</p>
            <ul>
              <li>Usage data (features accessed, buttons clicked, time spent on pages)</li>
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Location information (based on IP address or GPS with your consent)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3>2. How We Use Your Information</h3>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our Service</li>
              <li>Process your score sheets and generate personalized recommendations</li>
              <li>Process payments and administer your subscription</li>
              <li>Send administrative messages, updates, and promotional content</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Detect, prevent, and address technical issues and fraudulent activities</li>
              <li>Improve our AI algorithms and training models through anonymized data</li>
            </ul>

            <h3>3. How We Share Your Information</h3>
            <p>We may share your personal information in the following circumstances:</p>

            <h4>3.1 With Your Consent</h4>
            <p>We may share your information when you direct us to do so or provide explicit consent.</p>

            <h4>3.2 Service Providers</h4>
            <p>We may share your information with third-party vendors, service providers, and other business partners who need access to such information to carry out work on our behalf, such as:</p>
            <ul>
              <li>Cloud storage providers</li>
              <li>Payment processors</li>
              <li>Customer service providers</li>
              <li>Analytics providers</li>
            </ul>

            <h4>3.3 Legal Requirements</h4>
            <p>We may disclose your information if required to do so by law or in response to valid legal requests, such as subpoenas, court orders, or government regulations.</p>

            <h4>3.4 Business Transfers</h4>
            <p>If we are involved in a merger, acquisition, financing, or sale of business assets, your information may be transferred as part of that transaction.</p>

            <h4>3.5 Anonymized and Aggregated Data</h4>
            <p>We may share anonymized, aggregated information that cannot reasonably be used to identify you with third parties for research, development, and marketing purposes.</p>

            <h3>4. Data Retention</h3>
            <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need to use your information, we will take reasonable steps to remove it from our systems and records.</p>

            <h3>5. Data Security</h3>
            <p>We implement appropriate technical and organizational security measures designed to protect your personal information from unauthorized access, disclosure, alteration, and destruction. However, no internet or email transmission is ever fully secure or error-free, so we cannot guarantee absolute security.</p>

            <h3>6. Your Data Protection Rights</h3>
            <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
            <ul>
              <li><strong>Access</strong>: Request access to your personal information</li>
              <li><strong>Correction</strong>: Request correction of inaccurate personal information</li>
              <li><strong>Deletion</strong>: Request deletion of your personal information</li>
              <li><strong>Portability</strong>: Request transfer of your personal information</li>
              <li><strong>Restriction</strong>: Object to or request restriction of processing</li>
              <li><strong>Withdrawal of Consent</strong>: Withdraw consent where processing is based on consent</li>
            </ul>

            <p>To exercise these rights, please contact us using the information provided in the "Contact Us" section.</p>

            <h3>7. Children's Privacy</h3>
            <p>Our Service is not directed to children under the age of 16, and we do not knowingly collect personal information from children under 16. If we learn we have collected personal information from a child under 16, we will delete that information as quickly as possible. If you believe a child under 16 has provided us with personal information, please contact us.</p>

            <h3>8. International Data Transfers</h3>
            <p>Your information may be transferred to, and processed in, countries other than the country in which you reside. These countries may have data protection laws that are different from the laws of your country. We take steps to ensure that your personal information receives an adequate level of protection in the countries in which we process it.</p>

            <h3>9. Cookies and Tracking Technologies</h3>
            <p>We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.</p>

            <h3>10. Third-Party Services</h3>
            <p>Our Service may contain links to third-party websites, services, or applications that are not operated by us. We have no control over and assume no responsibility for the privacy practices of these third parties. We encourage you to review the privacy policies of every third-party service that you visit or use.</p>

            <h3>11. AI Data Processing</h3>
            <h4>11.1 Training Data</h4>
            <p>We use anonymized and aggregated user data to train and improve our AI algorithms. This process removes personally identifiable information and combines data from multiple users to ensure privacy.</p>

            <h4>11.2 Score Sheet Analysis</h4>
            <p>When you upload dressage test score sheets, our AI processes the information to provide personalized recommendations. The original score sheets and analysis results are stored securely and associated with your account.</p>

            <h4>11.3 User Control</h4>
            <p>You can delete uploaded score sheets from your account at any time. Once deleted, the original sheets will no longer be accessible, though anonymized insights may remain part of our aggregated training data.</p>

            <h3>12. Marketing Communications</h3>
            <p>We may use your personal information to contact you with newsletters, marketing, or promotional materials and other information that may be of interest to you. You can opt out of receiving any, or all, of these communications from us by following the unsubscribe instructions provided in any email we send or by contacting us.</p>

            <h3>13. Changes to This Privacy Policy</h3>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

            <h3>14. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <ul>
              <li>By email: privacy@aidressagetrainer.com</li>
            </ul>

            <h3>15. Data Protection Officer</h3>
            <p>Our Data Protection Officer can be contacted at dpo@aidressagetrainer.com for any data protection related inquiries.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Privacy;
