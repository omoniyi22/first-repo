
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Upload, Plus } from 'lucide-react';

const DashboardHeader = () => {
  const { user } = useAuth();
  
  const displayName = user?.user_metadata?.full_name || 
                      user?.email?.split('@')[0] || 
                      'Rider';

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-purple-900">
          Welcome, {displayName}
        </h1>
        <p className="mt-2 text-purple-700">
          Track your progress and upload new dressage tests
        </p>
      </div>
      <div className="mt-4 sm:mt-0 flex space-x-4">
        <Button className="bg-purple-700 hover:bg-purple-800">
          <Upload className="mr-2 h-4 w-4" />
          Upload Test
        </Button>
        <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
          <Plus className="mr-2 h-4 w-4" />
          New Test
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
