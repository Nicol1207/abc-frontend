import axios from "~/services/axios.server";
import { currentToken } from "~/services/auth.server";
import { ActionFunctionArgs, data } from "@remix-run/node";

export async function action({request}: ActionFunctionArgs) {
  const formData = await request.formData();
  const id = formData.get("id");

  if (!id) {
    return {
      success: "error",
      toast: {
        title: "Error al eliminar",
        description: "El ID del contenido es requerido.",
      },
    };
  }

  try {
    const token = await currentToken({request});
    const response = await axios.delete(`/api/contents/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
        success: "success",
        toast: {
            title: "Contenido eliminado",
            description: "El contenido ha sido eliminado correctamente.",
        },
        data: response.data,
    };
  } catch (error: any) {
    console.error("Error deleting content:", error);
    return { 
        success: "error",
        toast: {
            title: "Error al eliminar",
            description: "No se pudo eliminar el contenido. Inténtalo de nuevo más tarde.",
        }
     };
  }
}