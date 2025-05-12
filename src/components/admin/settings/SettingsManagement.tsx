
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralSettings from "@/components/admin/settings/GeneralSettings";
import EmailSettings from "@/components/admin/settings/EmailSettings";
import IntegrationSettings from "@/components/admin/settings/IntegrationSettings";
import PricingSettings from "@/components/admin/settings/PricingSettings";

const SettingsManagement = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage application settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 sm:w-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <GeneralSettings />
        </TabsContent>
        
        <TabsContent value="email" className="mt-6">
          <EmailSettings />
        </TabsContent>
        
        <TabsContent value="integrations" className="mt-6">
          <IntegrationSettings />
        </TabsContent>
        
        <TabsContent value="pricing" className="mt-6">
          <PricingSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsManagement;
