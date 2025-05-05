
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EmailSettings = () => {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    provider: "brevo",
    sendFromName: "AI Equestrian",
    sendFromEmail: "notifications@aiequestrian.com",
    replyToEmail: "support@aiequestrian.com",
    enableEmailVerification: true,
    enableWelcomeEmail: true
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState("welcome");
  
  const [templates, setTemplates] = useState({
    welcome: {
      subject: "Welcome to AI Equestrian!",
      body: `<p>Dear {{name}},</p>
<p>Welcome to AI Equestrian! We're excited to have you join our community.</p>
<p>With your new account, you can:</p>
<ul>
  <li>Upload and analyze your dressage tests</li>
  <li>Track your progress over time</li>
  <li>Receive personalized training recommendations</li>
</ul>
<p>If you have any questions, please don't hesitate to reach out to our support team.</p>
<p>Happy riding!</p>
<p>The AI Equestrian Team</p>`
    },
    passwordReset: {
      subject: "Reset Your AI Equestrian Password",
      body: `<p>Dear {{name}},</p>
<p>We received a request to reset your password for your AI Equestrian account.</p>
<p>To reset your password, please click the link below:</p>
<p><a href="{{resetLink}}">Reset My Password</a></p>
<p>If you did not request this password reset, you can safely ignore this email.</p>
<p>The AI Equestrian Team</p>`
    },
    analysisComplete: {
      subject: "Your Analysis is Ready",
      body: `<p>Dear {{name}},</p>
<p>Great news! We've completed the analysis of your recent submission.</p>
<p>Your analysis report is now available in your dashboard. Click the link below to view it:</p>
<p><a href="{{reportLink}}">View My Analysis</a></p>
<p>We hope you find the insights valuable for your training.</p>
<p>The AI Equestrian Team</p>`
    }
  });
  
  const handleSettingsChange = (field: string, value: any) => {
    setSettings({
      ...settings,
      [field]: value
    });
  };
  
  const handleTemplateChange = (field: string, value: string) => {
    setTemplates({
      ...templates,
      [selectedTemplate]: {
        ...templates[selectedTemplate as keyof typeof templates],
        [field]: value
      }
    });
  };
  
  const handleSaveSettings = () => {
    // In a real app, you would save the settings to your database
    console.log("Saving email settings:", settings);
    
    toast({
      title: "Settings Saved",
      description: "Email settings have been updated successfully.",
    });
  };
  
  const handleSaveTemplate = () => {
    // In a real app, you would save the template to your database
    console.log("Saving email template:", templates[selectedTemplate as keyof typeof templates]);
    
    toast({
      title: "Template Saved",
      description: "Email template has been updated successfully.",
    });
  };
  
  const handleTestEmail = () => {
    // In a real app, you would send a test email
    toast({
      title: "Test Email Sent",
      description: "Check your inbox for the test email.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Provider Settings</CardTitle>
          <CardDescription>
            Configure your email delivery provider
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-provider">Email Provider</Label>
            <Select 
              value={settings.provider}
              onValueChange={(value) => handleSettingsChange("provider", value)}
            >
              <SelectTrigger id="email-provider">
                <SelectValue placeholder="Select email provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brevo">Brevo (SendInBlue)</SelectItem>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
                <SelectItem value="mailchimp">Mailchimp</SelectItem>
                <SelectItem value="aws-ses">Amazon SES</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="from-name">Send From Name</Label>
            <Input 
              id="from-name" 
              value={settings.sendFromName} 
              onChange={(e) => handleSettingsChange("sendFromName", e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="from-email">Send From Email</Label>
            <Input 
              id="from-email" 
              type="email"
              value={settings.sendFromEmail} 
              onChange={(e) => handleSettingsChange("sendFromEmail", e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reply-to">Reply-To Email</Label>
            <Input 
              id="reply-to" 
              type="email"
              value={settings.replyToEmail} 
              onChange={(e) => handleSettingsChange("replyToEmail", e.target.value)} 
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="email-verification">Email Verification</Label>
              <p className="text-xs text-gray-500">
                Require email verification for new accounts
              </p>
            </div>
            <Switch 
              id="email-verification" 
              checked={settings.enableEmailVerification}
              onCheckedChange={(checked) => handleSettingsChange("enableEmailVerification", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="welcome-email">Welcome Email</Label>
              <p className="text-xs text-gray-500">
                Send welcome email to new users
              </p>
            </div>
            <Switch 
              id="welcome-email" 
              checked={settings.enableWelcomeEmail}
              onCheckedChange={(checked) => handleSettingsChange("enableWelcomeEmail", checked)}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-between border-t p-4">
          <Button variant="outline" onClick={handleTestEmail}>
            Send Test Email
          </Button>
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Customize email templates sent to users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="welcome">Welcome</TabsTrigger>
              <TabsTrigger value="passwordReset">Password Reset</TabsTrigger>
              <TabsTrigger value="analysisComplete">Analysis Complete</TabsTrigger>
            </TabsList>
            
            <TabsContent value="welcome" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="welcome-subject">Subject</Label>
                <Input 
                  id="welcome-subject" 
                  value={templates.welcome.subject} 
                  onChange={(e) => handleTemplateChange("subject", e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="welcome-body">Email Body (HTML)</Label>
                <Textarea 
                  id="welcome-body" 
                  value={templates.welcome.body} 
                  onChange={(e) => handleTemplateChange("body", e.target.value)} 
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Available variables: {{name}}, {{email}}, {{loginUrl}}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="passwordReset" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="reset-subject">Subject</Label>
                <Input 
                  id="reset-subject" 
                  value={templates.passwordReset.subject} 
                  onChange={(e) => handleTemplateChange("subject", e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reset-body">Email Body (HTML)</Label>
                <Textarea 
                  id="reset-body" 
                  value={templates.passwordReset.body} 
                  onChange={(e) => handleTemplateChange("body", e.target.value)} 
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Available variables: {{name}}, {{email}}, {{resetLink}}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="analysisComplete" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="analysis-subject">Subject</Label>
                <Input 
                  id="analysis-subject" 
                  value={templates.analysisComplete.subject} 
                  onChange={(e) => handleTemplateChange("subject", e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="analysis-body">Email Body (HTML)</Label>
                <Textarea 
                  id="analysis-body" 
                  value={templates.analysisComplete.body} 
                  onChange={(e) => handleTemplateChange("body", e.target.value)} 
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Available variables: {{name}}, {{email}}, {{reportLink}}, {{reportName}}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="justify-end border-t p-4">
          <Button onClick={handleSaveTemplate}>Save Template</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmailSettings;
