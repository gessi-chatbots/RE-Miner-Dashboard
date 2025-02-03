export interface SentenceDTO {
    id: string;
    text: string;

    featureData: {
        feature: string;
    } | null;

    sentimentData: {
        sentiment: string;
    } | null;

    polarityData: {
        polarity: string;   // e.g., positive, negative, neutral
    } | null;

    typeData: {
        type: string;       // e.g., bug, feature, rating, user experience
    } | null;

    topicData: {
        topic: string;      // e.g., general, usability, efficiency, reliability
    } | null;
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