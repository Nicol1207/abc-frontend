import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AppLayout from "~/layouts/AppLayout";
import { getSidebar, requireAuth, user } from "~/services/auth.server";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { AdvancedMemoryGame } from "~/components/AdvancedMemoryGame";
import { Trophy, Star, Lock, Home } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "ABC Media" },
    { name: "description", content: "Desafía tu memoria con diferentes niveles de dificultad" },
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

type Level = 'easy' | 'medium' | 'hard' | 'expert';

interface LevelProgress {
  level: Level;
  completed: boolean;
  bestScore: number;
  attempts: number;
}

export default function MemoryLevels() {
  const loaderData = useLoaderData<any>();
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [progress, setProgress] = useState<LevelProgress[]>([
    { level: 'easy', completed: false, bestScore: 0, attempts: 0 },
    { level: 'medium', completed: false, bestScore: 0, attempts: 0 },
    { level: 'hard', completed: false, bestScore: 0, attempts: 0 },
    { level: 'expert', completed: false, bestScore: 0, attempts: 0 },
  ]);

  const levelInfo = {
    easy: {
      title: 'Fácil',
      description: '4 parejas • Animales y hogar • 2 minutos',
      color: 'bg-green-500',
      icon: '🌟',
      minScore: 500,
    },
    medium: {
      title: 'Medio',
      description: '6 parejas • Animales, hogar y comida • 3 minutos',
      color: 'bg-yellow-500',
      icon: '⭐',
      minScore: 750,
    },
    hard: {
      title: 'Difícil',
      description: '8 parejas • Múltiples categorías • 4 minutos',
      color: 'bg-red-500',
      icon: '🏆',
      minScore: 1000,
    },
    expert: {
      title: 'Experto',
      description: '10 parejas • Todas las categorías • 5 minutos',
      color: 'bg-purple-500',
      icon: '👑',
      minScore: 1250,
    },
  };

  const handleLevelComplete = (level: Level, score: number) => {
    setProgress(prev => prev.map(p => {
      if (p.level === level) {
        return {
          ...p,
          completed: score >= levelInfo[level].minScore,
          bestScore: Math.max(p.bestScore, score),
          attempts: p.attempts + 1,
        };
      }
      return p;
    }));

    // Volver al selector de niveles después de 3 segundos
    setTimeout(() => {
      setSelectedLevel(null);
    }, 3000);
  };

  const isLevelUnlocked = (level: Level): boolean => {
    if (level === 'easy') return true;
    if (level === 'medium') {
      const easyProgress = progress.find(p => p.level === 'easy');
      return easyProgress?.completed || false;
    }
    if (level === 'hard') {
      const mediumProgress = progress.find(p => p.level === 'medium');
      return mediumProgress?.completed || false;
    }
    if (level === 'expert') {
      const hardProgress = progress.find(p => p.level === 'hard');
      return hardProgress?.completed || false;
    }
    return false;
  };

  const getStarRating = (score: number, level: Level): number => {
    const minScore = levelInfo[level].minScore;
    if (score < minScore) return 0;
    if (score < minScore * 1.5) return 1;
    if (score < minScore * 2) return 2;
    return 3;
  };

  if (selectedLevel) {
    return (
      <AppLayout
        sidebarOptions={loaderData.sidebar}
        userData={loaderData.user}
      >
        <div className="w-full max-w-6xl mx-auto py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              {levelInfo[selectedLevel].icon} Nivel {levelInfo[selectedLevel].title}
            </h1>
            <Button
              onClick={() => setSelectedLevel(null)}
              variant="outline"
              className="flex items-center gap-2"
            >
              ← Volver a niveles
            </Button>
          </div>
          
          <AdvancedMemoryGame
            level={selectedLevel}
            onComplete={(score) => handleLevelComplete(selectedLevel, score)}
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
            <h1 className="text-4xl font-bold text-primary">🧠 Niveles de Memoria</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {progress.filter(p => p.completed).length}
              </div>
              <div className="text-sm text-blue-800">Niveles completados</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {progress.reduce((sum, p) => sum + p.bestScore, 0)}
              </div>
              <div className="text-sm text-green-800">Puntuación total</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {progress.reduce((sum, p) => sum + p.attempts, 0)}
              </div>
              <div className="text-sm text-purple-800">Intentos totales</div>
            </CardContent>
          </Card>
        </div>

        {/* Descripción del juego */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-3">📖 Cómo jugar:</h2>
            <div className="grid md:grid-cols-2 gap-4 text-blue-700">
              <div>
                <h3 className="font-semibold mb-2">🎯 Objetivo:</h3>
                <p>Encuentra todas las parejas de palabras en inglés y español antes de que se acabe el tiempo.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">⭐ Puntuación:</h3>
                <p>Gana puntos por velocidad y precisión. Menos movimientos = más puntos.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🔓 Desbloqueo:</h3>
                <p>Completa cada nivel para desbloquear el siguiente desafío.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🏆 Recompensas:</h3>
                <p>Consigue hasta 3 estrellas según tu puntuación final.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selector de niveles */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(['easy', 'medium', 'hard', 'expert'] as Level[]).map((level) => {
            const info = levelInfo[level];
            const levelProgress = progress.find(p => p.level === level);
            const isUnlocked = isLevelUnlocked(level);
            const stars = levelProgress ? getStarRating(levelProgress.bestScore, level) : 0;

            return (
              <Card
                key={level}
                className={`
                  transition-all duration-200 hover:shadow-lg cursor-pointer
                  ${isUnlocked ? 'hover:scale-105' : 'opacity-60 cursor-not-allowed'}
                  ${levelProgress?.completed ? 'ring-2 ring-yellow-400' : ''}
                `}
                onClick={() => isUnlocked && setSelectedLevel(level)}
              >
                <CardHeader className="text-center pb-2">
                  <div className="flex items-center justify-center mb-2">
                    <div className="text-4xl">{info.icon}</div>
                    {!isUnlocked && <Lock className="w-6 h-6 text-gray-400 ml-2" />}
                  </div>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <span>{info.title}</span>
                    {levelProgress?.completed && (
                      <Badge className="bg-green-100 text-green-800">
                        Completado
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">{info.description}</p>
                  
                  {/* Estrellas */}
                  {levelProgress && levelProgress.attempts > 0 && (
                    <div className="flex justify-center mb-3">
                      {[1, 2, 3].map(starNum => (
                        <Star
                          key={starNum}
                          className={`w-5 h-5 ${
                            starNum <= stars 
                              ? 'text-yellow-500 fill-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Estadísticas del nivel */}
                  {levelProgress && levelProgress.attempts > 0 && (
                    <div className="text-sm text-gray-600 mb-4">
                      <div>Mejor puntuación: <strong>{levelProgress.bestScore}</strong></div>
                      <div>Intentos: <strong>{levelProgress.attempts}</strong></div>
                    </div>
                  )}

                  <Button
                    className={`w-full ${info.color} hover:opacity-90 text-white`}
                    disabled={!isUnlocked}
                  >
                    {!isUnlocked ? (
                      <span className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Bloqueado
                      </span>
                    ) : levelProgress && levelProgress.attempts > 0 ? (
                      'Jugar de nuevo'
                    ) : (
                      'Comenzar'
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Consejos */}
        <Card className="mt-8 bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-yellow-800 mb-3">💡 Consejos para mejorar:</h3>
            <ul className="text-yellow-700 space-y-2">
              <li>• <strong>Observa bien:</strong> Trata de recordar dónde están las cartas que ya has visto.</li>
              <li>• <strong>Sé estratégico:</strong> No hagas clic al azar, piensa antes de voltear cada carta.</li>
              <li>• <strong>Practica:</strong> Mientras más juegues, mejor será tu memoria visual.</li>
              <li>• <strong>Mantén la calma:</strong> No te apresures, el tiempo está de tu lado si juegas inteligentemente.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
