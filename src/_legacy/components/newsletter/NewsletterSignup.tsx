import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Check } from "lucide-react";

interface NewsletterSignupProps {
  source?: string;
  variant?: "default" | "inline" | "compact" | "card";
  showName?: boolean;
  className?: string;
}

export const NewsletterSignup = ({
  source = "website",
  variant = "default",
  showName = false,
  className = "",
}: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address (e.g., name@example.com).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({
        email: trimmedEmail,
        full_name: name.trim() || null,
        status: "subscribed",
        source,
      });

      // A duplicate email is treated exactly like a new one. Reporting
      // "already subscribed" would let anyone probe whether a given address
      // is on the list, so every outcome below looks identical to the caller.
      if (error) {
        if (error.code === "23505") {
          // Re-subscribe unconditionally; this is a no-op for an address that
          // is already active, and does not disclose which case applied.
          const { error: updateError } = await supabase
            .from("newsletter_subscribers")
            .update({ status: "subscribed" })
            .eq("email", trimmedEmail);

          if (updateError) throw updateError;
        } else {
          throw error;
        }
      }

      setSuccess(true);
      toast({
        title: "Successfully subscribed!",
        description: "Thank you for subscribing. Check your inbox for updates.",
      });
      setEmail("");
      setName("");
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (error: unknown) {
      console.error("Newsletter subscription error:", error);
      toast({
        title: "Subscription failed",
        // Don't surface the raw database error to the visitor.
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Compact variant for sidebar
  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading || success}
          className="w-full"
        />
        {showName && (
          <Input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading || success}
            className="w-full"
          />
        )}
        <Button type="submit" disabled={loading || success} className="w-full" size="sm">
          {success ? (
            <>
              <Check className="h-4 w-4 mr-2 animate-bounce-in" />
              Subscribed!
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2 group-hover:animate-pulse" />
              {loading ? "Subscribing..." : "Subscribe"}
            </>
          )}
        </Button>
      </form>
    );
  }

  // Inline variant
  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading || success}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || success}>
          {success ? (
            <>
              <Check className="h-4 w-4 mr-2 animate-bounce-in" />
              Subscribed!
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2 group-hover:animate-pulse" />
              {loading ? "Subscribing..." : "Subscribe"}
            </>
          )}
        </Button>
      </form>
    );
  }

  // Card variant
  if (variant === "card") {
    return (
      <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
        {showName && (
          <Input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading || success}
          />
        )}
        <Input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading || success}
        />
        <Button type="submit" disabled={loading || success} className="w-full">
          {success ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Subscribed!
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              {loading ? "Subscribing..." : "Subscribe to Newsletter"}
            </>
          )}
        </Button>
      </form>
    );
  }

  // Default variant
  return (
    <form onSubmit={handleSubmit} className={`space-y-4 max-w-md mx-auto ${className}`}>
      {showName && (
        <div>
          <Input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading || success}
          />
        </div>
      )}
      <div>
        <Input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading || success}
        />
      </div>
      <Button type="submit" disabled={loading || success} className="w-full">
        {success ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Subscribed!
          </>
        ) : (
          <>
            <Mail className="h-4 w-4 mr-2" />
            {loading ? "Subscribing..." : "Subscribe to Newsletter"}
          </>
        )}
      </Button>
    </form>
  );
};

