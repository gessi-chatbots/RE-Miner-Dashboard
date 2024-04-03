export interface FeatureOccurrence {
    featureName: string;
    occurrences: number;
}

export interface TopFeaturesDTO {
    topFeatures: FeatureOccurrence[];
}