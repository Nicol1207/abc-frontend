import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { getRandomWordsFromCategory, type WordPair } from "~/data/vocabulary";
import { toast } from "~/hooks/use-toast";
import { Clock, Target, Trophy, RotateCcw, CheckCircle } from "lucide-react";


interface CrosswordProps {
  level: 'easy' | 'medium' | 'hard';
  category: string;
  onComplete: (score: number) => void;
  words?: WordPair[];
}

interface WordPair {
  english: string;
  spanish: string;
  emoji?: string;
}

interface CrosswordWord {
  word: string;
  clue: string;
  answer: string;
  direction: 'across' | 'down';
  startRow: number;
  startCol: number;
  number: number;
  completed: boolean;
}

interface CellData {
  letter: string;
  isBlocked: boolean;
  number?: number;
  belongsToWords: number[];
  isSelected: boolean;
  isCorrect: boolean;
  userInput: string;
}

const levelConfig = {
  easy: {
    gridSize: 9,
    wordsCount: 5,
    timeLimit: 600, // 10 minutos
    description: 'Cuadrícula 9x9 • 5 palabras • 10 minutos',
  },
  medium: {
    gridSize: 11,
    wordsCount: 7,
    timeLimit: 900, // 15 minutos
    description: 'Cuadrícula 11x11 • 7 palabras • 15 minutos',
  },
  hard: {
    gridSize: 13,
    wordsCount: 10,
    timeLimit: 1200, // 20 minutos
    description: 'Cuadrícula 13x13 • 10 palabras • 20 minutos',
  },
};

