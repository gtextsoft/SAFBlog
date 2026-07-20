import { useEffect, useState } from "react";
import { useNavigate, Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, FileText, Users, LayoutDashboard, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AdminLayout = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        checkAdminStatus(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
        navigate("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      setUser(session.user);
      await checkAdminStatus(session.user.id);
    } else {
      navigate("/admin/login");
    }

    setLoading(false);
  };

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    setIsAdmin(!!data);

    if (!data) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/admin" className="flex items-center space-x-2">
              <img 
                src="/logos/saflogo.png" 
                alt="Stephen Akintayo Foundation Admin" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-semibold ml-2">Admin</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <Link to="/admin">
                <Button variant="ghost" size="sm">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/admin/posts">
                <Button variant="ghost" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Posts
                </Button>
              </Link>
              <Link to="/admin/subscribers">
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Subscribers
                </Button>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/" className="hidden md:block">
              <Button variant="outline" size="sm">
                View Site
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t bg-background p-4 space-y-2">
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/admin/posts" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Posts
              </Button>
            </Link>
            <Link to="/admin/subscribers" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Subscribers
              </Button>
            </Link>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">
                View Site
              </Button>
            </Link>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  );
};
