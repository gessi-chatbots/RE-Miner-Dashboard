import { AppDataDTO } from '../DTOs/AppDataDTO';
import { AppDataSimpleDTO } from '../DTOs/AppDataSimpleDTO';
import { AppDirectoryDataSimpleDTO } from '../DTOs/AppDirectoryDataSimpleDTO';
class AppService {

    API_URL = 'http://127.0.0.1:3001/api/v1'; 
    PATH_NAME = '/users';

    
    fetchAllApps = async (page = 1, pageSize = 4): Promise<{ apps: AppDataSimpleDTO[], total_pages: number } | null> => {
        const id = localStorage.getItem('USER_ID')
        try {
            const response = await fetch(`${this.API_URL}${this.PATH_NAME}/${id}/applications?page=${page}&pageSize=${pageSize}`);
            const jsonResponse = await response.json();
            const apps = jsonResponse.applications.map((item: any) => ({
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


    fetchAllDirectoryApps = async (page = 1, pageSize = 4): Promise<{ apps: AppDirectoryDataSimpleDTO[], total_pages: number } | null> => {
        try {
            const response = await fetch(`${this.API_URL}/applications/directory`);
            const jsonResponse = await response.json();
            const apps = jsonResponse.map((item: any) => ({
                applicationPackage: item.applicationPackage,
                name: item.name,
                reviewCount: item.reviewCount
            }));
            return {
                apps: apps,
                total_pages: 1
            };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };

    fetchAllAppsNames = async (): Promise<{ apps: AppDataDTO[] } | null> => {
        const id = localStorage.getItem('USER_ID')

        try {
            const response = await fetch(`${this.API_URL}${this.PATH_NAME}/${id}/applications`);
            const jsonResponse = await response.json();
            const apps = jsonResponse.applications.map((item: any) => ({
                id: item.data.id,
                app_name: item.data.name
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
        try {
            await fetch(`${this.API_URL}${this.PATH_NAME}/${id}/applications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(appData)
            });
            await new Promise(resolve => setTimeout(resolve, 10000));
            
        } catch (error) {
            console.error("Error creating app:", error);
            throw error;
        }
    };

    addAppFromDirectory = async (appName: any) => {
        const id = localStorage.getItem('USER_ID');
        const appData = [{ "app_name": appName }];
        try {
            const response = await fetch(`${this.API_URL}/applications/directory?user_id=${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(appData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }
            await new Promise(resolve => setTimeout(resolve, 10000));
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
