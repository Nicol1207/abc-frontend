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
import { getCrossword } from "~/services/loaders/crossword";
import { useParams } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Crucigrama - ABC English" },
    { name: "description", content: "Resuelve crucigramas en inglés y practica tu vocabulario" },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuth({ request });

  const u = await user({ request });
  const sidebar = await getSidebar({ request });
  const crosswordData = await getCrossword({ request, activityId: params.id });

  // Mapear palabras del backend a formato esperado por CrosswordGame
  let words: any[] = [];
  let level: Level = 'easy';
  if (crosswordData && crosswordData.words) {
    words = crosswordData.words.map((w: any) => ({
      english: w.english_word,
      spanish: w.spanish_word,
      emoji: w.emoji,
    }));
    // Si el backend provee nivel, puedes mapearlo aquí
    // level = crosswordData.level || 'easy';
  }

  return {
    user: {
      ...u.user,
      role: u.role,
    },
    sidebar: sidebar,
    crossword: {
      words,
      level,
      category: '',
    },
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
  const {id} = useParams<any>();

  // Renderiza solo el crucigrama con los datos del loader
  return (
    <AppLayout
      sidebarOptions={loaderData.sidebar}
      userData={loaderData.user}
    >
      <div className="w-full max-w-7xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Grid className="w-8 h-8" />
            Crucigrama
          </h1>
          <Button
            asChild
            variant="outline"
            className="flex items-center gap-2"
          >
            <a href="/activities">← Volver a actividades</a>
          </Button>
        </div>
        <CrosswordGame
          level={loaderData.crossword.level}
          category={loaderData.crossword.category}
          words={loaderData.crossword.words}
          onComplete={() => {}}
          activityId={parseInt(id || "0")} // Asegúrate de pasar el ID de la actividad
        />
      </div>
    </AppLayout>
  );
}
