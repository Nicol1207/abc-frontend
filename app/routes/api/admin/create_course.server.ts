import axios from '~/services/axios.server';
import { ActionFunctionArgs } from '@remix-run/node';
import { currentToken } from '~/services/auth.server';

export async function action({request}: ActionFunctionArgs) {
    let response: any = {};
    const formData = await request.formData();
    const teacher_id = formData.get('teacher_id');
    const section = formData.get('section');

    const data = {
        teacher: teacher_id,
        section: section,
    };

    try {
        const token = await currentToken({request});
        response = await axios.post('/api/courses', JSON.stringify(data), {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return {
            success: "success",
            toast: {
                title: "Curso creado exitosamente",
                description: "El curso ha sido agregado al sistema.",
            },
            data: response.data,
        };

    } catch (error: any) {
        console.error('Error creating teacher:', error);
        return {
            success: "error",
            toast: {
                title: "Error",
                description: error.response?.data?.message || "Ha ocurrido un error al crear el profesor.",
            },
        };
    }
}