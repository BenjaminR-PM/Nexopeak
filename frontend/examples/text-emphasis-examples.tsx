/**
 * Text Emphasis Library Usage Examples
 * Copy these examples into your components
 */

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { EmphasizedText, InsightText, CampaignText, ReportText } from '../components/EmphasizedText';

// Example 1: Basic Usage
export function BasicExample() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Website Performance</Typography>
        <EmphasizedText 
          text="Your website received 45,672 visitors this month, with 65% coming from mobile devices. The conversion rate increased by 12.5% compared to last month, generating $23,450 in revenue."
          variant="body1"
        />
      </CardContent>
    </Card>
  );
}

// Example 2: Campaign Performance with Chips
export function CampaignExample() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Campaign Results</Typography>
        <CampaignText 
          text="The Google Ads campaign achieved a 3.2% CTR with an average CPC of $1.85. Total impressions reached 1,250,000 with 40,000 clicks, resulting in 1,200 conversions. The ROAS improved to 4.5x, exceeding the target by 25%."
          variant="body1"
          useChips={true}
        />
      </CardContent>
    </Card>
  );
}

// Example 3: Social Media Insights
export function SocialMediaExample() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Social Media Growth</Typography>
        <InsightText 
          text="Instagram engagement increased by 89% in Q3, with 15,000 new followers gained. The most popular posts were published on Wednesdays and Fridays, receiving an average of 2,500 likes and 150 comments."
          variant="body1"
          animate={true}
        />
      </CardContent>
    </Card>
  );
}

// Example 4: E-commerce Analytics
export function EcommerceExample() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Sales Report</Typography>
        <ReportText 
          text="Black Friday sales generated $156,789 in revenue from 2,847 orders. The average order value was $55.12, up 18% from last year. Mobile purchases accounted for 72% of all transactions."
          variant="body1"
        />
      </CardContent>
    </Card>
  );
}

// Example 5: SEO Performance
export function SEOExample() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>SEO Performance</Typography>
        <InsightText 
          text="Organic traffic grew by 34% this quarter, with 89,432 new sessions. The top-performing keywords include 'digital marketing' and 'SEO tools'. Page load speed improved to 2.3 seconds, reducing bounce rate by 15%."
          variant="body1"
        />
      </CardContent>
    </Card>
  );
}

// Example 6: Custom Configuration
export function CustomConfigExample() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Custom Keywords</Typography>
        <EmphasizedText 
          text="Brand awareness campaigns showed strong performance with customer lifetime value increasing significantly. The churn rate decreased while user acquisition cost remained stable."
          variant="body1"
          emphasisOptions={{
            customKeywords: ['brand awareness', 'customer lifetime value', 'churn rate', 'user acquisition cost'],
            enableCurrency: false
          }}
        />
      </CardContent>
    </Card>
  );
}

// Example 7: All Examples in One Component
export function AllExamples() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <BasicExample />
      <CampaignExample />
      <SocialMediaExample />
      <EcommerceExample />
      <SEOExample />
      <CustomConfigExample />
    </Box>
  );
}




