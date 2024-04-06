    import {ReviewDataDTO} from "./ReviewDataDTO";

    export interface AppDataDTO {
        package_name: string;
        app_name: string;
        description: string;
        summary: string;
        release_date: string;
        version: string;
        reviews: ReviewDataDTO[];
    }