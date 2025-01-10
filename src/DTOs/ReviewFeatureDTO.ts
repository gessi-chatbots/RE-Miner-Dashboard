export interface ReviewFeatureDTO {
    app_id: string;
    app_name: string;
    feature_id: number;
    feature_name: string;
    review_id: string; // Updated to match SelectedFeatureReviewDTO
    review_text: string;
    date: string;
}
