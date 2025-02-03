import React from 'react';

// Define types for styles
type StyleType = {
    icon: string;
    bg: string;
    color: string;
    border: string;
};

const NA_STYLE: StyleType = {
    icon: 'mdi mdi-help-circle-outline',
    bg: '#E5E7EB',
    color: '#374151',
    border: '#D1D5DB',
};

// Badge Components

export const TypeBadge: React.FC<{ type?: string }> = ({ type }) => {
    const getTypeStyles = (type: string): StyleType => {
        switch (type.toLowerCase()) {
            case 'bug': return { icon: 'mdi mdi-bug-outline', bg: '#FFE6E6', color: '#D63031', border: '#FFB8B8' };
            case 'rating': return { icon: 'mdi mdi-star-outline', bg: '#FFF4E6', color: '#E67E22', border: '#FFD8A8' };
            case 'feature': return { icon: 'mdi mdi-puzzle-outline', bg: '#E6F6FF', color: '#0984E3', border: '#B8E2FF' };
            case 'userexperience': return { icon: 'mdi mdi-account-outline', bg: '#E6FFE6', color: '#00B894', border: '#B8FFB8' };
            default: return NA_STYLE;
        }
    };

    const styles = getTypeStyles(type || '');

    return (
        <div style={{
            backgroundColor: styles.bg,
            color: styles.color,
            border: `1px solid ${styles.border}`,
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 12px',
            borderRadius: '12px'
        }}>
            <i className={`${styles.icon} me-1`} style={{ fontSize: '16px' }} />
            {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'N/A'}
        </div>
    );
};


export const TopicBadge: React.FC<{ topic?: string }> = ({ topic }) => {
    const getTopicStyles = (topic: string): StyleType => {
        switch (topic.toLowerCase()) {
            case 'general': return { icon: 'mdi mdi-checkbox-multiple-blank-circle-outline', bg: '#F3F4F6', color: '#4B5563', border: '#D1D5DB' };
            case 'usability': return { icon: 'mdi mdi-gesture-tap', bg: '#EDE9FE', color: '#7C3AED', border: '#DDD6FE' };
            case 'effectiveness': return { icon: 'mdi mdi-target', bg: '#FCE7F3', color: '#DB2777', border: '#FBCFE8' };
            case 'efficiency': return { icon: 'mdi mdi-clock-fast', bg: '#E6F7E6', color: '#0B8457', border: '#C7F2C7' };
            case 'enjoyability': return { icon: 'mdi mdi-emoticon-excited-outline', bg: '#FFF4E6', color: '#E67E22', border: '#FFD8A8' };
            case 'cost': return { icon: 'mdi mdi-cash-multiple', bg: '#FEF9C3', color: '#B45309', border: '#FDE68A' };
            case 'reliability': return { icon: 'mdi mdi-shield-check', bg: '#E6EFFF', color: '#2563EB', border: '#93C5FD' };
            case 'security': return { icon: 'mdi mdi-lock-outline', bg: '#E0F7FF', color: '#0284C7', border: '#7DD3FC' };
            case 'compatibility': return { icon: 'mdi mdi-link-variant', bg: '#F4E7FF', color: '#7C3AED', border: '#DDD6FE' };
            case 'learnability': return { icon: 'mdi mdi-book-open-page-variant', bg: '#FFF6E7', color: '#D97706', border: '#FCD34D' };
            case 'safety': return { icon: 'mdi mdi-shield-outline', bg: '#E6FFE6', color: '#059669', border: '#86EFAC' };
            case 'aesthetics': return { icon: 'mdi mdi-palette-outline', bg: '#FFE6F6', color: '#BE185D', border: '#F9A8D4' };
            default: return NA_STYLE;
        }
    };

    const styles = getTopicStyles(topic || '');

    return (
        <div style={{
            backgroundColor: styles.bg,
            color: styles.color,
            border: `1px solid ${styles.border}`,
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: '12px'
        }}>
            <i className={`${styles.icon} me-1`} style={{ fontSize: '14px' }} />
            {topic ? topic.charAt(0).toUpperCase() + topic.slice(1) : 'N/A'}
        </div>
    );
};
const defaultEmotionColors: { [key: string]: string } = {
    happiness: 'rgba(255, 99, 132, 0.7)',
    sadness: 'rgba(54, 162, 235, 0.7)',
    anger: 'rgba(255, 206, 86, 0.7)',
    surprise: 'rgba(75, 192, 192, 0.7)',
    fear: 'rgba(153, 102, 255, 0.7)',
    disgust: 'rgba(255, 159, 64, 0.7)',
};

