import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { SEOHead } from "@/_legacy/components/seo/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted via-background to-muted animate-gradient-shift">
      <SEOHead 
        title="404 - Page Not Found" 
        description="The page you're looking for doesn't exist."
        url="/404"
      />
      <div className="text-center space-y-6 animate-on-scroll max-w-md mx-auto px-4">
        <div className="animate-fade-in">
          <h1 className="mb-4 text-6xl md:text-8xl font-bold text-primary animate-scale-in">404</h1>
        </div>
        <div className="animate-fade-in stagger-1">
          <h2 className="mb-2 text-2xl md:text-3xl font-bold">Oops! Page not found</h2>
          <p className="mb-6 text-lg text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in stagger-2">
          <Button asChild className="group">
            <Link to="/">
              <Home className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
              Return to Home
            </Link>
          </Button>
          <Button variant="outline" asChild className="group" onClick={() => window.history.back()}>
            <Link to="#" onClick={(e) => { e.preventDefault(); window.history.back(); }}>
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
              Go Back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
