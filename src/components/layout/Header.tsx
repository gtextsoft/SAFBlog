import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all duration-300 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <img
            src="/logos/saflogo.png"
            alt="Stephen Akintayo Foundation"
            className="h-10 w-auto transition-transform duration-300 group-hover:scale-110"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium transition-all duration-300 hover:text-primary relative group">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link to="/about" className="text-sm font-medium transition-all duration-300 hover:text-primary relative group">
            About
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link to="/blog" className="text-sm font-medium transition-all duration-300 hover:text-primary relative group">
            Blog
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link to="/newsletter" className="text-sm font-medium transition-all duration-300 hover:text-primary relative group">
            Newsletter
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link to="/admin">
            <Button variant="outline" size="sm">
              Admin
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden transition-transform duration-300 hover:scale-110 active:scale-95"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 animate-in fade-in duration-200" />
          ) : (
            <Menu className="h-6 w-6 animate-in fade-in duration-200" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t bg-background p-4 space-y-3 animate-in slide-in-from-top duration-300">
          <Link
            to="/"
            className="block py-2 text-sm font-medium transition-all duration-300 hover:text-primary hover:translate-x-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/about"
            className="block py-2 text-sm font-medium transition-all duration-300 hover:text-primary hover:translate-x-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link
            to="/blog"
            className="block py-2 text-sm font-medium transition-all duration-300 hover:text-primary hover:translate-x-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Blog
          </Link>
          <Link
            to="/newsletter"
            className="block py-2 text-sm font-medium transition-all duration-300 hover:text-primary hover:translate-x-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Newsletter
          </Link>
          <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="outline" size="sm" className="w-full">
              Admin
            </Button>
          </Link>
        </nav>
      )}
    </header>
  );
};
