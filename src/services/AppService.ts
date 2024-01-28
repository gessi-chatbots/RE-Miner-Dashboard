import { get, post, del } from 'aws-amplify/api';
import { AppDataDTO } from '../DTOs/AppDataDTO';
import AuthService from "./AuthService";
class AppService {
    API_NAME = 'appsAPI';
    PATH_NAME = '/apps'
    fetchAllApps = async (): Promise<AppDataDTO[] | null> => {
        const authService = new AuthService();
        const userData = await authService.getUserData();
        const id = userData?.sub || "";
        try {
            const restOperation = get({
                apiName: this.API_NAME,
                path: this.PATH_NAME,
                options: {
                    queryParams: {
                        user_id: id
                    }
                }
            });
            const { body } = await restOperation.response;
            const textResponse = await body.text();
            const jsonResponse = JSON.parse(textResponse);
            console.log(jsonResponse);
            return jsonResponse.map((item: any) => ({
                app_name: item.app_name,
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

     createApp = async (appData: any) => {
         const authService = new AuthService();
         const userData = await authService.getUserData();
         const request_body = {
             user_id: userData?.sub,
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
}

export default AppService;
