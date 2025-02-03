import {FeatureOccurrenceDTO} from "./FeatureOccurrenceDTO";
import {EmotionOccurrenceDTO} from "./EmotionOccurrenceDTO";
import {PolarityOccurrenceDTO} from "./TopDescriptorsDTO";

export interface ApplicationDayStatisticsDTO {
    date: Date;
    emotionOccurrences: EmotionOccurrenceDTO[];
    featureOccurrences: FeatureOccurrenceDTO[];
    polarityOccurrences: PolarityOccurrenceDTO[];
    typeOccurrences: PolarityOccurrenceDTO[];
    topicOccurrences: PolarityOccurrenceDTO[];
}