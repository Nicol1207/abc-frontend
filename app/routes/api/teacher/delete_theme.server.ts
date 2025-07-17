import axios from "~/services/axios.server";
import { currentToken } from "~/services/auth.server";
import { ActionFunctionArgs } from "@remix-run/node";

export async function action({request, params}: ActionFunctionArgs) {
  let response: any = {};
  const {id} = params;
  try {
    const token = await currentToken({request});
    response = await axios.delete(`/api/teacher/themes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return {
        success: "success",
        toast: {
            title: "Tema eliminado correctamente",
            description: "El tema ha sido eliminado exitosamente.",
        }
    }
  } catch (error: any) {
    console.error("Error al eliminar el tema:", error.response);
    return {
        success: "error",
        toast: {
            title: "Error al eliminar el tema",
            description: error.message || "Ocurrió un error inesperado al eliminar el tema.",
        }
    }
  }
}
