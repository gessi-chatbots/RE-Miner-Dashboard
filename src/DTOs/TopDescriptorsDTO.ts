
export interface EmotionOccurrenceDTO {
    emotion: string;
    occurrences: number;
}

export interface PolarityOccurrenceDTO {
    polarity: string;
    occurrences: number;
}

export interface TopicOccurrenceDTO {
    topic: string;
    occurrences: number;
}

export interface TypeOccurrenceDTO {
    type: string;
    occurrences: number;
}

export interface TopDescriptorsDTO {
    topEmotions: EmotionOccurrenceDTO[];
    topPolarities: PolarityOccurrenceDTO[];
    topOccurrences: TopicOccurrenceDTO[];
    topTypes: TypeOccurrenceDTO[];
}