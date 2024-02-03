import {SentimentDataDTO} from "./SentimentDataDTO";

export interface ReviewDataDTO {
    app_name: string;
    app_id: string;
    id: string;
    review: string;
    score: number;
    date: string;
    features: string[] | null;
    sentiments: SentimentDataDTO[] | null;
}
