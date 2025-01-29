import { AppDataDTO } from '../DTOs/AppDataDTO';
import { AppDataSimpleDTO } from '../DTOs/AppDataSimpleDTO';
import { AppDirectoryDataSimpleDTO } from '../DTOs/AppDirectoryDataSimpleDTO';
import { ApplicationDayStatisticsDTO } from '../DTOs/ApplicationDayStatisticsDTO';
import { FeatureOccurrenceDTO, TopFeaturesDTO } from '../DTOs/TopFeaturesDTO';
import { TopSentimentsDTO, SentimentOccurrenceDTO } from '../DTOs/TopSentimentsDTO';
class AppService {

    API_URL = 'http://127.0.0.1:3001/api/v1'; 
    PATH_NAME = '/users';

    
    fetchAllApps = async (page = 1, pageSize = 4): Promise<{ apps: AppDataSimpleDTO[], total_pages: number } | null> => {
        const id = localStorage.getItem('USER_ID');
        try {
            const response = await fetch(`${this.API_URL}${this.PATH_NAME}/${id}/applications?page=${page}&pageSize=${pageSize}`);
            if (response.status === 204) {
                return { apps: [], total_pages: 0 }; // Return empty array and 0 total pages for 204 response
            }
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
            if (response.status === 204) {
                return { apps: [], total_pages: 0 };
            }
            const jsonResponse = await response.json();
            const apps = jsonResponse.map((item: any) => ({
                applicationPackage: item.package_name,
                name: item.app_name,
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
            
            if (response.status === 204) {
                return { apps: [] };
            }
            
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

    fetchAllAppsPackages = async (): Promise<{ apps: AppDataSimpleDTO[] } | null> => {

        try {
            const response = await fetch(`${this.API_URL}/applications/directory`);
            
            if (response.status === 204) {
                return { apps: [] };
            }
            
            const jsonResponse = await response.json();
            const apps = jsonResponse.map((item: any) => ({
                app_package: item.package_name,
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

    fetchTopSentiments = async (data: string[]): Promise<{ topSentiments: TopSentimentsDTO } | null> => {
        const id = localStorage.getItem('USER_ID');
        try {
            const response = await fetch(`${this.API_URL}${this.PATH_NAME}/${id}/analyze/top-sentiments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data })
            });

            if (response.status === 500) {
                return { topSentiments: { topSentiments: [] } };
            }

            const jsonResponse: { occurrences: number; sentiment: string }[] = await response.json();
            const sentiments: SentimentOccurrenceDTO[] = jsonResponse.map(item => ({
                sentimentName: item.sentiment,
                occurrences: item.occurrences
            }));
            const topSentiments: TopSentimentsDTO = {
                topSentiments: sentiments
            }
            return { topSentiments };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };

    
    fetchAppFeatures = async (appId: string): Promise<{ features: string[] } | null> => {
        const id = localStorage.getItem('USER_ID');
        try {
            const response = await fetch(`${this.API_URL}${this.PATH_NAME}/${id}/applications/${appId}/features`, {
                method: 'GET'
            });
            const features: string[] = await response.json();
    
            return { features };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };

        
    getStatisticsOverTime = async (appName: string, startDate: Date, endDate?: Date): Promise<{ statistics: ApplicationDayStatisticsDTO[] } | null> => {
        const id = localStorage.getItem('USER_ID');
        const queryParams = new URLSearchParams();
        queryParams.set('start_date', startDate.toISOString());
        if (endDate) {
            queryParams.set('end_date', endDate.toISOString());
        }
    
        try {
            const response = await fetch(`${this.API_URL}${this.PATH_NAME}/${id}/applications/${appName}/statistics?${queryParams.toString()}`, {
                method: 'GET'
            });
    
            if (!response.ok) {
                throw new Error(`Failed to fetch statistics data: ${response.statusText}`);
            }
    
            const statistics: ApplicationDayStatisticsDTO[] = await response.json();
            return { statistics };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };
    
    fetchTopFeatures = async (data: string[]): Promise<{ topFeatures: TopFeaturesDTO } | null> => {
        const id = localStorage.getItem('USER_ID');
        try {
            const response = await fetch(`${this.API_URL}${this.PATH_NAME}/${id}/analyze/top-features`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data })
            });
    
            if (response.status === 500) {
                return { topFeatures: { topFeatures: [] } };
            }
    
            const jsonResponse: { occurrences: number; feature: string }[] = await response.json();
            const features: FeatureOccurrenceDTO[] = jsonResponse.map(item => ({
                featureName: item.feature,
                occurrences: item.occurrences
            }));
            const topFeatures: TopFeaturesDTO = {
                topFeatures: features
            }
            return { topFeatures };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };

    createApp = async (appData: any) => {
        const id = localStorage.getItem('USER_ID')
        try {
            const response = await fetch(`${this.API_URL}${this.PATH_NAME}/${id}/applications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(appData)
            });
            if (response.status === 201) {
                const responseData = await response.json();
                console.log("Application created successfully:", responseData);
            } else {
                console.error("Unexpected status code:", response.status);
            }
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
