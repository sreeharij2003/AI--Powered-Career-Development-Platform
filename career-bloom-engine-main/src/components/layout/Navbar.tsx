import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useClerkAuthContext } from "@/contexts/ClerkAuthContext";
import { UserButton } from "@clerk/clerk-react";
import {
    Sparkles,
    User as UserIcon
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Navbar = () => {
  const { isAuthenticated, signOut } = useClerkAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  // Navigation items with icons
  const navItems = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/jobs", label: "Jobs", icon: "💼" },
    { path: "/companies", label: "Companies", icon: "🏢" },
    ...(isAuthenticated ? [{ path: "/dashboard", label: "Dashboard", icon: "📊" }] : [])
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          {/* Enhanced Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="hidden font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent sm:inline-block">
              CareerBloom
            </span>
          </Link>

          {/* Enhanced Navigation - Desktop */}
          <nav className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200 ease-in-out group
                  ${isActive(item.path)
                    ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-600 dark:text-purple-400'
                    : 'hover:bg-muted/50 hover:text-foreground'
                  }
                `}
              >
                <span className="text-base group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </span>
                <span>{item.label}</span>

                {/* Active indicator */}
                {isActive(item.path) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                )}

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <span className="text-xl">✕</span>
            ) : (
              <span className="text-xl">☰</span>
            )}
          </button>
        </div>
        {/* Enhanced Right Side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <NotificationCenter />
              <Link
                to="/profile"
                title="Profile"
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200 group"
              >
                <UserIcon className="w-5 h-5 group-hover:text-purple-600 transition-colors duration-200" />
              </Link>
              <div className="border-l border-border/50 pl-3">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 ring-2 ring-purple-500/20 hover:ring-purple-500/40 transition-all duration-200"
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hover:bg-muted/50 hover:text-foreground transition-all duration-200"
              >
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <div className="container py-4">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                    transition-all duration-200 ease-in-out
                    ${isActive(item.path)
                      ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-600 dark:text-purple-400'
                      : 'hover:bg-muted/50 hover:text-foreground'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}

              {!isAuthenticated && (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
