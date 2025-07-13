import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { getRandomWordsFromCategory, type WordPair } from "~/data/vocabulary";
import { WordSearchStats, WordList } from "~/components/WordSearchStats";
import { toast } from "~/hooks/use-toast";

interface WordSearchProps {
  level: 'easy' | 'medium' | 'hard';
  category: string;
  onComplete: (score: number) => void;
}

interface WordPosition {
  word: string;
  translation: string;
  startRow: number;
  startCol: number;
  direction: 'horizontal' | 'vertical' | 'diagonal';
  found: boolean;
}

interface CellState {
  letter: string;
  isSelected: boolean;
  isHighlighted: boolean;
  isPartOfWord: boolean;
}

const levelConfig = {
  easy: {
    gridSize: 12,
    wordsCount: 6,
    timeLimit: 300, // 5 minutos
    description: 'Cuadrícula 12x12 • 6 palabras • 5 minutos',
  },
  medium: {
    gridSize: 15,
    wordsCount: 8,
    timeLimit: 420, // 7 minutos
    description: 'Cuadrícula 15x15 • 8 palabras • 7 minutos',
  },
  hard: {
    gridSize: 18,
    wordsCount: 10,
    timeLimit: 600, // 10 minutos
    description: 'Cuadrícula 18x18 • 10 palabras • 10 minutos',
  },
};

