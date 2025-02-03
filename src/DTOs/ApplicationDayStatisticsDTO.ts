import {FeatureOccurrenceDTO} from "./FeatureOccurrenceDTO";
import {EmotionOccurrenceDTO} from "./EmotionOccurrenceDTO";
import {PolarityOccurrenceDTO, TopicOccurrenceDTO, TypeOccurrenceDTO} from "./TopDescriptorsDTO";

export interface ApplicationDayStatisticsDTO {
    date: Date;
    emotionOccurrences: EmotionOccurrenceDTO[];
    featureOccurrences: FeatureOccurrenceDTO[];
    polarityOccurrences: PolarityOccurrenceDTO[];
    typeOccurrences: TypeOccurrenceDTO[];
    topicOccurrences: TopicOccurrenceDTO[];
}