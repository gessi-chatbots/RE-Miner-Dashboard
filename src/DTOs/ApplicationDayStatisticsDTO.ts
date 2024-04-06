import {FeatureOccurrenceDTO} from "./FeatureOccurrenceDTO";
import {SentimentOccurrenceDTO} from "./SentimentOccurrenceDTO";

export interface ApplicationDayStatisticsDTO {
    date: Date;
    sentimentOccurrences: SentimentOccurrenceDTO[];
    featureOccurrences: FeatureOccurrenceDTO[];
}