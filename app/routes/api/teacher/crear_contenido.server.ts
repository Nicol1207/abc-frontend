import axios from '~/services/axios.server';
import { currentToken } from '~/services/auth.server';
import { ActionFunctionArgs } from '@remix-run/node';
import { Form } from '@remix-run/react';

export async function action({ request, params }: ActionFunctionArgs) {
    let response: any = {};
    const { id } = params;
    const formData = await request.formData();
    const contenido = formData.get('contenido') as string;
    const file = formData.get('file') as File | null;
    const tipo = formData.get('id_tipocontenido_fk') as string;
    const tema = formData.get('id_tema_fk') as string;
    const tipoCarga = formData.get('tipoCarga') as string;
    const link = formData.get('link') as string | null;

    const payload = new FormData();
    payload.append('contenido', contenido);
    payload.append('id_tipocontenido_fk', tipo);
    payload.append('id_tema_fk', tema);
    payload.append('tipoCarga', tipoCarga);
    if (tipoCarga === 'archivo' && file) {
        payload.append('file', file);
    }
    if (tipoCarga === 'link' && link) {
        payload.append('link', link);
    }

    try {
        const token = await currentToken({ request });
        response = await axios.post('/api/contents', payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return {
            success: "success",
            toast: {
                title: "Éxito",
                description: "Contenido creado correctamente.",
            },
            content: response.data,
        }
    } catch (error: any) {
        console.error("Error al crear el contenido:", error.response.data);
        return {
            success: "error",
            toast: {
                title: "Error",
                description: error.response?.data?.message || "Error al crear el contenido.",
            }
        }
    }
}