export function CrosswordGame({ level, category, onComplete, words: externalWords }: CrosswordProps) {
  const config = levelConfig[level];
  const [grid, setGrid] = useState<CellData[][]>([]);
  const [words, setWords] = useState<CrosswordWord[]>([]);
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [completedWords, setCompletedWords] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [hints, setHints] = useState<{[key: number]: number}>({});

  // Generar crucigrama

  const generateCrossword = useCallback(() => {
    let selectedWords: WordPair[] = [];
    if (Array.isArray(externalWords) && externalWords.length > 0) {
      selectedWords = externalWords;
    } else {
      selectedWords = getRandomWordsFromCategory(category, config.wordsCount);
    }

    // Crear grid vacío
    const newGrid: CellData[][] = Array(config.gridSize).fill(null).map(() =>
      Array(config.gridSize).fill(null).map(() => ({
        letter: '',
        isBlocked: true,
        belongsToWords: [],
        isSelected: false,
        isCorrect: false,
        userInput: '',
      }))
    );

    const crosswordWords: CrosswordWord[] = [];
    let wordNumber = 1;

    // Algoritmo simple para colocar palabras
    selectedWords.forEach((wordPair, index) => {
      const word = wordPair.english.toUpperCase().replace(/\s/g, '');
      if (word.length > config.gridSize - 2) return; // Palabra muy larga

      let placed = false;
      let attempts = 0;
      const maxAttempts = 50;

      while (!placed && attempts < maxAttempts) {
        const direction = Math.random() > 0.5 ? 'across' : 'down';
        const startRow = Math.floor(Math.random() * (config.gridSize - (direction === 'down' ? word.length : 0)));
        const startCol = Math.floor(Math.random() * (config.gridSize - (direction === 'across' ? word.length : 0)));

        // Verificar si se puede colocar
        let canPlace = true;
        for (let i = 0; i < word.length; i++) {
          const row = direction === 'down' ? startRow + i : startRow;
          const col = direction === 'across' ? startCol + i : startCol;
          
          if (!newGrid[row][col].isBlocked && newGrid[row][col].letter !== word[i]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          // Colocar palabra
          for (let i = 0; i < word.length; i++) {
            const row = direction === 'down' ? startRow + i : startRow;
            const col = direction === 'across' ? startCol + i : startCol;
            
            newGrid[row][col] = {
              ...newGrid[row][col],
              letter: word[i],
              isBlocked: false,
              belongsToWords: [...newGrid[row][col].belongsToWords, wordNumber],
            };

            // Marcar número en la primera celda
            if (i === 0) {
              newGrid[row][col].number = wordNumber;
            }
          }

          crosswordWords.push({
            word: word,
            clue: `${wordPair.emoji ? wordPair.emoji + ' ' : ''}${wordPair.spanish}`,
            answer: word,
            direction: direction,
            startRow: startRow,
            startCol: startCol,
            number: wordNumber,
            completed: false,
          });

          wordNumber++;
          placed = true;
        }
        attempts++;
      }
    });

    setGrid(newGrid);
    setWords(crosswordWords);
    setCompletedWords([]);
    setSelectedWord(null);
    setSelectedCell(null);
    setGameComplete(false);
    setTimeLeft(config.timeLimit);
    setGameStarted(false);
    setHints({});
  }, [category, config.gridSize, config.wordsCount, config.timeLimit, externalWords]);

  // Inicializar juego
  useEffect(() => {
    generateCrossword();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generateCrossword]);

  // Timer
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameComplete) {
      toast({
        title: "⏰ Tiempo agotado",
        description: "¡El crucigrama ha terminado!",
        variant: "destructive",
      });
      const finalScore = completedWords.length * 100;
      setScore(finalScore);
      onComplete(finalScore);
      setGameComplete(true);
    }
  }, [gameStarted, timeLeft, gameComplete, completedWords.length, onComplete]);

  // Verificar si el juego está completo
  useEffect(() => {
    if (completedWords.length === words.length && words.length > 0 && !gameComplete) {
      setGameComplete(true);
      const timeBonus = timeLeft * 2;
      const hintPenalty = Object.keys(hints).length * 25;
      const finalScore = Math.max(0, completedWords.length * 100 + timeBonus - hintPenalty);
      setScore(finalScore);
      
      toast({
        title: "🎉 ¡Felicitaciones!",
      });
      
      onComplete(finalScore);
    }
  }, [completedWords.length, words.length, timeLeft, gameComplete, hints, onComplete]);

  // Manejar entrada de texto
  const handleCellInput = (row: number, col: number, value: string) => {
    if (!gameStarted) setGameStarted(true);
    const upperValue = value.toUpperCase();
    if (upperValue.length > 1) return;

    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      newGrid[row][col] = {
        ...newGrid[row][col],
        userInput: upperValue,
        isCorrect: upperValue === newGrid[row][col].letter,
      };

      // Verificar palabras completadas y si el juego termina justo al escribir esta letra
      words.forEach(word => {
        if (completedWords.includes(word.number)) return;
        let isComplete = true;
        for (let i = 0; i < word.word.length; i++) {
          const r = word.direction === 'down' ? word.startRow + i : word.startRow;
          const c = word.direction === 'across' ? word.startCol + i : word.startCol;
          if ((r === row && c === col ? upperValue : newGrid[r][c].userInput) !== word.word[i]) {
            isComplete = false;
            break;
          }
        }
        if (isComplete) {
          setCompletedWords(prev => {
            if (!prev.includes(word.number)) {
              if (prev.length + 1 === words.length) {
                setTimeout(() => {
                  setGameComplete(true);
                  const timeBonus = timeLeft * 2;
                  const hintPenalty = Object.keys(hints).length * 25;
                  const finalScore = Math.max(0, (prev.length + 1) * 100 + timeBonus - hintPenalty);
                  setScore(finalScore);
                  toast({
                    title: "🎉 ¡Felicitaciones!",
                  });
                  onComplete(finalScore);
                }, 0);
              }
              return [...prev, word.number];
            }
            return prev;
          });
          toast({
            title: "✅ ¡Palabra completada!",
            description: `${word.word} - ${word.clue}`,
          });
        }
      });

      // Enfocar siguiente celda de la palabra si existe
      setTimeout(() => {
        // Buscar si la celda pertenece a alguna palabra no completada
        const word = words.find(w => {
          if (completedWords.includes(w.number)) return false;
          for (let i = 0; i < w.word.length; i++) {
            const r = w.direction === 'down' ? w.startRow + i : w.startRow;
            const c = w.direction === 'across' ? w.startCol + i : w.startCol;
            if (r === row && c === col) return true;
          }
          return false;
        });
        if (!word) return;
        // Buscar el índice de la letra actual en la palabra
        let idx = -1;
        for (let i = 0; i < word.word.length; i++) {
          const r = word.direction === 'down' ? word.startRow + i : word.startRow;
          const c = word.direction === 'across' ? word.startCol + i : word.startCol;
          if (r === row && c === col) {
            idx = i;
            break;
          }
        }
        if (idx === -1) return;
        // Buscar la siguiente celda vacía de la palabra
        for (let j = idx + 1; j < word.word.length; j++) {
          const r = word.direction === 'down' ? word.startRow + j : word.startRow;
          const c = word.direction === 'across' ? word.startCol + j : word.startCol;
          if (newGrid[r][c].userInput === '' && !newGrid[r][c].isBlocked) {
            const nextInput = document.querySelector(
              `input[data-row='${r}'][data-col='${c}']`
            ) as HTMLInputElement | null;
            if (nextInput) nextInput.focus();
            return;
          }
        }
      }, 10);

      return newGrid;
    });
  };

  // Verificar palabras completadas (ya no se usa, la lógica está en handleCellInput)
  // const checkCompletedWords = () => {};

  // Usar pista
  const useHint = (wordNumber: number) => {
    const word = words.find(w => w.number === wordNumber);
    if (!word || completedWords.includes(wordNumber)) return;

    setHints(prev => ({ ...prev, [wordNumber]: (prev[wordNumber] || 0) + 1 }));

    // Revelar la siguiente letra vacía
    for (let i = 0; i < word.word.length; i++) {
      const row = word.direction === 'down' ? word.startRow + i : word.startRow;
      const col = word.direction === 'across' ? word.startCol + i : word.startCol;
      
      if (grid[row][col].userInput !== word.word[i]) {
        setGrid(prevGrid => {
          const newGrid = [...prevGrid];
          newGrid[row][col] = {
            ...newGrid[row][col],
            userInput: word.word[i],
            isCorrect: true,
          };
          return newGrid;
        });
        break;
      }
    }

    toast({
      title: "💡 Pista usada",
      description: `Se reveló una letra de "${word.word}"`,
    });
  };

  // Seleccionar palabra
  const selectWord = (wordNumber: number) => {
    setSelectedWord(wordNumber);
    const word = words.find(w => w.number === wordNumber);
    if (word) {
      setSelectedCell({ row: word.startRow, col: word.startCol });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLevelColor = () => {
    switch (level) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Grid del crucigrama */}
        <div className="flex-1 flex justify-center">
          <div className="inline-block border-2 border-gray-300 bg-white rounded-lg overflow-hidden shadow-lg">
            {/* ...existing code... */}
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      w-10 h-10 border border-gray-300 relative
                      ${cell.isBlocked 
                        ? 'bg-gray-800' 
                        : selectedWord && cell.belongsToWords.includes(selectedWord)
                        ? 'bg-blue-100'
                        : 'bg-white'
                      }
                      ${cell.isCorrect ? 'bg-green-100' : ''}
                    `}
                    onClick={() => {
                      if (!cell.isBlocked) {
                        setSelectedCell({ row: rowIndex, col: colIndex });
                        if (cell.belongsToWords.length > 0) {
                          setSelectedWord(cell.belongsToWords[0]);
                        }
                      }
                    }}
                  >
                    {!cell.isBlocked && (
                      <>
                        {/* Número */}
                        {cell.number && (
                          <div className="absolute top-0 left-0 text-xs font-bold text-blue-600 leading-none p-0.5">
                            {cell.number}
                          </div>
                        )}
                        {/* Input */}
                        <input
                          type="text"
                          maxLength={1}
                          value={cell.userInput}
                          onChange={(e) => handleCellInput(rowIndex, colIndex, e.target.value)}
                          data-row={rowIndex}
                          data-col={colIndex}
                          className={`
                            w-full h-full text-center font-bold text-lg bg-transparent border-none outline-none
                            ${cell.isCorrect ? 'text-green-700' : 'text-gray-800'}
                          `}
                          style={{ fontSize: '16px' }}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Panel lateral combinado */}
        <div className="w-1/2 xl:max-w-xs xl:sticky xl:top-8 xl:self-start">
          <Card>
            <CardContent className="p-4">
              {/* Estadísticas */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold">Tiempo</span>
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    {formatTime(timeLeft)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-500" />
                    <span className="font-semibold">Progreso</span>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {completedWords.length}/{words.length}
                  </div>
                </div>
              </div>
              {/* Lista de pistas */}
              <h3 className="font-bold text-lg mb-4">Pistas:</h3>
              {/* Horizontales */}
              <div className="mb-4">
                <h4 className="font-semibold text-md mb-2">Horizontales:</h4>
                <div className="space-y-2">
                  {words.filter(w => w.direction === 'across').map(word => (
                    <div
                      key={word.number}
                      className={`
                        p-2 rounded-lg border cursor-pointer transition-all
                        ${completedWords.includes(word.number)
                          ? 'bg-green-100 border-green-300'
                          : selectedWord === word.number
                          ? 'bg-blue-100 border-blue-300'
                          : 'bg-gray-50 border-gray-200 hover:bg-blue-50'
                        }
                      `}
                      onClick={() => selectWord(word.number)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="font-semibold text-blue-600">{word.number}.</span>
                          <span className="ml-2">{word.clue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {completedWords.includes(word.number) && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              useHint(word.number);
                            }}
                            disabled={completedWords.includes(word.number)}
                            className="text-xs"
                          >
                            💡 ({hints[word.number] || 0})
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Verticales */}
              <div>
                <h4 className="font-semibold text-md mb-2">Verticales:</h4>
                <div className="space-y-2">
                  {words.filter(w => w.direction === 'down').map(word => (
                    <div
                      key={word.number}
                      className={`
                        p-2 rounded-lg border cursor-pointer transition-all
                        ${completedWords.includes(word.number)
                          ? 'bg-green-100 border-green-300'
                          : selectedWord === word.number
                          ? 'bg-blue-100 border-blue-300'
                          : 'bg-gray-50 border-gray-200 hover:bg-blue-50'
                        }
                      `}
                      onClick={() => selectWord(word.number)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="font-semibold text-blue-600">{word.number}.</span>
                          <span className="ml-2">{word.clue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {completedWords.includes(word.number) && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              useHint(word.number);
                            }}
                            disabled={completedWords.includes(word.number)}
                            className="text-xs"
                          >
                            💡 ({hints[word.number] || 0})
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de resultado */}
      {gameComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="bg-white p-8 max-w-md w-full mx-4">
            <CardContent className="text-center">
              <div className="text-6xl mb-4">
                {completedWords.length === words.length ? '🎉' : '⏰'}
              </div>
              <h2 className="text-2xl font-bold mb-4">
                {completedWords.length === words.length ? '¡Felicitaciones!' : 'Tiempo Agotado'}
              </h2>
              <div className="space-y-2 mb-6">
                <p className="text-lg">
                  {completedWords.length === words.length 
                    ? '¡Has completado el crucigrama!' 
                    : `Completaste ${completedWords.length} de ${words.length} palabras`
                  }
                </p>
                
                {Object.keys(hints).length > 0 && (
                  <p className="text-sm text-gray-500">
                    Pistas usadas: {Object.values(hints).reduce((sum, count) => sum + count, 0)}
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={() => {/* Aquí puedes disparar la lógica de recompensa */ window.history.back(); }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Obtener recompensa
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
