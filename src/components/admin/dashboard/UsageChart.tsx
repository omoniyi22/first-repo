import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

const UsageChart = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const allUser = await fetchUsers();
        const transformedData = transformUsersToMonthlyData(allUser);
        setChartData(transformedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log("Fetching users via Edge Function...");

      // Call the Edge Function to get users
      const { data, error } = await supabase.functions.invoke(
        "get-admin-users"
      );

      if (error) {
        console.error("Error calling Edge Function:", error);
        throw error;
      }

      if (!data || !data.users || data.users.length === 0) {
        console.warn("No users found via Edge Function");
      }

      // Process the user data
      const fetchedUsers = data.users.filter((user) => user.role != "admin");

      return fetchedUsers;
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  function transformUsersToMonthlyData(users) {
    // Initialize monthly data structure
    const monthlyData = {};
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Get current month to determine sorting
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const currentMonthName = monthNames[currentMonthIndex];

    // Initialize all months with zero counts
    monthNames.forEach((month) => {
      monthlyData[month] = { dressage: 0, jumping: 0 };
    });

    // Process each user
    users.forEach((user) => {
      // Get the month from created_at date
      const createdDate = new Date(user.created_at);
      const monthIndex = createdDate.getMonth();
      const monthName = monthNames[monthIndex];

      // Check user's discipline and increment count
      if (user.profile && user.profile.discipline) {
        const discipline = user.profile.discipline.toLowerCase();

        if (discipline === "dressage") {
          monthlyData[monthName].dressage++;
        } else if (discipline === "jumping" || discipline === "show jumping") {
          monthlyData[monthName].jumping++;
        }
      } else {
        // Users without discipline are counted as dressage
        monthlyData[monthName].dressage++;
      }
    });

    const sortedMonths = [
      ...monthNames.slice(currentMonthIndex + 1), // Months after current month
      ...monthNames.slice(0, currentMonthIndex + 1), // Months from Jan to current month
    ];

    // Convert to the desired array format with sorted order
    const result = sortedMonths.map((month) => ({
      name: month,
      dressage: monthlyData[month].dressage,
      jumping: monthlyData[month].jumping,
    }));

    return result;
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 8,
            right: 5,
            left: 0,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="dressageGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="5%" stopColor="#7b4a97" stopOpacity={1} />
              <stop offset="95%" stopColor="#6b3987" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="jumpingGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="5%" stopColor="#4a6da7" stopOpacity={1} />
              <stop offset="95%" stopColor="#3a5d97" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11 }}
            width={25}
          />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "5px" }} />
          <Line
            type="monotone"
            dataKey="dressage"
            name="Dressage"
            stroke="url(#dressageGradient)"
            strokeWidth={2}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="jumping"
            name="Jumping"
            stroke="url(#jumpingGradient)"
            strokeWidth={2}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UsageChart;
