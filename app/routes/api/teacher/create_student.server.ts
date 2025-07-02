import axios from '~/services/axios.server';
import { currentToken } from '~/services/auth.server';
import { ActionFunctionArgs } from '@remix-run/node';

export async function action({ request }: ActionFunctionArgs) {
    let response: any = {};
    const formData = await request.formData();
    const first_name = formData.get('first_name');
    const last_name = formData.get('last_name');
    const document_number = formData.get('document_number');

    if (!first_name) {
        return {
            success: "error",
            toast: {
                title: "Error",
                description: "El nombre es obligatorio.",
            }
        }
    }

    if (!last_name) {
        return {
            success: "error",
            toast: {
                title: "Error",
                description: "El apellido es obligatorio.",
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
        first_name,
        last_name,
        document_number,
    };

    try {
        const token = await currentToken({ request });
        response = await axios.post('/api/students', JSON.stringify(data), {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return {
            success: "success",
            toast: {
                title: "Éxito",
                description: "Estudiante creado correctamente.",
            },
            student: response.data,
        }
    } catch (error: any) {
        console.error("Error al crear el estudiante:", error);
        return {
            success: "error",
            toast: {
                title: "Error",
                description: error.response?.data?.message || "Error al crear el estudiante.",
            }
        }
    }
}