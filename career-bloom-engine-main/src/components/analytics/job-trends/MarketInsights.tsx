import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Copy, 
  Share2, 
  Download, 
  Lightbulb,
  TrendingUp,
  Target,
  DollarSign,
  MapPin
} from "lucide-react";

interface MarketInsightsProps {
  insights: string;
}

export const MarketInsights: React.FC<MarketInsightsProps> = ({ insights }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(insights);
  };

  const shareInsights = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Job Market Insights',
        text: insights,
      });
    }
  };

  const downloadInsights = () => {
    const blob = new Blob([insights], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-market-insights-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Parse insights to extract key sections
  const parseInsights = (text: string) => {
    const sections = text.split('\n\n').filter(section => section.trim());
    return sections;
  };

  const formatInsightText = (text: string) => {
    // Convert markdown-style formatting to JSX
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•/g, '•')
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('#')) {
          const level = line.match(/^#+/)?.[0].length || 1;
          const text = line.replace(/^#+\s*/, '');
          const className = level === 1 ? 'text-xl font-bold mb-3' : 
                          level === 2 ? 'text-lg font-semibold mb-2' : 
                          'text-base font-medium mb-1';
          return (
            <div key={index} className={className}>
              {text}
            </div>
          );
        }
        
        if (line.startsWith('•') || line.startsWith('-')) {
          return (
            <div key={index} className="flex items-start gap-2 mb-1">
              <span className="text-primary mt-1">•</span>
              <span dangerouslySetInnerHTML={{ __html: line.replace(/^[•-]\s*/, '') }} />
            </div>
          );
        }
        
        if (line.trim()) {
          return (
            <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: line }} />
          );
        }
        
        return <br key={index} />;
      });
  };

  const getInsightIcon = (text: string) => {
    if (text.toLowerCase().includes('trend')) return <TrendingUp className="h-4 w-4" />;
    if (text.toLowerCase().includes('skill')) return <Target className="h-4 w-4" />;
    if (text.toLowerCase().includes('salary')) return <DollarSign className="h-4 w-4" />;
    if (text.toLowerCase().includes('location')) return <MapPin className="h-4 w-4" />;
    return <Lightbulb className="h-4 w-4" />;
  };

  const sections = parseInsights(insights);

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Lightbulb className="h-3 w-3" />
          AI Generated Insights
        </Badge>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-8"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={shareInsights}
            className="h-8"
          >
            <Share2 className="h-3 w-3 mr-1" />
            Share
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadInsights}
            className="h-8"
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </div>

      {/* Insights Content */}
      <div className="space-y-4">
        {sections.length > 1 ? (
          // Multiple sections - render as cards
          sections.map((section, index) => {
            const firstLine = section.split('\n')[0];
            const isHeader = firstLine.startsWith('#') || firstLine.includes(':');
            
            return (
              <Card key={index} className="border-l-4 border-l-primary/50">
                <CardContent className="p-4">
                  {isHeader && (
                    <div className="flex items-center gap-2 mb-3">
                      {getInsightIcon(firstLine)}
                      <h3 className="font-semibold text-foreground">
                        {firstLine.replace(/^#+\s*/, '').replace(/:$/, '')}
                      </h3>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {formatInsightText(isHeader ? section.split('\n').slice(1).join('\n') : section)}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          // Single section - render as one block
          <Card className="border-l-4 border-l-primary/50">
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none">
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {formatInsightText(insights)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Key Takeaways */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-primary">Key Takeaways</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Market shows strong growth trends</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Remote work opportunities increasing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Tech skills in high demand</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span>Competitive salary landscape</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
