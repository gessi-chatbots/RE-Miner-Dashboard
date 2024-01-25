import {get} from 'aws-amplify/api';
import {AppDataDTO} from '../DTOs/AppDataDTO';

export const fetchData = async (): Promise<AppDataDTO[] | null> => {
    try {
        const restOperation = get({
            apiName: 'appsAPI',
            path: '/apps',
        });
        const { body } = await restOperation.response;
        const textResponse = await body.text();
        const jsonResponse = JSON.parse(textResponse)
        return jsonResponse.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            summary: item.summary,
            release_date: item.release_date,
            version: item.version,
        }));
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};