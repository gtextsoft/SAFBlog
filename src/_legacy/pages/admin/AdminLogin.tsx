import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        // Check if user is admin
        const { data: adminCheck } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id)
          .eq("role", "admin")
          .single();

        if (!adminCheck) {
          // User logged in but not admin - sign them out and show deterrent message
          await supabase.auth.signOut();
          setErrorMessage("Fuck you");
          setEmail("");
          setPassword("");
          toast({
            title: "Access Denied",
            description: "Fuck you",
            variant: "destructive",
            duration: 5000,
          });
          setLoading(false);
          return;
        }

        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate("/admin");
      }
    } catch (error: any) {
      // Show deterrent message for unauthorized access attempts
      setErrorMessage("Fuck you");
      setEmail("");
      setPassword("");
      toast({
        title: "Access Denied",
        description: "Fuck you",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <img 
              src="/logos/saflogo.png" 
              alt="Stephen Akintayo Foundation" 
              className="h-16 w-auto"
            />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@safoundation.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {errorMessage && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
                <p className="text-destructive font-bold text-center text-lg">
                  {errorMessage}
                </p>
                <p className="text-destructive/80 text-center text-sm mt-2">
                  Unauthorized access attempts are not tolerated.
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
