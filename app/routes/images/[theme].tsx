import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AppLayout from "~/layouts/AppLayout";
import { getSidebar, requireAuth, user } from "~/services/auth.server";
import { useState } from "react";
// Importa Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/navigation";
import { Grid, Navigation } from "swiper/modules";
import { Separator } from "~/components/ui/separator";

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
  // Más imágenes para probar el paginado
  const images = [
    { src: "https://source.unsplash.com/random/400x300?sig=1", alt: "Imagen 1" },
    { src: "https://source.unsplash.com/random/400x300?sig=2", alt: "Imagen 2" },
    { src: "https://source.unsplash.com/random/400x300?sig=3", alt: "Imagen 3" },
    { src: "https://source.unsplash.com/random/400x300?sig=4", alt: "Imagen 4" },
    { src: "https://source.unsplash.com/random/400x300?sig=5", alt: "Imagen 5" },
    { src: "https://source.unsplash.com/random/400x300?sig=6", alt: "Imagen 6" },
    { src: "https://source.unsplash.com/random/400x300?sig=7", alt: "Imagen 7" },
    { src: "https://source.unsplash.com/random/400x300?sig=8", alt: "Imagen 8" },
    { src: "https://source.unsplash.com/random/400x300?sig=9", alt: "Imagen 9" },
    { src: "https://source.unsplash.com/random/400x300?sig=10", alt: "Imagen 10" },
    { src: "https://source.unsplash.com/random/400x300?sig=11", alt: "Imagen 11" },
    { src: "https://source.unsplash.com/random/400x300?sig=12", alt: "Imagen 12" },
    { src: "https://source.unsplash.com/random/400x300?sig=13", alt: "Imagen 13" },
    { src: "https://source.unsplash.com/random/400x300?sig=14", alt: "Imagen 14" },
    { src: "https://source.unsplash.com/random/400x300?sig=15", alt: "Imagen 15" },
    { src: "https://source.unsplash.com/random/400x300?sig=16", alt: "Imagen 16" },
    { src: "https://source.unsplash.com/random/400x300?sig=17", alt: "Imagen 17" },
    { src: "https://source.unsplash.com/random/400x300?sig=18", alt: "Imagen 18" },
  ];

  const [openImg, setOpenImg] = useState<{ src: string; alt: string } | null>(null);

  return (
    <AppLayout
      sidebarOptions={loaderData.sidebar}
      userData={loaderData.user}
    >
     <div className="w-full max-w-6xl mx-auto py-8">
        <div className="flex flex-col mb-4">
          <h1 className="text-4xl font-bold text-primary">Galería de Imágenes</h1>
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
              {images.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <div className="overflow-hidden rounded-xl shadow-lg bg-white">
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-64 object-cover transition-transform duration-300 hover:scale-110 cursor-zoom-in"
                      onClick={() => setOpenImg(img)}
                      onError={e => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.style.display = "none";
                        const parent = e.currentTarget.parentElement;
                        if (parent && !parent.querySelector(".img-error-msg")) {
                          const msg = document.createElement("div");
                          msg.className = "img-error-msg flex items-center justify-center h-64 text-center text-red-600 font-bold";
                          msg.textContent = "Imagen no encontrada";
                          parent.appendChild(msg);
                        }
                      }}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
        {/* Modal de imagen a pantalla completa */}
        {openImg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <button
              className="absolute top-6 right-8 bg-white/80 hover:bg-white text-black font-bold rounded-full px-4 py-2 text-lg shadow-lg transition"
              onClick={() => setOpenImg(null)}
              aria-label="Cerrar"
            >
              ✕
            </button>
            <img
              src={openImg.src}
              alt={openImg.alt}
              className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl border-4 border-white"
              onError={e => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent && !parent.querySelector(".img-error-msg")) {
                  const msg = document.createElement("div");
                  msg.className = "img-error-msg flex items-center justify-center h-64 text-center text-red-600 font-bold";
                  msg.textContent = "Imagen no encontrada";
                  parent.appendChild(msg);
                }
              }}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