export const EmotionBadge: React.FC<{ sentiment?: string }> = ({ sentiment }) => {
    const getSentimentStyles = (sentiment: string): StyleType => {
        const bgColor = defaultEmotionColors[sentiment.toLowerCase()] || NA_STYLE.bg;

        return {
            icon: '',
            bg: bgColor,
            color: '#FFF',  // Use white for text for better contrast
            border: '#D1D5DB',
        };
    };

    const styles = getSentimentStyles(sentiment || '');

    return (
        <div style={{
            backgroundColor: styles.bg,
            color: styles.color,
            border: `1px solid ${styles.border}`,
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: '12px'
        }}>

            {sentiment ? sentiment.charAt(0).toUpperCase() + sentiment.slice(1) : 'N/A'}
        </div>
    );
};

export const PolarityIcon: React.FC<{ polarity: string }> = ({ polarity }) => {
    const getPolarityStyles = (polarity: string): StyleType => {
        switch (polarity.toLowerCase()) {
            case 'positive': return { icon: 'mdi mdi-emoticon-happy-outline', bg: '#E6FFE6', color: '#0b6c17', border: '#0dae0d' };
            case 'negative': return { icon: 'mdi mdi-emoticon-sad-outline', bg: '#FFE6E6', color: '#D63031', border: '#bf0b0b' };
            default: return NA_STYLE;
        }
    };

    const styles = getPolarityStyles(polarity || '');

    return (
        <div style={{
            backgroundColor: styles.bg,
            color: styles.color,
            border: `1px solid ${styles.border}`,
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: '12px'
        }}>
            <i className={`${styles.icon} me-1`} style={{ fontSize: '16px' }} />
            {polarity ? polarity.charAt(0).toUpperCase() + polarity.slice(1) : 'N/A'}
        </div>
    );
};

export const FeatureBadge: React.FC<{ feature?: string }> = ({ feature }) => {
    const getFeatureStyles = (feature: string): StyleType => {
        return feature.toLowerCase() === 'n/a'
            ? NA_STYLE
            : {
                icon: '',
                bg: '#F0F9FF',
                color: '#0369A1',
                border: '#BAE6FD',
            };
    };

    const styles = getFeatureStyles(feature || 'N/A');

    return (
        <div style={{
            backgroundColor: styles.bg,
            color: styles.color,
            border: `1px solid ${styles.border}`,
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: '12px'
        }}>
            {feature || 'N/A'}
        </div>
    );
};

export const ReviewIdBadge: React.FC<{ id?: string }> = ({ id }) => {
    const isValidId = id && id.trim().length > 0;
    const shortId = isValidId && id.length > 8 ? `${id.slice(0, 8)}...` : id || 'N/A';

    const styles: StyleType = isValidId
        ? {
            icon: 'mdi mdi-pound',
            bg: '#F1F5F9',
            color: '#475569',
            border: '#CBD5E1',
        }
        : NA_STYLE;

    return (
        <div
            title={id} // This creates a native tooltip on hover
            style={{
                backgroundColor: styles.bg,
                color: styles.color,
                border: `1px solid ${styles.border}`,
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'help',
                fontFamily: 'monospace',
                letterSpacing: '0.5px',
            }}
        >
            <i className="mdi mdi-pound me-1" style={{ fontSize: '12px' }} />
            {shortId}
        </div>
    );
};
