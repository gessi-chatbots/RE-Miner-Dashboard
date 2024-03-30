import {SentimentDataDTO} from "./SentimentDataDTO";

export interface ReviewDataDTO {
    app_name: string;
    app_id: string;
    reviewId: string;
    review: string;
    score: number;
    date: string;
    features: string[] | null;
    sentiments: SentimentDataDTO[] | null;
    analyzed: boolean
}
