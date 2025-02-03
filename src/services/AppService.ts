import { AppDataDTO } from '../DTOs/AppDataDTO';
import { AppDataSimpleDTO } from '../DTOs/AppDataSimpleDTO';
import { AppDirectoryDataSimpleDTO } from '../DTOs/AppDirectoryDataSimpleDTO';
import { ApplicationDayStatisticsDTO } from '../DTOs/ApplicationDayStatisticsDTO';
import { FeatureOccurrenceDTO, TopFeaturesDTO } from '../DTOs/TopFeaturesDTO';
import {
    EmotionOccurrenceDTO,
    PolarityOccurrenceDTO,
    TopDescriptorsDTO, TopicOccurrenceDTO,
    TypeOccurrenceDTO
} from '../DTOs/TopDescriptorsDTO';
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


    fetchAllDirectoryApps = async (
        page = 1,
        pageSize = 4
    ): Promise<{ apps: AppDirectoryDataSimpleDTO[]; total_pages: number } | null> => {
        try {
            const response = await fetch(`${this.API_URL}/applications/directory`);

            if (response.status === 204 || response.status === 404) {
                return { apps: [], total_pages: 0 };
            }

            const jsonResponse = await response.json();
            const apps = jsonResponse.map((item: any) => ({
                applicationPackage: item.package_name,
                name: item.app_name,
                reviewCount: item.reviewCount
            }));

            return {
                apps,
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

    fetchTopDescriptors = async (): Promise<TopDescriptorsDTO | null> => {
        try {
            const response = await fetch(`${this.API_URL}/analyze/top-descriptors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: [] }), // adjust payload as needed
            });

            if (response.status === 500) {
                return { topEmotions: [], topPolarities: [], topOccurrences: [], topTypes: [] };
            }
            if (!response.ok) {
                console.error(`Request failed with status: ${response.status}`);
                return null;
            }

            const jsonResponse = await response.json();

            const topEmotions: EmotionOccurrenceDTO[] =
                (jsonResponse.topEmotions.topEmotions || []).map((item: any) => ({
                    sentimentName: item.emotion,
                    occurrences: item.occurrences,
                }));

            const topPolarities: PolarityOccurrenceDTO[] =
                (jsonResponse.topPolarities.topPolarities || []).map((item: any) => ({
                    sentimentName: item.polarity,
                    occurrences: item.occurrences,
                }));

            const topTypes: TypeOccurrenceDTO[] =
                (jsonResponse.topTypes.topTypes || []).map((item: any) => ({
                    sentimentName: item.type,
                    occurrences: item.occurrences,
                }));

            const topOccurrences: TopicOccurrenceDTO[] =
                (jsonResponse.topTopics.topicOccurrences || []).map((item: any) => ({
                    sentimentName: item.topic,
                    occurrences: item.occurrences,
                }));

            return { topEmotions, topPolarities, topOccurrences, topTypes };
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    };

    fetchAppFeatures = async (appId: string): Promise<{ features: string[] } | null> => {
        try {
            const response = await fetch(`${this.API_URL}/applications/${appId}/features`, {
                method: 'GET'
            });

            let features: string[] = await response.json();

            // Filter out features that are empty or contain only whitespace
            features = features.filter(feature => feature.trim() !== "");

            return { features };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };


    getStatisticsOverTime = async (
        appPackage: string,
        descriptor: string,
        startDate?: Date | null,
        endDate?: Date | null
    ): Promise<ApplicationDayStatisticsDTO[]> => {
        const queryParams = new URLSearchParams();

        // Only add date parameters if they are defined
        if (startDate !== null && startDate !== undefined) {
            queryParams.set('start_date', startDate.toISOString());
        }

        if (endDate !== null && endDate !== undefined) {
            queryParams.set('end_date', endDate.toISOString());
        }

        queryParams.set('descriptor', descriptor);

        try {
            const response = await fetch(
                `${this.API_URL}/applications/${appPackage}/statistics?${queryParams.toString()}`,
                { method: 'GET' }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch statistics data: ${response.statusText}`);
            }

            // Expect a plain list from the backend instead of an object with "statistics"
            const statistics: ApplicationDayStatisticsDTO[] = await response.json();
            return statistics;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };

    fetchTopFeatures = async (): Promise<{ topFeatures: TopFeaturesDTO } | null> => {
        try {
            const response = await fetch(`${this.API_URL}/analyze/top-features`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (response.status === 500) {
                return { topFeatures: { topFeatures: [] } };
            }

            const jsonResponse: { occurrences: number; feature: string }[] = await response.json();

            // Filter out features that are empty or contain only whitespace
            const filteredResponse = jsonResponse.filter(item => item.feature.trim() !== "");

            const features: FeatureOccurrenceDTO[] = filteredResponse.map(item => ({
                featureName: item.feature,
                occurrences: item.occurrences
            }));

            const topFeatures: TopFeaturesDTO = {
                topFeatures: features
            };

            return { topFeatures };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };


    createApp = async (appData: any) => {
        try {
            const response = await fetch(`${this.API_URL}/applications`, {
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
