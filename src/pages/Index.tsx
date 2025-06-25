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
      <Features />
      <FeaturedJobs />
      <CompanyShowcase />
      <Testimonials />
      <CTASection />
    </MainLayout>
  );
};

export default Index;
