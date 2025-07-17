import axios from "~/services/axios.server";
import { currentToken } from "../auth.server";

export async function getMemory({ request, activityId }: any) {
    let response: any = {};
    try {
        const token = await currentToken({ request });
        response = await axios.get(`/api/activities/memory/${activityId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error: any) {
        console.error("Error fetching word search:", error);
        return {};
    }
}