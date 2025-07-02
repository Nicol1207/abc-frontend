import axios from '~/services/axios.server';
import { currentToken } from '~/services/auth.server';
import { ActionFunctionArgs } from '@remix-run/node';

export async function action({ request, params }: ActionFunctionArgs) {
    let response: any = {};
    const { id } = params;
    const formData = await request.formData();
    const name = formData.get('name');
    const document_number = formData.get('document_number');

    if (!id) {
        return {
            success: "error",
            toast: {
                title: "Error",
                description: "El ID del estudiante es obligatorio.",
            }
        }
    }

    if (!name) {
        return {
            success: "error",
            toast: {
                title: "Error",
                description: "El nombre y apellido es obligatorio.",
            }
        }
    }

    if (!document_number) {
        return {
            success: "error",
            toast: {
                title: "Error",
                description: "El número de documento es obligatorio.",
            }
        }
    }

    const data = {
        name,
        document_number,
    };

    try {
        const token = await currentToken({ request });
        response = await axios.put(`/api/students/${id}`, JSON.stringify(data), {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return {
            success: "success",
            toast: {
                title: "Éxito",
                description: "Estudiante editado correctamente.",
            },
            student: response.data,
        }
    } catch (error: any) {
        console.error("Error al editar el estudiante:", error);
        return {
            success: "error",
            toast: {
                title: "Error",
                description: error.response?.data?.message || "Error al editar el estudiante.",
            }
        }
    }
}
