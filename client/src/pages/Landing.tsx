import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import { Gamepad2, Trophy, Clock, Target } from "lucide-react";

export default function Landing() {
  const handlePlayAsGuest = () => {
    window.location.href = '/game';
  };

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-sudoku-bg">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-sudoku-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 grid grid-cols-3 gap-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-3 h-3 bg-white rounded-sm" />
              ))}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Sudoku Master
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Challenge your mind with our beautiful Sudoku puzzles. Multiple difficulty levels, 
            progress tracking, and endless entertainment await!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handlePlayAsGuest}
              size="lg"
              className="bg-sudoku-secondary hover:bg-emerald-700 text-white px-8 py-4 text-lg font-semibold"
              data-testid="button-play-guest"
            >
              <Gamepad2 className="mr-2 h-5 w-5" />
              Play as Guest
            </Button>
            
            <Button 
              onClick={handleLogin}
              size="lg"
              variant="outline"
              className="border-sudoku-primary text-sudoku-primary hover:bg-sudoku-primary hover:text-white px-8 py-4 text-lg font-semibold"
              data-testid="button-login"
            >
              Login to Save Progress
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="border-gray-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-sudoku-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multiple Difficulties</h3>
              <p className="text-gray-600">From beginner-friendly to expert-level challenges</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-sudoku-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Time Tracking</h3>
              <p className="text-gray-600">Monitor your solving speed and improve over time</p>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-sudoku-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Saving</h3>
              <p className="text-gray-600">Login to save your progress and track your achievements</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
