import { useState, useEffect } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Clock, Target, Trophy, RotateCcw } from "lucide-react";
import { toast } from "~/hooks/use-toast";

interface WordSearchStatsProps {
  timeLeft: number;
  totalTime: number;
  foundWords: number;
  totalWords: number;
  score: number;
  level: string;
  onNewGame: () => void;
}

export function WordSearchStats({ 
  timeLeft, 
  totalTime, 
  foundWords, 
  totalWords, 
  score, 
  level,
  onNewGame 
}: WordSearchStatsProps) {
  const [urgentTime, setUrgentTime] = useState(false);

  useEffect(() => {
    // Tiempo urgente cuando quedan menos del 20% del tiempo
    const urgentThreshold = totalTime * 0.2;
    setUrgentTime(timeLeft <= urgentThreshold && timeLeft > 0);
  }, [timeLeft, totalTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    const progress = foundWords / totalWords;
    if (progress < 0.3) return 'bg-red-500';
    if (progress < 0.7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getLevelBadgeColor = () => {
    switch (level.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Información del nivel */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Badge className={getLevelBadgeColor()}>
              Nivel {level}
            </Badge>
            <Button
              onClick={onNewGame}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Nuevo Juego
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 gap-3">
        {/* Tiempo */}
        <Card className={`transition-colors ${urgentTime ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${urgentTime ? 'text-red-500' : 'text-blue-500'}`} />
                <span className="font-semibold">Tiempo</span>
              </div>
              <div className={`text-xl font-bold ${urgentTime ? 'text-red-600' : 'text-blue-600'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
            {urgentTime && (
              <div className="text-sm text-red-600 mt-1">
                ¡Tiempo casi agotado!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progreso */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                <span className="font-semibold">Progreso</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {foundWords}/{totalWords}
              </div>
            </div>
            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${totalWords > 0 ? (foundWords / totalWords) * 100 : 0}%` }}
              />
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {totalWords > 0 ? Math.round((foundWords / totalWords) * 100) : 0}% completado
            </div>
          </CardContent>
        </Card>

        {/* Puntuación */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">Puntuación</span>
              </div>
              <div className="text-xl font-bold text-yellow-600">
                {score.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consejos dinámicos */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="p-4">
          <div className="text-sm">
            <div className="font-semibold text-indigo-800 mb-2">💡 Consejo:</div>
            <div className="text-indigo-700">
              {foundWords === 0 && "¡Comienza buscando palabras cortas!"}
              {foundWords > 0 && foundWords < totalWords / 2 && "¡Vas bien! Revisa las diagonales."}
              {foundWords >= totalWords / 2 && foundWords < totalWords && "¡Excelente! Solo quedan unas pocas."}
              {foundWords === totalWords && totalWords > 0 && "¡Perfecto! Has encontrado todas las palabras."}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface WordListProps {
  words: Array<{
    english: string;
    spanish: string;
    emoji: string;
  }>;
  foundWords: string[];
}

export function WordList({ words, foundWords }: WordListProps) {
  const sortedWords = [...words].sort((a, b) => {
    const aFound = foundWords.includes(a.english.toUpperCase());
    const bFound = foundWords.includes(b.english.toUpperCase());
    
    // Palabras no encontradas primero
    if (aFound && !bFound) return 1;
    if (!aFound && bFound) return -1;
    return 0;
  });

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Palabras a encontrar:
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sortedWords.map((word, index) => {
            const isFound = foundWords.includes(word.english.toUpperCase());
            return (
              <div
                key={index}
                className={`
                  p-3 rounded-lg border transition-all duration-300
                  ${isFound 
                    ? 'bg-green-100 border-green-300 opacity-75' 
                    : 'bg-gray-50 border-gray-200 hover:bg-blue-50'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{word.emoji}</span>
                    <div>
                      <div className={`font-semibold ${isFound ? 'line-through text-gray-600' : 'text-gray-800'}`}>
                        {word.english}
                      </div>
                      <div className={`text-sm ${isFound ? 'text-gray-500' : 'text-gray-600'}`}>
                        {word.spanish}
                      </div>
                    </div>
                  </div>
                  <div className={`text-2xl transition-all duration-300 ${isFound ? 'scale-110' : 'scale-0'}`}>
                    ✅
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Contador de palabras */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <span className="font-semibold text-green-600">{foundWords.length}</span> de{' '}
            <span className="font-semibold text-blue-600">{words.length}</span> palabras encontradas
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
