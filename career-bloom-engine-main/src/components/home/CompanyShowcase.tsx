import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { API } from "@/services/api";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// Removed Swiper imports to avoid potential issues

// Sample company data
const companies = [
  {
    id: 1,
    name: "Google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/800px-Google_%22G%22_Logo.svg.png",
    openPositions: 42,
    industry: "Technology"
  },
  {
    id: 2,
    name: "Airbnb",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_B%C3%A9lo.svg/1200px-Airbnb_Logo_B%C3%A9lo.svg.png",
    openPositions: 28,
    industry: "Travel & Hospitality"
  },
  {
    id: 3,
    name: "Slack",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Slack_Technologies_Logo.svg/1280px-Slack_Technologies_Logo.svg.png",
    openPositions: 15,
    industry: "Technology"
  },
  {
    id: 4,
    name: "Netflix",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1920px-Netflix_2015_logo.svg.png",
    openPositions: 23,
    industry: "Entertainment"
  },
  {
    id: 5,
    name: "Spotify",
    logo: "https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png",
    openPositions: 19,
    industry: "Technology"
  },
  {
    id: 6,
    name: "Tesla",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Tesla_Motors.svg/800px-Tesla_Motors.svg.png",
    openPositions: 31,
    industry: "Automotive"
  }
];

const CompanyShowcase = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching trending companies for showcase...');

      const response = await API.companies.getTrending(12);
      console.log('✅ Company showcase response:', response);

      if (response.success && response.companies) {
        setCompanies(response.companies);
        console.log(`📋 Loaded ${response.companies.length} companies for showcase`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('❌ Error fetching companies for showcase:', err);
      // Fallback to mock data
      setCompanies(getMockCompanies());
    } finally {
      setLoading(false);
    }
  };

  // Mock companies fallback
  const getMockCompanies = () => [
    {
      id: 1,
      name: "Google",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/800px-Google_%22G%22_Logo.svg.png",
      openPositions: 42,
      industry: "Technology"
    },
    {
      id: 2,
      name: "Microsoft",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/800px-Microsoft_logo.svg.png",
      openPositions: 38,
      industry: "Technology"
    },
    {
      id: 3,
      name: "Apple",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/800px-Apple_logo_black.svg.png",
      openPositions: 35,
      industry: "Technology"
    }
  ];

  return (
    <section className="py-16 transition-colors duration-500">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Top Companies Hiring</h2>
            <p className="text-muted-foreground mt-2">Discover opportunities at leading organizations across industries</p>
          </div>
          <Link to="/companies" className="text-primary-purple hover:underline mt-4 md:mt-0">
            View all companies →
          </Link>
        </div>

        {/* Company cards grid - Replaced Swiper to avoid issues */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 my-8">
          {loading ? (
            // Loading skeleton
            [...Array(6)].map((_, i) => (
              <Card key={`loading-${i}`} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/80 via-purple-100/60 to-purple-200/40 dark:from-gray-900/80 dark:via-gray-950/60 dark:to-purple-950/40 backdrop-blur-lg shadow-2xl border border-gray-200 dark:border-gray-800">
                <CardContent className="relative p-6 flex flex-col items-center justify-center text-center z-10">
                  <div className="animate-pulse">
                    <div className="w-16 h-16 bg-gray-200 rounded-md mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            companies.map(company => (
              <Card key={company.id} className="relative card-hover overflow-hidden rounded-2xl bg-gradient-to-br from-white/80 via-purple-100/60 to-purple-200/40 dark:from-gray-900/80 dark:via-gray-950/60 dark:to-purple-950/40 backdrop-blur-lg shadow-2xl border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-3xl hover:scale-[1.03] hover:border-primary-purple/60 dark:hover:border-primary-purple/80">
                <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-br from-primary-purple/10 to-transparent opacity-60 hover:opacity-80 transition-all duration-300" />
                <CardContent className="relative p-6 flex flex-col items-center justify-center text-center z-10">
                  <div className="w-16 h-16 bg-white rounded-md overflow-hidden border p-2 flex items-center justify-center mb-4 shadow group-hover:shadow-lg transition-all duration-300">
                    <img src={company.logo} alt={company.name} className="max-w-full max-h-full object-contain group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.4)] transition-all duration-300" />
                  </div>
                  <h3 className="font-semibold">{company.name}</h3>
                  <p className="text-sm text-muted-foreground">{company.industry}</p>
                  <p className="text-sm font-medium text-primary-purple mt-1">
                    {company.openPositions} open positions
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="mt-12">
          <Card className="overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-2/3 p-8 lg:p-12">
                <h3 className="text-2xl font-bold mb-4">For Employers</h3>
                <p className="text-muted-foreground mb-6">
                  Attract top talent and build your dream team with CareerBloom's employer solutions. Post jobs, manage applications, and connect with qualified candidates all in one place.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button className="btn-gradient">Post a Job</Button>
                  <Button variant="outline">Learn More</Button>
                </div>
              </div>
              <div className="lg:w-1/3 bg-gradient-to-br from-primary/20 to-secondary/20 p-8 lg:p-12 flex items-center justify-center">
                <div className="text-center">
                  <h4 className="text-xl font-semibold mb-2">Get Started Today</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Join thousands of companies already using CareerBloom to find their perfect candidates.
                  </p>
                  <span className="block text-3xl font-bold text-primary-purple">10,000+</span>
                  <span className="text-sm text-muted-foreground">Companies</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default CompanyShowcase;
