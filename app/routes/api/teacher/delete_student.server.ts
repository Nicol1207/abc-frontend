import axios from '~/services/axios.server';
import { currentToken } from '~/services/auth.server';
import { ActionFunctionArgs } from '@remix-run/node';

export async function action({ request, params }: ActionFunctionArgs) {
    let response: any = {};
    const { id } = params;
    const formData = await request.formData();

    if (!id) {
        return {
            success: "error",
            toast: {
                title: "Error",
                description: "El ID del estudiante es obligatorio.",
            }
        }
    }

    try {
        const token = await currentToken({ request });
        response = await axios.delete(`/api/students/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return {
            success: "success",
            toast: {
                title: "Éxito",
                description: "Estudiante eliminado correctamente.",
            }
        }
    } catch (error: any) {
        console.error("Error al eliminar el estudiante:", error);
        return {
            success: "error",
            toast: {
                title: "Error",
                description: error.response?.data?.message || "Error al eliminar el estudiante.",
            }
        }
    }
}
