import axios from '~/services/axios.server';
import { currentToken } from '../auth.server';

export async function getStudent({request}: any) {
    let response: any = {};

    try {
        const token = await currentToken({request});
        response = await axios.get('/api/student', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        console.log(error);
        return {};
    }
}

export async function getThemes({request}: any) {
    let response: any = {};

    try {
        const token = await currentToken({request});
        response = await axios.get('/api/student/themes', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        console.log(error)
        return {};
    }
}

export async function getImages({request}: any) {
    let response: any = {};

    try {
        const token = await currentToken({request});
        response = await axios.get('/images', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        console.log(error);
        return {};
    }
}

export async function getTeacher({ request }: any) {
    let response: any = {};

    try {
        const token = await currentToken({request});
        response = await axios.get('/api/student/teacher', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: any) {
        console.log(error);
        return {};
    }
}