import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AppLayout from "~/layouts/AppLayout";
import { getSidebar, requireAuth, user } from "~/services/auth.server";
import { Separator } from "~/components/ui/separator";
import { useState } from "react";
// Importa Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/navigation";
import { Grid, Navigation } from "swiper/modules";


export const meta: MetaFunction = () => {
  return [
    { title: "ABC English" },
    { name: "description", content: "Sistema educativo de inglés" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth({ request });

  const u = await user({request});
  const sidebar = await getSidebar({request});

  console.log(u)

  return {
    user: {
      ...u.user,
      role: u.role,
    },
    sidebar: sidebar,
  };
}

export default function Index() {
  const loaderData = useLoaderData<any>();
   const { temas, englishTeacher } = loaderData;

  // videos para reemplazar 
  const videos = [
    { src: "https://www.w3schools.com/html/mov_bbb.mp4", title: "Aprende los colores" },
    { src: "https://www.w3schools.com/html/movie.mp4", title: "Video 2" },
    { src: "https://www.w3schools.com/html/mov_bbb.mp4", title: "Video 3" },
    { src: "https://www.w3schools.com/html/movie.mp4", title: "Video 4" },
    { src: "https://www.w3schools.com/html/mov_bbb.mp4", title: "Video 5" },
    { src: "https://www.w3schools.com/html/movie.mp4", title: "Video 6" },
    { src: "https://www.w3schools.com/html/mov_bbb.mp4", title: "Video 7" },
    { src: "https://www.w3schools.com/html/movie.mp4", title: "Video 8" },
    { src: "https://www.w3schools.com/html/mov_bbb.mp4", title: "Video 9" },
    { src: "https://www.w3schools.com/html/movie.mp4", title: "Video 10" },
    { src: "https://www.w3schools.com/html/mov_bbb.mp4", title: "Video 11" },
    { src: "https://www.w3schools.com/html/movie.mp4", title: "Video 12" },
  ];

  const [openVideo, setOpenVideo] = useState<{ src: string; title: string } | null>(null);

  return (
    <AppLayout
      sidebarOptions={loaderData.sidebar}
      userData={loaderData.user}
    >
      <div className="w-full max-w-6xl mx-auto py-8">
        <div className="flex flex-col mb-4">
          <h1 className="text-4xl font-bold text-primary">Galería de Videos</h1>
           {`Tema # ${temas?.numero || " "}`}
        </div>
          <Separator className="my-4 bg-[#004d5a]" />
        <div className="flex-1 flex items-center">
          <div className="w-full rounded-2xl bg-gradient-to-br from-[#e0f7fa] via-[#b2dfdb] to-[#fffde7] p-3 shadow-lg">
            <Swiper
              modules={[Grid, Navigation]}
              grid={{ rows: 2, fill: "row" }}
              spaceBetween={24}
              slidesPerView={3}
              pagination={{ clickable: true }}
              navigation
              style={{ "--swiper-navigation-color": "#008999", "--swiper-pagination-color": "#008999" } as React.CSSProperties}
            >
              {videos.map((video, idx) => (
                <SwiperSlide key={idx}>
                  <div className="overflow-hidden rounded-xl shadow-lg bg-white flex flex-col items-center">
                    <video
                      src={video.src}
                      controls={false}
                      className="w-full h-64 object-cover cursor-pointer bg-black"
                      onClick={() => setOpenVideo(video)}
                      onError={e => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent && !parent.querySelector(".video-error-msg")) {
                          const msg = document.createElement("div");
                          msg.className = "video-error-msg flex items-center justify-center h-64 text-center text-red-600 font-bold";
                          msg.textContent = "Video no encontrado";
                          parent.appendChild(msg);
                        }
                      }}
                    />
                    <span className="mt-2 font-semibold">{video.title}</span>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
        {/* Modal de video a pantalla completa */}
        {openVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <button
              className="absolute top-6 right-8 bg-white/80 hover:bg-white text-black font-bold rounded-full px-4 py-2 text-lg shadow-lg transition"
              onClick={() => setOpenVideo(null)}
              aria-label="Cerrar"
            >
              ✕
            </button>
            <video
              src={openVideo.src}
              controls
              autoPlay
              className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl border-4 border-white bg-black"
              onError={e => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent && !parent.querySelector(".video-error-msg")) {
                  const msg = document.createElement("div");
                  msg.className = "video-error-msg flex items-center justify-center h-64 text-center text-red-600 font-bold";
                  msg.textContent = "Video no encontrado";
                  parent.appendChild(msg);
                }
              }}
            />
            <span className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/80 text-black px-4 py-2 rounded font-bold">
              {openVideo.title}
            </span>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
