import axios from "~/services/axios.server";
import { currentToken } from "~/services/auth.server";
import { ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
    const response: any = {};
    const formData = await request.formData();
    const contentId = formData.get("contentId");

    if (!contentId) {
        throw new Error("Content ID is required");
    }

    try {
        const token = await currentToken({ request });
        const response = await axios.get(`/api/student/content/view/${contentId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error: any) {
        console.error("Error fetching content:", error);
        throw new Error("Failed to fetch content");
    }
}