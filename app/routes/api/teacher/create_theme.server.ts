import axios from '~/services/axios.server';
import { currentToken } from '~/services/auth.server';
import { ActionFunctionArgs } from '@remix-run/node';

export async function action({ request }: ActionFunctionArgs) {
    let response: any = {};
    const formData = await request.formData();
    const titulo = formData.get('titulo');
    const numero = formData.get('numero');
    const color = formData.get('color');
    const descripcion = formData.get('descripcion');

    if (!titulo) {
        return {
            success: "error",
            toast: {
                title: "Error",
                description: "El título es obligatorio.",
            }
        }
    }

    if (!numero) {
        return {
            success: "error",
            toast: {
                title: "Error",
                description: "El número de tema es obligatorio.",
            }
        }
    }

    if (!color) {
        return {
            success: "error",
            toast: {
                title: "Error",
                description: "El color es obligatorio.",
            }
        }
    }

    if (!descripcion) {
        return {
            success: "error",
            toast: {
                title: "Error",
                description: "La descripción es obligatoria.",
            }
        }
    }

    const data = {
        titulo,
        numero,
        color,
        descripcion,
    };

    try {
        const token = await currentToken({ request });
        response = await axios.post('/api/themes', JSON.stringify(data), {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return {
            success: "success",
            toast: {
                title: "Éxito",
                description: "Tema creado correctamente.",
            },
            theme: response.data,
        }
    } catch (error: any) {
        console.error("Error al crear el tema:", error);
        return {
            success: "error",
            toast: {
                title: "Error",
                description: error.response?.data?.message || "Error al crear el tema.",
            }
        }
    }
}
