
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Sample testimonial data
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "UX Designer",
    company: "Adobe",
    avatar: "https://i.pravatar.cc/150?img=32",
    quote: "CareerBloom completely transformed my job search. The AI recommendations were spot-on and led me to my dream role at Adobe within just three weeks!"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Software Engineer",
    company: "Spotify",
    avatar: "https://i.pravatar.cc/150?img=11",
    quote: "I was skeptical about another job platform, but the personalized matches were incredibly accurate. CareerBloom helped me find a position that aligns perfectly with my skills and career goals."
  },
  {
    id: 3,
    name: "Jessica Rivera",
    role: "Marketing Manager",
    company: "HubSpot",
    avatar: "https://i.pravatar.cc/150?img=25",
    quote: "The company insights and interview preparation resources gave me a significant advantage in my job search. I felt confident and prepared at every step of the process."
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-accent">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Success Stories</h2>
          <p className="text-muted-foreground mt-4">
            Hear from professionals who found their perfect career match with CareerBloom
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="h-full card-hover">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 fill-primary-purple"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                        />
                      </svg>
                    ))}
                  </div>
                  <blockquote className="text-lg italic mb-6">
                    "{testimonial.quote}"
                  </blockquote>
                </div>
                
                <div className="flex items-center">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-6">
            Join thousands of professionals who've found their perfect career match
          </p>
          <div className="flex justify-center items-center gap-8 md:gap-16">
            <div className="text-center">
              <span className="block text-3xl font-bold text-primary-purple">50k+</span>
              <span className="text-sm text-muted-foreground">Job Matches</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-primary-purple">90%</span>
              <span className="text-sm text-muted-foreground">Success Rate</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-primary-purple">28</span>
              <span className="text-sm text-muted-foreground">Days Average</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials;
