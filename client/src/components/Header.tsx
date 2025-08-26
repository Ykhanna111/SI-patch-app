import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, User } from "lucide-react";
import type { User as UserType } from "@shared/schema";

export default function Header() {
  const { user, isAuthenticated } = useAuth();

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-sudoku-primary to-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-th text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Sudoku Master</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isAuthenticated && user ? (
              <>
                <div className="hidden sm:flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <User className="h-4 w-4" />
                    <span data-testid="text-username">
                      {(user as UserType)?.firstName ? `${(user as UserType).firstName} ${(user as UserType).lastName || ''}`.trim() : (user as UserType)?.email}
                    </span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-gray-400 hover:text-gray-600"
                  data-testid="button-settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                
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
                <div className="hidden sm:flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <User className="h-4 w-4" />
                    <span data-testid="text-guest">Guest</span>
                  </div>
                </div>
                
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
    </header>
  );
}
