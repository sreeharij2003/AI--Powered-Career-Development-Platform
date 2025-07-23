
import MainLayout from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { API } from "@/services/api";
import { Building, Filter, MapPin, Search, Star, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Sample company data
const companies = [
  {
    id: 1,
    name: "Google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/800px-Google_%22G%22_Logo.svg.png",
    industry: "Technology",
    location: "Mountain View, CA",
    size: "10,000+ employees",
    description: "Google is a multinational technology company specializing in Internet-related services and products.",
    openPositions: 42,
    rating: 4.5,
    founded: 1998
  },
  {
    id: 2,
    name: "Airbnb",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_B%C3%A9lo.svg/1200px-Airbnb_Logo_B%C3%A9lo.svg.png",
    industry: "Travel & Hospitality",
    location: "San Francisco, CA",
    size: "5,000-10,000 employees",
    description: "Airbnb is an online marketplace for arranging or offering lodging, primarily homestays, or tourism experiences.",
    openPositions: 28,
    rating: 4.3,
    founded: 2008
  },
  {
    id: 3,
    name: "Slack",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Slack_Technologies_Logo.svg/1280px-Slack_Technologies_Logo.svg.png",
    industry: "Technology",
    location: "San Francisco, CA",
    size: "1,000-5,000 employees",
    description: "Slack is a business communication platform offering many IRC-style features, including persistent chat rooms organized by topic.",
    openPositions: 15,
    rating: 4.4,
    founded: 2013
  },
  {
    id: 4,
    name: "Netflix",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1920px-Netflix_2015_logo.svg.png",
    industry: "Entertainment",
    location: "Los Gatos, CA",
    size: "5,000-10,000 employees",
    description: "Netflix is an American content platform and production company, offering subscription-based streaming service.",
    openPositions: 23,
    rating: 4.2,
    founded: 1997
  },
  {
    id: 5,
    name: "Spotify",
    logo: "https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png",
    industry: "Technology",
    location: "Stockholm, Sweden",
    size: "1,000-5,000 employees",
    description: "Spotify is a digital music service that gives you access to millions of songs.",
    openPositions: 19,
    rating: 4.1,
    founded: 2006
  },
  {
    id: 6,
    name: "Tesla",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Tesla_Motors.svg/800px-Tesla_Motors.svg.png",
    industry: "Automotive",
    location: "Palo Alto, CA",
    size: "10,000+ employees",
    description: "Tesla is an American electric vehicle and clean energy company.",
    openPositions: 31,
    rating: 4.0,
    founded: 2003
  }
];

const Companies = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching companies from API...');

      const response = await API.companies.getTrending(20);
      console.log('✅ Companies response:', response);

      if (response.success && response.companies) {
        setCompanies(response.companies);
        console.log(`📋 Loaded ${response.companies.length} companies`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('❌ Error fetching companies:', err);
      setError(err.message || 'Failed to fetch companies');
      // Fallback to mock data
      setCompanies(getMockCompanies());
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔍 Searching companies: "${searchQuery}", industry: "${selectedIndustry}", location: "${selectedLocation}"`);

      const response = await API.companies.search(
        searchQuery || undefined,
        selectedLocation || undefined,
        selectedIndustry || undefined,
        20
      );

      if (response.success && response.companies) {
        setCompanies(response.companies);
        console.log(`📋 Found ${response.companies.length} companies`);
      } else {
        throw new Error('Invalid search response');
      }
    } catch (err: any) {
      console.error('❌ Error searching companies:', err);
      setError(err.message || 'Failed to search companies');
    } finally {
      setLoading(false);
    }
  };

  // Mock companies fallback
  const getMockCompanies = () => [
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
      description: 'Microsoft is a multinational technology corporation.',
      openPositions: 38,
      rating: 4.4,
      founded: 1975
    }
  ];

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Sidebar filters */}
          <div className="w-full md:w-64 shrink-0 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  <h3 className="font-medium">Filters</h3>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Industry</h4>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded text-primary" />
                      Technology
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded text-primary" />
                      Healthcare
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded text-primary" />
                      Finance
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded text-primary" />
                      Education
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Company Size</h4>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded text-primary" />
                      1-50 employees
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded text-primary" />
                      51-200 employees
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded text-primary" />
                      201-1000 employees
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded text-primary" />
                      1000+ employees
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Rating</h4>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded text-primary" />
                      4+ stars
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded text-primary" />
                      3+ stars
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded text-primary" />
                      2+ stars
                    </label>
                  </div>
                </div>
                <Button className="w-full btn-gradient">Apply Filters</Button>
              </CardContent>
            </Card>
          </div>

          {/* Company listings */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search companies by name or industry"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button
                className="btn-gradient md:w-auto w-full"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">⚠️ {error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={fetchCompanies}
                >
                  Try Again
                </Button>
              </div>
            )}

            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Explore Companies</h1>
              <p className="text-sm text-muted-foreground">
                {loading ? 'Loading...' : `${companies.length} companies found`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map(company => (
                <Card key={company.id} className="card-hover overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-white rounded-md overflow-hidden border p-2 flex items-center justify-center">
                        <img src={company.logo} alt={company.name} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">{company.name}</h2>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm">{company.rating} rating</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-2">
                        <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{company.industry}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{company.size}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{company.location}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {company.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {company.openPositions} open positions
                      </Badge>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/companies/${company.id}`}>View Company</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            )}

            <div className="flex justify-center mt-8">
              <Button variant="outline" className="mr-2">Previous</Button>
              <Button className="btn-gradient">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Companies;
