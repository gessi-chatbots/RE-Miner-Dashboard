export interface ReviewManagerDTO {
    app_id: string;
    app_package: string;
    app_name: string;
    review_id: string;
    review: string;
    language_model: string;
    polarities: string[];
    features: string[];
    types: string[];
    topics: string[];
    emotions: string[];
}
