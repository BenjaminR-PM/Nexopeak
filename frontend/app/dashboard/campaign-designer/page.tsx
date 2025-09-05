'use client'

import React, { useMemo, useState } from "react";
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip, 
  TextField, Tabs, Tab, Select, MenuItem, FormControl, InputLabel,
  Slider, Tooltip, Divider,
  Paper, List, ListItem, ListItemText
} from '@mui/material';
import {
  Settings as SettingsIcon, Rocket as RocketIcon, Gauge as GaugeIcon,
  Layers as LayersIcon, Target as TargetIcon, AutoFixHigh as WandIcon,
  PlayArrow as PlayIcon, BarChart as BarChartIcon, TrendingUp as TrendingUpIcon,
  Warning as WarningIcon, PauseCircle as PauseCircleIcon, ContentCopy as CopyIcon
} from '@mui/icons-material';

export const dynamic = 'force-dynamic'

interface TabPanelProps {
  readonly children?: React.ReactNode;
  readonly index: number;
  readonly value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`campaign-tabpanel-${index}`}
      aria-labelledby={`campaign-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CampaignDesignerPage() {
  const [objective, setObjective] = useState("lead_gen");
  const [primaryKpi, setPrimaryKpi] = useState("CPL");
  const [budget, setBudget] = useState(15000);
  const [dailyMin, setDailyMin] = useState(300);
  const [flightDays, setFlightDays] = useState(42);
  const [geo, setGeo] = useState("CA-ON, CA-BC");
  const [retargetDays, setRetargetDays] = useState(30);
  const [channels, setChannels] = useState(["Search","Meta","LinkedIn","YouTube"]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [icpNotes, setIcpNotes] = useState("PMs & GC owners, 25–54; high intent in ON & BC; ACV $3600; margin 80%");

  const score = useMemo(() => {
    // toy derived score to make the UI feel alive
    const intentBoost = objective === "lead_gen" && channels.includes("Search") ? 1.15 : 1;
    const reachBoost = channels.includes("YouTube") ? 1.05 : 1;
    const durationBoost = Math.min(1 + (flightDays/90)*0.2, 1.2);
    const pacingPenalty = dailyMin * flightDays > budget ? 0.85 : 1;
    return Math.round(68 * intentBoost * reachBoost * durationBoost * pacingPenalty);
  }, [objective, channels, flightDays, dailyMin, budget]);

  const budgetSplit = useMemo(() => {
    // simple proportional suggestion (demo only)
    const weights: Record<string, number> = {Search: 0.45, Meta: 0.25, LinkedIn: 0.2, YouTube: 0.1};
    const active = channels.filter(c => weights[c]);
    const sum = active.reduce((s,c) => s + weights[c], 0);
    return active.map(c => ({channel: c, pct: Math.round((weights[c]/sum)*100)}));
  }, [channels]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const toggleChannel = (channel: string) => {
    setChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const generateActivationJSON = () => {
    return JSON.stringify({
      objective,
      kpi: { primary: primaryKpi },
      budget_split: budgetSplit.map(b => ({channel: b.channel, pct: b.pct})),
      flight_days: flightDays,
      geo,
      channels,
      icp_notes: icpNotes,
      retargeting_window: retargetDays
    }, null, 2);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateActivationJSON());
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 3 }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Nexopeak <Typography component="span" sx={{ color: 'text.secondary' }}>Campaign Designer</Typography>
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Turn inputs → optimized plan → activation JSON
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<SettingsIcon />} sx={{ borderRadius: 3 }}>
              Settings
            </Button>
            <Button variant="contained" startIcon={<RocketIcon />} sx={{ borderRadius: 3 }}>
              Generate Plan
            </Button>
          </Box>
        </Box>

        {/* KPI Strip */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Design Score</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GaugeIcon />
                  <Typography variant="h4" fontWeight="bold">{score}/100</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Budget</Typography>
                <Typography variant="h4" fontWeight="bold">${budget.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Flight</Typography>
                <Typography variant="h4" fontWeight="bold">{flightDays} days</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Channels</Typography>
                <Typography variant="h4" fontWeight="bold">{channels.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<LayersIcon />} label="Inputs" />
            <Tab icon={<TargetIcon />} label="Plan" />
            <Tab icon={<WandIcon />} label="Optimizer" />
            <Tab icon={<PlayIcon />} label="Experiments" />
            <Tab icon={<BarChartIcon />} label="Scorecard" />
            <Tab icon={<TrendingUpIcon />} label="Tracking" />
          </Tabs>

          {/* INPUTS TAB */}
          <TabPanel value={selectedTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Objective</InputLabel>
                          <Select
                            value={objective}
                            label="Objective"
                            onChange={(e) => setObjective(e.target.value)}
                          >
                            <MenuItem value="lead_gen">Lead Gen</MenuItem>
                            <MenuItem value="ecommerce_sales">E‑commerce Sales</MenuItem>
                            <MenuItem value="app_installs">App Installs</MenuItem>
                            <MenuItem value="awareness">Awareness</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Primary KPI</InputLabel>
                          <Select
                            value={primaryKpi}
                            label="Primary KPI"
                            onChange={(e) => setPrimaryKpi(e.target.value)}
                          >
                            <MenuItem value="CPL">CPL</MenuItem>
                            <MenuItem value="CPA">CPA</MenuItem>
                            <MenuItem value="ROAS">ROAS</MenuItem>
                            <MenuItem value="CTR">CTR</MenuItem>
                            <MenuItem value="Reach">Reach</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Total Budget"
                          type="number"
                          value={budget}
                          onChange={(e) => setBudget(parseInt(e.target.value || "0"))}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Daily Min Spend"
                          type="number"
                          value={dailyMin}
                          onChange={(e) => setDailyMin(parseInt(e.target.value || "0"))}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography gutterBottom>Flight Length (days)</Typography>
                        <Slider
                          value={flightDays}
                          min={7}
                          max={120}
                          step={1}
                          onChange={(_, value) => setFlightDays(value as number)}
                          valueLabelDisplay="auto"
                        />
                        <Typography variant="body2" color="text.secondary">{flightDays} days</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Geo"
                          value={geo}
                          onChange={(e) => setGeo(e.target.value)}
                          placeholder="CA-ON, CA-BC"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography gutterBottom>Channels</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {["Search","Performance Max","Meta","LinkedIn","TikTok","YouTube","Display","Email","SMS"].map(channel => {
                            const active = channels.includes(channel);
                            return (
                              <Chip
                                key={channel}
                                label={channel}
                                onClick={() => toggleChannel(channel)}
                                color={active ? "primary" : "default"}
                                variant={active ? "filled" : "outlined"}
                                sx={{ cursor: 'pointer' }}
                              />
                            );
                          })}
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography gutterBottom>Retargeting Window (days)</Typography>
                        <Slider
                          value={retargetDays}
                          min={7}
                          max={180}
                          step={1}
                          onChange={(_, value) => setRetargetDays(value as number)}
                          valueLabelDisplay="auto"
                        />
                        <Typography variant="body2" color="text.secondary">{retargetDays} days</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="ICP / Notes"
                          multiline
                          rows={3}
                          value={icpNotes}
                          onChange={(e) => setIcpNotes(e.target.value)}
                          placeholder="e.g., PMs & GC owners, 25–54; high intent in ON & BC; ACV $3600; margin 80%"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold">Suggested Split</Typography>
                      <Tooltip title="Demo logic based on IPPO priors">
                        <WarningIcon color="warning" />
                      </Tooltip>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <List dense>
                      {budgetSplit.map(b => (
                        <ListItem key={b.channel} sx={{ px: 0 }}>
                          <ListItemText primary={b.channel} />
                          <Typography fontWeight="bold">{b.pct}%</Typography>
                        </ListItem>
                      ))}
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <Button fullWidth variant="contained" startIcon={<WandIcon />} sx={{ borderRadius: 3 }}>
                      Recalculate
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* PLAN TAB */}
          <TabPanel value={selectedTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Campaign Blueprint</Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Audiences</Typography>
                          <List dense>
                            <ListItem sx={{ px: 0 }}><ListItemText primary="Search – Nonbrand (core keywords)" /></ListItem>
                            <ListItem sx={{ px: 0 }}><ListItemText primary="Search – Brand" /></ListItem>
                            <ListItem sx={{ px: 0 }}><ListItemText primary={`Meta – Retarget ${retargetDays}d`} /></ListItem>
                            <ListItem sx={{ px: 0 }}><ListItemText primary="LinkedIn – Prospecting (PM/Construction interests)" /></ListItem>
                            <ListItem sx={{ px: 0 }}><ListItemText primary="YouTube – Awareness (15s)" /></ListItem>
                          </List>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Creatives</Typography>
                          <List dense>
                            <ListItem sx={{ px: 0 }}><ListItemText primary="RSA v1/v2 (Search)" /></ListItem>
                            <ListItem sx={{ px: 0 }}><ListItemText primary="Video 15s – Value Prop A" /></ListItem>
                            <ListItem sx={{ px: 0 }}><ListItemText primary="Carousel – Case Study" /></ListItem>
                            <ListItem sx={{ px: 0 }}><ListItemText primary="Static – Comparison chart" /></ListItem>
                          </List>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Budget & Pacing</Typography>
                          <List dense>
                            {budgetSplit.map(b => (
                              <ListItem key={b.channel} sx={{ px: 0 }}>
                                <ListItemText primary={`${b.channel}: ${b.pct}% of total`} />
                              </ListItem>
                            ))}
                            <ListItem sx={{ px: 0 }}><ListItemText primary={`Daily min: $${dailyMin}`} /></ListItem>
                            <ListItem sx={{ px: 0 }}><ListItemText primary={`Flight: ${flightDays} days`} /></ListItem>
                          </List>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Decision Rules</Typography>
                          <List dense>
                            <ListItem sx={{ px: 0 }}><ListItemText primary="Pause: CPL > 1.5× target + ≥50 clicks" /></ListItem>
                            <ListItem sx={{ px: 0 }}><ListItemText primary="Scale: CPL < 0.8× target + ≥10 conv" /></ListItem>
                            <ListItem sx={{ px: 0 }}><ListItemText primary="Min learning: ≥3k impressions" /></ListItem>
                          </List>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Activation JSON</Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'white', borderRadius: 2, mb: 2 }}>
                      <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem', lineHeight: 1.5, overflow: 'auto' }}>
                        {generateActivationJSON()}
                      </Typography>
                    </Paper>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      startIcon={<CopyIcon />} 
                      sx={{ borderRadius: 3 }}
                      onClick={copyToClipboard}
                    >
                      Copy JSON
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* OPTIMIZER TAB */}
          <TabPanel value={selectedTab} index={2}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">Budget Optimizer (Demo)</Typography>
                  <Chip label="Greedy Allocation" variant="outlined" sx={{ borderRadius: 3 }} />
                </Box>
                <Grid container spacing={3}>
                  {budgetSplit.map(b => (
                    <Grid item xs={12} md={3} key={b.channel}>
                      <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary">{b.channel}</Typography>
                        <Typography variant="h4" fontWeight="bold">{b.pct}%</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Saturation: {(40 + b.pct/2)}%
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button variant="contained" startIcon={<PlayIcon />} sx={{ borderRadius: 3 }}>
                    Run
                  </Button>
                  <Button variant="outlined" startIcon={<PauseCircleIcon />} sx={{ borderRadius: 3 }}>
                    Reset
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          {/* EXPERIMENTS TAB */}
          <TabPanel value={selectedTab} index={3}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Experiment Grid</Typography>
                <Grid container spacing={3}>
                  {["Search_Nonbrand", "Meta_Retarget_30d", "LinkedIn_Prospecting"].map(tactic => (
                    <Grid item xs={12} md={4} key={tactic}>
                      <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{tactic}</Typography>
                        <List dense>
                          <ListItem sx={{ px: 0 }}><ListItemText primary="Creative A vs B" /></ListItem>
                          <ListItem sx={{ px: 0 }}><ListItemText primary="Bid Strategy 1 vs 2" /></ListItem>
                          <ListItem sx={{ px: 0 }}><ListItemText primary="Audience Variant X" /></ListItem>
                        </List>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* SCORECARD TAB */}
          <TabPanel value={selectedTab} index={4}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Weekly Scorecard (Mock)</Typography>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={2}><Typography variant="subtitle2" fontWeight="bold">Tactic</Typography></Grid>
                  <Grid item xs={2}><Typography variant="subtitle2" fontWeight="bold">Spend</Typography></Grid>
                  <Grid item xs={2}><Typography variant="subtitle2" fontWeight="bold">Clicks</Typography></Grid>
                  <Grid item xs={2}><Typography variant="subtitle2" fontWeight="bold">Leads</Typography></Grid>
                  <Grid item xs={2}><Typography variant="subtitle2" fontWeight="bold">CPL</Typography></Grid>
                </Grid>
                {budgetSplit.map(b => (
                  <Grid container spacing={1} key={b.channel} sx={{ mb: 1 }}>
                    <Grid item xs={2}><Typography variant="body2">{b.channel}</Typography></Grid>
                    <Grid item xs={2}><Typography variant="body2">${Math.round((budget*b.pct/100)/4).toLocaleString()}</Typography></Grid>
                    <Grid item xs={2}><Typography variant="body2">{Math.round(500*b.pct/25)}</Typography></Grid>
                    <Grid item xs={2}><Typography variant="body2">{Math.round(20*b.pct/25)}</Typography></Grid>
                    <Grid item xs={2}><Typography variant="body2">${Math.max(20, 90 - b.pct)}</Typography></Grid>
                  </Grid>
                ))}
              </CardContent>
            </Card>
          </TabPanel>

          {/* TRACKING TAB */}
          <TabPanel value={selectedTab} index={5}>
            <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Tracking & UTMs</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>UTM Template</Typography>
                      <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'white', borderRadius: 2 }}>
                        <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem', lineHeight: 1.5, overflow: 'auto' }}>
                          {"utm_source={{src}}&utm_medium={{med}}&utm_campaign={{cmp}}&utm_content={{crt}}&utm_term={{term}}"}
                        </Typography>
                      </Paper>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Events</Typography>
                      <List dense>
                        <ListItem sx={{ px: 0 }}><ListItemText primary="view_content" /></ListItem>
                        <ListItem sx={{ px: 0 }}><ListItemText primary="lead_form_start" /></ListItem>
                        <ListItem sx={{ px: 0 }}><ListItemText primary="qualified_lead" /></ListItem>
                      </List>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>
        </Paper>
      </Box>
    </Box>
  );
}
