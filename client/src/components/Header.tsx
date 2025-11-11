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
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-shrink">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <img 
                src={logoImage} 
                alt="Sudoku Infinity Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 object-contain flex-shrink-0"
              />
              <h1 className="text-sm sm:text-base lg:text-xl font-bold truncate" style={{
                background: 'linear-gradient(135deg, hsl(35 100% 60%), hsl(50 100% 65%), hsl(320 85% 65%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Sudoku Infinium</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHowToPlay}
              className="text-gray-600 hover:text-gray-800 px-1 sm:px-2 lg:px-3 hidden sm:flex"
              data-testid="button-how-to-play"
            >
              <HelpCircle className="h-4 w-4 sm:mr-1" />
              <span className="hidden lg:inline">How to Play</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHowToPlay}
              className="text-gray-600 hover:text-gray-800 p-1 sm:hidden"
              data-testid="button-how-to-play-mobile"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>

            {isAuthenticated && user ? (
              <>
                <div className="hidden lg:flex items-center space-x-2 text-sm">
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
                    className="p-1 sm:p-2 text-gray-400 hover:text-gray-600"
                    data-testid="button-settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-800 px-1 sm:px-2 lg:px-3 hidden sm:flex"
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4 sm:mr-1" />
                  <span className="hidden lg:inline">Logout</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-800 p-1 sm:hidden"
                  data-testid="button-logout-mobile"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayAsGuest}
                  className="text-gray-600 hover:text-gray-800 px-1 sm:px-2 text-xs sm:text-sm"
                  data-testid="button-play-guest"
                >
                  <User className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Play as Guest</span>
                </Button>
                
                <Button
                  onClick={handleLogin}
                  className="bg-sudoku-primary text-white hover:bg-indigo-700 px-2 sm:px-3 text-xs sm:text-sm"
                  size="sm"
                  data-testid="button-login"
                >
                  <i className="fas fa-sign-in-alt sm:mr-1"></i>
                  <span className="hidden sm:inline">Login</span>
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
