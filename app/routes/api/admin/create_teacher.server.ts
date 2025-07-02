import axios from '~/services/axios.server';
import { ActionFunctionArgs } from '@remix-run/node';
import { currentToken } from '~/services/auth.server';

export async function action({request}: ActionFunctionArgs) {
    let response: any = {};
    const formData = await request.formData();
    const firstName = formData.get('first_name');
    const lastName = formData.get('last_name');
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');

    const data = {
        name: name,
        email: email,
        password: password,
    };

    try {
        const token = await currentToken({request});
        response = await axios.post('/api/teachers', JSON.stringify(data), {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return {
            success: "success",
            toast: {
                title: "Profesor creado exitosamente",
                description: "El profesor ha sido agregado al sistema.",
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