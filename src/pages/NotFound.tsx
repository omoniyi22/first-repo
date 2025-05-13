
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HomeIcon, UserIcon, ChevronRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <div className="mb-8">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-serif text-purple-700">404</span>
          </div>
          <h1 className="text-2xl font-serif font-semibold mb-2">Page not found</h1>
          <p className="text-gray-600 mb-6">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link to="/">
            <Button variant="default" className="w-full bg-purple-600 hover:bg-purple-700">
              <HomeIcon className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </Link>
          
          <div className="text-sm text-gray-600 py-2">or try one of these</div>
          
          <div className="space-y-2">
            <Link to="/profile">
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-2 text-purple-600" />
                  <span>Your Profile</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            
            <Link to="/profile-questionnaire">
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-2 text-purple-600" />
                  <span>Profile Setup</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            
            <Link to="/jump-profile-setup">
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-2 text-blue-600" />
                  <span>Jump Profile Setup</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
