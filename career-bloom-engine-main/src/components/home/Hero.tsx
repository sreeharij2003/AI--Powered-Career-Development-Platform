import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative py-16 lg:py-24 overflow-hidden bg-gradient-to-b from-white via-gray-100/80 to-purple-100/40 dark:from-gray-900 dark:via-gray-950 dark:to-purple-950">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary-purple/10 via-white/0 to-secondary-purple/10 opacity-80 z-0" />
      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary-purple drop-shadow-[0_2px_16px_rgba(124,58,237,0.15)] animate-gradient-x">
                Find Your Dream Career with AI-Powered Precision
              </h1>
              <p className="max-w-[600px] md:text-xl font-medium text-gray-800 dark:text-violet-300">
                CareerBloom matches your skills and aspirations with the perfect opportunities. Discover jobs that truly align with your career goals.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="btn-gradient text-base px-8 py-6 shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-200" size="lg" asChild>
                <Link to="/profile/create">Create Your Profile</Link>
              </Button>
              <Button variant="outline" className="text-base px-8 py-6 shadow hover:scale-105 hover:shadow-xl transition-transform duration-200" size="lg" asChild>
                <Link to="/jobs">Browse Jobs</Link>
              </Button>
            </div>

            <div className="mt-6 bg-white/80 dark:bg-gray-900/60 backdrop-blur-lg rounded-2xl p-4 shadow-2xl max-w-2xl flex flex-col sm:flex-row gap-3 border border-gray-200 dark:border-gray-800">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-5 w-5 text-primary-purple" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent"
                />
              </div>
              <div className="relative flex-grow">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-3 h-5 w-5 text-primary-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Location or Remote"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent"
                />
              </div>
              <Button className="btn-gradient px-6 shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-200">Search</Button>
            </div>

            <div className="flex items-center pt-2">
              <p className="text-sm text-muted-foreground">Popular searches:</p>
              <div className="flex flex-wrap gap-2 ml-2">
                <Link to="/jobs?q=remote" className="text-xs px-3 py-1 rounded-full bg-primary-purple/10 text-primary-purple font-medium hover:bg-primary-purple/20 transition-colors">Remote</Link>
                <Link to="/jobs?q=engineering" className="text-xs px-3 py-1 rounded-full bg-primary-purple/10 text-primary-purple font-medium hover:bg-primary-purple/20 transition-colors">Engineering</Link>
                <Link to="/jobs?q=marketing" className="text-xs px-3 py-1 rounded-full bg-primary-purple/10 text-primary-purple font-medium hover:bg-primary-purple/20 transition-colors">Marketing</Link>
                <Link to="/jobs?q=design" className="text-xs px-3 py-1 rounded-full bg-primary-purple/10 text-primary-purple font-medium hover:bg-primary-purple/20 transition-colors">Design</Link>
              </div>
            </div>
          </div>

          <div className="lg:order-last flex items-center justify-center">
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full filter blur-3xl animate-pulse-light" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary-purple/20 rounded-full filter blur-3xl animate-pulse-light" />

              {/* Clean image container */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 backdrop-blur-lg bg-gradient-to-br from-white/80 via-purple-100/60 to-purple-200/40 dark:from-gray-900/80 dark:via-gray-950/60 dark:to-purple-950/40">
                <img
                    src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80"
                  alt="Diverse professionals collaborating on career growth"
                    className="relative mx-auto object-cover w-full sm:w-[550px] h-[400px] transition-transform duration-300 hover:scale-105"
                />


              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero;
