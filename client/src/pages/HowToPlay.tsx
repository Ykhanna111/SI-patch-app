import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";

export default function HowToPlay() {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  
  // Determine back destination based on user status
  // If not logged in or not in game context, go to main dashboard
  // If logged in or playing as guest, go to game selection
  const isInGameContext = isAuthenticated || location.includes('guest') || location.includes('game');
  const backUrl = isInGameContext ? '/game' : '/';
  const backText = isInGameContext ? 'Back to Choose Your Challenge' : 'Back to Dashboard';
  
  return (
    <div className="min-h-screen bg-sudoku-bg">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link href={backUrl} className="inline-flex items-center text-sudoku-primary hover:text-indigo-700 transition-colors" data-testid="link-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backText}
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">How to Play Sudoku</h1>
          <p className="text-lg text-gray-600">Master the classic number puzzle game</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="bg-sudoku-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                Basic Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li>• Fill a 9x9 grid with numbers 1-9</li>
                <li>• Each row must contain all numbers 1-9</li>
                <li>• Each column must contain all numbers 1-9</li>
                <li>• Each 3x3 box must contain all numbers 1-9</li>
                <li>• No number can be repeated in any row, column, or box</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="bg-sudoku-secondary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li>• Look for cells with the fewest possibilities</li>
                <li>• Start with numbers that appear most frequently</li>
                <li>• Use the process of elimination</li>
                <li>• Focus on one row, column, or box at a time</li>
                <li>• Don't guess - use logic to deduce the answer</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                Solving Techniques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Naked Singles:</strong> Only one number can fit in a cell</li>
                <li>• <strong>Hidden Singles:</strong> Only one cell can contain a specific number</li>
                <li>• <strong>Naked Pairs:</strong> Two cells in a group can only contain the same two numbers</li>
                <li>• <strong>Pointing Pairs:</strong> Numbers confined to one row/column within a box</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
                Game Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Hints:</strong> Get up to 2 hints per puzzle</li>
                <li>• <strong>Undo:</strong> Reverse your last move</li>
                <li>• <strong>Mistakes:</strong> You can make up to 3 mistakes</li>
                <li>• <strong>Timer:</strong> Track how long it takes to solve</li>
                <li>• <strong>Difficulty:</strong> Choose from Easy, Medium, Hard, or Expert</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Difficulty Levels</CardTitle>
            <CardDescription>Choose the right challenge for your skill level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-green-600 font-bold text-lg mb-2">Easy</div>
                <div className="text-sm text-gray-600">Perfect for beginners<br/>More numbers pre-filled</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-yellow-600 font-bold text-lg mb-2">Medium</div>
                <div className="text-sm text-gray-600">Balanced challenge<br/>Requires basic techniques</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-orange-600 font-bold text-lg mb-2">Hard</div>
                <div className="text-sm text-gray-600">For experienced players<br/>Advanced techniques needed</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-red-600 font-bold text-lg mb-2">Expert</div>
                <div className="text-sm text-gray-600">Ultimate challenge<br/>Complex solving required</div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}