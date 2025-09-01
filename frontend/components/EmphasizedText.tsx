/**
 * EmphasizedText React Component for Nexopeak
 * Automatically highlights key values in text using the text-emphasis library
 */

import React from 'react';
import { Typography, TypographyProps, Box, Chip } from '@mui/material';
import { 
  EmphasisOptions, 
  EmphasisSegment, 
  emphasizeText
} from '../lib/text-emphasis';

export interface EmphasizedTextProps extends Omit<TypographyProps, 'children'> {
  /** The text to emphasize */
  text: string;
  /** Emphasis options */
  emphasisOptions?: EmphasisOptions;
  /** Whether to use chip-style highlighting for numbers/percentages */
  useChips?: boolean;
  /** Custom chip props */
  chipProps?: {
    size?: 'small' | 'medium';
    variant?: 'filled' | 'outlined';
  };
  /** Whether to animate emphasis on mount */
  animate?: boolean;
  /** Custom render function for emphasis segments */
  renderEmphasis?: (segment: EmphasisSegment, index: number) => React.ReactNode;
}

/**
 * Component that automatically emphasizes key values in text
 */
export const EmphasizedText: React.FC<EmphasizedTextProps> = ({
  text,
  emphasisOptions,
  useChips = false,
  chipProps = { size: 'small', variant: 'filled' },
  animate = false,
  renderEmphasis,
  ...typographyProps
}) => {
  const segments = React.useMemo(() => {
    return emphasizeText(text, emphasisOptions);
  }, [text, emphasisOptions]);

  const renderSegment = (segment: EmphasisSegment, index: number): React.ReactNode => {
    if (segment.type === 'text') {
      return segment.text;
    }

    // Use custom render function if provided
    if (renderEmphasis) {
      return renderEmphasis(segment, index);
    }

    // Use chips for numbers and percentages if enabled
    if (useChips && (segment.emphasisType === 'number' || segment.emphasisType === 'percentage' || segment.emphasisType === 'currency')) {
      const chipColor = getChipColor(segment.emphasisType);
      return (
        <Chip
          key={index}
          label={segment.text}
          size={chipProps.size}
          variant={chipProps.variant}
          color={chipColor}
          sx={{ 
            mx: 0.25,
            fontSize: 'inherit',
            height: 'auto',
            '& .MuiChip-label': {
              px: 1,
              py: 0.25,
              fontSize: 'inherit',
              fontWeight: 600
            },
            ...(animate && {
              animation: 'pulse 2s ease-in-out',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.7 }
              }
            })
          }}
        />
      );
    }

    // Default span with CSS classes
    return (
      <Box
        key={index}
        component="span"
        className={segment.className}
        sx={{
          ...segment.style,
          ...(animate && {
            animation: 'fadeIn 0.5s ease-in',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'scale(0.95)' },
              to: { opacity: 1, transform: 'scale(1)' }
            }
          })
        }}
      >
        {segment.text}
      </Box>
    );
  };

  const getChipColor = (type: EmphasisSegment['emphasisType']): 'primary' | 'secondary' | 'success' | 'warning' | 'error' => {
    switch (type) {
      case 'percentage': return 'primary';
      case 'currency': return 'success';
      case 'number': return 'warning';
      case 'date': return 'secondary';
      default: return 'primary';
    }
  };

  return (
    <Typography {...typographyProps}>
      {segments.map((segment, index) => renderSegment(segment, index))}
    </Typography>
  );
};

/**
 * Hook for using text emphasis in custom components
 */
export const useTextEmphasis = (text: string, options?: EmphasisOptions) => {
  return React.useMemo(() => {
    return emphasizeText(text, options);
  }, [text, options]);
};

/**
 * Higher-order component for adding text emphasis to any text-containing component
 */
export function withTextEmphasis<P extends { children?: React.ReactNode }>(
  Component: React.ComponentType<P>,
  defaultOptions?: EmphasisOptions
) {
  return React.forwardRef<any, P & { emphasisOptions?: EmphasisOptions }>((props, ref) => {
    const { emphasisOptions, children, ...rest } = props;
    
    if (typeof children === 'string') {
      return (
        <Component ref={ref} {...(rest as any)}>
          <EmphasizedText 
            text={children} 
            emphasisOptions={{ ...defaultOptions, ...emphasisOptions }}
            component="span"
          />
        </Component>
      );
    }
    
    return <Component ref={ref} {...(rest as any)}>{children}</Component>;
  });
}

/**
 * Pre-configured components for common use cases
 */

// Insight text with emphasis optimized for analytics
export const InsightText: React.FC<Omit<EmphasizedTextProps, 'emphasisOptions'> & {
  emphasisOptions?: Partial<EmphasisOptions>;
}> = ({ emphasisOptions, ...props }) => (
  <EmphasizedText
    {...props}
    emphasisOptions={{
      enableNumbers: true,
      enablePercentages: true,
      enableCurrency: true,
      enableDates: true,
      enableKeywords: true,
      customKeywords: [
        'conversion rate', 'click-through rate', 'bounce rate', 'engagement',
        'traffic', 'revenue', 'ROI', 'impressions', 'reach', 'organic',
        'mobile', 'desktop', 'social media', 'peak hours'
      ],
      theme: 'nexopeak',
      ...emphasisOptions
    }}
  />
);

// Campaign performance text
export const CampaignText: React.FC<Omit<EmphasizedTextProps, 'emphasisOptions'> & {
  emphasisOptions?: Partial<EmphasisOptions>;
}> = ({ emphasisOptions, ...props }) => (
  <EmphasizedText
    {...props}
    useChips={true}
    emphasisOptions={{
      enableNumbers: true,
      enablePercentages: true,
      enableCurrency: true,
      enableDates: true,
      enableKeywords: true,
      customKeywords: [
        'CTR', 'CPC', 'CPM', 'ROAS', 'conversion', 'impression', 'click',
        'campaign', 'ad group', 'keyword', 'audience', 'targeting'
      ],
      theme: 'nexopeak',
      ...emphasisOptions
    }}
  />
);

// Analytics report text
export const ReportText: React.FC<Omit<EmphasizedTextProps, 'emphasisOptions'> & {
  emphasisOptions?: Partial<EmphasisOptions>;
}> = ({ emphasisOptions, ...props }) => (
  <EmphasizedText
    {...props}
    emphasisOptions={{
      enableNumbers: true,
      enablePercentages: true,
      enableCurrency: false,
      enableDates: true,
      enableKeywords: true,
      customKeywords: [
        'sessions', 'users', 'page views', 'bounce rate', 'duration',
        'source', 'medium', 'channel', 'device', 'browser', 'location'
      ],
      theme: 'nexopeak',
      ...emphasisOptions
    }}
  />
);

export default EmphasizedText;
