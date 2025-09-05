/**
 * Campaign API service for frontend
 */

// Types
export interface Campaign {
  id: string
  name: string
  description?: string
  campaign_type: 'search' | 'display' | 'video' | 'shopping' | 'performance_max' | 'app' | 'local'
  platform: 'google_ads' | 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'snapchat' | 'pinterest'
  status: 'draft' | 'active' | 'paused' | 'completed'
  primary_objective: string
  secondary_objectives: string[]
  target_kpis: Record<string, any>
  total_budget?: number
  daily_budget?: number
  currency: string
  start_date?: string
  end_date?: string
  target_demographics: Record<string, any>
  target_locations: string[]
  target_interests: string[]
  target_behaviors: string[]
  audience_size_estimate?: number
  creative_assets: Record<string, any>
  messaging_themes: string[]
  call_to_action?: string
  landing_page_url?: string
  bidding_strategy?: string
  ad_scheduling: Record<string, any>
  device_targeting: string[]
  tags: string[]
  custom_fields: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CampaignCreate {
  name: string
  description?: string
  campaign_type: string
  platform: string
  primary_objective: string
  secondary_objectives?: string[]
  target_kpis?: Record<string, any>
  total_budget?: number
  daily_budget?: number
  currency?: string
  start_date?: string
  end_date?: string
  target_demographics?: Record<string, any>
  target_locations?: string[]
  target_interests?: string[]
  target_behaviors?: string[]
  creative_assets?: Record<string, any>
  messaging_themes?: string[]
  call_to_action?: string
  landing_page_url?: string
  bidding_strategy?: string
  ad_scheduling?: Record<string, any>
  device_targeting?: string[]
  tags?: string[]
  custom_fields?: Record<string, any>
}

export interface CampaignListResponse {
  campaigns: Campaign[]
  total: number
  page: number
  per_page: number
}

export interface CampaignQuestionnaire {
  campaign_name: string
  business_goals: string[]
  target_action: string
  budget_range: string
  campaign_duration: string
  seasonality: string
  target_audience_description: string
  audience_interests?: string[]
  audience_pain_points?: string[]
}

// Campaign Designer types
export interface CampaignDesignerData {
  name: string
  objective: 'lead_gen' | 'ecommerce_sales' | 'app_installs' | 'awareness'
  primaryKpi: 'CPL' | 'CPA' | 'ROAS' | 'CTR' | 'Reach'
  budget: {
    total: number
    daily: number
    duration: number
  }
  channels: Array<{
    channel: string
    percentage: number
    amount: number
  }>
  targeting: {
    geo: string[]
    audience: string
  }
  kpiTarget: number
  designScore: number
  selectedTemplate?: string
  createdAt: string
}

export interface CampaignDesignerCreate {
  designer_data: CampaignDesignerData
}

export interface CampaignAnalysis {
  id: string
  campaign_id: string
  analysis_type: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  ga4_data: Record<string, any>
  campaign_predictions: Record<string, any>
  performance_gaps: Record<string, any>
  recommendations: Record<string, any>
  priority_actions: string[]
  overall_score?: number
  gap_scores: Record<string, any>
  confidence_level?: number
  audience_analysis: Record<string, any>
  creative_analysis: Record<string, any>
  budget_analysis: Record<string, any>
  timing_analysis: Record<string, any>
  technical_analysis: Record<string, any>
  market_insights: Record<string, any>
  competitor_analysis: Record<string, any>
  seasonal_trends: Record<string, any>
  processing_started_at?: string
  processing_completed_at?: string
  error_message?: string
  created_at: string
  updated_at: string
}

export interface CampaignOptions {
  campaign_types: Array<{
    value: string
    label: string
    description: string
  }>
  platforms: Array<{
    value: string
    label: string
    description: string
  }>
  objectives: Array<{
    value: string
    label: string
    description: string
  }>
}

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-staging.nexopeak.ca'
  : 'http://localhost:8000'

/**
 * Get authentication headers
 */
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API Error: ${response.status} - ${error}`)
  }
  return response.json()
}

/**
 * Get campaign type options
 */
export async function getCampaignOptions(): Promise<CampaignOptions> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/types/options`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse<CampaignOptions>(response)
  } catch (error) {
    console.error('Error fetching campaign options:', error)
    // Fallback data
    return {
      campaign_types: [
        { value: 'search', label: 'Search', description: 'Text ads on search results' },
        { value: 'display', label: 'Display', description: 'Visual ads on websites' },
        { value: 'video', label: 'Video', description: 'Video ads on platforms like YouTube' },
        { value: 'social', label: 'Social Media', description: 'Social media advertising' }
      ],
      platforms: [
        { value: 'google_ads', label: 'Google Ads', description: 'Google advertising platform' },
        { value: 'facebook', label: 'Facebook', description: 'Facebook advertising' },
        { value: 'instagram', label: 'Instagram', description: 'Instagram advertising' }
      ],
      objectives: [
        { value: 'awareness', label: 'Brand Awareness', description: 'Increase brand visibility' },
        { value: 'traffic', label: 'Website Traffic', description: 'Drive visitors to website' },
        { value: 'leads', label: 'Lead Generation', description: 'Generate leads and inquiries' },
        { value: 'sales', label: 'Sales', description: 'Drive online sales' }
      ]
    }
  }
}

