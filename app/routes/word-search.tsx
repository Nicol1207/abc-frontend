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
import { getWordSearch } from "~/services/loaders/wordsearch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";

export const meta: MetaFunction = () => {
  return [
    { title: "Sopa de Letras - ABC English" },
    { name: "description", content: "Encuentra palabras en inglés en divertidas sopas de letras" },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuth({ request });

  const u = await user({ request });
  const sidebar = await getSidebar({ request });
  const wordSearchData = await getWordSearch({request, activityId: params.id});

  console.log("Word Search Data:", wordSearchData.data);

  return {
    user: {
      ...u.user,
      role: u.role,
    },
    sidebar: sidebar,
    wordSearchData: wordSearchData.data, // Asegúrate de que los datos de la sopa de letras se devuelvan aquí
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

  // Obtener palabras del loader y remapear claves
  const words = (loaderData.wordSearchData?.words || []).map((w: any) => ({
    english: w.english_word,
    spanish: w.spanish_word,
    emoji: w.emoji,
    category: ""
  }));

  const [showCongrats, setShowCongrats] = useState(false);
  const [lastScore, setLastScore] = useState(0);

  const handleComplete = (score: number) => {
    setLastScore(score);
    setShowCongrats(true);
  };

  // Renderizar directamente la sopa de letras
  return (
    <AppLayout
      sidebarOptions={loaderData.sidebar}
      userData={loaderData.user}
    >
      <div className="w-full max-w-4xl mx-auto py-8">
        <h1 className="text-4xl font-bold text-primary mb-6 flex items-center gap-3">
          <Search className="w-10 h-10" />
          Sopa de Letras
        </h1>
        <Separator className="my-4 bg-[#004d5a]" />
        <WordSearchGame
          level="easy"
          category=""
          words={words}
          onComplete={handleComplete}
        />
      </div>
      <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>🎉 ¡Felicidades!</DialogTitle>
          </DialogHeader>
          <div className="text-center my-4">
            <p className="text-lg font-semibold mb-2">¡Has completado la sopa de letras!</p>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={() => setShowCongrats(false)}>
              Obtener recompensa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
