import { get, post } from 'aws-amplify/api';
import { AppDataDTO } from '../DTOs/AppDataDTO';
import AuthService from "./AuthService";
class AppService {
    API_NAME = 'appsAPI';
    PATH_NAME = '/apps'
    fetchAllApps = async (): Promise<AppDataDTO[] | null> => {
        try {
            const restOperation = get({
                apiName: this.API_NAME,
                path: this.PATH_NAME,
            });
            const { body } = await restOperation.response;
            const textResponse = await body.text();
            const jsonResponse = JSON.parse(textResponse);
            console.log(jsonResponse);
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

     createApp = async (appData: any) => {
         console.log(appData)
         const authService = new AuthService();
         const userData = await authService.getUserData();
         const request_body = {
             user_id: userData?.sub,
             apps: [appData]
         };
         console.log(JSON.stringify(request_body))
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
}

export default AppService;
