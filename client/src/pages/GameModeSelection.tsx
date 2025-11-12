import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import Header from '@/components/Header';

import { GameMode, Difficulty, GAME_MODES } from '@shared/gameTypes';

export default function GameModeSelection() {
  const [, setLocation] = useLocation();
  const [showHowToPlay, setShowHowToPlay] = useState<GameMode | null>(null);
  
  console.log('GameModeSelection component loaded'); // Debug log
  
  const handleModeSelect = (gameMode: GameMode) => {
    console.log('Selected game mode:', gameMode); // Debug log
    // Store selected game mode in sessionStorage for Game.tsx to use
    sessionStorage.setItem('selectedGameMode', gameMode);
    // Navigate to the challenge selection in Game.tsx
    setLocation('/game');
  };

  const HowToPlayDialog = ({ mode }: { mode: GameMode }) => {
    if (!mode || !GAME_MODES[mode]) return null;
    
    return (
      <Dialog open={showHowToPlay === mode} onOpenChange={() => setShowHowToPlay(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{GAME_MODES[mode].icon}</span>
              How to Play {GAME_MODES[mode].name}
            </DialogTitle>
            <DialogDescription>
              {GAME_MODES[mode].description}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Rules</h4>
                <ul className="space-y-1">
                  {GAME_MODES[mode].rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-sudoku-primary">•</span>
                      <span className="text-sm">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Grid Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Grid Size:</span>
                    <span className="ml-2">{GAME_MODES[mode].gridSize}×{GAME_MODES[mode].gridSize}</span>
                  </div>
                  <div>
                    <span className="font-medium">Available Difficulties:</span>
                    <div className="ml-2 flex gap-1 mt-1">
                      {GAME_MODES[mode].difficulty.map((diff) => (
                        <Badge key={diff} variant="outline" className="text-xs">
                          {diff}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-sudoku-bg">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Sudoku Adventure</h1>
            <p className="text-lg text-gray-600">Select a game mode to start playing</p>
          </div>

          {/* Game Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Standard Sudoku */}
            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 border-gray-200 hover:border-sudoku-primary"
              onClick={() => handleModeSelect('standard')}
              data-testid="mode-standard"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{GAME_MODES.standard.icon}</span>
                    <span>{GAME_MODES.standard.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHowToPlay('standard');
                    }}
                    data-testid="how-to-play-standard"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{GAME_MODES.standard.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="outline" className="text-sm">
                    {GAME_MODES.standard.gridSize}×{GAME_MODES.standard.gridSize} Grid
                  </Badge>
                  <div className="flex gap-1">
                    {GAME_MODES.standard.difficulty.map((diff) => (
                      <Badge key={diff} variant="secondary" className="text-xs">
                        {diff}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button 
                  className="w-full bg-sudoku-primary hover:bg-sudoku-primary/90 text-white py-3 text-lg font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleModeSelect('standard');
                  }}
                >
                  Play Standard Sudoku
                </Button>
              </CardContent>
            </Card>

            {/* Diagonal Sudoku */}
            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 border-gray-200 hover:border-sudoku-primary"
              onClick={() => handleModeSelect('diagonal')}
              data-testid="mode-diagonal"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{GAME_MODES.diagonal.icon}</span>
                    <span>{GAME_MODES.diagonal.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHowToPlay('diagonal');
                    }}
                    data-testid="how-to-play-diagonal"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{GAME_MODES.diagonal.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="outline" className="text-sm">
                    {GAME_MODES.diagonal.gridSize}×{GAME_MODES.diagonal.gridSize} Grid
                  </Badge>
                  <div className="flex gap-1">
                    {GAME_MODES.diagonal.difficulty.map((diff) => (
                      <Badge key={diff} variant="secondary" className="text-xs">
                        {diff}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button 
                  className="w-full bg-sudoku-primary hover:bg-sudoku-primary/90 text-white py-3 text-lg font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleModeSelect('diagonal');
                  }}
                >
                  Play Diagonal Sudoku
                </Button>
              </CardContent>
            </Card>

            {/* Hyper Sudoku (Windoku) */}
            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 border-gray-200 hover:border-sudoku-primary"
              onClick={() => handleModeSelect('hyper')}
              data-testid="mode-hyper"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{GAME_MODES.hyper.icon}</span>
                    <span>{GAME_MODES.hyper.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHowToPlay('hyper');
                    }}
                    data-testid="how-to-play-hyper"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{GAME_MODES.hyper.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="outline" className="text-sm">
                    {GAME_MODES.hyper.gridSize}×{GAME_MODES.hyper.gridSize} Grid
                  </Badge>
                  <div className="flex gap-1">
                    {GAME_MODES.hyper.difficulty.map((diff) => (
                      <Badge key={diff} variant="secondary" className="text-xs">
                        {diff}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button 
                  className="w-full bg-sudoku-primary hover:bg-sudoku-primary/90 text-white py-3 text-lg font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleModeSelect('hyper');
                  }}
                >
                  Play Hyper Sudoku
                </Button>
              </CardContent>
            </Card>

            {/* Odd-Even Sudoku */}
            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 border-gray-200 hover:border-sudoku-primary"
              onClick={() => handleModeSelect('odd-even')}
              data-testid="mode-odd-even"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{GAME_MODES['odd-even'].icon}</span>
                    <span>{GAME_MODES['odd-even'].name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHowToPlay('odd-even');
                    }}
                    data-testid="how-to-play-odd-even"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{GAME_MODES['odd-even'].description}</p>
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="outline" className="text-sm">
                    {GAME_MODES['odd-even'].gridSize}×{GAME_MODES['odd-even'].gridSize} Grid
                  </Badge>
                  <div className="flex gap-1">
                    {GAME_MODES['odd-even'].difficulty.map((diff) => (
                      <Badge key={diff} variant="secondary" className="text-xs">
                        {diff}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button 
                  className="w-full bg-sudoku-primary hover:bg-sudoku-primary/90 text-white py-3 text-lg font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleModeSelect('odd-even');
                  }}
                >
                  Play Odd-Even Sudoku
                </Button>
              </CardContent>
            </Card>

            {/* Killer Sudoku */}
            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 border-gray-200 hover:border-sudoku-primary"
              onClick={() => handleModeSelect('killer')}
              data-testid="mode-killer"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{GAME_MODES.killer.icon}</span>
                    <span>{GAME_MODES.killer.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHowToPlay('killer');
                    }}
                    data-testid="how-to-play-killer"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{GAME_MODES.killer.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="outline" className="text-sm">
                    {GAME_MODES.killer.gridSize}×{GAME_MODES.killer.gridSize} Grid
                  </Badge>
                  <div className="flex gap-1">
                    {GAME_MODES.killer.difficulty.map((diff) => (
                      <Badge key={diff} variant="secondary" className="text-xs">
                        {diff}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button 
                  className="w-full bg-sudoku-primary hover:bg-sudoku-primary/90 text-white py-3 text-lg font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleModeSelect('killer');
                  }}
                >
                  Play Killer Sudoku
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* How to Play Dialogs */}
          <HowToPlayDialog mode="standard" />
          <HowToPlayDialog mode="diagonal" />
          <HowToPlayDialog mode="hyper" />
          <HowToPlayDialog mode="odd-even" />
          <HowToPlayDialog mode="killer" />
        </div>
      </div>
    </div>
  );
}