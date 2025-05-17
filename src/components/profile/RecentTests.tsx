import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

const RecentTests = () => {
  // Example tests - in a real app, these would come from your backend
  const tests = [
    {
      id: 1,
      title: "First Level Test 3",
      date: "2023-04-15",
      horse: "Maestro",
      thumbnail: "/lovable-uploads/141a866f-fe45-4edc-aa64-b95d2c7f1d6c.png",
      score: "67.2%",
    },
    {
      id: 2,
      title: "Training Level Test 2",
      date: "2023-03-22",
      horse: "Bella",
      thumbnail: "/lovable-uploads/15df63d0-27e1-486c-98ee-bcf44eb600f4.png",
      score: "64.5%",
    },
    {
      id: 3,
      title: "Second Level Test 1",
      date: "2023-02-10",
      horse: "Gatsby",
      thumbnail: "/lovable-uploads/79f64a37-cb8e-4627-b743-c5330837a1b0.png",
      score: "61.8%",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-serif font-semibold text-gray-900">
          Recent Tests
        </h2>
        <Button variant="link" className="text-blue-700">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {tests.map((test) => (
          <Card
            key={test.id}
            className="flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="sm:w-48 h-32 sm:h-auto relative">
              <img
                src={test.thumbnail}
                alt={`${test.horse} - ${test.title}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-sm font-medium">
                {test.score}
              </div>
            </div>
            <div className="p-4 flex-1">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-blue-700" />
                <h3 className="font-medium text-gray-900">{test.title}</h3>
              </div>
              <p className="text-sm text-gray-700 mt-1">Horse: {test.horse}</p>
              <p className="text-sm text-gray-700">
                Analyzed on
                {new Date(test.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
              </p>
              <div className="mt-4 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-700 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  View Analysis
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-700 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  Recommendations
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecentTests;
