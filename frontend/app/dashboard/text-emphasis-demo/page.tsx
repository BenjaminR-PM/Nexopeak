'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Divider,
  Alert,
  Paper,
  Chip,
  Button
} from '@mui/material';
import { 
  EmphasizedText, 
  InsightText, 
  CampaignText, 
  ReportText,
  useTextEmphasis 
} from '../../../components/EmphasizedText';
import { EmphasisOptions } from '../../../lib/text-emphasis';

const DEMO_TEXTS = {
  analytics: "Your website received 45,672 visitors this month, with 65% coming from mobile devices. The conversion rate increased by 12.5% compared to last month, generating $23,450 in revenue. Peak traffic occurs on Saturdays and Sundays between 2 PM and 6 PM.",
  
  campaign: "The Google Ads campaign achieved a 3.2% CTR with an average CPC of $1.85. Total impressions reached 1,250,000 with 40,000 clicks, resulting in 1,200 conversions. The ROAS improved to 4.5x, exceeding the target by 25%.",
  
  social: "Instagram engagement increased by 89% in Q3, with 15,000 new followers gained. The most popular posts were published on Wednesdays and Fridays, receiving an average of 2,500 likes and 150 comments.",
  
  ecommerce: "Black Friday sales generated $156,789 in revenue from 2,847 orders. The average order value was $55.12, up 18% from last year. Mobile purchases accounted for 72% of all transactions.",
  
  seo: "Organic traffic grew by 34% this quarter, with 89,432 new sessions. The top-performing keywords include 'digital marketing' and 'SEO tools'. Page load speed improved to 2.3 seconds, reducing bounce rate by 15%."
};

export default function TextEmphasisDemoPage() {
  const [options, setOptions] = useState<EmphasisOptions>({
    enableNumbers: true,
    enablePercentages: true,
    enableCurrency: true,
    enableDates: true,
    enableKeywords: true,
    customKeywords: [],
    theme: 'nexopeak'
  });

  const [customText, setCustomText] = useState(DEMO_TEXTS.analytics);
  const [useChips, setUseChips] = useState(false);
  const [animate, setAnimate] = useState(false);

  const handleOptionChange = (option: keyof EmphasisOptions) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setOptions(prev => ({
      ...prev,
      [option]: event.target.checked
    }));
  };

  const segments = useTextEmphasis(customText, options);

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
        Text Emphasis Library Demo
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        Automatically highlight key values (numbers, percentages, dates, keywords) in your insights text.
      </Typography>

      <Grid container spacing={3}>
        {/* Controls */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Controls</Typography>
              
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={<Switch checked={options.enableNumbers} onChange={handleOptionChange('enableNumbers')} />}
                  label="Highlight Numbers"
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={<Switch checked={options.enablePercentages} onChange={handleOptionChange('enablePercentages')} />}
                  label="Highlight Percentages"
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={<Switch checked={options.enableCurrency} onChange={handleOptionChange('enableCurrency')} />}
                  label="Highlight Currency"
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={<Switch checked={options.enableDates} onChange={handleOptionChange('enableDates')} />}
                  label="Highlight Dates"
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={<Switch checked={options.enableKeywords} onChange={handleOptionChange('enableKeywords')} />}
                  label="Highlight Keywords"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={<Switch checked={useChips} onChange={(e) => setUseChips(e.target.checked)} />}
                  label="Use Chip Style"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={<Switch checked={animate} onChange={(e) => setAnimate(e.target.checked)} />}
                  label="Animate Emphasis"
                />
              </Box>
            </CardContent>
          </Card>

          {/* Quick Examples */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Quick Examples</Typography>
              {Object.entries(DEMO_TEXTS).map(([key, text]) => (
                <Button
                  key={key}
                  variant="outlined"
                  size="small"
                  onClick={() => setCustomText(text)}
                  sx={{ mr: 1, mb: 1, textTransform: 'capitalize' }}
                >
                  {key}
                </Button>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Demo Area */}
        <Grid item xs={12} md={8}>
          {/* Custom Text Input */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Custom Text</Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Enter your insight text here..."
              />
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Live Preview</Typography>
              <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                <EmphasizedText
                  text={customText}
                  emphasisOptions={options}
                  useChips={useChips}
                  animate={animate}
                  variant="body1"
                />
              </Paper>
            </CardContent>
          </Card>

          {/* Segment Analysis */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Segment Analysis</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {segments.map((segment, index) => (
                  <Chip
                    key={index}
                    label={`"${segment.text}" (${segment.type}${segment.emphasisType ? `: ${segment.emphasisType}` : ''})`}
                    variant={segment.type === 'emphasis' ? 'filled' : 'outlined'}
                    color={segment.type === 'emphasis' ? 'primary' : 'default'}
                    size="small"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Pre-configured Components */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Pre-configured Components</Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom color="primary">
                  InsightText Component:
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                  <InsightText 
                    text="Your conversion rate improved by 23% this month, with mobile traffic accounting for 68% of all sessions."
                    variant="body1"
                  />
                </Paper>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom color="success.main">
                  CampaignText Component:
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                  <CampaignText 
                    text="Campaign performance: 2.8% CTR, $1.45 CPC, 125,000 impressions, ROAS of 3.2x"
                    variant="body1"
                  />
                </Paper>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom color="warning.main">
                  ReportText Component:
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                  <ReportText 
                    text="Weekly report: 45,678 sessions, 2.5% bounce rate, average session duration of 3 minutes 42 seconds"
                    variant="body1"
                  />
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Usage Instructions */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          How to use in your components:
        </Typography>
        <Typography variant="body2" component="div">
          <code>{`import { InsightText } from '@/components/EmphasizedText';`}</code><br />
          <code>{`<InsightText text="Your insight text here" variant="body1" />`}</code>
        </Typography>
      </Alert>
    </Box>
  );
}





