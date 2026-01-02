import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Gamepad2, Trophy, Clock, Target } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {

  return (
    <div className="min-h-screen bg-sudoku-bg">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{
            background: 'linear-gradient(135deg, hsl(35 100% 60%), hsl(50 100% 65%), hsl(320 85% 65%))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Welcome to Sudoku Infinium
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Challenge your mind with our beautiful Sudoku puzzles. Multiple difficulty levels, 
            progress tracking, and endless entertainment await!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="/login">
              <Button size="lg" className="w-full" data-testid="button-login">
                Login to Play
              </Button>
            </Link>
            
            <Link href="/select-game">
              <Button variant="outline" size="lg" className="w-full" data-testid="button-guest">
                Play as Guest
              </Button>
            </Link>
            
            <Link href="/register">
              <Button variant="secondary" size="lg" className="w-full" data-testid="button-register">
                Create Account
              </Button>
            </Link>
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
      <Footer />
    </div>
  );
}