/**
 * Get questionnaire template
 */
export async function getQuestionnaireTemplate(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/templates/questionnaire`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  } catch (error) {
    console.error('Error fetching questionnaire template:', error)
    throw error
  }
}

/**
 * Get campaigns with pagination and filtering
 */
export async function getCampaigns(
  page: number = 1,
  per_page: number = 20,
  status?: string,
  campaign_type?: string
): Promise<CampaignListResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: per_page.toString(),
      ...(status && { status }),
      ...(campaign_type && { campaign_type })
    })

    const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/?${params}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse<CampaignListResponse>(response)
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    // Return empty result on error
    return {
      campaigns: [],
      total: 0,
      page: 1,
      per_page: 20
    }
  }
}

/**
 * Get a specific campaign
 */
export async function getCampaign(campaignId: string): Promise<Campaign> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/${campaignId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse<Campaign>(response)
  } catch (error) {
    console.error('Error fetching campaign:', error)
    throw error
  }
}

/**
 * Create a new campaign
 */
export async function createCampaign(campaignData: CampaignCreate): Promise<Campaign> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(campaignData)
    })
    return handleResponse<Campaign>(response)
  } catch (error) {
    console.error('Error creating campaign:', error)
    throw error
  }
}


/**
 * Update a campaign
 */
export async function updateCampaign(campaignId: string, campaignData: Partial<CampaignCreate>): Promise<Campaign> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/${campaignId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(campaignData)
    })
    return handleResponse<Campaign>(response)
  } catch (error) {
    console.error('Error updating campaign:', error)
    throw error
  }
}

/**
 * Delete a campaign
 */
export async function deleteCampaign(campaignId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/${campaignId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    await handleResponse(response)
  } catch (error) {
    console.error('Error deleting campaign:', error)
    throw error
  }
}

/**
 * Start campaign analysis
 */
export async function startCampaignAnalysis(
  campaignId: string, 
  questionnaireData?: CampaignQuestionnaire,
  forceReanalysis: boolean = false
): Promise<CampaignAnalysis> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/${campaignId}/analyze`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        questionnaire_data: questionnaireData,
        force_reanalysis: forceReanalysis
      })
    })
    return handleResponse<CampaignAnalysis>(response)
  } catch (error) {
    console.error('Error starting campaign analysis:', error)
    throw error
  }
}

/**
 * Analyze questionnaire (create campaign and start analysis)
 */
export async function analyzeQuestionnaire(questionnaire: CampaignQuestionnaire): Promise<{
  analysis: CampaignAnalysis
  campaign: Campaign
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/analyze-questionnaire`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        questionnaire_data: questionnaire,
        force_reanalysis: true
      })
    })
    return handleResponse(response)
  } catch (error) {
    console.error('Error analyzing questionnaire:', error)
    throw error
  }
}

/**
 * Get campaign analysis
 */
export async function getCampaignAnalysis(campaignId: string): Promise<CampaignAnalysis> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/${campaignId}/analysis`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse<CampaignAnalysis>(response)
  } catch (error) {
    console.error('Error fetching campaign analysis:', error)
    throw error
  }
}

/**
 * Get full campaign analysis with campaign details
 */
export async function getCampaignAnalysisFull(campaignId: string): Promise<{
  analysis: CampaignAnalysis
  campaign: Campaign
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/${campaignId}/analysis/full`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  } catch (error) {
    console.error('Error fetching full campaign analysis:', error)
    throw error
  }
}

/**
 * Create campaign from Campaign Designer data
 */
export async function createCampaignFromDesigner(designerData: CampaignDesignerData): Promise<Campaign> {
  try {
    console.log('Sending campaign data to API:', designerData);
    console.log('API URL:', `${API_BASE_URL}/api/v1/campaigns/from-designer`);
    console.log('Headers:', getAuthHeaders());
    
    const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/from-designer`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        designer_data: designerData
      })
    })
    
    console.log('API Response status:', response.status);
    console.log('API Response headers:', response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error response:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('API Success response:', result);
    return result;
  } catch (error) {
    console.error('Error creating campaign from designer:', error)
    throw error
  }
}




