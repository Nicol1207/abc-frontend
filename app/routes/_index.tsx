import type React from "react";
import { Form, useActionData } from "@remix-run/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { Lamp, Star } from "lucide-react";
import { ActionFunctionArgs, LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { login, requireGuest } from "~/services/auth.server";

export async function loader({request}: LoaderFunctionArgs) {
  await requireGuest({request});

  return null;
}

export async function action({request}: ActionFunctionArgs) {
  
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  let {errors, redirector} = await login({request, email, password});

  console.log("Login Action", {email, password, errors, redirector});

  return errors || redirector;
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const errors = useActionData<any>();

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#008999]/20">
      <Card className="w-full max-w-md mx-auto bg-white shadow-lg">
        <CardContent className="p-8">

          {/* <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-28 bg-teal-600 rounded-t-full relative flex flex-col items-center justify-center">
                <div className="absolute bottom-0 w-32 h-6 bg-teal-700 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    COLEGIO MUNICIPAL
                  </span>
                </div>

                <div className="bg-white w-16 h-20 rounded-t-full flex flex-col items-center justify-center mb-2">
                  <div className="flex items-center space-x-1 mb-1">
                    <Lamp className="w-4 h-4 text-gray-700" />
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  </div>
                  <div className="text-xs text-center text-gray-600 leading-tight">
                    <div>MANUEL CAÑADAS REALES</div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          {/* Login Form */}
          <Form method="POST" autoComplete="off" className="space-y-4">
            

            <div>
              <img src="/image.png" className="w-32 h-32 object-cover mx-auto" />
            </div>

            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-teal-600">Iniciar Sesión</h1>
            </div>

            <div>
              <Input
                placeholder="Correo Electrónico"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 border-2 border-teal-300 rounded-lg focus:border-teal-500 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="Contraseña"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 border-2 border-teal-300 rounded-lg focus:border-teal-500 focus:ring-teal-500"
                required
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg"
              >
                Iniciar Sesión
              </Button>
            </div>
            {errors && (
              <div className="text-red-500 text-sm mt-2 text-center">
                {errors.message || "Error al iniciar sesión. Por favor, inténtelo de nuevo."}
              </div>
            )}
          </Form>

        </CardContent>
      </Card>
    </div>
  );
}
