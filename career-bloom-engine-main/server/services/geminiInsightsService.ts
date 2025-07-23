import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiInsightsService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA0aFb_12Xtn-qr5iv8hOaoerMV7YxS4qE';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateMarketInsights(trendsData: any): Promise<string> {
    try {
      console.log('🧠 Generating market insights with Gemini...');

      const prompt = this.buildMarketInsightsPrompt(trendsData);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const insights = response.text();

      console.log('✅ Market insights generated successfully');
      return insights;

    } catch (error) {
      console.error('❌ Error generating market insights:', error);
      
      // Fallback to structured insights if AI fails
      return this.generateFallbackInsights(trendsData);
    }
  }

  private buildMarketInsightsPrompt(trendsData: any): string {
    const {
      totalJobs,
      timeRange,
      location,
      quickStats,
      topRoles,
      trendingSkills,
      salaryInsights,
      locationDistribution,
      remoteWorkTrends,
      industryDistribution
    } = trendsData;

    return `
Analyze the following job market data from the last ${timeRange} in ${location} and provide comprehensive career insights:

📊 MARKET OVERVIEW:
- Total Jobs Posted: ${totalJobs}
- Remote Work: ${quickStats.remotePercentage}% of jobs
- Salary Transparency: ${quickStats.salaryTransparency}% of jobs show salary
- Average Posts Per Day: ${quickStats.averagePostsPerDay}

🔥 TOP ROLES IN DEMAND:
${topRoles.slice(0, 10).map((role: any, index: number) => 
  `${index + 1}. ${role.title}: ${role.count} jobs (${role.percentage}%)`
).join('\n')}

⚡ TRENDING SKILLS:
${trendingSkills.slice(0, 15).map((skill: any, index: number) => 
  `${index + 1}. ${skill.skill}: ${skill.count} mentions (${skill.growth}% growth)`
).join('\n')}

💰 SALARY INSIGHTS:
${salaryInsights.overallAverage ? `- Average Salary: $${salaryInsights.overallAverage.toLocaleString()}` : '- Limited salary data available'}
${salaryInsights.byRole ? salaryInsights.byRole.slice(0, 5).map((role: any) => 
  `- ${role.role}: $${role.averageSalary.toLocaleString()} avg`
).join('\n') : ''}

🌍 TOP LOCATIONS:
${locationDistribution.slice(0, 8).map((loc: any, index: number) => 
  `${index + 1}. ${loc.location}: ${loc.count} jobs (${loc.percentage}%)`
).join('\n')}

🏢 INDUSTRY BREAKDOWN:
${industryDistribution.slice(0, 6).map((ind: any, index: number) => 
  `${index + 1}. ${ind.industry}: ${ind.count} jobs (${ind.percentage}%)`
).join('\n')}

🏠 REMOTE WORK TRENDS:
- Remote Jobs: ${remoteWorkTrends.remoteJobs} out of ${remoteWorkTrends.totalJobs} (${remoteWorkTrends.remotePercentage}%)

Please provide a comprehensive market analysis that includes:

1. **Key Market Trends**: What are the most significant trends in the current job market?

2. **Emerging Opportunities**: Which roles and skills are showing the strongest growth?

3. **Salary Landscape**: What can professionals expect in terms of compensation?

4. **Geographic Insights**: Which locations offer the best opportunities?

5. **Remote Work Evolution**: How is remote work shaping the market?

6. **Actionable Career Advice**: Specific recommendations for job seekers and career changers.

7. **Future Outlook**: Predictions for the next 3-6 months based on current trends.

Format your response as engaging, professional insights that would be valuable for career-minded professionals. Use bullet points, emojis, and clear sections for readability. Keep the tone informative yet accessible.
`;
  }

  private generateFallbackInsights(trendsData: any): string {
    const {
      totalJobs,
      quickStats,
      topRoles,
      trendingSkills,
      remoteWorkTrends
    } = trendsData;

    return `
# 📊 Job Market Insights - Last 7 Days

## 🔥 Market Highlights
- **${totalJobs.toLocaleString()} new jobs** posted this week
- **${quickStats.remotePercentage}% remote opportunities** available
- **${quickStats.averagePostsPerDay} jobs posted daily** on average

## 🚀 Top Opportunities
The most in-demand roles this week:
${topRoles.slice(0, 5).map((role: any, index: number) => 
  `${index + 1}. **${role.title}** - ${role.count} openings`
).join('\n')}

## ⚡ Skills in High Demand
${trendingSkills.slice(0, 8).map((skill: any, index: number) => 
  `• **${skill.skill}** - mentioned in ${skill.count} job posts`
).join('\n')}

## 🏠 Remote Work Trends
- ${remoteWorkTrends.remotePercentage}% of jobs offer remote work options
- Remote-first companies are actively hiring
- Hybrid models becoming the new standard

## 💡 Career Recommendations
- **Focus on trending skills** like ${trendingSkills.slice(0, 3).map((s: any) => s.skill).join(', ')}
- **Consider remote opportunities** to expand your job search
- **${topRoles[0]?.title} roles** show the highest demand currently

## 📈 Market Outlook
The job market remains strong with consistent daily postings and growing remote work opportunities. Tech skills continue to dominate demand across industries.

*Data based on ${totalJobs} job postings from the last 7 days*
`;
  }

  async generateSkillsInsights(skillsData: any[]): Promise<string> {
    try {
      const prompt = `
Analyze these trending skills data and provide insights:

${skillsData.map((skill, index) => 
  `${index + 1}. ${skill.skill}: ${skill.count} mentions (${skill.growth}% growth)`
).join('\n')}

Provide:
1. Which skills are most critical for career growth
2. Emerging technologies to watch
3. Skills that complement each other
4. Learning recommendations for professionals

Keep it concise and actionable.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('Error generating skills insights:', error);
      return 'Skills analysis temporarily unavailable. Please try again later.';
    }
  }

  async generateSalaryInsights(salaryData: any): Promise<string> {
    try {
      const prompt = `
Analyze this salary data and provide insights:

Overall Average: $${salaryData.overallAverage?.toLocaleString() || 'N/A'}

Top Paying Roles:
${salaryData.byRole?.slice(0, 8).map((role: any, index: number) => 
  `${index + 1}. ${role.role}: $${role.averageSalary.toLocaleString()}`
).join('\n') || 'Limited data available'}

Provide:
1. Salary trends and market positioning
2. Roles with best compensation growth
3. Factors affecting salary ranges
4. Negotiation insights for professionals

Keep it professional and data-driven.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('Error generating salary insights:', error);
      return 'Salary analysis temporarily unavailable. Please try again later.';
    }
  }

  async generateLocationInsights(locationData: any[]): Promise<string> {
    try {
      const prompt = `
Analyze these geographic job trends:

${locationData.map((loc, index) => 
  `${index + 1}. ${loc.location}: ${loc.count} jobs (${loc.percentage}%)`
).join('\n')}

Provide insights on:
1. Emerging job markets and tech hubs
2. Location-based opportunities
3. Remote vs on-site trends by location
4. Cost of living vs opportunity analysis

Keep it practical for job seekers.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('Error generating location insights:', error);
      return 'Geographic analysis temporarily unavailable. Please try again later.';
    }
  }
}

// Export a simple function for easy use
export async function generateInsights(prompt: string): Promise<string> {
  const service = new GeminiInsightsService();
  try {
    const result = await service.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('❌ Error generating insights:', error);
    return `# 🤖 AI Insights

Unfortunately, AI insights are temporarily unavailable. Please try again later.

## 📊 Quick Analysis
Based on the current job market data, here are some key observations:

- The job market remains active with consistent posting activity
- Remote work opportunities continue to be in high demand
- Technology skills are showing strong growth across industries
- Geographic distribution shows concentration in major tech hubs

*Please refresh to try generating AI insights again.*`;
  }
}
