
export interface EmotionOccurrenceDTO {
    sentimentName: string;
    occurrences: number;
}

export interface PolarityOccurrenceDTO {
    sentimentName: string;
    occurrences: number;
}

export interface TopicOccurrenceDTO {
    sentimentName: string;
    occurrences: number;
}

export interface TypeOccurrenceDTO {
    sentimentName: string;
    occurrences: number;
}

export interface TopDescriptorsDTO {
    topEmotions: EmotionOccurrenceDTO[];
    topPolarities: PolarityOccurrenceDTO[];
    topOccurrences: TopicOccurrenceDTO[];
    topTypes: TypeOccurrenceDTO[];
}