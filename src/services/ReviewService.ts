import { get, post, del, put } from 'aws-amplify/api';
import { AppDataDTO } from '../DTOs/AppDataDTO';
import AuthService from "./AuthService";
import {ReviewDataDTO} from "../DTOs/ReviewDataDTO";
class ReviewService {
    API_NAME = 'reviewsAPI';
    PATH_NAME = '/reviews'
    fetchAllReviewsPaginated = async (page: number = 1, pageSize: number = 8): Promise<{ reviews: ReviewDataDTO[], total_pages: number } | null> => {
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
            const reviews = jsonResponse.reviews.map((item: any) => ({
                app_id: item.app_id,
                app_name: item.app_name,
                id: item.id,
                review: item.review,
                score: item.score,
                date: item.date,
                sentiments: item.sentiments,
                feature: item.features,
                analyzed: item.analyzed
            }));

            return {
                reviews: reviews,
                total_pages: jsonResponse.total_pages
            };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };

    fetchReview = async (reviewId: string): Promise<{ review: ReviewDataDTO } | null> => {
        const authService = new AuthService();
        const userData = await authService.getUserData();
        const id = userData?.sub || "";
        try {
            const restOperation = get({
                apiName: this.API_NAME,
                path: this.PATH_NAME + '/review' + '/' + reviewId,
                options: {
                    queryParams: {
                        user_id: id
                    }
                }
            });

            const { body } = await restOperation.response;
            const textResponse = await body.text();
            const jsonResponse = JSON.parse(textResponse);
            console.log(jsonResponse)
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
            return {
                review: review
            };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };

    fetchAllReviewsDetailed = async (): Promise<{ reviews: ReviewDataDTO[]} | null> => {
        const authService = new AuthService();
        const userData = await authService.getUserData();
        const id = userData?.sub || "";

        try {
            const restOperation = get({
                apiName: this.API_NAME,
                path: this.PATH_NAME + '/detailed',
                options: {
                    queryParams: {
                        user_id: id,
                    }
                }
            });

            const { body } = await restOperation.response;
            const textResponse = await body.text();
            const jsonResponse = JSON.parse(textResponse);
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

            return {
                reviews: reviews
            };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };
    fetchAllReviewsDetailedFromApp = async (appId: string): Promise<{ reviews: ReviewDataDTO[]} | null> => {
        const authService = new AuthService();
        const userData = await authService.getUserData();
        const id = userData?.sub || "";

        try {
            const restOperation = get({
                apiName: this.API_NAME,
                path: this.PATH_NAME + '/detailed/app',
                options: {
                    queryParams: {
                        user_id: id,
                        app_id: appId
                    }
                }
            });

            const { body } = await restOperation.response;
            const textResponse = await body.text();
            const jsonResponse = JSON.parse(textResponse);
            const reviews = jsonResponse.reviews.map((item: any) => ({
                app_id: item.app_id,
                app_name: item.app_name,
                id: item.id,
                date: item.date,
                sentiments: item.sentiments,
                features: item.features,
                analyzed: item.analyzed
            }));

            return {
                reviews: reviews,
            };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };
    createReview = async (reviewData: any) => {
        const authService = new AuthService();
        const userData = await authService.getUserData();
        const id = userData?.sub || "";
        const request_body = {
            review: reviewData
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
                        user_id: id,
                        app_id: reviewData.app_id
                    },
                    body: JSON.stringify(request_body)
                }
            });
            const { body } = await restOperation.response;
            const textResponse = await body.text();
        } catch (error) {
            console.error("Error creating review:", error);
            throw error;
        }
    };
    deleteReview = async (appId: string, reviewId: string) => {
        const authService = new AuthService();
        const userData = await authService.getUserData();
        const userId = userData?.sub || "";
        try {
            const deleteOperation = del({
                apiName: this.API_NAME,
                path: this.PATH_NAME,
                options: {
                    queryParams: {
                        user_id: userId,
                        app_id: appId,
                        review_id: reviewId
                    }
                }
            });
            await deleteOperation.response;
        } catch (error) {
            console.error("Error deleting review:", error);
            throw error;
        }
    };
    updateReview = async (review: ReviewDataDTO) => {
        const authService = new AuthService();
        const userData = await authService.getUserData();
        const id = userData?.sub || "";
        const reviewId = review?.reviewId;
        const appId = review?.app_id;
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
                        app_id: appId,
                        review_id: reviewId
                    },
                    body: JSON.stringify(review)
                }
            });
            const { body } = await restOperation.response;
            const textResponse = await body.text();
        } catch (error) {
            console.error("Error updating review:", error);
            throw error;
        }
    }

    analyzeReviews = async (reviews: ReviewDataDTO[],
                            featureExtraction: boolean,
                            sentimentExtraction: boolean,
                            featureModel: string | null,
                            sentimentModel: string | null) => {
        const authService = new AuthService();
        const userData = await authService.getUserData();
        const id = userData?.sub || "";
        const jsonBody = {
            "featureExtraction": featureExtraction,
            "sentimentExtraction": sentimentExtraction,
            "featureModel": featureModel,
            "sentimentModel": sentimentModel,
            "reviews": reviews
        }
        try {
            const restOperation = post({
                apiName: this.API_NAME,
                path: this.PATH_NAME + '/analyze',
                options: {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    queryParams: {
                        user_id: id
                    },
                    body: JSON.stringify(jsonBody)
                }
            });
            const { body } = await restOperation.response;
            const textResponse = await body.text();
        } catch (error) {
            console.error("Error analyzing reviews:", error);
            throw error;
        }
    }
}

export default ReviewService;
