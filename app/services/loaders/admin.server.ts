import axios from '~/services/axios.server';
import { currentToken } from '../auth.server';

export async function getCourses({request}: any) {
    let response: any = {};

    try {
        const token = await currentToken({request});
        response = await axios.get('/api/courses', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response.data;
    } catch (error: any) {
        console.error('Error fetching courses:', error);
        return {}
    }
}

export async function getTeachers({request}: any) {
    let response: any = {};

    try {
        const token = await currentToken({request});
        response = await axios.get('/api/teachers', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response.data;
    } catch (error: any) {
        console.error('Error fetching teachers:', error);
        return {}
    }
}   