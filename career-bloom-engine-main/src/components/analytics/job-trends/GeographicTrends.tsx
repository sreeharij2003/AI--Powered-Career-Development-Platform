import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/services/api";
import { Globe, MapPin, TrendingUp } from "lucide-react";
import React, { useEffect, useState } from 'react';

export const GeographicTrends: React.FC = () => {
  const [locationData, setLocationData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLocationData();
  }, []);

  const fetchLocationData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/job-trends/locations`);
      const result = await response.json();
      
      if (result.success) {
        setLocationData(result.data);
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
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
      {/* Geographic Distribution Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geographic Distribution
          </CardTitle>
          <CardDescription>
            Top locations for job opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locationData.slice(0, 9).map((location, index) => (
              <div key={location.location} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{location.location}</div>
                    <div className="text-xs text-muted-foreground">{location.percentage}%</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{location.count}</div>
                  <div className="text-xs text-muted-foreground">jobs</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Detailed Market Analysis
            </CardTitle>
            <CardDescription>
              Comprehensive breakdown of job markets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locationData.slice(0, 8).map((location, index) => (
                <div key={location.location} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-base">{location.location}</div>
                      <div className="text-sm text-muted-foreground">
                        {location.percentage}% of total opportunities
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl">{location.count}</div>
                    <div className="text-sm text-muted-foreground">active jobs</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Regional Insights
            </CardTitle>
            <CardDescription>
              Geographic trends and market insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div className="text-2xl font-bold text-blue-600">{locationData.length}</div>
                  <div className="text-sm text-muted-foreground">Active Markets</div>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="text-2xl font-bold text-green-600">
                    {locationData[0]?.location || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Top Market</div>
                </div>
              </div>

              <div className="h-48 bg-gradient-to-br from-muted/30 to-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                <div className="text-center text-muted-foreground">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p className="text-sm font-medium">Interactive Map Visualization</p>
                  <p className="text-xs mt-1">Coming Soon - Geographic Heat Map</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
