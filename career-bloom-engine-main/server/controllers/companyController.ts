import axios from 'axios';
import { Request, Response } from 'express';

const RAPIDAPI_KEY = '38f988da28msh1698b0a89a1a354p1d4711jsn2bc53cbaadc6';

interface CompanyData {
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
}

/**
 * Get trending/popular companies
 */
export const getTrendingCompanies = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Fetching trending companies...');
    
    const limit = parseInt(req.query.limit as string) || 12;
    
    // Try to fetch companies from JSearch API (extract from job data)
    try {
      console.log('🔍 Fetching companies from JSearch job data...');
      const companies = await fetchCompaniesFromLinkedIn('technology', limit);
      if (companies.length > 0) {
        console.log(`✅ Fetched ${companies.length} companies from JSearch API`);
        return res.json({
          success: true,
          companies: companies,
          source: 'jsearch_api'
        });
      }
    } catch (apiError) {
      console.warn('⚠️ JSearch API failed, falling back to mock data:', apiError);
    }

    // Fallback to enhanced mock data only if API fails
    const mockCompanies = getMockCompanies().slice(0, limit);
    console.log(`📋 Using ${mockCompanies.length} mock companies as fallback`);

    res.json({
      success: true,
      companies: mockCompanies,
      source: 'mock_data'
    });

  } catch (error) {
    console.error('❌ Error in getTrendingCompanies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending companies'
    });
  }
};

/**
 * Search companies by query and filters
 */
export const searchCompanies = async (req: Request, res: Response) => {
  try {
    const { query, location, industry, limit = 20 } = req.query;
    
    console.log(`🔍 Searching companies: query="${query}", location="${location}", industry="${industry}"`);

    // Try to fetch companies from JSearch API (extract from job data)
    try {
      console.log('🔍 Searching companies from JSearch job data...');
      const companies = await fetchCompaniesFromLinkedIn(
        query as string || 'technology',
        parseInt(limit as string),
        location as string,
        industry as string
      );

      if (companies.length > 0) {
        console.log(`✅ Found ${companies.length} companies from JSearch API`);
        return res.json({
          success: true,
          companies: companies,
          total: companies.length,
          source: 'jsearch_api'
        });
      }
    } catch (apiError) {
      console.warn('⚠️ JSearch API failed, using filtered mock data:', apiError);
    }

    // Fallback to filtered mock data
    let mockCompanies = getMockCompanies();
    
    // Apply filters to mock data
    if (query) {
      const searchTerm = (query as string).toLowerCase();
      mockCompanies = mockCompanies.filter(company => 
        company.name.toLowerCase().includes(searchTerm) ||
        company.industry.toLowerCase().includes(searchTerm) ||
        company.description.toLowerCase().includes(searchTerm)
      );
    }
    
    if (industry) {
      const industryFilter = (industry as string).toLowerCase();
      mockCompanies = mockCompanies.filter(company => 
        company.industry.toLowerCase().includes(industryFilter)
      );
    }
    
    if (location) {
      const locationFilter = (location as string).toLowerCase();
      mockCompanies = mockCompanies.filter(company => 
        company.location.toLowerCase().includes(locationFilter)
      );
    }

    const limitedCompanies = mockCompanies.slice(0, parseInt(limit as string));
    console.log(`📋 Using ${limitedCompanies.length} filtered mock companies`);

    res.json({
      success: true,
      companies: limitedCompanies,
      total: limitedCompanies.length,
      source: 'mock_data'
    });

  } catch (error) {
    console.error('❌ Error in searchCompanies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search companies'
    });
  }
};

/**
 * Get company details by ID
 */
