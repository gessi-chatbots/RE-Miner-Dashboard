    import {ReviewDataDTO, SimilarAppDTO} from "./ReviewDataDTO";

    export interface AppDataDTO {
        app_name: string;
        categories: string[];
        category: string;
        categoryId: string;
        changelog: string;
        current_version_release_date: string;
        description: string;
        developer: string;
        developer_site: string;
        features: string[];
        in_app_purchases: boolean;
        is_open_source: boolean;
        other_apps: boolean;
        package_name: string;
        play_store_link: string;
        release_date: string;
        repository: string;
        reviews: ReviewDataDTO[];
        similar_apps: SimilarAppDTO[] 
        summary: string;
        tags: string [];
        version: string;
    }