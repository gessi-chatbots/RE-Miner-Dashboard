export interface SentimentOccurrenceDTO {
    sentimentName: string;
    occurrences: number;
}

export interface TopSentimentsDTO {
    topSentiments: SentimentOccurrenceDTO[];
}