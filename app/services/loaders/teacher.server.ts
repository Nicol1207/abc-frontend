import axios from "~/services/axios.server";
import { currentToken } from "../auth.server";

export async function getStudents({request, teacher_id}: any) {
    let response: any = {};
    try {
        const token = await currentToken({request});
        response = await axios.get(`/api/teacher/${teacher_id}/students`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error: any) {
        console.error("Error fetching students:", error);
        return [];
    }
}

export async function getCourse({request, teacher_id}: any) {
    let response: any = {};
    try {
        const token = await currentToken({request});
        response = await axios.get(`/api/teacher/${teacher_id}/course`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error: any) {
        console.error("Error fetching course:", error);
        return {};
    }
}

export async function getLibrary({request}: any) {
    let response: any = {};
    try {
        const token = await currentToken({request});
        response = await axios.get(`/api/library`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error: any) {
        console.error("Error fetching library:", error);
        return [];
    }
}

export async function getContents({request, theme_id}: any) {
    let response: any = {};
    try {
        const token = await currentToken({request});
        response = await axios.get(`/api/student/contents/${theme_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error: any) {
        console.error("Error fetching contents:", error);
        return {};
    }
}