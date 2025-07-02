// app/routes/api.admin.delete_teacher.$id.ts
import axios from '~/services/axios.server';
import { currentToken } from '~/services/auth.server';
import { ActionFunctionArgs } from '@remix-run/node';

export async function action({ request, params }: ActionFunctionArgs) {
    const { id } = params; // The ID of the teacher to delete

    if (!id) {
        return {
            success: "error",
            toast: {
                title: "Error",
                description: "El ID del profesor es obligatorio para eliminar.",
            }
        };
    }

    try {
        const token = await currentToken({ request });
        // Make a DELETE request to your backend API for teachers
        // Based on AdminController.php, the route expects a teacher ID in the URL.
        // The Laravel backend's delete_teacher method expects 'teacher_id' in the request body,
        // but it's more RESTful to send it in the URL for a DELETE operation.
        // We'll adapt the request to match the expected Laravel route by passing it in the URL.
        const response = await axios.delete(`/api/teachers/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            // It seems AdminController expects a 'teacher_id' in the request body for validation,
            // even though the route parameter already has the ID.
            // Sending it in the body for validation if required by the backend.
            data: { teacher_id: id }
        });

        return {
            success: "success",
            toast: {
                title: "Éxito",
                description: "Profesor eliminado correctamente.",
            },
            // You might want to return some data from the backend if available
            teacher: response.data,
        };
    } catch (error: any) {
        console.error("Error al eliminar el profesor:", error);
        return {
            success: "error",
            toast: {
                title: "Error",
                description: error.response?.data?.message || "Error al eliminar el profesor.",
            }
        };
    }
}