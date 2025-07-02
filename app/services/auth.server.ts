import { createCookieSessionStorage, redirect } from "@remix-run/node";
import axios from "./axios.server";

let storage = createCookieSessionStorage({
  cookie: {
    name: "abc_session",
    secure: process.env.NODE_ENV === "production",
    //secrets: [process.env.SESSION_SECRET],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

let storageSidebar = createCookieSessionStorage({
  cookie: {
    name: "sidebar",
    secure: process.env.NODE_ENV === "production",
    //secrets: [process.env.SESSION_SECRET],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function login({ request, email, password }: any) {
  let response;
  let session = await storage.getSession(request.headers.get("Cookie"));
  let sessionSidebar = await storageSidebar.getSession(
    request.headers.get("Cookie"),
  );

  try {
    response = await axios.post("/api/login", { email, password });
  } catch (error: any) {
    if (error.response !== undefined) {
      if (error.response.status === 400) {
        if (error.response.data.errors.password !== undefined) {
          if (error.response.data.errors.password[0].includes("8")) {
            return {
              errors: "La contraseña debe tener mínimo 8 caracteres",
            };
          }
        }
      }
    }
    return { errors: "Credenciales Inválidas" };
  }

  session.set("userToken", response.data.token);
  sessionSidebar.set("sidebar", response.data.sidebar);

  return {
    redirector: redirect("/dashboard", {
      // @ts-ignore
      headers: {
        "Set-Cookie": [
          await storage.commitSession(session),
          await storageSidebar.commitSession(sessionSidebar),
        ],
      },
    }),
  };
}

export async function logout({ request }: any) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  const sessionSidebar = await storageSidebar.getSession(
    request.headers.get("Cookie"),
  );

  let token = session.get("userToken");

  await axios.post(
    "/api/logout",
    {},
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  );

  return redirect("/", {
    // @ts-ignore
    headers: {
      "Set-Cookie": [
        await storage.destroySession(session),
        await storageSidebar.destroySession(sessionSidebar),
      ],
    },
  });
}

export async function currentToken({ request }: any) {
  const session = await storage.getSession(request.headers.get("Cookie"));

  return session.get("userToken");
}

export async function user({ request }: any) {
  let response;
  let token = await currentToken({ request });

  try {
    response = await axios.get("/api/user", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
  } catch (error: any) {
    console.log(error.response);
    return null;
  }

  return response.data;
}

export async function getSidebar({ request }: any) {
  const sessionSidebar = await storageSidebar.getSession(
    request.headers.get("Cookie"),
  );

  return sessionSidebar.get("sidebar");
}

export async function requireGuest({ request }: any) {
  if (await user({ request })) {
    throw redirect("/dashboard");
  }
}

export async function requireAuth({ request }: any) {
  let token = await currentToken({ request });

  if (!token) {
    throw redirect("/");
  }
}

export async function requireAdmin({ request }: any) {
  let token = await currentToken({ request });
  let u = await user({ request });

  if (!token) {
    throw redirect("/");
  } else if (u.user.role_id !== 1 && u.user.role_id === 2) {
    throw redirect("/students");
  } else if (u.user.role_id !== 1 && u.user.role_id === 3) {
    throw redirect("/student");
  }
}

export async function requireTeacher({ request }: any) {
  let token = await currentToken({ request });
  let u = await user({ request });

  if (!token) {
    throw redirect("/");
  } else if (u.user.role_id !== 2 && u.user.role_id === 3) {
    throw redirect("/student");
  }
}
