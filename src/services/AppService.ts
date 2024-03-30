import { AppDataDTO } from '../DTOs/AppDataDTO';
import { AppDataSimpleDTO } from '../DTOs/AppDataSimpleDTO';
class AppService {

    API_URL = 'http://127.0.0.1:3001/api/v1'; 
    PATH_NAME = '/users';

    
    fetchAllApps = async (page = 1, pageSize = 4): Promise<{ apps: AppDataSimpleDTO[], total_pages: number } | null> => {
        const id = localStorage.getItem('USER_ID')
        try {
            const response = await fetch(`${this.API_URL}${this.PATH_NAME}/${id}/applications`);
            const jsonResponse = await response.json();
            const apps = jsonResponse.map((item: any) => ({
                id: item.data.id,
                app_name: item.data.name,
                review_size: item.reviews.length
            }));

            return {
                apps: apps,
                total_pages: jsonResponse.total_pages
            };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };


    fetchAllAppsNames = async (): Promise<{ apps: AppDataDTO[] } | null> => {
        const id = localStorage.getItem('USER_ID')

        try {
            const response = await fetch(`${this.API_URL}${this.PATH_NAME}/names?user_id=${id}`);
            const jsonResponse = await response.json();
            const apps = jsonResponse.apps.map((item: any) => ({
                id: item.id,
                app_name: item.app_name,
            }));

            return {
                apps: apps,
            };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };


    createApp = async (appData: any) => {
        const id = localStorage.getItem('USER_ID')
        const batchSize = 1;

        try {
            const numBatches = Math.ceil(appData.length / batchSize);

            for (let i = 0; i < numBatches; i++) {
                const start = i * batchSize;
                const end = Math.min((i + 1) * batchSize, appData.length);
                const batchData = appData.slice(start, end);

                const request_body = {
                    apps: batchData
                };

                await fetch(`${this.API_URL}${this.PATH_NAME}?user_id=${id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(request_body)
                });

                await new Promise(resolve => setTimeout(resolve, 10000));
            }
        } catch (error) {
            console.error("Error creating app:", error);
            throw error;
        }
    };

    deleteApp = async (appId: string) => {
        const id = localStorage.getItem('USER_ID')
        try {
            await fetch(`${this.API_URL}${this.PATH_NAME}/${id}/applications/${appId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error("Error deleting app:", error);
            throw error;
        }
    };
}

export default AppService;
