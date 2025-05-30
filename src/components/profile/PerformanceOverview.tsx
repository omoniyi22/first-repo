import { ArrowUp, TrendingUp, User, Award, FileText, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import MovementRadarChart from "./MovementRadarChart";

interface TestData {
  id: string;
  file_name: string;
  document_date: string;
  horse_name: string;
  test_level?: string;
  discipline: string;
  status: string;
  document_url: string;
}

const PerformanceOverview = () => {
  const [tests, setTests] = useState<TestData[]>([]);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [scorePercentageChange, setScorePercentageChange] = useState(0);
  const [testsCountChange, setTestsCountChange] = useState(0);
  const [currentMonthTestsCount, setCurrentMonthTestsCount] = useState(0);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // NEW state variables for strongest movement and focus area
  const [strongestMovement, setStrongestMovement] = useState("Trot");
  const [strongestMovementDetails, setStrongestMovementDetails] = useState("");
  const [focusArea, setFocusArea] = useState("Transitions");
  const [focusAreaDetails, setFocusAreaDetails] = useState("");
  const [scoreTrendData, setScoreTrendData] = useState([]);
  const [userDiscipline, setUserDiscipline] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Fetch user profile to get discipline
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("discipline")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError);
        } else if (profileData?.discipline) {
          setUserDiscipline(profileData.discipline);
        }
      } catch (error) {
        console.error("Error fetching horses:", error);
      } finally {
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const fetchRecentTests = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("document_analysis")
          .select(
            `
        *,
        analysis_results(*)
      `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching recent tests:", error);
          return;
        }

        // Helper function to calculate strongest movement from current month tests
        const calculateStrongestMovement = (currentMonthTests) => {
          const movementScores = {};
          let overallHighestScore = 0;
          let strongestMovement = "";
          let strongestMovementType = ""; // e.g., "Trot", "Canter", "Walk"

          currentMonthTests.forEach((test) => {
            const analysisResult = test.analysis_results?.[0]?.result_json;
            let parsedResult;

            if (typeof analysisResult === "string") {
              try {
                parsedResult = JSON.parse(analysisResult);
              } catch {
                return;
              }
            } else {
              parsedResult = analysisResult;
            }

            // Use the pre-calculated highest score from analysis
            if (parsedResult?.highestScore) {
              const score = parsedResult.highestScore.score;
              const movement = parsedResult.highestScore.movement;

              if (score > overallHighestScore) {
                overallHighestScore = score;
                strongestMovement = movement;

                // Determine movement type based on movement name
                const movementLower = movement.toLowerCase();
                if (
                  movementLower.includes("trote") ||
                  movementLower.includes("trot")
                ) {
                  strongestMovementType = "Trot";
                } else if (
                  movementLower.includes("galope") ||
                  movementLower.includes("canter") ||
                  movementLower.includes("cambio")
                ) {
                  strongestMovementType = "Canter";
                } else if (
                  movementLower.includes("paso") ||
                  movementLower.includes("walk")
                ) {
                  strongestMovementType = "Walk";
                } else if (
                  movementLower.includes("passage") ||
                  movementLower.includes("piaffe")
                ) {
                  strongestMovementType = "Passage";
                } else {
                  strongestMovementType = "Extended"; // Default for other movements
                }
              }
            }

            // Also analyze individual scores for better insights
            if (parsedResult?.scores) {
              parsedResult.scores.forEach((scoreData) => {
                const movement = scoreData.movement;
                const score =
                  scoreData.judgeA ||
                  scoreData.judgeB ||
                  scoreData.judgeC ||
                  scoreData.judgeH;

                if (score && movement) {
                  if (!movementScores[movement]) {
                    movementScores[movement] = {
                      scores: [],
                      totalScore: 0,
                      count: 0,
                      average: 0,
                    };
                  }

                  movementScores[movement].scores.push(score);
                  movementScores[movement].totalScore += score;
                  movementScores[movement].count++;
                  movementScores[movement].average =
                    movementScores[movement].totalScore /
                    movementScores[movement].count;
                }
              });
            }
          });

          return {
            strongestMovement: strongestMovementType || "Trot", // Default to Trot if nothing found
            strongestMovementName: strongestMovement,
            overallHighestScore,
            movementAverages: movementScores,
          };
        };

        // Helper function to calculate most common focus area
        const calculateFocusArea = (currentMonthTests) => {
          const focusAreas = {};
          const focusAreaCategories = {
            transition: ["transicion", "transition", "cambio", "change"],
            balance: ["equilibrio", "balance", "estabilidad", "stability"],
            contact: ["contacto", "contact", "rienda", "rein"],
            impulsion: ["impulsion", "impulso", "energia", "energy"],
            straightness: ["rectitud", "straight", "derecho"],
            collection: ["reunion", "collection", "reunido"],
            rhythm: ["ritmo", "rhythm", "cadencia", "cadence"],
            suppleness: ["flexibilidad", "suppleness", "flexion"],
          };

          currentMonthTests.forEach((test) => {
            const analysisResult = test.analysis_results?.[0]?.result_json;
            let parsedResult;

            if (typeof analysisResult === "string") {
              try {
                parsedResult = JSON.parse(analysisResult);
              } catch {
                return;
              }
            } else {
              parsedResult = analysisResult;
            }

            if (parsedResult?.focusArea) {
              parsedResult.focusArea.forEach((focus) => {
                const area = focus.area;
                if (area) {
                  if (!focusAreas[area]) {
                    focusAreas[area] = {
                      count: 0,
                      tips: [],
                      category: "Other",
                    };
                  }
                  focusAreas[area].count++;
                  focusAreas[area].tips.push(focus.tip);

                  // Categorize the focus area
                  const areaLower = area.toLowerCase();
                  for (const [category, keywords] of Object.entries(
                    focusAreaCategories
                  )) {
                    if (
                      keywords.some((keyword) => areaLower.includes(keyword))
                    ) {
                      focusAreas[area].category =
                        category.charAt(0).toUpperCase() + category.slice(1);
                      break;
                    }
                  }
                }
              });
            }
          });

          // Find most common focus area
          let mostCommonArea = "";
          let mostCommonCategory = "Transitions"; // Default
          let highestCount = 0;

          Object.keys(focusAreas).forEach((area) => {
            if (focusAreas[area].count > highestCount) {
              highestCount = focusAreas[area].count;
              mostCommonArea = area;
              mostCommonCategory = focusAreas[area].category;
            }
          });

          // If no focus areas found, return default
          if (!mostCommonArea) {
            mostCommonCategory = "Transitions";
            mostCommonArea = "Work on transitions";
          }

          return {
            mostCommonArea,
            mostCommonCategory,
            focusAreasData: focusAreas,
            totalFocusAreas: Object.keys(focusAreas).length,
          };
        };

        // Define the expected shape of result_json
        interface AnalysisResultJson {
          percentage?: number;
          [key: string]: any;
        }

        // Parse all test results and extract percentages
        const testsResults = data?.map((test) => {
          const result = test.analysis_results[0]?.result_json;
          let parsedResult;

          if (typeof result === "string") {
            try {
              parsedResult = JSON.parse(result) as AnalysisResultJson;
            } catch {
              parsedResult = {};
            }
          } else {
            parsedResult = result as AnalysisResultJson;
          }

          return {
            ...test,
            parsedPercentage: parsedResult?.percentage,
            parsedResult: parsedResult,
          };
        });

        // console.log("📊 Tests with Parsed Percentages:", testsResults);

        // Get current month and year
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 1-based month
        const currentMonthKey = `${currentYear}-${String(currentMonth).padStart(
          2,
          "0"
        )}`;

        // console.log(`📅 Current Month: ${currentMonthKey}`);

        // Filter and process current month tests
        const currentMonthTests =
          testsResults?.filter((test) => {
            const testDate = new Date(test.document_date);
            const testMonthKey = `${testDate.getFullYear()}-${String(
              testDate.getMonth() + 1
            ).padStart(2, "0")}`;
            return testMonthKey === currentMonthKey;
          }) || [];

        // console.log("📊 Current Month All Tests:", currentMonthTests);

        // Calculate strongest movement and focus area from current month tests
        const strongestMovementData =
          calculateStrongestMovement(currentMonthTests);
        const focusAreaData = calculateFocusArea(currentMonthTests);

        // console.log("🏆 Strongest Movement Analysis:", strongestMovementData);
        // console.log("🎯 Focus Area Analysis:", focusAreaData);

        // Filter only tests with valid percentages for current month
        const currentMonthValidTests = currentMonthTests.filter(
          (test) =>
            test.parsedPercentage !== null &&
            test.parsedPercentage !== undefined &&
            test.parsedPercentage > 0
        );

        // console.log("📊 Current Month Valid Tests:", currentMonthValidTests);

        // Calculate current month's average score and count
        const currentMonthAverageScore =
          currentMonthValidTests.length > 0
            ? currentMonthValidTests.reduce(
                (acc, test) => acc + (test.parsedPercentage || 0),
                0
              ) / currentMonthValidTests.length
            : 0;

        const currentMonthTestsCount = currentMonthTests.length; // Total tests (including null percentages)
        const currentMonthValidTestsCount = currentMonthValidTests.length; // Only valid tests

        // console.log(`📊 Current Month (${currentMonthKey}) Statistics:`);
        // console.log(`  - Total Tests: ${currentMonthTestsCount}`);
        // console.log(`  - Valid Tests: ${currentMonthValidTestsCount}`);
        // console.log(
        //   `  - Average Score: ${currentMonthAverageScore.toFixed(1)}%`
        // );

        // Group ALL tests by month for comparison
        const groupTestsByMonth = (tests: any[]) => {
          const monthlyGroups: { [key: string]: any[] } = {};

          tests.forEach((test) => {
            const testDate = new Date(test.document_date);
            const monthKey = `${testDate.getFullYear()}-${String(
              testDate.getMonth() + 1
            ).padStart(2, "0")}`;

            if (!monthlyGroups[monthKey]) {
              monthlyGroups[monthKey] = [];
            }

            monthlyGroups[monthKey].push(test);
          });

          return monthlyGroups;
        };

        // Calculate monthly averages for comparison (only valid percentages)
        const calculateMonthlyAverages = (monthlyGroups: {
          [key: string]: any[];
        }) => {
          const monthlyAverages: {
            [key: string]: {
              average: number;
              count: number;
              validCount: number;
            };
          } = {};

          Object.keys(monthlyGroups).forEach((monthKey) => {
            const monthTests = monthlyGroups[monthKey];

            // Filter valid percentages only
            const validTests = monthTests.filter(
              (test) =>
                test.parsedPercentage !== null &&
                test.parsedPercentage !== undefined &&
                test.parsedPercentage > 0
            );

            const monthAverage =
              validTests.length > 0
                ? validTests.reduce(
                    (acc, test) => acc + (test.parsedPercentage || 0),
                    0
                  ) / validTests.length
                : 0;

            monthlyAverages[monthKey] = {
              average: monthAverage,
              count: monthTests.length, // Total tests
              validCount: validTests.length, // Valid tests only
            };
          });

          return monthlyAverages;
        };

        let scorePercentageChange = 0;
        let testsCountChange = 0;

        if (testsResults && testsResults.length > 0) {
          const monthlyGroups = groupTestsByMonth(testsResults);
          const monthlyAverages = calculateMonthlyAverages(monthlyGroups);
          const sortedMonths = Object.keys(monthlyAverages).sort();

          // console.log("📅 All Monthly Data:", monthlyAverages);
          // console.log("📅 Sorted Months:", sortedMonths);

          // Find current month and previous month for comparison
          const currentMonthIndex = sortedMonths.indexOf(currentMonthKey);

          if (currentMonthIndex > 0) {
            // We have previous month data
            const previousMonth = sortedMonths[currentMonthIndex - 1];
            const currentMonthData = monthlyAverages[currentMonthKey];
            const previousMonthData = monthlyAverages[previousMonth];

            // console.log(`📊 Comparison Data:`);
            // console.log(
            //   `  Current Month (${currentMonthKey}):`,
            //   currentMonthData
            // );
            // console.log(
            //   `  Previous Month (${previousMonth}):`,
            //   previousMonthData
            // );

            // Calculate score percentage change (only if both months have valid data)
            if (
              previousMonthData &&
              previousMonthData.validCount > 0 &&
              currentMonthData.validCount > 0
            ) {
              scorePercentageChange =
                ((currentMonthData.average - previousMonthData.average) /
                  previousMonthData.average) *
                100;
            }

            // Calculate tests count change (total tests)
            testsCountChange =
              currentMonthData.count - (previousMonthData?.count || 0);

            // console.log(`  Score Change: ${scorePercentageChange.toFixed(1)}%`);
            // console.log(`  Tests Change: ${testsCountChange}`);
          } else if (currentMonthIndex === 0 || currentMonthIndex === -1) {
            // Current month is the first month or current month has no data
            if (monthlyAverages[currentMonthKey]) {
              testsCountChange = monthlyAverages[currentMonthKey].count;
              scorePercentageChange = 0; // No previous month to compare
            } else {
              testsCountChange = 0;
              scorePercentageChange = 0;
            }

            // console.log(`📊 First month of data or no current month data`);
          }
        }

        // console.log("📊 Final Analytics Summary:");
        // console.log(
        //   `Current Month Average Score: ${currentMonthAverageScore.toFixed(1)}%`
        // );
        // console.log(`Current Month Tests Count: ${currentMonthTestsCount}`);
        // console.log(
        //   `Strongest Movement: ${strongestMovementData.strongestMovement} (${strongestMovementData.strongestMovementName})`
        // );
        // console.log(
        //   `Focus Area: ${focusAreaData.mostCommonCategory} (${focusAreaData.mostCommonArea})`
        // );
        // console.log(
        //   `Score Change: ${
        //     scorePercentageChange >= 0 ? "+" : ""
        //   }${scorePercentageChange.toFixed(1)}%`
        // );
        // console.log(
        //   `Tests Change: ${testsCountChange >= 0 ? "+" : ""}${testsCountChange}`
        // );

        // Set state values - NOW USING CURRENT MONTH DATA ONLY
        setAverageScore(currentMonthAverageScore || 0); // Current month average
        setTests(data || []); // Keep all tests for other components
        setCurrentMonthTestsCount(currentMonthTestsCount); // Add this state variable
        setScorePercentageChange(Number(scorePercentageChange.toFixed(1)));
        setTestsCountChange(testsCountChange);

        // Set new state values for strongest movement and focus area
        setStrongestMovement(strongestMovementData.strongestMovement);
        setStrongestMovementDetails(
          strongestMovementData.strongestMovementName
        );
        setFocusArea(focusAreaData.mostCommonCategory);
        setFocusAreaDetails(focusAreaData.mostCommonArea);
      } catch (error) {
        console.error("Error fetching recent tests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTests();
  }, [user]);

  useEffect(() => {
    const monthlyAverages = calculateMonthlyAverages(tests);
    const scoreTrendData = monthlyAverages.map((item) => ({
      month: item.month,
      score: item.score,
    }));
    setScoreTrendData(scoreTrendData);
  }, [tests]);

  // Function to calculate monthly averages from test data
  function calculateMonthlyAverages(testData) {
    // console.log("📊 Calculating monthly averages...");

    // Step 1: Extract valid test scores with dates
    const validTests = [];

    testData.forEach((test, index) => {
      if (test.analysis_results && test.analysis_results.length > 0) {
        const result = test.analysis_results[0].result_json;
        const percentage = result.percentage;

        // Only include tests with valid percentages (not null, not 0)
        if (percentage !== null && percentage !== undefined && percentage > 0) {
          const testDate = new Date(test.document_date);
          validTests.push({
            date: testDate,
            percentage: percentage,
            month: testDate.toLocaleDateString("en-US", { month: "short" }),
            year: testDate.getFullYear(),
          });
        }
      }
    });

    // console.log(`Found ${validTests.length} valid tests`);

    // Step 2: Group tests by month
    const monthlyGroups = {};

    validTests.forEach((test) => {
      const monthKey = test.month; // Just use month name for grouping

      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = {
          month: test.month,
          scores: [],
          total: 0,
          count: 0,
        };
      }

      monthlyGroups[monthKey].scores.push(test.percentage);
      monthlyGroups[monthKey].total += test.percentage;
      monthlyGroups[monthKey].count++;
    });

    // Step 3: Calculate average for each month
    const monthlyAverages = [];

    Object.keys(monthlyGroups).forEach((monthKey) => {
      const group = monthlyGroups[monthKey];
      const average = group.total / group.count;

      monthlyAverages.push({
        month: group.month,
        score: Number(average.toFixed(1)),
      });

      // console.log(
      //   `${group.month}: ${group.scores.join(
      //     ", "
      //   )} → Average: ${average.toFixed(1)}%`
      // );
    });

    // Step 4: Sort by month order
    const monthOrder = [
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

    monthlyAverages.sort((a, b) => {
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
    });

    return monthlyAverages;
  }

  // Helper functions for displaying the data
  const formatPercentageChange = (change: number): string => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  const formatCountChange = (change: number): string => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change}`;
  };



  // Updated stats with brand color gradients
  const stats = [
    {
      title: `${
        userDiscipline
          ? userDiscipline === "dressage"
            ? "Average Score"
            : "Clear Round"
          : "Loading..."
      }`,
      value: `${averageScore.toFixed(1)}%`,
      change: `${formatPercentageChange(scorePercentageChange)}`,
      positive: true,
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      gradient: "bg-gradient-to-r from-[#a28bfb] to-[#7759eb]", // AI Dressage gradient
    },
    {
      title: `${
        userDiscipline
          ? userDiscipline === "dressage"
            ? "Tests Analyzed"
            : "Videos Analyzed"
          : "Loading..."
      }`,
      value: tests.length.toString(),
      change: `${formatCountChange(currentMonthTestsCount)}`,
      positive: true,
      icon: <FileText className="h-6 w-6 text-white" />,
      gradient: "bg-gradient-to-r from-[#5e92fa] to-[#3d78ec]", // AI Jump gradient
    },
    {
      title: `${
        userDiscipline
          ? userDiscipline === "dressage"
            ? "Strongest Movement"
            : "Average Faults per Round"
          : "Loading..."
      }`,
      value: strongestMovement,
      subValue: strongestMovementDetails,
      change: "",
      positive: true,
      icon: <Award className="h-6 w-6 text-white" />,
      gradient: "bg-gradient-to-r from-[#f57cb5] to-[#d80669]", // Purple gradient
    },
    {
      title: `${
        userDiscipline
          ? userDiscipline === "dressage"
            ? "Focus Area"
            : "Focus Area"
          : "Loading..."
      }`,
      value: focusArea,
      subValue: focusAreaDetails,
      change: "",
      positive: false,
      icon: <Star className="h-6 w-6 text-white" />,
      gradient: "bg-gradient-to-r from-[#ffd565] to-[#ff831d]", // Blue gradient
    },
  ];

  const chartConfig = {
    score: { label: "Score" },
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-serif font-semibold text-gray-900 mb-4">
        Performance Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stats Cards with Theme-Matching Gradient Backgrounds */}
        {stats.map((stat, index) => (
          <Card
            key={index}
            className={`border-none shadow-md hover:shadow-lg transition-all duration-200 ${stat.gradient}`}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-medium text-white">{stat.title}</h3>
                {stat.icon}
              </div>
              <div className="mt-4 flex justify-between items-end">
                <div>
                  <p className="text-3xl font-semibold text-white">
                    {stat.value}
                  </p>
                  {stat.subValue && (
                    <p className="text-sm text-white/90">{stat.subValue}</p>
                  )}
                </div>
                {stat.change && (
                  <div className="px-2 py-1 rounded-full text-sm text-white bg-white/20 flex items-center">
                    {stat.positive && <ArrowUp className="h-3 w-3 mr-1" />}
                    {stat.change}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Score Trend Chart */}
        <Card className="p-4 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Score Trend
          </h3>
          <div className="h-80 w-full">
            <ChartContainer
              config={chartConfig}
              className="max-h-full h-full max-w-full w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={scoreTrendData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <defs>
                    {/* Combined gradient with color and opacity transitions */}
                    <linearGradient
                      id="scoreGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#7759eb" stopOpacity={0.9} />
                      <stop
                        offset="50%"
                        stopColor="#5f69ee"
                        stopOpacity={0.5}
                      />
                      <stop
                        offset="100%"
                        stopColor="#3d78ec"
                        stopOpacity={0.1}
                      />
                    </linearGradient>

                    <linearGradient
                      id="strokeGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="50%" stopColor="#7759eb" />
                      <stop offset="100%" stopColor="#3d78ec" />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
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
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="url(#strokeGradient)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </Card>

        {/* Movement Radar Chart */}
        <MovementRadarChart/>
      </div>
    </div>
  );
};

export default PerformanceOverview;
