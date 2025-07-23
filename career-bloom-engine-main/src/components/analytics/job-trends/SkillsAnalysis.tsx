import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Code, Target, TrendingUp, Zap } from "lucide-react";
import React, { useEffect, useState } from 'react';

interface Skill {
  skill: string;
  count: number;
  percentage: number;
  growth: number;
}

export const SkillsAnalysis: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<string>('');

  useEffect(() => {
    fetchSkillsData();
  }, []);

  const fetchSkillsData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/job-trends/skills?location=US&limit=25`);
      const result = await response.json();
      
      if (result.success) {
        setSkills(result.data);
      }
    } catch (error) {
      console.error('Error fetching skills data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSkillsInsights = async () => {
    try {
      // This would call the Gemini API for skills-specific insights
      setInsights('Skills analysis insights would be generated here using AI...');
    } catch (error) {
      console.error('Error generating skills insights:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
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
            <Target className="h-5 w-5" />
            Skills Analysis Dashboard
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of trending technical skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateSkillsInsights} variant="outline">
            <Zap className="h-4 w-4 mr-2" />
            Generate AI Insights
          </Button>
          {insights && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">{insights}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Growing Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skills.slice(0, 10).map((skill, index) => (
                <div key={skill.skill} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Code className="h-4 w-4 text-primary" />
                    <span className="font-medium">{skill.skill}</span>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-700">
                    +{skill.growth}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills Heatmap</CardTitle>
            <CardDescription>Visual representation of skill demand</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-4xl mb-2">🔥</div>
                <p className="text-sm">Skills heatmap visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
