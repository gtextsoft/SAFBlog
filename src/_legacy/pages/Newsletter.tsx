import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { Mail, Bell, Zap } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";
import { OrganizationStructuredData } from "@/components/seo/StructuredData";
import { useScrollVisibility } from "@/hooks/use-scroll-animation";

const Newsletter = () => {
  useScrollVisibility();

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Join Our Newsletter"
        description="Stay updated with our latest programs, impact stories, and community initiatives"
        url="/newsletter"
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
            <div className="max-w-2xl mx-auto text-center space-y-6 animate-on-scroll">
              <Mail className="h-16 w-16 mx-auto mb-4 text-primary animate-float" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground animate-fade-in stagger-1">Join Our Newsletter</h1>
              <p className="text-lg md:text-xl text-muted-foreground animate-fade-in stagger-2">
                Stay updated with our latest programs, impact stories, and community initiatives
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12 animate-on-scroll">Why Subscribe?</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="text-center space-y-3 animate-on-scroll hover-lift p-6 rounded-lg transition-all duration-300">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2 transition-all duration-300 hover:scale-110 hover:bg-primary/20">
                    <Bell className="h-7 w-7 text-primary animate-pulse-slow" />
                  </div>
                  <h3 className="text-xl font-semibold">Stay Informed</h3>
                  <p className="text-muted-foreground">
                    Be the first to know about new programs, events, and opportunities to get involved
                  </p>
                </div>

                <div className="text-center space-y-3 animate-on-scroll hover-lift p-6 rounded-lg transition-all duration-300 stagger-1">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-2 transition-all duration-300 hover:scale-110 hover:bg-accent/20">
                    <Zap className="h-7 w-7 text-accent animate-pulse-slow" />
                  </div>
                  <h3 className="text-xl font-semibold">Impact Stories</h3>
                  <p className="text-muted-foreground">
                    Read inspiring stories of transformation and community impact delivered to your inbox
                  </p>
                </div>

                <div className="text-center space-y-3 animate-on-scroll hover-lift p-6 rounded-lg transition-all duration-300 stagger-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary/10 mb-2 transition-all duration-300 hover:scale-110 hover:bg-secondary/20">
                    <Mail className="h-7 w-7 text-secondary animate-pulse-slow" />
                  </div>
                  <h3 className="text-xl font-semibold">Exclusive Content</h3>
                  <p className="text-muted-foreground">
                    Get access to exclusive insights, reports, and behind-the-scenes content from our team
                  </p>
                </div>
              </div>

              {/* Newsletter Form */}
              <div className="max-w-md mx-auto">
                <div className="p-8 rounded-lg border bg-card shadow-lg">
                  <h3 className="text-2xl font-bold text-center mb-6">Subscribe Now</h3>
                  <NewsletterSignup source="newsletter_page" variant="card" showName={true} />
                </div>
              </div>

              {/* Privacy Note */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                We respect your privacy. Unsubscribe at any time. We'll never share your information.
              </p>
            </div>
          </div>
        </section>

        {/* What to Expect */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">What to Expect</h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Monthly Updates</h3>
                    <p className="text-muted-foreground">
                      Receive a comprehensive monthly newsletter with program highlights, upcoming events, and impact metrics
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Impact Stories</h3>
                    <p className="text-muted-foreground">
                      Read real stories from community members whose lives have been transformed through our programs
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Ways to Get Involved</h3>
                    <p className="text-muted-foreground">
                      Discover volunteer opportunities, donation campaigns, and other ways you can contribute to our mission
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Special Announcements</h3>
                    <p className="text-muted-foreground">
                      Be notified about special events, partnership opportunities, and important foundation updates
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Newsletter;
