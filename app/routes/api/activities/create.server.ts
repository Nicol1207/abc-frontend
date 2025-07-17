import axios from "~/services/axios.server";
import { currentToken } from "~/services/auth.server";
import { ActionFunctionArgs } from "@remix-run/node";

export async function action({request}: ActionFunctionArgs) {
    let response: any = {};
    const formData = await request.formData();
    const activityType = parseInt(formData.get("type") as string, 10);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const points = formData.get("points") as string;
    const words = formData.get("words") as string;
    const wordsParsed = JSON.parse(words);

    const data = {
        activityType,
        title,
        description,
        points: parseInt(points, 10),
        words: wordsParsed,
    }

    try {
        const token = await currentToken({ request });
        response = await axios.post("/api/teacher/activities", data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return {
            success: "success",
            toast: {
                title: "Actividad creada",
                description: "La actividad se ha creado correctamente.",
            },
        }
    } catch (error: any) {
        console.error("Error creating activity:", error.response);
        return {
            success: "error",
            toast: {
                title: "Error creando actividad",
                description: error.response.data.message || "Ha ocurrido un error al crear la actividad.",
            },
        };
    }
}