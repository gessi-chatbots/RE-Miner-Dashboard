import {ReviewDataDTO} from "../DTOs/ReviewDataDTO";
import { ReviewDataSimpleDTO } from "../DTOs/ReviewDataSimpleDTO";
class ReviewService {
    API_NAME = 'http://127.0.0.1:3001/api/v1';
    PATH_NAME = '/users'

    fetchAllReviewsPaginated = async (page = 1, pageSize = 8): Promise<{ reviews: ReviewDataSimpleDTO[], total_pages: number } | null> => {
        const id = localStorage.getItem('USER_ID');
        try {
            const response = await fetch(`${this.API_NAME}${this.PATH_NAME}/${id}/reviews?page=${page}&pageSize=${pageSize}`);
            const jsonResponse = await response.json();
            const revs = [];
    
            for (const review of jsonResponse.reviews) { 
                const rev = {
                    app_id: review.app_id,
                    app_name: review.app_name,
                    reviewId: review.review_id,
                    review: review.review,
                };
                revs.push(rev);
            }
    
            return {
                reviews: revs,
                total_pages: jsonResponse.total_pages
            };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };

    fetchReview = async (reviewId: string): Promise<{ review: ReviewDataDTO } | null> => {
        const id = localStorage.getItem('USER_ID')
        try {
            const response = await fetch(`${this.API_NAME}${this.PATH_NAME}/review/${reviewId}?user_id=${id}`);
            const jsonResponse = await response.json();

            console.log(jsonResponse);

            const reviewFromJson = jsonResponse.review;
            const review: ReviewDataDTO = {
                app_id: reviewFromJson.app_id,
                app_name: reviewFromJson.app_name,
                reviewId: reviewFromJson.id,
                review: reviewFromJson.review,
                score: reviewFromJson.score,
                date: reviewFromJson.date,
                sentiments: reviewFromJson.sentiments,
                features: reviewFromJson.features,
                analyzed: reviewFromJson.analyzed
            };

            return { review: review };
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
        reviews: ReviewDataSimpleDTO[],
        featureExtraction: boolean,
        sentimentExtraction: boolean,
        featureModel: string | null,
        sentimentModel: string | null
    ) => {
        const id = localStorage.getItem('USER_ID')

        const jsonBody = {
            "featureExtraction": featureExtraction,
            "sentimentExtraction": sentimentExtraction,
            "featureModel": featureModel,
            "sentimentModel": sentimentModel,
            "reviews": reviews
        };

        try {
            await fetch(`${this.API_NAME}${this.PATH_NAME}/analyze?user_id=${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonBody)
            });
        } catch (error) {
            console.error("Error analyzing reviews:", error);
            throw error;
        }
    };
}

export default ReviewService;
