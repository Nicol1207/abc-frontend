import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AppLayout from "~/layouts/AppLayout";
import { getSidebar, requireAuth, user } from "~/services/auth.server";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Trophy, RotateCcw, Home } from "lucide-react";
import { toast } from "~/hooks/use-toast";
import { getMemory } from "~/services/loaders/memories";

export const meta: MetaFunction = () => {
  return [
    { title: "Juego de Memoria - ABC English" },
    { name: "description", content: "Mejora tu vocabulario en inglés con nuestro juego de memoria" },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuth({ request });

  const u = await user({ request });
  const sidebar = await getSidebar({ request });
  const memoryData = await getMemory({ request, activityId: params.id });

  // Aseguramos que el loader retorne memoryData como array de palabras
  return {
    user: {
      ...u.user,
      role: u.role,
    },
    sidebar: sidebar,
    memoryData: memoryData.data, // <-- aquí debe estar el array de palabras
  };
}

// Las palabras del juego ahora vienen del backend vía loader

interface Card {
  id: string;
  content: string;
  type: 'english' | 'spanish';
  wordId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryGame() {
  const loaderData = useLoaderData<any>();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeStarted, setTimeStarted] = useState<number | null>(null);
  const [timeCompleted, setTimeCompleted] = useState<number | null>(null);
  const [pairStatus, setPairStatus] = useState<'correct' | 'incorrect' | null>(null);

  // Función para barajar las cartas usando datos del backend
  const shuffleCards = useCallback(() => {
    // Remapear las palabras del backend
    const backendWords = loaderData.memoryData?.words || [];
    const mappedWords = backendWords.map((w: any, idx: number) => ({
      id: w.id ?? idx + 1,
      english: w.english_word,
      spanish: w.spanish_word,
      emoji: w.emoji || '',
      category: '', // Se deja vacío
    }));

    const gameCards: Card[] = [];
    mappedWords.forEach((word) => {
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
    // Barajar las cartas
    const shuffled = gameCards.sort(() => Math.random() - 0.5);
    return shuffled;
  }, [loaderData.memoryData]);

  // Inicializar el juego
  const initializeGame = useCallback(() => {
    setCards(shuffleCards());
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setGameComplete(false);
    setTimeStarted(Date.now());
    setTimeCompleted(null);
  }, [shuffleCards]);

  // Manejar clic en carta
  const handleCardClick = (cardId: string) => {
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(cardId)) return;
    if (cards.find(c => c.id === cardId)?.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Voltear la carta
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === cardId ? { ...card, isFlipped: true } : card
      )
    );

    // Si se voltearon 2 cartas, verificar coincidencia
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstCardId);
      const secondCard = cards.find(c => c.id === secondCardId);
      const isCorrect = firstCard && secondCard && firstCard.wordId === secondCard.wordId;
      setPairStatus(isCorrect ? 'correct' : 'incorrect');
      setTimeout(() => {
        if (isCorrect) {
          // ¡Coincidencia encontrada!
          setCards(prevCards =>
            prevCards.map(card =>
              newFlippedCards.includes(card.id)
                ? { ...card, isMatched: true }
                : card
            )
          );
          setMatches(prev => prev + 1);
          toast({
            title: "¡Excelente!",
            description: `Has encontrado una pareja: ${firstCard.type === 'english' ? firstCard.content.split(' ').slice(1).join(' ') : secondCard.content.split(' ').slice(1).join(' ')}`,
          });

          // Verificar si el juego está completo
          const backendWords = loaderData.memoryData?.words || [];
          if (matches + 1 === backendWords.length) {
            setGameComplete(true);
            setTimeCompleted(Date.now());
            toast({
              title: "🎉 ¡Felicitaciones!",
              description: `¡Has completado el juego en ${moves + 1} movimientos!`,
            });
          }
        } else {
          // No hay coincidencia, voltear las cartas de vuelta
          setCards(prevCards =>
            prevCards.map(card =>
              newFlippedCards.includes(card.id)
                ? { ...card, isFlipped: false }
                : card
            )
          );
        }
        setFlippedCards([]);
        setPairStatus(null);
      }, 1000);
    }
  };

  // Formatear tiempo
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  // Inicializar juego al cargar
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return (
    <AppLayout
      sidebarOptions={loaderData.sidebar}
      userData={loaderData.user}
    >
      <div className="w-full max-w-6xl mx-auto py-8">
        <div className="flex flex-col mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-primary">🧠 Juego de Memoria</h1>
            <Button
              asChild
              variant="outline"
              className="flex items-center gap-2"
            >
              <a href="/activities">
                <Home className="w-4 h-4" />
                Volver a actividades
              </a>
            </Button>
          </div>
          <Separator className="my-4 bg-[#004d5a]" />
        </div>

        {/* Panel de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{moves}</div>
              <div className="text-sm text-blue-800">Movimientos</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{matches}/{loaderData.memoryData?.words?.length || 0}</div>
              <div className="text-sm text-green-800">Parejas encontradas</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {timeStarted && !gameComplete 
                  ? formatTime(Date.now() - timeStarted)
                  : timeCompleted && timeStarted
                  ? formatTime(timeCompleted - timeStarted)
                  : "0:00"
                }
              </div>
              <div className="text-sm text-purple-800">Tiempo</div>
            </CardContent>
          </Card>
        </div>

        {/* Instrucciones */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-bold text-lg mb-2 text-blue-800">📖 Instrucciones:</h3>
            <p className="text-blue-700">
              Encuentra las parejas de palabras en inglés y español. Haz clic en las cartas para voltearlas 
              y encuentra su traducción correspondiente. ¡Completa todas las parejas en el menor número de movimientos posible!
            </p>
          </CardContent>
        </Card>

        {/* Tablero de juego */}
        <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
          {cards.map((card) => {
            // Animación visual para las cartas seleccionadas
            let animationClass = '';
            let animationStyle = {};
            if (flippedCards.includes(card.id) && pairStatus === 'correct') {
              animationClass = 'animate-pulse bg-green-200 border-green-400';
            } else if (flippedCards.includes(card.id) && pairStatus === 'incorrect') {
              animationClass = 'bg-red-200 border-red-400 animate-shake';
              animationStyle = { animation: 'shake 0.5s' };
            }
            return (
              <Card
                key={card.id}
                className={`
                  h-24 cursor-pointer transform transition-all duration-300 hover:scale-105 
                  ${card.isFlipped || card.isMatched 
                    ? card.type === 'english' 
                      ? 'bg-blue-100 border-blue-300' 
                      : 'bg-green-100 border-green-300'
                    : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                  }
                  ${card.isMatched ? 'opacity-75 ring-2 ring-yellow-400' : ''}
                  ${animationClass}
                `}
                style={animationStyle}
                onClick={() => handleCardClick(card.id)}
              >
                <CardContent className="p-0 h-full flex items-center justify-center">
                  {card.isFlipped || card.isMatched ? (
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {card.content}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {card.type === 'english' ? 'Inglés' : 'Español'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-4xl">?</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Modal de victoria */}
        {gameComplete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="bg-white p-8 max-w-md w-full mx-4">
              <CardContent className="text-center">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-green-600 mb-4">
                  🎉 ¡Felicitaciones!
                </h2>
                <div className="space-y-2 mb-6">
                  <p className="text-lg">¡Has completado el juego!</p>
                  <p className="text-gray-600">Movimientos: <span className="font-bold">{moves}</span></p>
                  <p className="text-gray-600">
                    Tiempo: <span className="font-bold">
                      {timeCompleted && timeStarted ? formatTime(timeCompleted - timeStarted) : "0:00"}
                    </span>
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                    onClick={() => {/* Aquí puedes agregar la lógica para obtener la recompensa */}}
                  >
                    Obtener recompensa
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1"
                  >
                    <a href="/student">Volver al inicio</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
