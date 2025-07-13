import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AppLayout from "~/layouts/AppLayout";
import { getSidebar, requireAuth, user } from "~/services/auth.server";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { WordSearchGame } from "~/components/WordSearchGame";
import { Home, Search, Star, Trophy } from "lucide-react";
import { vocabulary } from "~/data/vocabulary";

export const meta: MetaFunction = () => {
  return [
    { title: "Sopa de Letras - ABC English" },
    { name: "description", content: "Encuentra palabras en inglés en divertidas sopas de letras" },
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

export default function WordSearchLevels() {
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
      description: 'Cuadrícula 12x12 • 6 palabras • 5 minutos',
      color: 'bg-green-500',
      icon: '🌟',
    },
    medium: {
      title: 'Medio',
      description: 'Cuadrícula 15x15 • 8 palabras • 7 minutos',
      color: 'bg-yellow-500',
      icon: '⭐',
    },
    hard: {
      title: 'Difícil',
      description: 'Cuadrícula 18x18 • 10 palabras • 10 minutos',
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
              <Search className="w-8 h-8" />
              Sopa de Letras - {categoryInfo[currentGame.category as keyof typeof categoryInfo].title}
            </h1>
            <Button
              onClick={() => setCurrentGame(null)}
              variant="outline"
              className="flex items-center gap-2"
            >
              ← Volver a categorías
            </Button>
          </div>
          
          <WordSearchGame
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
              <Search className="w-10 h-10" />
              Sopa de Letras
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
              <div className="text-sm text-blue-800">Juegos completados</div>
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
              <div className="text-sm text-purple-800">Promedio por juego</div>
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
              <Search className="w-6 h-6" />
              Cómo jugar:
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-blue-700">
              <div>
                <h3 className="font-semibold mb-2">🎯 Objetivo:</h3>
                <p>Encuentra todas las palabras en inglés ocultas en la cuadrícula. Las palabras pueden estar en horizontal, vertical o diagonal.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🖱️ Controles:</h3>
                <p>Haz clic y arrastra desde la primera letra hasta la última letra de cada palabra para seleccionarla.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">⭐ Puntuación:</h3>
                <p>Gana 100 puntos por palabra encontrada, más puntos bonus por el tiempo restante.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📚 Aprendizaje:</h3>
                <p>Cada palabra viene con su traducción al español para reforzar tu vocabulario.</p>
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
                Juegos Recientes
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
            <h3 className="font-bold text-yellow-800 mb-3">💡 Consejos para encontrar más palabras:</h3>
            <ul className="text-yellow-700 space-y-2">
              <li>• <strong>Busca sistemáticamente:</strong> Revisa fila por fila y columna por columna.</li>
              <li>• <strong>Piensa en diagonales:</strong> Muchas palabras están ocultas en diagonal.</li>
              <li>• <strong>Lee al revés:</strong> Las palabras pueden estar escritas de derecha a izquierda.</li>
              <li>• <strong>Usa las traducciones:</strong> Si conoces el significado en español, será más fácil encontrar la palabra en inglés.</li>
              <li>• <strong>Busca letras poco comunes:</strong> Letras como Q, X, Z pueden ser buenos puntos de partida.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
