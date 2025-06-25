
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Building, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchFeaturedJobs } from "@/services/jobsService";
import type { JobListing } from "@/types/jobs";

const FeaturedJobs = () => {
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['featuredJobs'],
    queryFn: fetchFeaturedJobs,
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
  });

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Jobs</h2>
            <p className="text-muted-foreground mt-2">Curated opportunities that match top talent</p>
          </div>
          <Link to="/jobs" className="text-primary-purple hover:underline mt-4 md:mt-0">
            View all jobs →
          </Link>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">Loading featured jobs...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">
            Error loading featured jobs. Please try again later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {jobs.map((job: JobListing) => (
              <Card key={job.id} className="card-hover overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-white rounded-md overflow-hidden border p-1 flex items-center justify-center">
                      <img src={job.logo || "/placeholder.svg"} alt={job.company} className="max-w-full max-h-full object-contain" />
                    </div>
                    <Badge variant={job.type === "Full-time" ? "default" : "outline"}>{job.type}</Badge>
                  </div>
                  <CardTitle className="mt-4 text-xl">
                    <a 
                      href={job.applicationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary-purple transition-colors"
                    >
                      {job.title}
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Posted {job.posted}</span>
                    </div>
                    <p className="line-clamp-2 text-muted-foreground mt-2">{job.description}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex flex-wrap gap-2">
                    {job.tags && job.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-accent text-secondary-foreground">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default FeaturedJobs;
