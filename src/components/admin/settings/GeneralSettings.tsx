
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const GeneralSettings = () => {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    siteName: "AI Equestrian",
    siteDescription: "Equine analytics platform using artificial intelligence to analyze horse and rider performance across dressage and show jumping disciplines.",
    contactEmail: "info@aiequestrian.com",
    supportEmail: "support@aiequestrian.com",
    siteUrl: "https://aiequestrian.com",
    maintenanceMode: false,
    registrationEnabled: true,
    analyticsEnabled: true
  });
  
  const handleChange = (field: string, value: any) => {
    setSettings({
      ...settings,
      [field]: value
    });
  };
  
  const handleSave = () => {
    // In a real app, you would save the settings to your database
    console.log("Saving settings:", settings);
    
    toast({
      title: "Settings Saved",
      description: "General settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
          <CardDescription>
            Configure basic information about your website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input 
              id="site-name" 
              value={settings.siteName} 
              onChange={(e) => handleChange("siteName", e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="site-description">Site Description</Label>
            <Textarea 
              id="site-description" 
              value={settings.siteDescription} 
              onChange={(e) => handleChange("siteDescription", e.target.value)} 
              rows={3}
            />
            <p className="text-xs text-gray-500">
              This description will be used in metadata for search engines.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="site-url">Site URL</Label>
            <Input 
              id="site-url" 
              value={settings.siteUrl} 
              onChange={(e) => handleChange("siteUrl", e.target.value)} 
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t p-4">
          <Button onClick={handleSave}>Save Site Settings</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            Set contact emails for your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-email">Contact Email</Label>
            <Input 
              id="contact-email" 
              type="email"
              value={settings.contactEmail} 
              onChange={(e) => handleChange("contactEmail", e.target.value)} 
            />
            <p className="text-xs text-gray-500">
              This email will be displayed on your contact page.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="support-email">Support Email</Label>
            <Input 
              id="support-email" 
              type="email"
              value={settings.supportEmail} 
              onChange={(e) => handleChange("supportEmail", e.target.value)} 
            />
            <p className="text-xs text-gray-500">
              This email will be used for support inquiries.
            </p>
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t p-4">
          <Button onClick={handleSave}>Save Contact Information</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Configure system-wide settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              <p className="text-xs text-gray-500">
                When enabled, the site will display a maintenance page to visitors.
              </p>
            </div>
            <Switch 
              id="maintenance-mode" 
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => handleChange("maintenanceMode", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="registration-enabled">User Registration</Label>
              <p className="text-xs text-gray-500">
                When disabled, new users cannot register on the site.
              </p>
            </div>
            <Switch 
              id="registration-enabled" 
              checked={settings.registrationEnabled}
              onCheckedChange={(checked) => handleChange("registrationEnabled",  checked)}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="analytics-enabled">Analytics</Label>
              <p className="text-xs text-gray-500">
                Enable or disable collection of analytics data.
              </p>
            </div>
            <Switch 
              id="analytics-enabled" 
              checked={settings.analyticsEnabled}
              onCheckedChange={(checked) => handleChange("analyticsEnabled", checked)}
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t p-4">
          <Button onClick={handleSave}>Save System Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GeneralSettings;
