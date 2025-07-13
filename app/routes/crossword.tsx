import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AppLayout from "~/layouts/AppLayout";
import { getSidebar, requireAuth, user } from "~/services/auth.server";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { CrosswordGame } from "~/components/CrosswordGame";
import { Home, Grid, Star, Trophy } from "lucide-react";
import { vocabulary } from "~/data/vocabulary";

export const meta: MetaFunction = () => {
  return [
    { title: "Crucigrama - ABC English" },
    { name: "description", content: "Resuelve crucigramas en inglés y practica tu vocabulario" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth({ request });

  const u = await user({ request });
  const sidebar = await getSidebar({ request });

  return {
    user: {
      ...u.user,
      role: u.role,
    },
    sidebar: sidebar,
  };
}

type Level = 'easy' | 'medium' | 'hard';
type Category = keyof typeof vocabulary;

interface GameSession {
  level: Level;
  category: Category;
}

export default function CrosswordLevels() {
  const loaderData = useLoaderData<any>();
  const [currentGame, setCurrentGame] = useState<GameSession | null>(null);
  const [completedGames, setCompletedGames] = useState<
    Array<{ level: Level; category: Category; score: number; date: Date }>
  >([]);

  const categoryInfo = {
    animals: {
      title: 'Animales',
      description: 'Gatos, perros, pájaros y más',
      icon: '🐾',
      color: 'bg-green-100 text-green-800',
    },
    household: {
      title: 'Hogar',
      description: 'Casa, muebles y objetos',
      icon: '🏠',
      color: 'bg-blue-100 text-blue-800',
    },
    transportation: {
      title: 'Transporte',
      description: 'Vehículos y medios de transporte',
      icon: '🚗',
      color: 'bg-purple-100 text-purple-800',
    },
    nature: {
      title: 'Naturaleza',
      description: 'Elementos naturales',
      icon: '🌳',
      color: 'bg-green-100 text-green-800',
    },
    food: {
      title: 'Comida',
      description: 'Frutas, alimentos y bebidas',
      icon: '🍎',
      color: 'bg-orange-100 text-orange-800',
    },
    school: {
      title: 'Escuela',
      description: 'Útiles escolares y educación',
      icon: '📚',
      color: 'bg-indigo-100 text-indigo-800',
    },
  };

  const levelInfo = {
    easy: {
      title: 'Fácil',
      description: 'Cuadrícula 10x10 • 6 palabras • Sin límite de tiempo',
      color: 'bg-green-500',
      icon: '🌟',
    },
    medium: {
      title: 'Medio',
      description: 'Cuadrícula 12x12 • 8 palabras • Sin límite de tiempo',
      color: 'bg-yellow-500',
      icon: '⭐',
    },
    hard: {
      title: 'Difícil',
      description: 'Cuadrícula 15x15 • 10 palabras • Sin límite de tiempo',
      color: 'bg-red-500',
      icon: '🏆',
    },
  };

  const handleGameComplete = (score: number) => {
    if (currentGame) {
      setCompletedGames(prev => [...prev, {
        ...currentGame,
        score,
        date: new Date(),
      }]);

      // Volver al selector después de 3 segundos
      setTimeout(() => {
        setCurrentGame(null);
      }, 3000);
    }
  };

  const getHighScore = (level: Level, category: Category) => {
    const games = completedGames.filter(g => g.level === level && g.category === category);
    return games.length > 0 ? Math.max(...games.map(g => g.score)) : 0;
  };

  const getTotalGamesPlayed = () => completedGames.length;
  const getTotalScore = () => completedGames.reduce((sum, game) => sum + game.score, 0);
  const getAverageScore = () => {
    const total = getTotalGamesPlayed();
    return total > 0 ? Math.round(getTotalScore() / total) : 0;
  };

  if (currentGame) {
    return (
      <AppLayout
        sidebarOptions={loaderData.sidebar}
        userData={loaderData.user}
      >
        <div className="w-full max-w-7xl mx-auto py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <Grid className="w-8 h-8" />
              Crucigrama - {categoryInfo[currentGame.category as keyof typeof categoryInfo].title}
            </h1>
            <Button
              onClick={() => setCurrentGame(null)}
              variant="outline"
              className="flex items-center gap-2"
            >
              ← Volver a categorías
            </Button>
          </div>
          
          <CrosswordGame
            level={currentGame.level}
            category={currentGame.category}
            onComplete={handleGameComplete}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      sidebarOptions={loaderData.sidebar}
      userData={loaderData.user}
    >
      <div className="w-full max-w-6xl mx-auto py-8">
        <div className="flex flex-col mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-primary flex items-center gap-3">
              <Grid className="w-10 h-10" />
              Crucigrama
            </h1>
            <Button
              asChild
              variant="outline"
              className="flex items-center gap-2"
            >
              <a href="/student">
                <Home className="w-4 h-4" />
                Volver al inicio
              </a>
            </Button>
          </div>
          <Separator className="my-4 bg-[#004d5a]" />
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{getTotalGamesPlayed()}</div>
              <div className="text-sm text-blue-800">Crucigramas completados</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{getTotalScore()}</div>
              <div className="text-sm text-green-800">Puntuación total</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{getAverageScore()}</div>
              <div className="text-sm text-purple-800">Promedio por crucigrama</div>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.keys(categoryInfo).length}
              </div>
              <div className="text-sm text-orange-800">Categorías disponibles</div>
            </CardContent>
          </Card>
        </div>

        {/* Descripción del juego */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-3 flex items-center gap-2">
              <Grid className="w-6 h-6" />
              Cómo jugar:
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-blue-700">
              <div>
                <h3 className="font-semibold mb-2">🎯 Objetivo:</h3>
                <p>Completa el crucigrama escribiendo las palabras en inglés basándote en las pistas proporcionadas.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🖱️ Controles:</h3>
                <p>Haz clic en una casilla y escribe la palabra. Usa Tab o flechas para navegar entre casillas.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">⭐ Puntuación:</h3>
                <p>Gana 100 puntos por palabra correcta, más puntos bonus por completar sin pistas adicionales.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📚 Aprendizaje:</h3>
                <p>Cada pista incluye la traducción al español para ayudarte a recordar el vocabulario.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selector de categorías */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Elige una categoría:</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(categoryInfo).map(([categoryKey, info]) => {
            const category = categoryKey as Category;
            const wordsCount = vocabulary[category]?.length || 0;
            
            return (
              <Card
                key={category}
                className="transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-blue-300"
              >
                <CardHeader className="text-center pb-4">
                  <div className="text-5xl mb-2">{info.icon}</div>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <span>{info.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">{info.description}</p>
                  <Badge className={info.color}>
                    {wordsCount} palabras disponibles
                  </Badge>
                  
                  {/* Mejores puntuaciones por nivel */}
                  <div className="mt-4 space-y-2">
                    {(Object.keys(levelInfo) as Level[]).map(level => {
                      const highScore = getHighScore(level, category);
                      return (
                        <div key={level} className="flex justify-between items-center text-sm">
                          <span className="flex items-center gap-1">
                            {levelInfo[level].icon} {levelInfo[level].title}
                          </span>
                          {highScore > 0 ? (
                            <Badge variant="outline" className="text-xs">
                              Mejor: {highScore}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-xs">No jugado</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Botones de nivel */}
                  <div className="mt-4 space-y-2">
                    {(Object.keys(levelInfo) as Level[]).map(level => (
                      <Button
                        key={level}
                        onClick={() => setCurrentGame({ level, category })}
                        className={`w-full ${levelInfo[level].color} hover:opacity-90 text-white text-sm`}
                      >
                        {levelInfo[level].icon} Jugar {levelInfo[level].title}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Historial reciente */}
        {completedGames.length > 0 && (
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Crucigramas Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {completedGames.slice(-10).reverse().map((game, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{categoryInfo[game.category as keyof typeof categoryInfo].icon}</span>
                      <div>
                        <div className="font-semibold text-sm">
                          {categoryInfo[game.category as keyof typeof categoryInfo].title} - {levelInfo[game.level].title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {game.date.toLocaleDateString()} {game.date.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold text-yellow-600">{game.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Consejos */}
        <Card className="mt-8 bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-yellow-800 mb-3">💡 Consejos para resolver crucigramas:</h3>
            <ul className="text-yellow-700 space-y-2">
              <li>• <strong>Empieza por las palabras cortas:</strong> Son más fáciles de resolver y te dan letras clave.</li>
              <li>• <strong>Busca intersecciones:</strong> Las letras compartidas te ayudan a resolver otras palabras.</li>
              <li>• <strong>Lee todas las pistas:</strong> Algunas pueden ser más obvias que otras.</li>
              <li>• <strong>Usa el contexto:</strong> La categoría te da pistas sobre el tipo de palabras.</li>
              <li>• <strong>No te rindas:</strong> Si no sabes una palabra, intenta con las que se cruzan.</li>
              <li>• <strong>Practica el vocabulario:</strong> Mientras más conozcas, más fácil será resolver.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