export const getCompanyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching company details for ID: ${id}`);

    // Try to find in mock data first
    const mockCompanies = getMockCompanies();
    const company = mockCompanies.find(c => c.id === id);
    
    if (company) {
      console.log(`✅ Found company: ${company.name}`);
      return res.json({
        success: true,
        company: company,
        source: 'mock_data'
      });
    }

    res.status(404).json({
      success: false,
      error: 'Company not found'
    });

  } catch (error) {
    console.error('❌ Error in getCompanyById:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company details'
    });
  }
};

/**
 * Fetch companies from LinkedIn API
 */
async function fetchCompaniesFromLinkedIn(
  query: string = 'technology',
  limit: number = 12,
  location?: string,
  industry?: string
): Promise<CompanyData[]> {
  
  // Try JSearch API for company data (since LinkedIn APIs are not subscribed)
  const endpoints = [
    'https://jsearch.p.rapidapi.com/search' // We'll extract company data from job listings
  ];

  // Since LinkedIn APIs are not subscribed, extract companies from JSearch job data
  try {
    console.log(`🔗 Fetching companies from JSearch job data...`);

    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      },
      params: {
        query: `${query} ${industry || 'technology'}`.trim(),
        page: 1,
        num_pages: 1
      },
      timeout: 10000
    });

    if (response.data && response.data.data) {
      // Extract unique companies from job listings
      const companiesMap = new Map();

      response.data.data.forEach((job: any) => {
        if (job.employer_name && !companiesMap.has(job.employer_name)) {
          companiesMap.set(job.employer_name, {
            id: job.employer_name.toLowerCase().replace(/\s+/g, '-'),
            name: job.employer_name,
            logo: job.employer_logo || getDefaultLogo(job.employer_name),
            industry: industry || 'Technology',
            location: job.job_city || location || 'Remote',
            size: '1-50 employees', // Default since we don't have this data
            description: `${job.employer_name} is a company offering opportunities in ${industry || 'technology'}.`,
            openPositions: 1, // At least one since we found a job
            rating: 4.0 + Math.random() * 1.0,
            website: job.employer_website
          });
        }
      });

      const companies = Array.from(companiesMap.values()).slice(0, limit);
      console.log(`✅ Extracted ${companies.length} companies from job data`);
      return companies.map(transformCompanyData);
    }

  } catch (error: any) {
    console.warn(`⚠️ JSearch API failed:`, error.message);
  }

  throw new Error('All LinkedIn API endpoints failed');
}

/**
 * Transform API company data to our format
 */
function transformCompanyData(company: any): CompanyData {
  return {
    id: company.id || company.linkedin_id || Math.random().toString(36).substr(2, 9),
    name: company.name || company.company_name || 'Unknown Company',
    logo: company.logo || company.logo_url || getDefaultLogo(company.name),
    industry: company.industry || company.industries?.[0] || 'Technology',
    location: company.location || company.headquarters || 'Remote',
    size: company.size || formatEmployeeCount(company.employee_count),
    description: company.description || company.about || `${company.name} is a leading company in the ${company.industry || 'technology'} industry.`,
    openPositions: company.open_positions || Math.floor(Math.random() * 50) + 5,
    rating: company.rating || (4.0 + Math.random() * 1.0),
    founded: company.founded || company.founded_year,
    website: company.website || company.website_url,
    linkedin_url: company.linkedin_url,
    specialties: company.specialties || []
  };
}

/**
 * Format employee count to readable string
 */
function formatEmployeeCount(count: number | string): string {
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
function getDefaultLogo(companyName: string): string {
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
 * Enhanced mock companies data
 */
function getMockCompanies(): CompanyData[] {
  return [
    {
      id: '1',
      name: 'Google',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/800px-Google_%22G%22_Logo.svg.png',
      industry: 'Technology',
      location: 'Mountain View, CA',
      size: '10,000+ employees',
      description: 'Google is a multinational technology company specializing in Internet-related services and products including search, cloud computing, and advertising.',
      openPositions: 42,
      rating: 4.5,
      founded: 1998,
      website: 'https://www.google.com'
    },
    {
      id: '2',
      name: 'Microsoft',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/800px-Microsoft_logo.svg.png',
      industry: 'Technology',
      location: 'Redmond, WA',
      size: '10,000+ employees',
      description: 'Microsoft is a multinational technology corporation that develops computer software, consumer electronics, personal computers, and cloud services.',
      openPositions: 38,
      rating: 4.4,
      founded: 1975,
      website: 'https://www.microsoft.com'
    },
    {
      id: '3',
      name: 'Apple',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/800px-Apple_logo_black.svg.png',
      industry: 'Technology',
      location: 'Cupertino, CA',
      size: '10,000+ employees',
      description: 'Apple Inc. designs, develops, and sells consumer electronics, computer software, and online services including iPhone, iPad, Mac, and Apple Watch.',
      openPositions: 35,
      rating: 4.6,
      founded: 1976,
      website: 'https://www.apple.com'
    },
    {
      id: '4',
      name: 'Amazon',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/800px-Amazon_logo.svg.png',
      industry: 'E-commerce',
      location: 'Seattle, WA',
      size: '10,000+ employees',
      description: 'Amazon is a multinational technology company focusing on e-commerce, cloud computing, digital streaming, and artificial intelligence services.',
      openPositions: 67,
      rating: 4.2,
      founded: 1994,
      website: 'https://www.amazon.com'
    },
    {
      id: '5',
      name: 'Meta',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/800px-Meta_Platforms_Inc._logo.svg.png',
      industry: 'Social Media',
      location: 'Menlo Park, CA',
      size: '10,000+ employees',
      description: 'Meta Platforms develops products that help people connect, find communities, and grow businesses through Facebook, Instagram, WhatsApp, and VR.',
      openPositions: 29,
      rating: 4.1,
      founded: 2004,
      website: 'https://about.meta.com'
    },
    {
      id: '6',
      name: 'Netflix',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/800px-Netflix_2015_logo.svg.png',
      industry: 'Entertainment',
      location: 'Los Gatos, CA',
      size: '5001-10000 employees',
      description: 'Netflix is a streaming entertainment service with over 230 million paid memberships in more than 190 countries enjoying TV series, films and games.',
      openPositions: 18,
      rating: 4.3,
      founded: 1997,
      website: 'https://www.netflix.com'
    },
    {
      id: '7',
      name: 'Tesla',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Tesla_T_symbol.svg/800px-Tesla_T_symbol.svg.png',
      industry: 'Automotive',
      location: 'Austin, TX',
      size: '10,000+ employees',
      description: 'Tesla designs, develops, manufactures, and sells electric vehicles, energy generation and storage systems, and related products and services.',
      openPositions: 45,
      rating: 4.0,
      founded: 2003,
      website: 'https://www.tesla.com'
    },
    {
      id: '8',
      name: 'Spotify',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/800px-Spotify_logo_without_text.svg.png',
      industry: 'Music Streaming',
      location: 'Stockholm, Sweden',
      size: '5001-10000 employees',
      description: 'Spotify is a digital music, podcast, and video service that gives you access to millions of songs and other content from creators all over the world.',
      openPositions: 22,
      rating: 4.2,
      founded: 2006,
      website: 'https://www.spotify.com'
    }
  ];
}
