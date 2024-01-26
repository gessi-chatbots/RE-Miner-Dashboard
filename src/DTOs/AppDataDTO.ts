import {ReviewDataDTO} from "./ReviewDataDTO";

export interface AppDataDTO {
    app_name: string;
    description: string;
    summary: string;
    release_date: string;
    version: number;
    reviews: ReviewDataDTO[];
}