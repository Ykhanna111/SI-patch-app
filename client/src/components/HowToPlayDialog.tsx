import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HowToPlayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HowToPlayDialog({ open, onOpenChange }: HowToPlayDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900">How to Play Sudoku</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-gray-100"
              data-testid="button-close-dialog"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-gray-600">Master the classic number puzzle game</p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <span className="bg-sudoku-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">1</span>
                Basic Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="space-y-1 text-gray-700">
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
              <CardTitle className="flex items-center text-base">
                <span className="bg-sudoku-secondary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">2</span>
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="space-y-1 text-gray-700">
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
              <CardTitle className="flex items-center text-base">
                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">3</span>
                Solving Techniques
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="space-y-1 text-gray-700">
                <li>• <strong>Naked Singles:</strong> Only one number can fit in a cell</li>
                <li>• <strong>Hidden Singles:</strong> Only one cell can contain a specific number</li>
                <li>• <strong>Naked Pairs:</strong> Two cells in a group can only contain the same two numbers</li>
                <li>• <strong>Pointing Pairs:</strong> Numbers confined to one row/column within a box</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-base">
                <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">4</span>
                Game Features
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="space-y-1 text-gray-700">
                <li>• <strong>Hints:</strong> Get up to 2 hints per puzzle</li>
                <li>• <strong>Undo:</strong> Reverse your last move</li>
                <li>• <strong>Mistakes:</strong> You can make up to 3 mistakes</li>
                <li>• <strong>Timer:</strong> Track how long it takes to solve</li>
                <li>• <strong>Difficulty:</strong> Choose from Easy, Medium, Hard, or Expert</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Difficulty Levels</CardTitle>
            <CardDescription className="text-sm">Choose the right challenge for your skill level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-green-600 font-bold text-sm mb-1">Easy</div>
                <div className="text-xs text-gray-600">Perfect for beginners<br/>More numbers pre-filled</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-yellow-600 font-bold text-sm mb-1">Medium</div>
                <div className="text-xs text-gray-600">Balanced challenge<br/>Requires basic techniques</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-orange-600 font-bold text-sm mb-1">Hard</div>
                <div className="text-xs text-gray-600">For experienced players<br/>Advanced techniques needed</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-red-600 font-bold text-sm mb-1">Expert</div>
                <div className="text-xs text-gray-600">Ultimate challenge<br/>Complex solving required</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}