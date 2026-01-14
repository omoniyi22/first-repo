
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

const IntegrationSettings = () => {
  const { toast } = useToast();
  
  const [integrations, setIntegrations] = useState({
    stripe: {
      enabled: true,
      connected: true,
      apiKey: "sk_test_••••••••••••••••••••••••",
      publicKey: "pk_test_••••••••••••••••••••••••",
      webhookSecret: "whsec_••••••••••••••••••••••••"
    },
    openai: {
      enabled: true,
      connected: true,
      apiKey: "sk-••••••••••••••••••••••••••••••••••••••••••••••"
    },
    google: {
      enabled: false,
      connected: false,
      clientId: "",
      clientSecret: ""
    },
    brevo: {
      enabled: true,
      connected: true,
      apiKey: "xkeysib-••••••••••••••••••••••••••••••••••••••••••••••"
    }
  });
  
  const handleToggle = (integration: string, field: string, value: boolean) => {
    setIntegrations({
      ...integrations,
      [integration]: {
        ...integrations[integration as keyof typeof integrations],
        [field]: value
      }
    });
  };
  
  const handleInputChange = (integration: string, field: string, value: string) => {
    setIntegrations({
      ...integrations,
      [integration]: {
        ...integrations[integration as keyof typeof integrations],
        [field]: value
      }
    });
  };
  
  const handleSave = (integration: string) => {
    // In a real app, you would save the settings to your database
    console.log("Saving integration:", integration, integrations[integration as keyof typeof integrations]);
    
    // Simulate connection status change
    if (integration === 'google' && !integrations.google.connected) {
      setIntegrations({
        ...integrations,
        google: {
          ...integrations.google,
          connected: true
        }
      });
    }
    
    toast({
      title: "Settings Saved",
      description: `${integration.charAt(0).toUpperCase() + integration.slice(1)} integration settings have been updated.`,
    });
  };
  
  const handleDisconnect = (integration: string) => {
    // In a real app, you would disconnect from the service
    setIntegrations({
      ...integrations,
      [integration]: {
        ...integrations[integration as keyof typeof integrations],
        connected: false
      }
    });
    
    toast({
      title: "Integration Disconnected",
      description: `${integration.charAt(0).toUpperCase() + integration.slice(1)} integration has been disconnected.`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stripe Integration</CardTitle>
              <CardDescription>
                Process payments with Stripe
              </CardDescription>
            </div>
            {integrations.stripe.connected ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="stripe-enabled">Enable Stripe</Label>
              <p className="text-xs text-gray-500">
                When enabled, payment features will be available.
              </p>
            </div>
            <Switch 
              id="stripe-enabled" 
              checked={integrations.stripe.enabled}
              onCheckedChange={(checked) => handleToggle("stripe", "enabled", checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stripe-secret">Secret API Key</Label>
            <Input 
              id="stripe-secret" 
              type="password"
              value={integrations.stripe.apiKey} 
              onChange={(e) => handleInputChange("stripe", "apiKey", e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stripe-public">Public API Key</Label>
            <Input 
              id="stripe-public" 
              value={integrations.stripe.publicKey} 
              onChange={(e) => handleInputChange("stripe", "publicKey", e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stripe-webhook">Webhook Secret</Label>
            <Input 
              id="stripe-webhook" 
              type="password"
              value={integrations.stripe.webhookSecret} 
              onChange={(e) => handleInputChange("stripe", "webhookSecret", e.target.value)} 
            />
          </div>
        </CardContent>
        <CardFooter className="justify-between border-t p-4">
          {integrations.stripe.connected && (
            <Button variant="outline" onClick={() => handleDisconnect("stripe")}>
              Disconnect
            </Button>
          )}
          <Button onClick={() => handleSave("stripe")}>Save</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>OpenAI Integration</CardTitle>
              <CardDescription>
                Use AI models for analysis and recommendations
              </CardDescription>
            </div>
            {integrations.openai.connected ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="openai-enabled">Enable OpenAI</Label>
              <p className="text-xs text-gray-500">
                When enabled, AI-powered analysis will be available.
              </p>
            </div>
            <Switch 
              id="openai-enabled" 
              checked={integrations.openai.enabled}
              onCheckedChange={(checked) => handleToggle("openai", "enabled", checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="openai-key">API Key</Label>
            <Input 
              id="openai-key" 
              type="password"
              value={integrations.openai.apiKey} 
              onChange={(e) => handleInputChange("openai", "apiKey", e.target.value)} 
            />
          </div>
        </CardContent>
        <CardFooter className="justify-between border-t p-4">
          {integrations.openai.connected && (
            <Button variant="outline" onClick={() => handleDisconnect("openai")}>
              Disconnect
            </Button>
          )}
          <Button onClick={() => handleSave("openai")}>Save</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Google Authentication</CardTitle>
              <CardDescription>
                Allow users to sign in with Google
              </CardDescription>
            </div>
            {integrations.google.connected ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="google-enabled">Enable Google Sign-In</Label>
              <p className="text-xs text-gray-500">
                When enabled, users can sign in with their Google account.
              </p>
            </div>
            <Switch 
              id="google-enabled" 
              checked={integrations.google.enabled}
              onCheckedChange={(checked) => handleToggle("google", "enabled", checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="google-client-id">Client ID</Label>
            <Input 
              id="google-client-id" 
              value={integrations.google.clientId} 
              onChange={(e) => handleInputChange("google", "clientId", e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="google-client-secret">Client Secret</Label>
            <Input 
              id="google-client-secret" 
              type="password"
              value={integrations.google.clientSecret} 
              onChange={(e) => handleInputChange("google", "clientSecret", e.target.value)} 
            />
          </div>
        </CardContent>
        <CardFooter className="justify-between border-t p-4">
          {integrations.google.connected && (
            <Button variant="outline" onClick={() => handleDisconnect("google")}>
              Disconnect
            </Button>
          )}
          <Button onClick={() => handleSave("google")}>Save</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Brevo Integration</CardTitle>
              <CardDescription>
                Send transactional emails with Brevo (formerly SendInBlue)
              </CardDescription>
            </div>
            {integrations.brevo.connected ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="brevo-enabled">Enable Brevo</Label>
              <p className="text-xs text-gray-500">
                When enabled, email notifications will be sent through Brevo.
              </p>
            </div>
            <Switch 
              id="brevo-enabled" 
              checked={integrations.brevo.enabled}
              onCheckedChange={(checked) => handleToggle("brevo", "enabled", checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="brevo-key">API Key</Label>
            <Input 
              id="brevo-key" 
              type="password"
              value={integrations.brevo.apiKey} 
              onChange={(e) => handleInputChange("brevo", "apiKey", e.target.value)} 
            />
          </div>
        </CardContent>
        <CardFooter className="justify-between border-t p-4">
          {integrations.brevo.connected && (
            <Button variant="outline" onClick={() => handleDisconnect("brevo")}>
              Disconnect
            </Button>
          )}
          <Button onClick={() => handleSave("brevo")}>Save</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default IntegrationSettings;
