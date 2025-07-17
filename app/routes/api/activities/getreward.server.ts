import axios from "~/services/axios.server";
import { currentToken } from "~/services/auth.server";
import { ActionFunctionArgs } from "@remix-run/node";

export async function action({request, params}: ActionFunctionArgs) {
    let response: any = {}
    const {id} = params;
    
    if (!id) {
        return {
            success: "error",
            toast: {
                title: "Error",
                description: "No se ha proporcionado un ID de actividad.",
            }
        }
    }

    try {
        const token = await currentToken({request});
        response = await axios.post(`/api/student/get/reward/${id}`, "", {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return {
            success: "success",
            toast: {
                title: "Recompensa obtenida",
                description: response.data.message || "Has obtenido tu recompensa con éxito.",
            },
        };
    } catch (error: any) {
        console.log(error.response);
        return {
            success: "error",
            toast: {
                title: "Error",
                description: error.response?.data?.message || "Ocurrió un error al obtener la recompensa.",
            }
        }
    }
}