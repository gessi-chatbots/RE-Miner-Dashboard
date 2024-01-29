import { get, post, del, put } from 'aws-amplify/api';
import { AppDataDTO } from '../DTOs/AppDataDTO';
import AuthService from "./AuthService";
class AppService {
    API_NAME = 'appsAPI';
    PATH_NAME = '/apps'
    fetchAllApps = async (page: number = 1, pageSize: number = 4): Promise<{ apps: AppDataDTO[], total_pages: number } | null> => {
        const authService = new AuthService();
        const userData = await authService.getUserData();
        const id = userData?.sub || "";

        try {
            const restOperation = get({
                apiName: this.API_NAME,
                path: this.PATH_NAME,
                options: {
                    queryParams: {
                        user_id: id,
                        page: page.toString(),
                        page_size: pageSize.toString()
                    }
                }
            });

            const { body } = await restOperation.response;
            const textResponse = await body.text();
            const jsonResponse = JSON.parse(textResponse);
            console.log(jsonResponse);

            const apps = jsonResponse.apps.map((item: any) => ({
                id: item.id,
                app_name: item.app_name,
                description: item.description,
                summary: item.summary,
                release_date: item.release_date,
                version: item.version,
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
    createApp = async (appData: any) => {
         const authService = new AuthService();
         const userData = await authService.getUserData();
         const id = userData?.sub || "";
         const request_body = {
             apps: appData
         };
        try {
            const restOperation = post({
                apiName: this.API_NAME,
                path: this.PATH_NAME,
                options: {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    queryParams: {
                        user_id: id
                    },
                    body: JSON.stringify(request_body)
                }
            });
            const { body } = await restOperation.response;
            const textResponse = await body.text();
            console.log(textResponse)
        } catch (error) {
            console.error("Error creating app:", error);
            throw error;
        }
    };
    deleteApp = async (appId: string) => {
        const authService = new AuthService();
        const userData = await authService.getUserData();
        const id = userData?.sub || "";
        try {
            const deleteOperation = del({
                apiName: this.API_NAME,
                path: this.PATH_NAME,
                options: {
                    queryParams: {
                        user_id: id,
                        app_id: appId
                    }
                }
            });
            await deleteOperation.response;
        } catch (error) {
            console.error("Error deleting app:", error);
            throw error;
        }
    };

    updateApp = async (appData: AppDataDTO) => {
        const authService = new AuthService();
        const userData = await authService.getUserData();
        const id = userData?.sub || "";
        try {
            const restOperation = put({
                apiName: this.API_NAME,
                path: this.PATH_NAME,
                options: {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    queryParams: {
                        user_id: id,
                        app_id: appData.id
                    },
                    body: JSON.stringify(appData)
                }
            });
            const { body } = await restOperation.response;
            const textResponse = await body.text();
            console.log(textResponse)
        } catch (error) {
            console.error("Error creating app:", error);
            throw error;
        }
    }
}

export default AppService;
