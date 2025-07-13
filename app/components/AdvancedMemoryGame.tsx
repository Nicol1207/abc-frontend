import { useState, useEffect } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { getWordsForLevel, levelConfigs, type WordPair } from "~/data/vocabulary";
import { toast } from "~/hooks/use-toast";

interface MemoryGameProps {
  level: 'easy' | 'medium' | 'hard' | 'expert';
  onComplete: (score: number) => void;
}

interface GameCard {
  id: string;
  content: string;
  type: 'english' | 'spanish';
  wordId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

// Configuración de niveles - ahora usando el sistema de vocabulario
const getLevelConfig = (level: 'easy' | 'medium' | 'hard' | 'expert') => {
  const baseConfig = levelConfigs[level];
  return {
    ...baseConfig,
    words: getWordsForLevel(level),
  };
};

export function AdvancedMemoryGame({ level, onComplete }: MemoryGameProps) {
  const config = getLevelConfig(level);
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timeLimit);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);

  // Inicializar cartas
  useEffect(() => {
    const gameCards: GameCard[] = [];
    
    config.words.forEach((word: WordPair) => {
      gameCards.push({
        id: `${word.id}-en`,
        content: `${word.emoji} ${word.english}`,
        type: 'english',
        wordId: word.id,
        isFlipped: false,
        isMatched: false,
      });
      gameCards.push({
        id: `${word.id}-es`,
        content: `${word.emoji} ${word.spanish}`,
        type: 'spanish',
        wordId: word.id,
        isFlipped: false,
        isMatched: false,
      });
    });

    const shuffled = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, [level, config.words]);

  // Timer
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameComplete) {
      // Tiempo agotado
      toast({
        title: "⏰ Tiempo agotado",
        description: "¡Inténtalo de nuevo!",
        variant: "destructive",
      });
      onComplete(0);
    }
  }, [gameStarted, timeLeft, gameComplete, onComplete]);

  // Calcular puntuación
  useEffect(() => {
    if (gameComplete) {
      const timeBonus = timeLeft * 10;
      const movesPenalty = Math.max(0, moves - config.words.length) * 5;
      const finalScore = Math.max(0, 1000 + timeBonus - movesPenalty);
      setScore(finalScore);
      
      toast({
        title: "🎉 ¡Excelente!",
        description: `Nivel completado con ${finalScore} puntos`,
      });
      
      onComplete(finalScore);
    }
  }, [gameComplete, timeLeft, moves, config.words.length, onComplete]);

  const handleCardClick = (cardId: string) => {
    if (!gameStarted) setGameStarted(true);
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(cardId)) return;
    if (cards.find(c => c.id === cardId)?.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    setCards(prevCards =>
      prevCards.map(card =>
        card.id === cardId ? { ...card, isFlipped: true } : card
      )
    );

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      setTimeout(() => {
        const [firstCardId, secondCardId] = newFlippedCards;
        const firstCard = cards.find(c => c.id === firstCardId);
        const secondCard = cards.find(c => c.id === secondCardId);

        if (firstCard && secondCard && firstCard.wordId === secondCard.wordId) {
          setCards(prevCards =>
            prevCards.map(card =>
              newFlippedCards.includes(card.id)
                ? { ...card, isMatched: true }
                : card
            )
          );
          setMatches(prev => {
            const newMatches = prev + 1;
            if (newMatches === config.words.length) {
              setGameComplete(true);
            }
            return newMatches;
          });
          
          // Feedback positivo
          const matchedWord = config.words.find(w => w.id === firstCard.wordId);
          if (matchedWord) {
            toast({
              title: "✅ ¡Correcto!",
              description: `${matchedWord.english} = ${matchedWord.spanish}`,
            });
          }
        } else {
          setCards(prevCards =>
            prevCards.map(card =>
              newFlippedCards.includes(card.id)
                ? { ...card, isFlipped: false }
                : card
            )
          );
        }

        setFlippedCards([]);
      }, 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLevelColor = () => {
    switch (level) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
    }
  };

  const getLevelBadgeColor = () => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header con información del nivel */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Badge className={getLevelBadgeColor()}>
            Nivel {level === 'easy' ? 'Fácil' : level === 'medium' ? 'Medio' : 'Difícil'}
          </Badge>
          <span className="text-sm text-gray-600">
            {config.words.length} parejas
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span>Tiempo: <strong>{formatTime(timeLeft)}</strong></span>
          <span>Movimientos: <strong>{moves}</strong></span>
          <span>Parejas: <strong>{matches}/{config.words.length}</strong></span>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getLevelColor()}`}
          style={{ width: `${(matches / config.words.length) * 100}%` }}
        />
      </div>

      {/* Tablero de juego */}
      <div 
        className={`grid gap-3 mx-auto`}
        style={{ 
          gridTemplateColumns: `repeat(${config.gridCols}, minmax(0, 1fr))`,
          maxWidth: config.gridCols * 120 + (config.gridCols - 1) * 12
        }}
      >
        {cards.map((card) => (
          <Card
            key={card.id}
            className={`
              h-20 cursor-pointer transform transition-all duration-200 hover:scale-105 
              ${card.isFlipped || card.isMatched 
                ? card.type === 'english' 
                  ? 'bg-blue-100 border-blue-300' 
                  : 'bg-green-100 border-green-300'
                : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
              }
              ${card.isMatched ? 'opacity-75 ring-2 ring-yellow-400' : ''}
            `}
            onClick={() => handleCardClick(card.id)}
          >
            <CardContent className="p-0 h-full flex items-center justify-center">
              {card.isFlipped || card.isMatched ? (
                <div className="text-center px-1">
                  <div className="text-sm font-semibold leading-tight">
                    {card.content}
                  </div>
                </div>
              ) : (
                <div className="text-2xl">?</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resultado del juego */}
      {gameComplete && (
        <div className="mt-6 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-green-700 mb-2">
              🎉 ¡Nivel Completado!
            </h3>
            <div className="text-lg text-green-600">
              Puntuación: <strong>{score}</strong>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Completado en {moves} movimientos con {formatTime(timeLeft)} restante
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
