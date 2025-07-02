import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
      routes(defineRoutes) {
        return defineRoutes((route) => {
          // Auth Routes
          route("/api/logout", "routes/api/auth/logout.server.ts");
          route("/api/admin/create_teacher", "routes/api/admin/create_teacher.server.ts");
          route("/api/admin/create_course", "routes/api/admin/create_course.server.ts");
          route("/api/admin/delete_course/:id", "routes/api/admin/delete_course.server.ts");
          route("/api/teacher/create_student", "routes/api/teacher/create_student.server.ts");
          route("/api/teacher/edit_student/:id", "routes/api/teacher/edit_student.server.ts");
          route("/api/teacher/delete_student/:id", "routes/api/teacher/delete_student.server.ts");
          route("/api/teacher/create_theme", "routes/api/teacher/create_theme.server.ts");
          route("/api/teacher/create_content/:id", "routes/api/teacher/crear_contenido.server.ts");
          route("/api/admin/edit_teacher/:id", "routes/api/admin/edit_teacher.server.ts");
          route("/api/admin/delete_teacher/:id", "routes/api/admin/delete_teacher.server.ts");

          // Frontend Routes
          route("/temas/:id", "routes/temas.tsx");
          route("/images/:theme", "routes/images/[theme].tsx");
          route("/videos/:theme", "routes/videos/[theme].tsx");
          route("/texts/:theme", "routes/texts/[theme].tsx");
        });
      },
    }),
    tsconfigPaths(),
  ],
});
