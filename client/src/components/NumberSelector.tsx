import { cn } from "@/lib/utils";
import { Eraser } from "lucide-react";

interface NumberSelectorProps {
  selectedNumber: number | null;
  onNumberSelect: (number: number) => void;
  onErase: () => void;
  disabled: boolean;
  numberCounts: number[];
}

export default function NumberSelector({
  selectedNumber,
  onNumberSelect,
  onErase,
  disabled,
  numberCounts,
}: NumberSelectorProps) {
  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-5 gap-3 sm:flex sm:space-x-3 sm:gap-0">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
          <button
            key={number}
            onClick={() => onNumberSelect(number)}
            disabled={disabled}
            className={cn(
              "w-12 h-14 rounded-xl border-2 flex flex-col items-center justify-center text-lg font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
              {
                "border-sudoku-primary text-sudoku-primary bg-blue-50": selectedNumber === number,
                "border-gray-200 hover:border-sudoku-primary hover:text-sudoku-primary": selectedNumber !== number,
              }
            )}
            data-testid={`button-number-${number}`}
          >
            <span>{number}</span>
            <span className="text-xs text-gray-500 leading-none">
              {9 - (numberCounts[number] || 0)}
            </span>
          </button>
        ))}
        <button
          onClick={onErase}
          disabled={disabled}
          className="w-12 h-14 rounded-xl border-2 border-sudoku-error text-sudoku-error flex items-center justify-center text-lg font-bold hover:bg-sudoku-error hover:text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Erase"
          data-testid="button-erase"
        >
          <Eraser className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
