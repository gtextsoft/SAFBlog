import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Check, X, ArrowLeft } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";
import { useScrollVisibility } from "@/hooks/use-scroll-animation";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  useScrollVisibility();

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Find subscriber by email
      const { data: subscriber, error: fetchError } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .single();

      if (fetchError || !subscriber) {
        setError("Email not found in our newsletter list.");
        setLoading(false);
        return;
      }

      if (subscriber.status === "unsubscribed") {
        setError("This email is already unsubscribed.");
        setLoading(false);
        return;
      }

      // Update status to unsubscribed
      const { error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({
          status: "unsubscribed",
          unsubscribed_at: new Date().toISOString(),
        })
        .eq("email", email.trim().toLowerCase());

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      toast({
        title: "Successfully unsubscribed",
        description: "You have been removed from our newsletter list.",
      });
    } catch (err) {
      console.error("Unsubscribe error:", err);
      setError("Something went wrong. Please try again later.");
      toast({
        title: "Unsubscribe failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Unsubscribe from Newsletter"
        description="Unsubscribe from the Stephen Akintayo Foundation newsletter"
        url="/unsubscribe"
      />
      <Header />

      <main className="flex-1">
        <section className="py-16 md:py-20">
          <div className="container">
            <div className="max-w-md mx-auto">
              <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 group transition-all duration-300 animate-on-scroll">
                <ArrowLeft className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                Back to Home
              </Link>

              <div className="bg-card border rounded-lg p-8 shadow-lg animate-on-scroll hover-lift transition-all duration-300">
                <div className="text-center mb-6 animate-fade-in">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4 transition-all duration-300 group-hover:scale-110">
                    <Mail className="h-8 w-8 text-muted-foreground animate-float" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2">Unsubscribe from Newsletter</h1>
                  <p className="text-muted-foreground">
                    We're sorry to see you go. Enter your email address to unsubscribe.
                  </p>
                </div>

                {success ? (
                  <div className="text-center space-y-4 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4 animate-scale-in">
                      <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Successfully Unsubscribed</h2>
                    <p className="text-muted-foreground">
                      You have been removed from our newsletter list. You will no longer receive emails from us.
                    </p>
                    <div className="pt-4">
                      <Link to="/">
                        <Button className="group">
                          Return to Homepage
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUnsubscribe} className="space-y-4 animate-fade-in stagger-1">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        required
                        disabled={loading}
                        className={error ? "border-destructive" : ""}
                      />
                      {error && (
                        <p className="text-sm text-destructive mt-2 flex items-center gap-1 animate-fade-in">
                          <X className="h-4 w-4" />
                          {error}
                        </p>
                      )}
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Unsubscribing..." : "Unsubscribe"}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      If you change your mind, you can always{" "}
                      <Link to="/newsletter" className="text-primary hover:underline transition-colors duration-300">
                        subscribe again
                      </Link>
                      .
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Unsubscribe;

