import axios from 'axios';

const RAPIDAPI_KEY = '38f988da28msh1698b0a89a1a354p1d4711jsn2bc53cbaadc6';

export interface Company {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  location: string;
  size: string;
  description: string;
  openPositions: number;
  rating: number;
  founded?: number;
  website?: string;
  linkedin_url?: string;
  specialties?: string[];
  employees_count?: string;
}

export interface CompanySearchResponse {
  companies: Company[];
  total: number;
  page: number;
  totalPages: number;
}

class CompanyApi {
  private apiKey: string;

  constructor() {
    this.apiKey = RAPIDAPI_KEY;
  }

  /**
   * Search for companies using LinkedIn Company Search API
   */
  async searchCompanies(query: string = '', location: string = '', limit: number = 20): Promise<Company[]> {
    try {
      console.log(`🔍 Searching companies: query="${query}", location="${location}"`);

      const response = await axios.get('https://linkedin-company-data.p.rapidapi.com/companies', {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'linkedin-company-data.p.rapidapi.com'
        },
        params: {
          query: query || 'technology',
          location: location,
          limit: limit
        }
      });

      console.log(`✅ Found ${response.data.length} companies`);
      return this.transformCompanyData(response.data);

    } catch (error) {
      console.error('❌ Error fetching companies from API:', error);
      // Fallback to mock data if API fails
      return this.getMockCompanies();
    }
  }

  /**
   * Get trending/popular companies
   */
  async getTrendingCompanies(limit: number = 12): Promise<Company[]> {
    try {
      // Use popular tech companies as search terms
      const popularCompanies = [
        'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix',
        'Tesla', 'Spotify', 'Airbnb', 'Uber', 'Slack', 'Zoom'
      ];

      const companies: Company[] = [];
      
      for (const companyName of popularCompanies.slice(0, limit)) {
        try {
          const companyData = await this.getCompanyByName(companyName);
          if (companyData) {
            companies.push(companyData);
          }
        } catch (error) {
          console.warn(`Failed to fetch data for ${companyName}:`, error);
        }
      }

      return companies.length > 0 ? companies : this.getMockCompanies();

    } catch (error) {
      console.error('❌ Error fetching trending companies:', error);
      return this.getMockCompanies();
    }
  }

  /**
   * Get company details by name
   */
  async getCompanyByName(companyName: string): Promise<Company | null> {
    try {
      const response = await axios.get('https://linkedin-company-data.p.rapidapi.com/company', {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'linkedin-company-data.p.rapidapi.com'
        },
        params: {
          name: companyName
        }
      });

      if (response.data) {
        return this.transformSingleCompany(response.data);
      }
      return null;

    } catch (error) {
      console.error(`❌ Error fetching company ${companyName}:`, error);
      return null;
    }
  }

  /**
   * Get companies by industry
   */
  async getCompaniesByIndustry(industry: string, limit: number = 10): Promise<Company[]> {
    try {
      const response = await axios.get('https://linkedin-company-data.p.rapidapi.com/companies', {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'linkedin-company-data.p.rapidapi.com'
        },
        params: {
          industry: industry,
          limit: limit
        }
      });

      return this.transformCompanyData(response.data);

    } catch (error) {
      console.error(`❌ Error fetching companies for industry ${industry}:`, error);
      return this.getMockCompanies().filter(c => 
        c.industry.toLowerCase().includes(industry.toLowerCase())
      );
    }
  }

  /**
   * Transform API response to our Company interface
   */
  private transformCompanyData(apiData: any[]): Company[] {
    return apiData.map(company => this.transformSingleCompany(company));
  }

  /**
   * Transform single company data from API
   */
  private transformSingleCompany(company: any): Company {
    return {
      id: company.id || company.linkedin_id || Math.random().toString(36).substr(2, 9),
      name: company.name || company.company_name || 'Unknown Company',
      logo: company.logo || company.logo_url || this.getDefaultLogo(company.name),
      industry: company.industry || company.industries?.[0] || 'Technology',
      location: company.location || company.headquarters || 'Remote',
      size: company.size || company.employees_count || this.formatEmployeeCount(company.employee_count),
      description: company.description || company.about || `${company.name} is a leading company in the ${company.industry || 'technology'} industry.`,
      openPositions: company.open_positions || Math.floor(Math.random() * 50) + 5,
      rating: company.rating || (4.0 + Math.random() * 1.0),
      founded: company.founded || company.founded_year,
      website: company.website || company.website_url,
      linkedin_url: company.linkedin_url,
      specialties: company.specialties || [],
      employees_count: company.employees_count
    };
  }

  /**
   * Format employee count to readable string
   */
  private formatEmployeeCount(count: number | string): string {
    if (!count) return '1-50 employees';
    
    const num = typeof count === 'string' ? parseInt(count) : count;
    
    if (num < 50) return '1-50 employees';
    if (num < 200) return '51-200 employees';
    if (num < 500) return '201-500 employees';
    if (num < 1000) return '501-1000 employees';
    if (num < 5000) return '1001-5000 employees';
    if (num < 10000) return '5001-10000 employees';
    return '10,000+ employees';
  }

  /**
   * Get default logo URL for company
   */
  private getDefaultLogo(companyName: string): string {
    const logoMap: { [key: string]: string } = {
      'Google': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/800px-Google_%22G%22_Logo.svg.png',
      'Microsoft': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/800px-Microsoft_logo.svg.png',
      'Apple': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/800px-Apple_logo_black.svg.png',
      'Amazon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/800px-Amazon_logo.svg.png',
      'Meta': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/800px-Meta_Platforms_Inc._logo.svg.png',
      'Netflix': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/800px-Netflix_2015_logo.svg.png'
    };

    return logoMap[companyName] || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=6366f1&color=fff&size=128`;
  }

  /**
   * Fallback mock companies data
   */
  private getMockCompanies(): Company[] {
    return [
      {
        id: '1',
        name: 'Google',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/800px-Google_%22G%22_Logo.svg.png',
        industry: 'Technology',
        location: 'Mountain View, CA',
        size: '10,000+ employees',
        description: 'Google is a multinational technology company specializing in Internet-related services and products.',
        openPositions: 42,
        rating: 4.5,
        founded: 1998
      },
      {
        id: '2',
        name: 'Microsoft',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/800px-Microsoft_logo.svg.png',
        industry: 'Technology',
        location: 'Redmond, WA',
        size: '10,000+ employees',
        description: 'Microsoft is a multinational technology corporation that develops computer software, consumer electronics, and personal computers.',
        openPositions: 38,
        rating: 4.4,
        founded: 1975
      },
      {
        id: '3',
        name: 'Apple',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/800px-Apple_logo_black.svg.png',
        industry: 'Technology',
        location: 'Cupertino, CA',
        size: '10,000+ employees',
        description: 'Apple Inc. is an American multinational technology company that designs, develops, and sells consumer electronics, computer software, and online services.',
        openPositions: 35,
        rating: 4.6,
        founded: 1976
      },
      {
        id: '4',
        name: 'Amazon',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/800px-Amazon_logo.svg.png',
        industry: 'E-commerce',
        location: 'Seattle, WA',
        size: '10,000+ employees',
        description: 'Amazon is an American multinational technology company focusing on e-commerce, cloud computing, digital streaming, and artificial intelligence.',
        openPositions: 67,
        rating: 4.2,
        founded: 1994
      },
      {
        id: '5',
        name: 'Meta',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/800px-Meta_Platforms_Inc._logo.svg.png',
        industry: 'Social Media',
        location: 'Menlo Park, CA',
        size: '10,000+ employees',
        description: 'Meta Platforms, Inc. is an American multinational technology conglomerate holding company based in Menlo Park, California.',
        openPositions: 29,
        rating: 4.1,
        founded: 2004
      },
      {
        id: '6',
        name: 'Netflix',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/800px-Netflix_2015_logo.svg.png',
        industry: 'Entertainment',
        location: 'Los Gatos, CA',
        size: '5001-10000 employees',
        description: 'Netflix is an American subscription streaming service and production company.',
        openPositions: 18,
        rating: 4.3,
        founded: 1997
      }
    ];
  }
}

export default new CompanyApi();
