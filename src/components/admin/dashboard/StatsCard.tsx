
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: string;
  isLoading?: boolean;
}

const StatsCard = ({ title, value, icon, trend, isLoading = false }: StatsCardProps) => {
  const isTrendPositive = trend && !trend.startsWith('-');
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-gray-100 p-2">{icon}</span>
          {trend && (
            <div className={`flex items-center text-sm font-medium ${isTrendPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isTrendPositive ? (
                <TrendingUp className="mr-1 h-4 w-4" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4" />
              )}
              {trend}
            </div>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-sm text-gray-500">{title}</h3>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mt-1" />
          ) : (
            <p className="text-2xl font-bold">{value.toLocaleString()}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
