import axios from "~/services/axios.server";
import { currentToken } from "~/services/auth.server";
import { ActionFunctionArgs } from "@remix-run/node";
import { toast } from "~/hooks/use-toast";

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const studentId = formData.get("studentId");
    const cantidad = formData.get("cantidad");

    if (!studentId) {
        return {
            success: "error",
            toast: {
                title: "Error",
                description: "El ID del estudiante es requerido.",
            }
        };
    }

    if (!cantidad || isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
        return {
            success: "error",
            toast: {
                title: "Error",
                description: "La cantidad debe ser un número positivo.",
            }
        };
    }

    const data = {
        studentId: studentId,
        cantidad: Number(cantidad),
    };

    try {
        const token = await currentToken({ request });
        const response = await axios.post(
            `/api/teacher/asignar_recompensa/${studentId}`,
            JSON.stringify(data),
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return {
            success: "success",
            toast: {
                title: "Éxito",
                description: response.data.message || "Recompensa asignada correctamente.",
            }
        };
    } catch (error: any) {
        console.error("Error al asignar recompensa:", error);
        return {
            success: "error",
            toast: {
                title: "Error",
                description: error.response?.data?.message || "Ocurrió un error al asignar la recompensa.",
            }
        };
    }
}