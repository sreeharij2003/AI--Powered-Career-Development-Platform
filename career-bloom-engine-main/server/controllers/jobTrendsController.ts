import { Request, Response } from 'express';
import { JobTrendsService } from '../services/jobTrendsService';
import { GeminiInsightsService } from '../services/geminiInsightsService';

export class JobTrendsController {
  private jobTrendsService: JobTrendsService;
  private geminiService: GeminiInsightsService;

  constructor() {
    this.jobTrendsService = new JobTrendsService();
    this.geminiService = new GeminiInsightsService();
  }

  // Get comprehensive job trends data
  getJobTrends = async (req: Request, res: Response) => {
    try {
      console.log('📊 Job trends endpoint hit');
      
      const { location = 'US', days = 7 } = req.query;
      
      // Get fresh job data and analysis
      const trendsData = await this.jobTrendsService.getComprehensiveTrends({
        location: location as string,
        days: parseInt(days as string)
      });

      res.json({
        success: true,
        data: trendsData,
        timestamp: new Date().toISOString(),
        metadata: {
          location,
          days,
          total_jobs: trendsData.totalJobs,
          last_updated: trendsData.lastUpdated
        }
      });

    } catch (error) {
      console.error('❌ Error fetching job trends:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch job trends',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get AI-generated market insights
  getMarketInsights = async (req: Request, res: Response) => {
    try {
      console.log('🧠 Market insights endpoint hit');
      
      const { location = 'US' } = req.query;
      
      // Get trends data for AI analysis
      const trendsData = await this.jobTrendsService.getComprehensiveTrends({
        location: location as string,
        days: 7
      });

      // Generate AI insights using Gemini
      const insights = await this.geminiService.generateMarketInsights(trendsData);

      res.json({
        success: true,
        data: {
          insights,
          generated_at: new Date().toISOString(),
          based_on: {
            total_jobs: trendsData.totalJobs,
            time_range: '7 days',
            location
          }
        }
      });

    } catch (error) {
      console.error('❌ Error generating market insights:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate market insights',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get trending skills
  getTrendingSkills = async (req: Request, res: Response) => {
    try {
      console.log('🔧 Trending skills endpoint hit');
      
      const { location = 'US', limit = 20 } = req.query;
      
      const skillsData = await this.jobTrendsService.getTrendingSkills({
        location: location as string,
        limit: parseInt(limit as string)
      });

      res.json({
        success: true,
        data: skillsData
      });

    } catch (error) {
      console.error('❌ Error fetching trending skills:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trending skills'
      });
    }
  };

  // Get popular roles
  getPopularRoles = async (req: Request, res: Response) => {
    try {
      console.log('👔 Popular roles endpoint hit');
      
      const { location = 'US', limit = 15 } = req.query;
      
      const rolesData = await this.jobTrendsService.getPopularRoles({
        location: location as string,
        limit: parseInt(limit as string)
      });

      res.json({
        success: true,
        data: rolesData
      });

    } catch (error) {
      console.error('❌ Error fetching popular roles:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch popular roles'
      });
    }
  };

  // Get salary trends
  getSalaryTrends = async (req: Request, res: Response) => {
    try {
      console.log('💰 Salary trends endpoint hit');
      
      const { location = 'US' } = req.query;
      
      const salaryData = await this.jobTrendsService.getSalaryTrends({
        location: location as string
      });

      res.json({
        success: true,
        data: salaryData
      });

    } catch (error) {
      console.error('❌ Error fetching salary trends:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch salary trends'
      });
    }
  };

  // Get geographic trends
  getGeographicTrends = async (req: Request, res: Response) => {
    try {
      console.log('🌍 Geographic trends endpoint hit');
      
      const geoData = await this.jobTrendsService.getGeographicTrends();

      res.json({
        success: true,
        data: geoData
      });

    } catch (error) {
      console.error('❌ Error fetching geographic trends:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch geographic trends'
      });
    }
  };

  // Refresh job data manually
  refreshJobData = async (req: Request, res: Response) => {
    try {
      console.log('🔄 Manual refresh triggered');
      
      const result = await this.jobTrendsService.refreshJobData();

      res.json({
        success: true,
        data: result,
        message: 'Job data refresh initiated'
      });

    } catch (error) {
      console.error('❌ Error refreshing job data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to refresh job data'
      });
    }
  };

  // Get trends status
  getTrendsStatus = async (req: Request, res: Response) => {
    try {
      const status = await this.jobTrendsService.getTrendsStatus();

      res.json({
        success: true,
        data: status
      });

    } catch (error) {
      console.error('❌ Error fetching trends status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trends status'
      });
    }
  };
}
