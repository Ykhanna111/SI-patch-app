import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Clock, AlertTriangle, Lightbulb, Hash } from "lucide-react";

interface GameStatsProps {
  timeElapsed: number;
  mistakes: number;
  hintsUsed: number;
  numberCounts: number[];
  formatTime: (seconds: number) => string;
}

export default function GameStats({
  timeElapsed,
  mistakes,
  hintsUsed,
  numberCounts,
  formatTime,
}: GameStatsProps) {
  return (
    <>
      <Card className="border-gray-100">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg">
            <BarChart3 className="text-sudoku-accent mr-2 h-5 w-5" />
            Game Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timer */}
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="text-sudoku-primary h-4 w-4" />
              <span>Time</span>
            </div>
            <div className="text-lg font-mono font-bold text-gray-900" data-testid="text-timer">
              {formatTime(timeElapsed)}
            </div>
          </div>
          
          {/* Mistakes */}
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <AlertTriangle className="text-sudoku-error h-4 w-4" />
              <span>Mistakes</span>
            </div>
            <div className="flex space-x-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i <= mistakes ? 'bg-sudoku-error' : 'bg-gray-200'
                  }`}
                  data-testid={`mistake-indicator-${i}`}
                />
              ))}
            </div>
          </div>
          
          {/* Hints */}
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Lightbulb className="text-sudoku-accent h-4 w-4" />
              <span>Hints Left</span>
            </div>
            <div className="text-lg font-bold text-sudoku-accent" data-testid="text-hints-left">
              {2 - hintsUsed}
            </div>
          </div>
        </CardContent>
      </Card>

    </>
  );
}
