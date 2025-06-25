import { Button } from "@/components/ui/button";
import { FileText, PenLine, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-secondary overflow-hidden shadow-xl">
          <div className="px-8 py-16 md:p-16 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
                Ready to Bloom in Your Career?
              </h2>
              <p className="text-white/80 mb-8 text-lg">
                Access our powerful career tools to create winning applications and plan your career growth. Get started with our most popular features:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link 
                  to="/dashboard?tool=resume-builder" 
                  className="flex items-center p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <FileText className="h-6 w-6 text-white mr-3" />
                  <div>
                    <h3 className="text-white font-semibold">Resume Builder</h3>
                    <p className="text-white/70 text-sm">Create a standout resume</p>
                  </div>
                </Link>
                <Link 
                  to="/dashboard?tool=cover-letter" 
                  className="flex items-center p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <PenLine className="h-6 w-6 text-white mr-3" />
                  <div>
                    <h3 className="text-white font-semibold">Cover Letters</h3>
                    <p className="text-white/70 text-sm">Generate custom letters</p>
                  </div>
                </Link>
                <Link 
                  to="/dashboard?tool=career-path" 
                  className="flex items-center p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <TrendingUp className="h-6 w-6 text-white mr-3" />
                  <div>
                    <h3 className="text-white font-semibold">Career Path</h3>
                    <p className="text-white/70 text-sm">Plan your growth</p>
                  </div>
                </Link>
                <Link 
                  to="/dashboard?tool=skill-gap" 
                  className="flex items-center p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Sparkles className="h-6 w-6 text-white mr-3" />
                  <div>
                    <h3 className="text-white font-semibold">Skill Analysis</h3>
                    <p className="text-white/70 text-sm">Bridge your skill gaps</p>
                  </div>
                </Link>
              </div>
              <div className="mt-8">
                <Button className="bg-white text-primary hover:bg-white/90" size="lg" asChild>
                  <Link to="/signup">Get Started Free</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:flex justify-end">
              <img 
                src="https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1776&q=80" 
                alt="Career success" 
                className="rounded-xl shadow-lg max-w-[90%] transform rotate-3"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection;
