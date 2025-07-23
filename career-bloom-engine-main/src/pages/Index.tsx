import CompanyShowcase from "@/components/home/CompanyShowcase";
import CTASection from "@/components/home/CTASection";
import FeaturedJobs from "@/components/home/FeaturedJobs";
import Features from "@/components/home/Features";
import Hero from "@/components/home/Hero";
import Testimonials from "@/components/home/Testimonials";
import MainLayout from "@/components/layout/MainLayout";

const Index = () => {
  return (
    <MainLayout>
      <Hero />
      <div className="bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-purple-950 transition-colors duration-500">
      <Features />
      <FeaturedJobs />
      <CompanyShowcase />
      <Testimonials />
      <CTASection />
      </div>
    </MainLayout>
  );
};

export default Index;
