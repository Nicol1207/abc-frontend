// app/routes/api.admin.edit_teacher.$id.ts
import axios from '~/services/axios.server';
import { currentToken } from '~/services/auth.server';
import { ActionFunctionArgs } from '@remix-run/node';

export async function action({ request, params }: ActionFunctionArgs) {
    let response: any = {};
    const { id } = params;
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password'); // Optional password field

    if (!id) {
        return {
            success: "error",
            toast: {
                title: "Error",
                description: "El ID del profesor es obligatorio.",
            }
        }
    }

    if (!name) {
        return {
            success: "error",
            toast: {
                title: "Error",
                description: "El nombre es obligatorio.",
            }
        }
    }

    if (!email) {
        return {
            success: "error",
            toast: {
                title: "Error",
                description: "El correo es obligatorio.",
            }
        }
    }

    const data: any = {
        id,
        name,
        email,
    };

    if (password) {
        data.password = password;
    }

    try {
        const token = await currentToken({ request });
        response = await axios.put(`/api/teachers`, JSON.stringify(data), {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json', // Ensure Content-Type is set
            }
        });
        return {
            success: "success",
            toast: {
                title: "Éxito",
                description: "Profesor editado correctamente.",
            },
            teacher: response.data,
        }
    } catch (error: any) {
        console.error("Error al editar el profesor:", error);
        return {
            success: "error",
            toast: {
                title: "Error",
                description: error.response?.data?.message || "Error al editar el profesor.",
            }
        }
    }
}