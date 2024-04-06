export interface FeatureOccurrenceDTO {
    featureName: string;
    occurrences: number;
}

export interface TopFeaturesDTO {
    topFeatures: FeatureOccurrenceDTO[];
}