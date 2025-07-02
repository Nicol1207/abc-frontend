import axios from '~/services/axios.server';
import { ActionFunctionArgs } from '@remix-run/node';
import { currentToken } from '~/services/auth.server';

export async function action({request, params}: ActionFunctionArgs) {
    const {id} = params;
    let response: any = {};

    try {
        const token = await currentToken({request});
        response = await axios.delete(`/api/courses/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return {
            success: "success",
            toast: {
                title: "Curso eliminado exitosamente",
                description: "El curso ha sido eliminado.",
            },
            data: response.data,
        };

    } catch (error: any) {
        console.error('Error creating teacher:', error);
        return {
            success: "error",
            toast: {
                title: "Error",
                description: error.response?.data?.message || "Ha ocurrido un error al eliminar el curso.",
            },
        };
    }
}