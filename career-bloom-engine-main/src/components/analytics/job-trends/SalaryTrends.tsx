import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, DollarSign, TrendingUp } from "lucide-react";
import React, { useEffect, useState } from 'react';

export const SalaryTrends: React.FC = () => {
  const [salaryData, setSalaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSalaryData();
  }, []);

  const fetchSalaryData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/job-trends/salaries?location=US`);
      const result = await response.json();
      
      if (result.success) {
        setSalaryData(result.data);
      }
    } catch (error) {
      console.error('Error fetching salary data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Salary Trends Analysis
          </CardTitle>
          <CardDescription>
            Compensation insights across roles and locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {salaryData?.overallAverage && (
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${salaryData.overallAverage.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Average Salary</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ${salaryData.salaryRange?.min.toLocaleString()} - ${salaryData.salaryRange?.max.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Salary Range</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {salaryData.totalWithSalary}
                </div>
                <div className="text-sm text-muted-foreground">Jobs with Salary Data</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Paying Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {salaryData?.byRole?.slice(0, 8).map((role: any, index: number) => (
                <div key={role.role} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                      {index + 1}
                    </div>
                    <span className="font-medium">{role.role}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${role.averageSalary.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{role.count} jobs</div>
                  </div>
                </div>
              )) || (
                <div className="text-center text-muted-foreground py-8">
                  Limited salary data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Salary Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-4xl mb-2">💰</div>
                <p className="text-sm">Salary distribution chart</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
