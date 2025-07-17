import axios from "~/services/axios.server";
import { currentToken } from "../auth.server";

export async function getWordSearch({ request, activityId }: any) {
    let response: any = {};
    try {
        const token = await currentToken({ request });
        response = await axios.get(`/api/activities/wordsearch/${activityId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error: any) {
        console.error("Error fetching word search activity:", error);
        return {};
    }
}