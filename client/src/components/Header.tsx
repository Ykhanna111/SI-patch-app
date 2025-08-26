import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, User, HelpCircle } from "lucide-react";
import type { User as UserType } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import HowToPlayDialog from "./HowToPlayDialog";
import logoImage from "@assets/ChatGPT Image Aug 26, 2025, 08_08_54 PM-Photoroom_1756219770081.png";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showHowToPlayDialog, setShowHowToPlayDialog] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/logout', {});
      return response;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Logged out",
        description: "You've been logged out successfully.",
      });
      setLocation('/');
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "There was an error logging you out.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = () => {
    setLocation('/login');
  };

  const handlePlayAsGuest = () => {
    setLocation('/select-game');
  };

  const handleHowToPlay = () => {
    // Show popup if user is in game (/, /guest, /game routes when game is active)
    const isInGame = location === '/' && isAuthenticated || location === '/guest' || location === '/game';
    
    if (isInGame) {
      setShowHowToPlayDialog(true);
    } else {
      setLocation('/how-to-play');
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img 
                src={logoImage} 
                alt="Sudoku Infinity Logo" 
                className="w-16 h-16 object-contain"
              />
              <h1 className="text-xl font-bold" style={{
                background: 'linear-gradient(135deg, hsl(35 100% 60%), hsl(50 100% 65%), hsl(320 85% 65%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Sudoku Infinium</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHowToPlay}
              className="text-gray-600 hover:text-gray-800"
              data-testid="button-how-to-play"
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              How to Play
            </Button>

            {isAuthenticated && user ? (
              <>
                <div className="hidden sm:flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <User className="h-4 w-4" />
                    <span data-testid="text-username">
                      {(user as UserType)?.firstName ? `${(user as UserType).firstName} ${(user as UserType).lastName || ''}`.trim() : (user as UserType)?.username}
                    </span>
                  </div>
                </div>
                
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-gray-400 hover:text-gray-600"
                    data-testid="button-settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-800"
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayAsGuest}
                  className="text-gray-600 hover:text-gray-800"
                  data-testid="button-play-guest"
                >
                  <User className="h-4 w-4 mr-1" />
                  Play as Guest
                </Button>
                
                <Button
                  onClick={handleLogin}
                  className="bg-sudoku-primary text-white hover:bg-indigo-700"
                  size="sm"
                  data-testid="button-login"
                >
                  <i className="fas fa-sign-in-alt mr-1"></i>
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <HowToPlayDialog 
        open={showHowToPlayDialog} 
        onOpenChange={setShowHowToPlayDialog} 
      />
    </header>
  );
}
