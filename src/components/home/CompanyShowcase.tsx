
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
  return (
    <section className="py-16 bg-white">
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
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {companies.map(company => (
            <Card key={company.id} className="card-hover overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white rounded-md overflow-hidden border p-2 flex items-center justify-center mb-4">
                  <img src={company.logo} alt={company.name} className="max-w-full max-h-full object-contain" />
                </div>
                <h3 className="font-semibold">{company.name}</h3>
                <p className="text-sm text-muted-foreground">{company.industry}</p>
                <p className="text-sm font-medium text-primary-purple mt-1">
                  {company.openPositions} open positions
                </p>
              </CardContent>
            </Card>
          ))}
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
