import { get } from 'aws-amplify/api';
import { AppData } from '../DTOs/AppDataDTO';

export const fetchData = async (): Promise<AppData[] | null> => {
    try {
        const restOperation = get({
            apiName: 'appsAPI',
            path: '/apps',
        });
        const { body } = await restOperation.response;
        const jsonResponse = await body.json();

        // If jsonResponse is null, return an empty array
        if (!jsonResponse) {
            return [];
        }

        console.log(jsonResponse)
        return null;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};