export function WordSearchGame({ level, category, onComplete }: WordSearchProps) {
  const config = levelConfig[level];
  const [grid, setGrid] = useState<CellState[][]>([]);
  const [words, setWords] = useState<WordPair[]>([]);
  const [wordPositions, setWordPositions] = useState<WordPosition[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{row: number, col: number} | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{row: number, col: number} | null>(null);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);

  // Generar letras aleatorias
  const getRandomLetter = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters[Math.floor(Math.random() * letters.length)];
  };

  // Verificar si una posición está dentro de los límites
  const isValidPosition = (row: number, col: number, length: number, direction: string) => {
    switch (direction) {
      case 'horizontal':
        return col + length <= config.gridSize;
      case 'vertical':
        return row + length <= config.gridSize;
      case 'diagonal':
        return row + length <= config.gridSize && col + length <= config.gridSize;
      default:
        return false;
    }
  };

  // Verificar si una palabra puede colocarse en una posición
  const canPlaceWord = (word: string, row: number, col: number, direction: string, currentGrid: string[][]) => {
    if (!isValidPosition(row, col, word.length, direction)) return false;

    for (let i = 0; i < word.length; i++) {
      let checkRow = row;
      let checkCol = col;

      switch (direction) {
        case 'horizontal':
          checkCol += i;
          break;
        case 'vertical':
          checkRow += i;
          break;
        case 'diagonal':
          checkRow += i;
          checkCol += i;
          break;
      }

      if (currentGrid[checkRow][checkCol] !== '' && currentGrid[checkRow][checkCol] !== word[i]) {
        return false;
      }
    }
    return true;
  };

  // Colocar una palabra en el grid
  const placeWord = (word: string, row: number, col: number, direction: string, currentGrid: string[][]) => {
    for (let i = 0; i < word.length; i++) {
      let placeRow = row;
      let placeCol = col;

      switch (direction) {
        case 'horizontal':
          placeCol += i;
          break;
        case 'vertical':
          placeRow += i;
          break;
        case 'diagonal':
          placeRow += i;
          placeCol += i;
          break;
      }

      currentGrid[placeRow][placeCol] = word[i];
    }
  };

  // Generar sopa de letras
  const generateWordSearch = useCallback(() => {
    const selectedWords = getRandomWordsFromCategory(category, config.wordsCount);
    setWords(selectedWords);

    // Crear grid vacío
    const newGrid: string[][] = Array(config.gridSize).fill(null).map(() => 
      Array(config.gridSize).fill('')
    );

    const positions: WordPosition[] = [];
    const directions = ['horizontal', 'vertical', 'diagonal'];

    // Intentar colocar cada palabra
    selectedWords.forEach((wordPair) => {
      const word = wordPair.english.toUpperCase();
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!placed && attempts < maxAttempts) {
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const row = Math.floor(Math.random() * config.gridSize);
        const col = Math.floor(Math.random() * config.gridSize);

        if (canPlaceWord(word, row, col, direction, newGrid)) {
          placeWord(word, row, col, direction, newGrid);
          positions.push({
            word: word,
            translation: wordPair.spanish,
            startRow: row,
            startCol: col,
            direction: direction as 'horizontal' | 'vertical' | 'diagonal',
            found: false,
          });
          placed = true;
        }
        attempts++;
      }
    });

    // Llenar espacios vacíos con letras aleatorias
    for (let row = 0; row < config.gridSize; row++) {
      for (let col = 0; col < config.gridSize; col++) {
        if (newGrid[row][col] === '') {
          newGrid[row][col] = getRandomLetter();
        }
      }
    }

    // Convertir a CellState
    const cellGrid: CellState[][] = newGrid.map(row =>
      row.map(letter => ({
        letter,
        isSelected: false,
        isHighlighted: false,
        isPartOfWord: false,
      }))
    );

    setGrid(cellGrid);
    setWordPositions(positions);
    setFoundWords([]);
    setGameComplete(false);
    setTimeLeft(config.timeLimit);
    setGameStarted(false);
  }, [category, config.gridSize, config.wordsCount, config.timeLimit]);

  // Inicializar juego
  useEffect(() => {
    generateWordSearch();
  }, [generateWordSearch]);

  // Timer
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameComplete) {
      toast({
        title: "⏰ Tiempo agotado",
        description: "¡El juego ha terminado!",
        variant: "destructive",
      });
      const finalScore = foundWords.length * 100;
      setScore(finalScore);
      onComplete(finalScore);
      setGameComplete(true);
    }
  }, [gameStarted, timeLeft, gameComplete, foundWords.length, onComplete]);

  // Verificar si el juego está completo
  useEffect(() => {
    if (foundWords.length === words.length && words.length > 0 && !gameComplete) {
      setGameComplete(true);
      const timeBonus = timeLeft * 2;
      const finalScore = foundWords.length * 100 + timeBonus;
      setScore(finalScore);
      
      toast({
        title: "🎉 ¡Felicitaciones!",
        description: `¡Has encontrado todas las palabras! Puntuación: ${finalScore}`,
      });
      
      onComplete(finalScore);
    }
  }, [foundWords.length, words.length, timeLeft, gameComplete, onComplete]);

  // Obtener celdas en línea recta entre dos puntos
  const getCellsInLine = (start: {row: number, col: number}, end: {row: number, col: number}) => {
    const cells: {row: number, col: number}[] = [];
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    
    // Solo permitir líneas rectas (horizontal, vertical, diagonal)
    if (rowDiff !== 0 && colDiff !== 0 && Math.abs(rowDiff) !== Math.abs(colDiff)) {
      return cells;
    }

    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
    const rowStep = rowDiff === 0 ? 0 : rowDiff / steps;
    const colStep = colDiff === 0 ? 0 : colDiff / steps;

    for (let i = 0; i <= steps; i++) {
      const row = start.row + Math.round(i * rowStep);
      const col = start.col + Math.round(i * colStep);
      cells.push({ row, col });
    }

    return cells;
  };

  // Verificar si la selección forma una palabra válida
  const checkWordFound = (selectedCells: {row: number, col: number}[]) => {
    const selectedWord = selectedCells.map(cell => grid[cell.row][cell.col].letter).join('');
    const reversedWord = selectedWord.split('').reverse().join('');

    const foundPosition = wordPositions.find(pos => 
      (pos.word === selectedWord || pos.word === reversedWord) && !pos.found
    );

    if (foundPosition) {
      // Marcar palabra como encontrada
      setWordPositions(prev => prev.map(pos => 
        pos === foundPosition ? { ...pos, found: true } : pos
      ));
      
      setFoundWords(prev => [...prev, foundPosition.word]);
      
      // Marcar celdas como parte de palabra encontrada
      setGrid(prev => {
        const newGrid = [...prev];
        selectedCells.forEach(cell => {
          newGrid[cell.row][cell.col] = {
            ...newGrid[cell.row][cell.col],
            isPartOfWord: true,
          };
        });
        return newGrid;
      });

      toast({
        title: "✅ ¡Palabra encontrada!",
        description: `${foundPosition.word} = ${foundPosition.translation}`,
      });

      return true;
    }
    return false;
  };

  // Manejar inicio de selección
  const handleMouseDown = (row: number, col: number) => {
    if (!gameStarted) setGameStarted(true);
    setIsSelecting(true);
    setSelectionStart({ row, col });
    setSelectionEnd({ row, col });
  };

  // Manejar movimiento del mouse
  const handleMouseEnter = (row: number, col: number) => {
    if (isSelecting && selectionStart) {
      setSelectionEnd({ row, col });
    }
  };

  // Manejar fin de selección
  const handleMouseUp = () => {
    if (isSelecting && selectionStart && selectionEnd) {
      const selectedCells = getCellsInLine(selectionStart, selectionEnd);
      if (selectedCells.length > 1) {
        checkWordFound(selectedCells);
      }
    }
    
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
    
    // Limpiar selección visual
    setGrid(prev => prev.map(row => 
      row.map(cell => ({ ...cell, isSelected: false, isHighlighted: false }))
    ));
  };

  // Actualizar grid visual durante la selección
  useEffect(() => {
    if (selectionStart && selectionEnd) {
      const selectedCells = getCellsInLine(selectionStart, selectionEnd);
      
      setGrid(prev => {
        const newGrid = prev.map(row => 
          row.map(cell => ({ ...cell, isSelected: false, isHighlighted: false }))
        );
        
        selectedCells.forEach(cell => {
          if (cell.row >= 0 && cell.row < config.gridSize && 
              cell.col >= 0 && cell.col < config.gridSize) {
            newGrid[cell.row][cell.col] = {
              ...newGrid[cell.row][cell.col],
              isSelected: true,
              isHighlighted: true,
            };
          }
        });
        
        return newGrid;
      });
    }
  }, [selectionStart, selectionEnd, config.gridSize]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Grid de sopa de letras */}
        <div className="flex-1">
          {/* Grid */}
          <div 
            className="inline-block border-2 border-gray-300 bg-white select-none rounded-lg overflow-hidden shadow-lg"
            style={{ 
              fontSize: Math.max(12, 20 - config.gridSize * 0.3) + 'px',
            }}
            onMouseLeave={handleMouseUp}
          >
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      w-8 h-8 border border-gray-200 flex items-center justify-center cursor-pointer font-bold
                      transition-colors duration-150
                      ${cell.isSelected ? 'bg-blue-200' : ''}
                      ${cell.isHighlighted ? 'bg-blue-300' : ''}
                      ${cell.isPartOfWord ? 'bg-green-200' : ''}
                      hover:bg-gray-100
                    `}
                    onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                    onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                    onMouseUp={handleMouseUp}
                  >
                    {cell.letter}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Panel lateral */}
        <div className="w-full xl:w-80 space-y-4">
          {/* Estadísticas */}
          <WordSearchStats
            timeLeft={timeLeft}
            totalTime={config.timeLimit}
            foundWords={foundWords.length}
            totalWords={words.length}
            score={score}
            level={level}
            onNewGame={generateWordSearch}
          />
          
          {/* Lista de palabras */}
          <WordList
            words={words.map(w => ({
              english: w.english,
              spanish: w.spanish,
              emoji: w.emoji,
            }))}
            foundWords={foundWords}
          />
        </div>
      </div>

      {/* Resultado del juego */}
      {gameComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="bg-white p-8 max-w-md w-full mx-4">
            <CardContent className="text-center">
              <div className="text-6xl mb-4">
                {foundWords.length === words.length ? '🎉' : '⏰'}
              </div>
              <h2 className="text-2xl font-bold mb-4">
                {foundWords.length === words.length ? '¡Felicitaciones!' : 'Tiempo Agotado'}
              </h2>
              <div className="space-y-2 mb-6">
                <p className="text-lg">
                  {foundWords.length === words.length 
                    ? '¡Has encontrado todas las palabras!' 
                    : `Encontraste ${foundWords.length} de ${words.length} palabras`
                  }
                </p>
                <p className="text-gray-600">
                  Puntuación final: <span className="font-bold text-yellow-600">{score}</span>
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={generateWordSearch}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Jugar de Nuevo
                </Button>
                <Button
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="flex-1"
                >
                  Salir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
