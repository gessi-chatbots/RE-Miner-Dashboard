export interface SentenceDTO {
    id: string;
    text: string;
    featureData: {
        feature: string;
    } | null;
    sentimentData: {
        sentiment: string;
    };
}

export interface ReviewDataDTO {
    app_name: string;
    app_id: string;
    reviewId: string;
    review: string;
    sentences: SentenceDTO[];
}

export interface SimilarAppDTO {
    title: string;
    link: string;
}