import {
    BadgeCheck,
    BookUser,
    BriefcaseIcon,
    Building,
    Network,
    Search,
    TrendingUp,
    Users
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: <BriefcaseIcon className="h-8 w-8 text-primary-purple" />,
    title: "Smart Job Matching",
    description: "Our AI-powered algorithm matches your skills and experience with relevant job opportunities."
  },
  {
    icon: <Search className="h-8 w-8 text-primary-purple" />,
    title: "Advanced Job Search",
    description: "Filter jobs by location, industry, experience level, and more to find the perfect fit."
  },
  {
    icon: <Building className="h-8 w-8 text-primary-purple" />,
    title: "Company Insights",
    description: "Get detailed information about companies, including culture, benefits, and employee reviews."
  },
  {
    icon: <Network className="h-8 w-8 text-primary-purple" />,
    title: "Professional Network",
    description: "Connect with professionals in your field and expand your career opportunities."
  },
  {
    icon: <BookUser className="h-8 w-8 text-primary-purple" />,
    title: "Resume Builder",
    description: "Create professional resumes tailored to your target roles with our AI-powered builder."
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-primary-purple" />,
    title: "Cover Letter Generator",
    description: "Generate customized cover letters that highlight your relevant experience and skills."
  },
  {
    icon: <BadgeCheck className="h-8 w-8 text-primary-purple" />,
    title: "Career Path Predictor",
    description: "Visualize and plan your career trajectory with AI-driven insights and recommendations."
  },
  {
    icon: <Users className="h-8 w-8 text-primary-purple" />,
    title: "Skill Gap Analysis",
    description: "Identify and bridge skill gaps to stay competitive in your desired career path."
  }
];

const Features = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Supercharge Your Job Search</h2>
          <p className="text-muted-foreground mt-4">
            CareerBloom combines cutting-edge technology with human-centered design to transform how you find and secure your next role.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link 
            to="/features" 
            className="text-primary-purple hover:underline inline-flex items-center"
          >
            Explore all features
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 ml-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Features;
