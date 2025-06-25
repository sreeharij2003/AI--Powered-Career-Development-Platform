
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="py-16 lg:py-24 overflow-hidden bg-gradient-to-b from-white to-accent/20">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary-purple">
                Find Your Dream Career with AI-Powered Precision
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                CareerBloom matches your skills and aspirations with the perfect opportunities. Discover jobs that truly align with your career goals.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="btn-gradient text-base px-8 py-6" size="lg" asChild>
                <Link to="/profile/create">Create Your Profile</Link>
              </Button>
              <Button variant="outline" className="text-base px-8 py-6" size="lg" asChild>
                <Link to="/jobs">Browse Jobs</Link>
              </Button>
            </div>
            
            <div className="mt-6 bg-white rounded-xl p-4 shadow-lg max-w-2xl flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Job title, keywords, or company" 
                  className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="relative flex-grow">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Location or Remote" 
                  className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <Button className="btn-gradient px-6">Search</Button>
            </div>
            
            <div className="flex items-center pt-2">
              <p className="text-sm text-muted-foreground">Popular searches:</p>
              <div className="flex flex-wrap gap-2 ml-2">
                <Link to="/jobs?q=remote" className="text-sm text-primary-purple hover:underline">Remote</Link>
                <Link to="/jobs?q=engineering" className="text-sm text-primary-purple hover:underline">Engineering</Link>
                <Link to="/jobs?q=marketing" className="text-sm text-primary-purple hover:underline">Marketing</Link>
                <Link to="/jobs?q=design" className="text-sm text-primary-purple hover:underline">Design</Link>
              </div>
            </div>
          </div>
          
          <div className="lg:order-last flex items-center justify-center">
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full filter blur-3xl animate-pulse-light" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary-purple/20 rounded-full filter blur-3xl animate-pulse-light" />
              <img 
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="People working together" 
                className="relative mx-auto rounded-2xl shadow-lg object-cover w-full sm:w-[550px] h-[400px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero;
