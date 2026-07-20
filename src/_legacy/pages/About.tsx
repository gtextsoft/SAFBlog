import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Target, Eye, Heart } from "lucide-react";
import { useScrollVisibility } from "@/hooks/use-scroll-animation";
import { SEOHead } from "@/components/seo/SEOHead";
import { OrganizationStructuredData } from "@/components/seo/StructuredData";

const About = () => {
  useScrollVisibility();

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead 
        title="About Us" 
        description="Learn about the Stephen Akintayo Foundation - our mission, vision, values, and programs dedicated to empowering communities through education and sustainable development."
        url="/about"
      />
      <OrganizationStructuredData />
      <Header />

      <main className="flex-1">
        {/* Hero Section - Blended with website */}
        <section className="relative overflow-hidden">
          {/* Subtle gradient background with overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent animate-gradient-shift"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          
          <div className="container relative z-10 py-16 md:py-20">
            <div className="max-w-3xl mx-auto text-center space-y-6 animate-on-scroll">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground animate-fade-in">About SAF</h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in stagger-1">
                Building a better tomorrow through education, empowerment, and sustainable development
              </p>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-4 animate-on-scroll hover-lift transition-all duration-300 p-6 rounded-lg group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <Target className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-2xl font-bold transition-colors duration-300 group-hover:text-primary">Our Mission</h3>
                <p className="text-muted-foreground">
                  To empower underserved communities through quality education, sustainable development programs, and capacity-building initiatives that create lasting positive change.
                </p>
              </div>

              <div className="text-center space-y-4 animate-on-scroll hover-lift transition-all duration-300 p-6 rounded-lg group stagger-1">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/20">
                  <Eye className="h-8 w-8 text-accent transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-2xl font-bold transition-colors duration-300 group-hover:text-accent">Our Vision</h3>
                <p className="text-muted-foreground">
                  A world where every individual has access to the resources, education, and opportunities needed to reach their full potential and contribute meaningfully to society.
                </p>
              </div>

              <div className="text-center space-y-4 animate-on-scroll hover-lift transition-all duration-300 p-6 rounded-lg group stagger-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-secondary/20">
                  <Heart className="h-8 w-8 text-secondary transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-2xl font-bold transition-colors duration-300 group-hover:text-secondary">Our Values</h3>
                <p className="text-muted-foreground">
                  Integrity, excellence, compassion, sustainability, and community-driven impact guide every decision we make and every program we implement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-4xl mx-auto space-y-6 animate-on-scroll">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 animate-fade-in">Our Story</h2>
              
              <div className="prose prose-lg max-w-none space-y-4">
                <p className="text-muted-foreground animate-fade-in stagger-1">
                  The Stephen Akintayo Foundation (SAF) was founded with a simple yet powerful belief: that every person deserves the opportunity to build a better life for themselves and their community.
                </p>

                <p className="text-muted-foreground animate-fade-in stagger-2">
                  Founded by visionary leader Stephen Akintayo, SAF has grown from a small community initiative into a comprehensive development organization serving thousands across multiple communities. Our work spans education, youth empowerment, sustainable development, and community capacity building.
                </p>

                <p className="text-muted-foreground animate-fade-in stagger-3">
                  Over the years, we've witnessed incredible transformations - from young people gaining access to quality education for the first time, to communities developing sustainable income sources, to leaders emerging who are now creating change in their own right.
                </p>

                <p className="text-muted-foreground animate-fade-in stagger-4">
                  Today, SAF continues to innovate and expand its impact, always staying true to our core mission of empowering individuals and communities to create lasting positive change. We believe that by investing in people and communities today, we're building a stronger, more equitable tomorrow for all.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Programs Overview */}
        <section className="py-16">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 animate-on-scroll">Our Programs</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="space-y-3 p-6 rounded-lg border bg-card animate-on-scroll hover-lift transition-all duration-300 group hover:shadow-lg hover:border-primary/50">
                <h3 className="text-xl font-bold transition-colors duration-300 group-hover:text-primary">Education & Scholarship</h3>
                <p className="text-muted-foreground">
                  Providing access to quality education through scholarships, school supplies, and educational infrastructure support for underserved communities.
                </p>
              </div>

              <div className="space-y-3 p-6 rounded-lg border bg-card animate-on-scroll hover-lift transition-all duration-300 group hover:shadow-lg hover:border-primary/50 stagger-1">
                <h3 className="text-xl font-bold transition-colors duration-300 group-hover:text-primary">Youth Empowerment</h3>
                <p className="text-muted-foreground">
                  Equipping young people with skills, mentorship, and resources to become leaders and change-makers in their communities.
                </p>
              </div>

              <div className="space-y-3 p-6 rounded-lg border bg-card animate-on-scroll hover-lift transition-all duration-300 group hover:shadow-lg hover:border-primary/50 stagger-2">
                <h3 className="text-xl font-bold transition-colors duration-300 group-hover:text-primary">Community Development</h3>
                <p className="text-muted-foreground">
                  Supporting sustainable community projects that improve infrastructure, create economic opportunities, and enhance quality of life.
                </p>
              </div>

              <div className="space-y-3 p-6 rounded-lg border bg-card animate-on-scroll hover-lift transition-all duration-300 group hover:shadow-lg hover:border-primary/50 stagger-3">
                <h3 className="text-xl font-bold transition-colors duration-300 group-hover:text-primary">Capacity Building</h3>
                <p className="text-muted-foreground">
                  Training programs and workshops that develop leadership, entrepreneurship, and professional skills for community members.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
