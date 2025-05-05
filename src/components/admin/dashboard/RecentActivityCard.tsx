
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, User, Video, Clock } from "lucide-react";

const RecentActivityCard = () => {
  // Sample data - in a real app this would come from the API
  const activities = [
    { 
      type: 'user',
      title: 'New user registration',
      user: 'Emma Johnson',
      time: '10 minutes ago',
      icon: <User className="h-4 w-4" /> 
    },
    { 
      type: 'document',
      title: 'Document analysis completed',
      user: 'Michael Taylor',
      time: '45 minutes ago',
      icon: <FileText className="h-4 w-4" /> 
    },
    { 
      type: 'video',
      title: 'Video analysis uploaded',
      user: 'Sarah Wilson',
      time: '2 hours ago',
      icon: <Video className="h-4 w-4" /> 
    },
    { 
      type: 'user',
      title: 'Profile updated',
      user: 'Robert Brown',
      time: '3 hours ago',
      icon: <User className="h-4 w-4" /> 
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className={`
                rounded-full p-1.5 flex-shrink-0 
                ${activity.type === 'user' ? 'bg-purple-100' : ''}
                ${activity.type === 'document' ? 'bg-blue-100' : ''}
                ${activity.type === 'video' ? 'bg-green-100' : ''}
              `}>
                {activity.icon}
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.user}</p>
                <div className="flex items-center text-xs text-gray-400 mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
