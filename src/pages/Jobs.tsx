import ApiKeyInitializer from "@/components/jobs/ApiKeyInitializer";
import ApiTester from "@/components/jobs/ApiTester";
import MainLayout from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useClerkAuthContext } from "@/contexts/ClerkAuthContext";
import { fetchJobs, searchJobs } from "@/services/jobsService";
import { JobListing } from "@/types/jobs";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Briefcase, Building, Clock, Filter, LayoutDashboard, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Jobs = () => {
  const { isAuthenticated } = useClerkAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [apiKeyInitialized, setApiKeyInitialized] = useState(false);
  const [showApiTester, setShowApiTester] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [usingMockData, setUsingMockData] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    jobType: [] as string[],
    experienceLevel: [] as string[],
    industry: [] as string[]
  });

  // JSearch API key - this would ideally come from environment variables
  const apiKey = "50e16db1b9msh3cd5b97a059ce2bp181ba5jsndd3ab1bbc0ac";

  // Initialize API key
  useEffect(() => {
    if (apiKey) {
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => {
        setApiKeyInitialized(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [apiKey]);

  const { data: jobs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['jobs', searchTerm, filters, apiKeyInitialized],
    queryFn: async () => {
      try {
        // Default to searching for developer jobs if no search term
        const effectiveSearchTerm = searchTerm || "developer";
        const result = searchTerm ? 
          await searchJobs(effectiveSearchTerm, filters) : 
          await fetchJobs(filters);
        
        // Check if we're using mock data (look for mock data markers)
        if (result.length > 0 && 
            ['Microsoft', 'Google', 'Amazon', 'Netflix', 'Facebook'].includes(result[0].company)) {
          setUsingMockData(true);
        } else {
          setUsingMockData(false);
        }
        
        setErrorDetails('');
        return result;
      } catch (err) {
        console.error('Error fetching jobs:', err);
        
        // Check if it's an API error
        const errorMessage = err instanceof Error ? err.message : String(err);
        setErrorDetails(errorMessage);
        throw err;
      }
    },
    staleTime: 60000, // 1 minute
    enabled: apiKeyInitialized, // Only run query when API key is initialized
    retry: 1, // Only retry once to avoid hammering the API
  });

  // Effect to refetch jobs when API key is initialized
  useEffect(() => {
    if (apiKeyInitialized) {
      console.log("API key initialized, fetching jobs...");
      refetch().catch(err => {
        console.error('Error refetching jobs:', err);
      });
    }
  }, [apiKeyInitialized, refetch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch().catch(err => {
      console.error('Error searching jobs:', err);
    });
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => {
      const currentValues = prev[filterType as keyof typeof prev] as string[];
      
      return {
        ...prev,
        [filterType]: currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value]
      };
    });
  };

  const handleApplyFilters = () => {
    refetch().catch(err => {
      console.error('Error applying filters:', err);
    });
  };

  const toggleApiTester = () => {
    setShowApiTester(prev => !prev);
  };

  return (
    <MainLayout>
      {/* Initialize the API key */}
      <ApiKeyInitializer apiKey={apiKey} />
      
      <div className="container py-10">
        {isAuthenticated && (
          <div className="mb-6 flex justify-end">
            <Button variant="outline" asChild className="flex items-center gap-2">
              <Link to="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        )}
        
        {/* Mock data notification */}
        {usingMockData && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800">Using sample job data</p>
              <p className="text-sm text-yellow-700">
                The JSearch API returned an error. Showing sample job listings instead.
              </p>
            </div>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Sidebar filters */}
          <div className="w-full md:w-64 shrink-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Location</h3>
                  <Input 
                    placeholder="Search locations" 
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Job Type</h3>
                  <div className="space-y-1">
                    {["Full-Time", "Part-Time", "Contract", "Remote"].map(type => (
                      <label key={type} className="flex items-center gap-2 text-sm">
                        <input 
                          type="checkbox" 
                          className="rounded text-primary"
                          checked={filters.jobType.includes(type)}
                          onChange={() => handleFilterChange('jobType', type)}
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Experience Level</h3>
                  <div className="space-y-1">
                    {["Entry Level", "Mid Level", "Senior Level"].map(level => (
                      <label key={level} className="flex items-center gap-2 text-sm">
                        <input 
                          type="checkbox" 
                          className="rounded text-primary"
                          checked={filters.experienceLevel.includes(level)}
                          onChange={() => handleFilterChange('experienceLevel', level)}
                        />
                        {level}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Industry</h3>
                  <div className="space-y-1">
                    {["Technology", "Healthcare", "Finance", "Education"].map(industry => (
                      <label key={industry} className="flex items-center gap-2 text-sm">
                        <input 
                          type="checkbox" 
                          className="rounded text-primary"
                          checked={filters.industry.includes(industry)}
                          onChange={() => handleFilterChange('industry', industry)}
                        />
                        {industry}
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button className="w-full btn-gradient" onClick={handleApplyFilters}>Apply Filters</Button>
                <Button variant="outline" className="w-full" onClick={toggleApiTester}>
                  {showApiTester ? 'Hide API Tester' : 'Show API Tester'}
                </Button>
              </CardFooter>
            </Card>
            
            {/* API Tester */}
            {showApiTester && (
              <ApiTester />
            )}
          </div>
          
          {/* Job listings */}
          <div className="flex-1 space-y-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search job titles, companies, or keywords" 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              <Button type="submit" className="btn-gradient md:w-auto w-full">Search</Button>
            </form>
            
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Browse Jobs</h1>
              <div className="text-xs text-muted-foreground">
                {usingMockData ? 'Sample Data' : 'Powered by JSearch API'}
              </div>
            </div>
            
            {!apiKeyInitialized ? (
              <div className="text-center py-10">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Initializing API connection...</p>
              </div>
            ) : isLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Loading jobs...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <div className="bg-red-50 border border-red-200 rounded-md p-6">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">Error loading jobs</h3>
                  <p className="text-red-600 mb-4">Please try again later or check your API key.</p>
                  
                  {errorDetails && (
                    <div className="mt-4 p-3 bg-red-100 rounded text-sm text-red-800 font-mono overflow-auto max-h-40">
                      {errorDetails}
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => refetch()} 
                    className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-10">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6">
                  <h3 className="text-lg font-semibold text-yellow-600 mb-2">No jobs found</h3>
                  <p>No jobs found matching your criteria. Try adjusting your search.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job: JobListing) => (
                  <Card key={job.id} className="card-hover overflow-hidden">
                    <div className="p-6 flex gap-4">
                      <div className="hidden md:block w-16 h-16 bg-white rounded-md overflow-hidden border p-2 flex-shrink-0">
                        <img 
                          src={job.logo || "/placeholder.svg"} 
                          alt={job.company} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row justify-between gap-2">
                          <div>
                            <h2 className="text-xl font-semibold">
                              <a 
                                href={job.applicationUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:text-primary-purple transition-colors"
                              >
                                {job.title}
                              </a>
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">{job.company}</span>
                            </div>
                          </div>
                          <Badge variant={job.type.includes("Full") ? "default" : "outline"} className="h-fit">
                            {job.type}
                          </Badge>
                        </div>
                        
                        <p className="my-2 text-muted-foreground line-clamp-2">{job.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {job.tags && job.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="bg-accent text-secondary-foreground">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-4 text-sm">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>Posted {job.posted}</span>
                          </div>
                          {job.salary && (
                            <div className="flex items-center">
                              <Briefcase className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{job.salary}</span>
                            </div>
                          )}
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>Source: {job.source || (usingMockData ? 'Sample Data' : 'JSearch')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Pagination placeholder - would be implemented with real API */}
            {jobs.length > 0 && (
              <div className="flex justify-center mt-8">
                <Button variant="outline" className="mr-2">Previous</Button>
                <Button className="btn-gradient">Next</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Jobs;
