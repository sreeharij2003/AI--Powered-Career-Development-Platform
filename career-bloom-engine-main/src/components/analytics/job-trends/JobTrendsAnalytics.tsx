import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/services/api";
import {
    BarChart3,
    Brain,
    Clock,
    DollarSign,
    Sparkles,
    TrendingUp,
    Users
} from "lucide-react";
import React, { useEffect, useState } from 'react';
import { MarketInsights } from './MarketInsights';
import { TrendsCharts } from './TrendsCharts';

interface JobTrendsData {
  totalJobs: number;
  lastUpdated: string;
  timeRange: string;
  location: string;
  quickStats: {
    totalJobs: number;
    remotePercentage: number;
    salaryTransparency: number;
    fullTimePercentage: number;
    averagePostsPerDay: number;
  };
  topRoles: Array<{
    title: string;
    count: number;
    percentage: number;
  }>;
  trendingSkills: Array<{
    skill: string;
    count: number;
    percentage: number;
    growth: number;
  }>;
  salaryInsights: any;
  locationDistribution: Array<{
    location: string;
    count: number;
    percentage: number;
  }>;
  remoteWorkTrends: {
    remoteJobs: number;
    totalJobs: number;
    remotePercentage: number;
    trend: string;
  };
}

export const JobTrendsAnalytics: React.FC = () => {
  const [trendsData, setTrendsData] = useState<JobTrendsData | null>(null);
  const [insights, setInsights] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isFetchingFresh, setIsFetchingFresh] = useState(false);
  const [dataSource, setDataSource] = useState<'database' | 'api'>('database');

  const fetchTrendsData = async (useFreshData = false) => {
    try {
      setIsLoading(true);
      setError('');

      console.log(`🔍 Fetching job trends data... (${useFreshData ? 'Fresh API' : 'Database'})`);

      const endpoint = useFreshData
        ? `${API_BASE_URL}/job-trends/fresh-trends`
        : `${API_BASE_URL}/job-trends?location=India&days=7`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setTrendsData(result.data);
        setDataSource(useFreshData ? 'api' : 'database');

        // If fresh data includes AI insights, set them
        if (result.data.aiInsights) {
          setInsights(result.data.aiInsights);
        }

        console.log(`✅ Job trends data loaded successfully from ${useFreshData ? 'API' : 'database'}`);
      } else {
        throw new Error(result.error || 'Failed to fetch trends data');
      }

    } catch (error) {
      console.error('❌ Error fetching trends data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load trends data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFreshTrends = async () => {
    try {
      setIsFetchingFresh(true);
      await fetchTrendsData(true);
    } catch (error) {
      console.error('❌ Error fetching fresh trends:', error);
    } finally {
      setIsFetchingFresh(false);
    }
  };

  const generateInsights = async () => {
    if (!trendsData) return;

    try {
      setIsGeneratingInsights(true);
      console.log('🧠 Generating AI insights...');

      const response = await fetch(`${API_BASE_URL}/job-trends/insights?location=US`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setInsights(result.data.insights);
        console.log('✅ AI insights generated successfully');
      } else {
        throw new Error(result.error || 'Failed to generate insights');
      }

    } catch (error) {
      console.error('❌ Error generating insights:', error);
      setInsights('Unable to generate insights at this time. Please try again later.');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  useEffect(() => {
    fetchTrendsData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-destructive">
        <AlertDescription>
          {error}
          <Button
            onClick={() => fetchTrendsData(false)}
            variant="outline"
            size="sm"
            className="ml-4"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!trendsData) {
    return (
      <Alert>
        <AlertDescription>
          No trends data available. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with AI Insights */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  AI Market Insights
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                </CardTitle>
                <CardDescription>
                  Powered by Gemini AI • Based on {trendsData.totalJobs.toLocaleString()} jobs
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={dataSource === 'api' ? 'default' : 'secondary'} className="text-xs">
                {dataSource === 'api' ? '🔥 Fresh API Data' : '💾 Database Data'}
              </Badge>
              <Button
                onClick={fetchFreshTrends}
                disabled={isFetchingFresh}
                variant="default"
                size="sm"
              >
                {isFetchingFresh ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Show Fresh Trends
                  </>
                )}
              </Button>
              <Button
                onClick={generateInsights}
                disabled={isGeneratingInsights}
                variant="outline"
                size="sm"
              >
                {isGeneratingInsights ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Insights
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        {insights && (
          <CardContent>
            <MarketInsights insights={insights} />
          </CardContent>
        )}
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-xl font-bold">{trendsData.totalJobs.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Remote Jobs</p>
                <p className="text-xl font-bold">{trendsData.quickStats.remotePercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">With Salary</p>
                <p className="text-xl font-bold">{trendsData.quickStats.salaryTransparency}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Daily Average</p>
                <p className="text-xl font-bold">{trendsData.quickStats.averagePostsPerDay}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <TrendsCharts trendsData={trendsData} />

      {/* Top Roles and Skills */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Roles in Demand
            </CardTitle>
            <CardDescription>
              Most popular job titles this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trendsData.topRoles.slice(0, 10).map((role, index) => {
                const maxCount = Math.max(...trendsData.topRoles.slice(0, 10).map(r => r.count));
                const barWidth = (role.count / maxCount) * 100;

                // Dynamic colors based on ranking
                const getBarColor = (index: number) => {
                  const colors = [
                    'from-yellow-400 to-orange-500', // Gold for #1
                    'from-gray-300 to-gray-500',     // Silver for #2
                    'from-amber-600 to-yellow-700',  // Bronze for #3
                    'from-blue-400 to-blue-600',     // Blue for #4-5
                    'from-blue-400 to-blue-600',
                    'from-green-400 to-green-600',   // Green for #6-7
                    'from-green-400 to-green-600',
                    'from-purple-400 to-purple-600', // Purple for #8-9
                    'from-purple-400 to-purple-600',
                    'from-pink-400 to-pink-600'      // Pink for #10
                  ];
                  return colors[index] || 'from-gray-400 to-gray-600';
                };

                const getRankIcon = (index: number) => {
                  if (index === 0) return '🥇';
                  if (index === 1) return '🥈';
                  if (index === 2) return '🥉';
                  return index + 1;
                };

                const getRankBg = (index: number) => {
                  if (index === 0) return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
                  if (index === 1) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
                  if (index === 2) return 'bg-gradient-to-r from-amber-600 to-yellow-700 text-white';
                  return 'bg-primary/10 text-primary';
                };

                return (
                  <div key={role.title} className="group hover:bg-muted/20 p-3 rounded-lg transition-all duration-300 hover:shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${getRankBg(index)}`}>
                          {getRankIcon(index)}
                        </div>
                        <div>
                          <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                            {role.title}
                          </span>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Rank #{index + 1} • {role.percentage}% of total
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium bg-primary/10 text-primary border-primary/20"
                        >
                          {role.count} jobs
                        </Badge>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${getBarColor(index)} h-3 rounded-full transition-all duration-700 ease-out shadow-sm relative`}
                          style={{ width: `${barWidth}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0</span>
                        <span className="font-medium">{role.count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Trending Skills
            </CardTitle>
            <CardDescription>
              Most in-demand technical skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trendsData.trendingSkills.slice(0, 10).map((skill, index) => {
                const maxCount = Math.max(...trendsData.trendingSkills.slice(0, 10).map(s => s.count));
                const barWidth = (skill.count / maxCount) * 100;

                // Skill-specific colors and icons
                const getSkillColor = (skillName: string, index: number) => {
                  const skill = skillName.toLowerCase();
                  if (skill.includes('javascript') || skill.includes('js')) return 'from-yellow-400 to-yellow-600';
                  if (skill.includes('react')) return 'from-cyan-400 to-blue-500';
                  if (skill.includes('python')) return 'from-green-400 to-blue-500';
                  if (skill.includes('node')) return 'from-green-500 to-green-700';
                  if (skill.includes('typescript')) return 'from-blue-500 to-blue-700';
                  if (skill.includes('aws') || skill.includes('cloud')) return 'from-orange-400 to-red-500';
                  if (skill.includes('docker')) return 'from-blue-400 to-cyan-500';
                  if (skill.includes('kubernetes')) return 'from-purple-400 to-blue-500';
                  if (skill.includes('java')) return 'from-red-500 to-orange-600';
                  if (skill.includes('sql') || skill.includes('database')) return 'from-indigo-400 to-purple-500';

                  // Fallback gradient colors
                  const colors = [
                    'from-emerald-400 to-teal-500',
                    'from-violet-400 to-purple-500',
                    'from-pink-400 to-rose-500',
                    'from-amber-400 to-orange-500',
                    'from-lime-400 to-green-500'
                  ];
                  return colors[index % colors.length];
                };

                const getSkillIcon = (skillName: string) => {
                  const skill = skillName.toLowerCase();
                  if (skill.includes('javascript') || skill.includes('js')) return '🟨';
                  if (skill.includes('react')) return '⚛️';
                  if (skill.includes('python')) return '🐍';
                  if (skill.includes('node')) return '🟢';
                  if (skill.includes('typescript')) return '🔷';
                  if (skill.includes('aws') || skill.includes('cloud')) return '☁️';
                  if (skill.includes('docker')) return '🐳';
                  if (skill.includes('kubernetes')) return '⚙️';
                  if (skill.includes('java')) return '☕';
                  if (skill.includes('sql') || skill.includes('database')) return '🗄️';
                  return '💻';
                };

                const getGrowthColor = (growth: number) => {
                  if (growth >= 20) return 'bg-green-100 text-green-800 border-green-200';
                  if (growth >= 10) return 'bg-blue-100 text-blue-800 border-blue-200';
                  if (growth >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                  return 'bg-gray-100 text-gray-800 border-gray-200';
                };

                return (
                  <div key={skill.skill} className="group hover:bg-muted/20 p-3 rounded-lg transition-all duration-300 hover:shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-sm shadow-sm">
                          {getSkillIcon(skill.skill)}
                        </div>
                        <div>
                          <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                            {skill.skill}
                          </span>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            #{index + 1} trending • {skill.count} mentions
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${getGrowthColor(skill.growth)}`}
                        >
                          +{skill.growth}% 📈
                        </Badge>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${getSkillColor(skill.skill, index)} h-3 rounded-full transition-all duration-700 ease-out shadow-sm relative`}
                          style={{ width: `${barWidth}%` }}
                        >
                          <div className="absolute inset-0 bg-white/30 rounded-full"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0</span>
                        <span className="font-medium">{skill.count} mentions</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
