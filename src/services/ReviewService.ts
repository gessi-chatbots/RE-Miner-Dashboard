import {ReviewDataDTO} from "../DTOs/ReviewDataDTO";
import { ReviewManagerDTO } from "../DTOs/ReviewManagerDTO";
import {ReviewFeatureDTO} from "../DTOs/ReviewFeatureDTO";
import {SelectedFeatureReviewDTO} from "../DTOs/SelectedFeatureReviewDTO";
class ReviewService {
    API_NAME = 'http://127.0.0.1:3001/api/v1';
    PATH_NAME = '/users'

    fetchAllReviewsPaginated = async (page?: number, pageSize?: number): Promise<{ reviews: ReviewManagerDTO[], total_pages: number }> => {
        const id = localStorage.getItem('USER_ID');
        let url = `${this.API_NAME}${this.PATH_NAME}/${id}/reviews`;
    
        if (page !== undefined && pageSize !== undefined) {
            url += `?page=${page}&pageSize=${pageSize}`;
        }
    
        try {
            const response = await fetch(url);
            if (response.status === 204) {
                return { reviews: [], total_pages: 0 }; 
            }
    
            const jsonResponse = await response.json();
            const revs: ReviewManagerDTO[] = jsonResponse.reviews.map((review: any) => ({
                app_id: review.app_id,
                app_name: review.app_name,
                reviewId: review.review_id,
                review: review.review,
                date: review.date
            }));
            
            return {
                reviews: revs,
                total_pages: jsonResponse.total_pages
            };
        } catch (error) {
            console.error('Error fetching data:', error);
            return { reviews: [], total_pages: 0 }; // Return empty list and 0 total pages for error cases
        }
    }
    

    fetchReview = async (appId: string, reviewId: string): Promise<{ review: ReviewDataDTO } | null> => {
        const id = localStorage.getItem('USER_ID');
        try {
            if (!id || !reviewId || !appId) {
                console.error('USER_ID or app id or reviewId is not available');
                return null;
            }
            
            const response = await fetch(`${this.API_NAME}${this.PATH_NAME}/${id}/applications/${appId}/reviews/${reviewId}`);
            const jsonResponse = await response.json();
    
            const reviewData: ReviewDataDTO = {
                app_name: jsonResponse.application.name,
                app_id: jsonResponse.application.id,
                reviewId: jsonResponse.review_id,
                review: jsonResponse.review_text,
                sentences: jsonResponse.sentences.map((sentence: any) => ({
                    id: sentence.id,
                    text: sentence.text,
                    featureData: sentence.featureData,
                    sentimentData: sentence.sentimentData
                }))
            };
    
            return { review: reviewData };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };
    

    fetchAllReviewsDetailed = async (): Promise<{ reviews: ReviewDataDTO[] } | null> => {
        const id = localStorage.getItem('USER_ID')
        try {
            const response = await fetch(`${this.API_NAME}${this.PATH_NAME}/detailed?user_id=${id}`);
            const jsonResponse = await response.json();

            const reviews = jsonResponse.reviews.map((item: any) => ({
                app_id: item.app_id,
                app_name: item.app_name,
                id: item.id,
                review: item.review,
                score: item.score,
                date: item.date,
                sentiments: item.sentiments,
                features: item.features,
                analyzed: item.analyzed
            }));

            return { reviews: reviews };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };

    fetchAllReviewsDetailedFromApp = async (appId: string): Promise<{ reviews: ReviewDataDTO[] } | null> => {
        const id = localStorage.getItem('USER_ID')
        try {
            const response = await fetch(`${this.API_NAME}${this.PATH_NAME}/detailed/app?user_id=${id}&app_id=${appId}`);
            const jsonResponse = await response.json();

            const reviews = jsonResponse.reviews.map((item: any) => ({
                app_id: item.app_id,
                app_name: item.app_name,
                id: item.id,
                date: item.date,
                sentiments: item.sentiments,
                features: item.features,
                analyzed: item.analyzed
            }));

            return { reviews: reviews };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };


    deleteReview = async (appId: string, reviewId: string) => {
        const id = localStorage.getItem('USER_ID')
        try {
            await fetch(`${this.API_NAME}${this.PATH_NAME}/${id}/applications/${appId}/reviews/${reviewId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error("Error deleting review:", error);
            throw error;
        }
    };

    analyzeReviews = async (
        reviews: ReviewManagerDTO[],
        featureExtraction: boolean,
        sentimentExtraction: boolean,
        polarityExtraction: boolean,
        typeExtraction: boolean,
        topicExtraction: boolean,
        featureModel: string | null,
        sentimentModel: string | null,
        polarityModel: string | null,
        typeModel: string | null,
        topicModel: string | null
    ) => {
        const id = localStorage.getItem('USER_ID');
        
        // Create an array of URL parameters and filter out empty ones
        const params = [
            featureExtraction && `featureExtraction=true`,
            featureExtraction && featureModel && `feature_model=${featureModel}`,
            sentimentExtraction && `sentimentExtraction=true`,
            sentimentExtraction && sentimentModel && `sentiment_model=${sentimentModel}`,
            polarityExtraction && `polarityExtraction=true`,
            polarityExtraction && polarityModel && `polarity_model=${polarityModel}`,
            typeExtraction && `typeExtraction=true`,
            typeExtraction && typeModel && `type_model=${typeModel}`,
            topicExtraction && `topicExtraction=true`,
            topicExtraction && topicModel && `topic_model=${topicModel}`
        ].filter(Boolean);

        const url = `${this.API_NAME}${this.PATH_NAME}/${id}/analyze${params.length ? '?' + params.join('&') : ''}`;
        console.log('Request URL:', url);
        
        //const jsonBody = reviews.map(review => ({ "reviewId": review.reviewId }));
        const jsonBody = reviews.map(review => review.reviewId);
        console.log('Request body:', JSON.stringify(jsonBody, null, 2));
    
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(jsonBody)
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
    
            const responseData = await response.json(); 
            console.log("Reviews analyzed successfully:", responseData);
            return responseData;
        } catch (error) {
            console.error("Error analyzing reviews:", error);
            throw error;
        }
    };


    fetchSelectedFeatureReviews = async (
        appName: string,
        featureList: string[]
    ): Promise<SelectedFeatureReviewDTO[]> => {
        const url = `${this.API_NAME}/${appName}/reviews-filtered`;

        const requestBody = {
            feature_list: featureList,
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`Error fetching reviews: ${response.statusText}`);
            }

            const reviews = await response.json();
            console.log("Reviews fetched successfully:", reviews);

            return reviews.map((review: any) => ({
                app_name: appName,
                review_id: review.reviewId,
                review_text: review.review,
                features: review.features?.length > 0 ? review.features.map((f: any) => f.feature) : "Unknown",
                polarities: review.polarities?.length > 0 ? review.polarities.map((p: any) => p.polarity) : "Unknown",
                types: review.types?.length > 0 ? review.types.map((t: any) => t.type) : "Unknown",
                topics: review.topics?.length > 0 ? review.topics.map((t: any) => t.topic) : "Unknown"
            }));
        } catch (error) {
            console.error("Error fetching selected feature reviews:", error);
            throw error;
        }
    };


}

export default ReviewService;
