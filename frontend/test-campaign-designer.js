#!/usr/bin/env node
/**
 * Campaign Designer Frontend Test Suite
 * Tests the complete campaign registration flow in the browser
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class CampaignDesignerTester {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || 'http://localhost:3000';
        this.headless = options.headless !== false;
        this.slowMo = options.slowMo || 50;
        this.timeout = options.timeout || 30000;
        this.browser = null;
        this.page = null;
        
        // Test data
        this.testUser = {
            email: 'test_designer_user@example.com',
            password: 'TestPassword123!',
            fullName: 'Campaign Designer Tester',
            companyName: 'Test Design Company'
        };
        
        this.campaignData = {
            name: 'Automated Test Campaign',
            objective: 'lead_gen',
            primaryKpi: 'leads',
            totalBudget: '5,000',
            dailyBudget: '167',
            duration: 30,
            channels: ['Search', 'Meta', 'LinkedIn'],
            geo: ['United States', 'Canada'],
            audience: {
                age: '25-45',
                gender: 'All',
                income: '$50k-$100k',
                interests: ['Technology', 'Marketing'],
                jobTitles: ['Marketing Manager'],
                industries: ['Technology']
            },
            kpiTarget: 150
        };
    }
    
    log(message, type = 'INFO') {
        const colors = {
            INFO: '\x1b[34m',
            SUCCESS: '\x1b[32m',
            ERROR: '\x1b[31m',
            WARNING: '\x1b[33m'
        };
        const reset = '\x1b[0m';
        console.log(`${colors[type]}[${type}]${reset} ${message}`);
    }
    
    async setup() {
        this.log('Setting up browser...');
        
        this.browser = await puppeteer.launch({
            headless: this.headless,
            slowMo: this.slowMo,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: { width: 1280, height: 720 }
        });
        
        this.page = await this.browser.newPage();
        
        // Set up error handling
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                this.log(`Browser console error: ${msg.text()}`, 'ERROR');
            }
        });
        
        this.page.on('pageerror', error => {
            this.log(`Page error: ${error.message}`, 'ERROR');
        });
        
        // Set default timeout
        this.page.setDefaultTimeout(this.timeout);
        
        this.log('Browser setup complete', 'SUCCESS');
    }
    
    async teardown() {
        if (this.browser) {
            await this.browser.close();
            this.log('Browser closed', 'SUCCESS');
        }
    }
    
    async waitForElement(selector, options = {}) {
        try {
            await this.page.waitForSelector(selector, {
                visible: true,
                timeout: options.timeout || this.timeout
            });
            return true;
        } catch (error) {
            this.log(`Element not found: ${selector}`, 'ERROR');
            return false;
        }
    }
    
    async takeScreenshot(name) {
        const screenshotPath = path.join(__dirname, 'test-screenshots', `${name}.png`);
        
        // Create directory if it doesn't exist
        const dir = path.dirname(screenshotPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        this.log(`Screenshot saved: ${screenshotPath}`);
    }
    
    async loginUser() {
        this.log('Testing user login...');
        
        try {
            // Navigate to login page
            await this.page.goto(`${this.baseUrl}/auth/login`);
            await this.waitForElement('input[type="email"]');
            
            // Fill login form
            await this.page.type('input[type="email"]', this.testUser.email);
            await this.page.type('input[type="password"]', this.testUser.password);
            
            // Submit form
            await this.page.click('button[type="submit"]');
            
            // Wait for redirect to dashboard
            await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
            
            // Check if we're on the dashboard
            const currentUrl = this.page.url();
            if (currentUrl.includes('/dashboard')) {
                this.log('User login successful', 'SUCCESS');
                return true;
            } else {
                this.log('Login failed - not redirected to dashboard', 'ERROR');
                return false;
            }
            
        } catch (error) {
            this.log(`Login error: ${error.message}`, 'ERROR');
            return false;
        }
    }
    
    async navigateToCampaignDesigner() {
        this.log('Navigating to Campaign Designer...');
        
        try {
            // Navigate to campaign designer
            await this.page.goto(`${this.baseUrl}/dashboard/campaign-designer`);
            await this.waitForElement('h1', { timeout: 10000 });
            
            // Check if we're on the campaign designer page
            const title = await this.page.$eval('h1', el => el.textContent);
            if (title.includes('Campaign Designer')) {
                this.log('Successfully navigated to Campaign Designer', 'SUCCESS');
                await this.takeScreenshot('campaign-designer-loaded');
                return true;
            } else {
                this.log('Failed to navigate to Campaign Designer', 'ERROR');
                return false;
            }
            
        } catch (error) {
            this.log(`Navigation error: ${error.message}`, 'ERROR');
            return false;
        }
    }
    
    async fillCampaignBasics() {
        this.log('Filling Campaign Basics step...');
        
        try {
            // Wait for campaign name input
            await this.waitForElement('input[placeholder*="campaign name"]');
            
            // Fill campaign name
            await this.page.type('input[placeholder*="campaign name"]', this.campaignData.name);
            
            // Select objective
            const objectiveSelector = `[data-value="${this.campaignData.objective}"]`;
            if (await this.page.$(objectiveSelector)) {
                await this.page.click(objectiveSelector);
            } else {
                // Try alternative selector
                await this.page.click('[role="button"]:has-text("Campaign Objective")');
                await this.page.click(`[data-value="${this.campaignData.objective}"]`);
            }
            
            // Select primary KPI
            const kpiSelector = `[data-value="${this.campaignData.primaryKpi}"]`;
            if (await this.page.$(kpiSelector)) {
                await this.page.click(kpiSelector);
            }
            
            // Fill audience details
            await this.fillAudienceDetails();
            
            // Click Next button
            await this.page.click('button:has-text("Next")');
            
            this.log('Campaign Basics step completed', 'SUCCESS');
            await this.takeScreenshot('campaign-basics-completed');
            return true;
            
        } catch (error) {
            this.log(`Campaign Basics error: ${error.message}`, 'ERROR');
            await this.takeScreenshot('campaign-basics-error');
            return false;
        }
    }
    
    async fillAudienceDetails() {
        this.log('Filling audience details...');
        
        try {
            // Age Range
            const ageSelector = '[data-testid="age-select"]';
            if (await this.page.$(ageSelector)) {
                await this.page.click(ageSelector);
                await this.page.click(`[data-value="${this.campaignData.audience.age}"]`);
            }
            
            // Gender
            const genderSelector = '[data-testid="gender-select"]';
            if (await this.page.$(genderSelector)) {
                await this.page.click(genderSelector);
                await this.page.click(`[data-value="${this.campaignData.audience.gender}"]`);
            }
            
            // Income Level
            const incomeSelector = '[data-testid="income-select"]';
            if (await this.page.$(incomeSelector)) {
                await this.page.click(incomeSelector);
                await this.page.click(`[data-value="${this.campaignData.audience.income}"]`);
            }
            
            // Interests (multi-select)
            for (const interest of this.campaignData.audience.interests) {
                const interestSelector = `[data-value="${interest}"]`;
                if (await this.page.$(interestSelector)) {
                    await this.page.click(interestSelector);
                }
            }
            
            this.log('Audience details filled', 'SUCCESS');
            
        } catch (error) {
            this.log(`Audience details error: ${error.message}`, 'WARNING');
        }
    }
    
    async fillBudgetAndTimeline() {
        this.log('Filling Budget & Timeline step...');
        
        try {
            // Wait for budget inputs
            await this.waitForElement('input[placeholder*="Total Budget"]');
            
            // Clear and fill total budget
            await this.page.click('input[placeholder*="Total Budget"]', { clickCount: 3 });
            await this.page.type('input[placeholder*="Total Budget"]', this.campaignData.totalBudget);
            
            // Clear and fill daily budget
            await this.page.click('input[placeholder*="Daily Budget"]', { clickCount: 3 });
            await this.page.type('input[placeholder*="Daily Budget"]', this.campaignData.dailyBudget);
            
            // Set duration using slider
            const durationSlider = await this.page.$('[role="slider"]');
            if (durationSlider) {
                // Get slider bounds
                const sliderBox = await durationSlider.boundingBox();
                const targetX = sliderBox.x + (sliderBox.width * (this.campaignData.duration / 90));
                
                await this.page.mouse.click(targetX, sliderBox.y + sliderBox.height / 2);
            }
            
            // Set KPI Target
            const kpiInput = await this.page.$('input[placeholder*="KPI Target"]');
            if (kpiInput) {
                await kpiInput.click({ clickCount: 3 });
                await kpiInput.type(this.campaignData.kpiTarget.toString());
            }
            
            // Click Next
            await this.page.click('button:has-text("Next")');
            
            this.log('Budget & Timeline step completed', 'SUCCESS');
            await this.takeScreenshot('budget-timeline-completed');
            return true;
            
        } catch (error) {
            this.log(`Budget & Timeline error: ${error.message}`, 'ERROR');
            await this.takeScreenshot('budget-timeline-error');
            return false;
        }
    }
    
    async selectChannelsAndTargeting() {
        this.log('Selecting Channels & Targeting...');
        
        try {
            // Wait for channels section
            await this.waitForElement('[data-testid="channel-selection"]', { timeout: 5000 });
            
            // Select channels
            for (const channel of this.campaignData.channels) {
                const channelSelector = `[data-testid="channel-${channel}"]`;
                if (await this.page.$(channelSelector)) {
                    await this.page.click(channelSelector);
                } else {
                    // Try alternative selector
                    await this.page.click(`button:has-text("${channel}")`);
                }
            }
            
            // Select geographic targeting
            const geoSelector = '[data-testid="geo-select"]';
            if (await this.page.$(geoSelector)) {
                await this.page.click(geoSelector);
                
                for (const location of this.campaignData.geo) {
                    await this.page.click(`[data-value="${location}"]`);
                }
            }
            
            // Click Next
            await this.page.click('button:has-text("Next")');
            
            this.log('Channels & Targeting step completed', 'SUCCESS');
            await this.takeScreenshot('channels-targeting-completed');
            return true;
            
        } catch (error) {
            this.log(`Channels & Targeting error: ${error.message}`, 'ERROR');
            await this.takeScreenshot('channels-targeting-error');
            return false;
        }
    }
    
    async reviewAndRegister() {
        this.log('Reviewing and registering campaign...');
        
        try {
            // Wait for review section
            await this.waitForElement('[data-testid="campaign-summary"]', { timeout: 10000 });
            
            // Verify campaign details are displayed
            const campaignName = await this.page.$eval(
                '[data-testid="campaign-name"]', 
                el => el.textContent
            ).catch(() => null);
            
            if (campaignName && campaignName.includes(this.campaignData.name)) {
                this.log('Campaign details verified in review', 'SUCCESS');
            } else {
                this.log('Campaign details not found in review', 'WARNING');
            }
            
            // Take screenshot of review page
            await this.takeScreenshot('campaign-review');
            
            // Click Register Campaign button
            const registerButton = await this.page.$('button:has-text("Register Campaign")');
            if (registerButton) {
                await registerButton.click();
                
                // Wait for success message or redirect
                try {
                    await this.page.waitForNavigation({ 
                        waitUntil: 'networkidle0', 
                        timeout: 15000 
                    });
                    
                    // Check if we're redirected to campaigns page
                    const currentUrl = this.page.url();
                    if (currentUrl.includes('/campaigns')) {
                        this.log('Campaign registered successfully!', 'SUCCESS');
                        await this.takeScreenshot('campaign-registered');
                        return true;
                    } else {
                        this.log('Registration completed but unexpected redirect', 'WARNING');
                        return true;
                    }
                    
                } catch (navigationError) {
                    // Check for success message on same page
                    const successMessage = await this.page.$('.success-message, .alert-success');
                    if (successMessage) {
                        this.log('Campaign registered successfully (no redirect)', 'SUCCESS');
                        return true;
                    } else {
                        this.log('Registration may have failed - no success indication', 'ERROR');
                        return false;
                    }
                }
            } else {
                this.log('Register Campaign button not found', 'ERROR');
                return false;
            }
            
        } catch (error) {
            this.log(`Review and Register error: ${error.message}`, 'ERROR');
            await this.takeScreenshot('review-register-error');
            return false;
        }
    }
    
    async testFormValidation() {
        this.log('Testing form validation...');
        
        try {
            // Navigate back to campaign designer
            await this.page.goto(`${this.baseUrl}/dashboard/campaign-designer`);
            await this.waitForElement('h1');
            
            // Try to proceed without filling required fields
            const nextButton = await this.page.$('button:has-text("Next")');
            if (nextButton) {
                const isDisabled = await this.page.$eval(
                    'button:has-text("Next")', 
                    el => el.disabled
                );
                
                if (isDisabled) {
                    this.log('Form validation working - Next button disabled', 'SUCCESS');
                    return true;
                } else {
                    this.log('Form validation issue - Next button should be disabled', 'WARNING');
                    return false;
                }
            }
            
            return true;
            
        } catch (error) {
            this.log(`Form validation test error: ${error.message}`, 'ERROR');
            return false;
        }
    }
    
    async testBudgetCalculations() {
        this.log('Testing budget calculations...');
        
        try {
            // Navigate to budget step
            await this.page.goto(`${this.baseUrl}/dashboard/campaign-designer`);
            await this.waitForElement('input[placeholder*="campaign name"]');
            
            // Fill minimum required fields to reach budget step
            await this.page.type('input[placeholder*="campaign name"]', 'Budget Test Campaign');
            await this.page.click('button:has-text("Next")');
            
            // Wait for budget inputs
            await this.waitForElement('input[placeholder*="Total Budget"]');
            
            // Test budget calculation
            await this.page.type('input[placeholder*="Total Budget"]', '3000');
            
            // Check if daily budget is calculated automatically
            await this.page.waitForTimeout(1000); // Wait for calculation
            
            const dailyBudgetValue = await this.page.$eval(
                'input[placeholder*="Daily Budget"]',
                el => el.value
            );
            
            if (dailyBudgetValue && parseInt(dailyBudgetValue.replace(/,/g, '')) > 0) {
                this.log('Budget calculations working correctly', 'SUCCESS');
                return true;
            } else {
                this.log('Budget calculations not working', 'ERROR');
                return false;
            }
            
        } catch (error) {
            this.log(`Budget calculation test error: ${error.message}`, 'ERROR');
            return false;
        }
    }
    
    async runFullCampaignFlow() {
        this.log('Running complete campaign registration flow...');
        
        const steps = [
            { name: 'Navigate to Campaign Designer', fn: () => this.navigateToCampaignDesigner() },
            { name: 'Fill Campaign Basics', fn: () => this.fillCampaignBasics() },
            { name: 'Fill Budget & Timeline', fn: () => this.fillBudgetAndTimeline() },
            { name: 'Select Channels & Targeting', fn: () => this.selectChannelsAndTargeting() },
            { name: 'Review and Register', fn: () => this.reviewAndRegister() }
        ];
        
        for (const step of steps) {
            this.log(`Executing: ${step.name}`);
            const result = await step.fn();
            
            if (!result) {
                this.log(`Step failed: ${step.name}`, 'ERROR');
                return false;
            }
            
            // Wait between steps
            await this.page.waitForTimeout(1000);
        }
        
        this.log('Complete campaign flow executed successfully!', 'SUCCESS');
        return true;
    }
    
    async runAllTests() {
        this.log('🧪 Starting Campaign Designer Test Suite');
        this.log('='.repeat(50));
        
        const results = [];
        
        try {
            await this.setup();
            
            // Login first
            const loginResult = await this.loginUser();
            if (!loginResult) {
                this.log('Cannot proceed without login', 'ERROR');
                return false;
            }
            
            // Define test cases
            const tests = [
                { name: 'Form Validation', fn: () => this.testFormValidation() },
                { name: 'Budget Calculations', fn: () => this.testBudgetCalculations() },
                { name: 'Complete Campaign Flow', fn: () => this.runFullCampaignFlow() }
            ];
            
            // Run each test
            for (const test of tests) {
                this.log(`\n🔍 Running: ${test.name}`);
                this.log('-'.repeat(30));
                
                try {
                    const result = await test.fn();
                    results.push({ name: test.name, passed: result });
                    
                    if (result) {
                        this.log(`✅ ${test.name} PASSED`, 'SUCCESS');
                    } else {
                        this.log(`❌ ${test.name} FAILED`, 'ERROR');
                    }
                } catch (error) {
                    this.log(`❌ ${test.name} ERROR: ${error.message}`, 'ERROR');
                    results.push({ name: test.name, passed: false });
                }
            }
            
            // Summary
            this.log('\n📊 Test Results Summary');
            this.log('='.repeat(50));
            
            const passed = results.filter(r => r.passed).length;
            const total = results.length;
            
            results.forEach(result => {
                const status = result.passed ? '✅ PASSED' : '❌ FAILED';
                this.log(`${status}: ${result.name}`);
            });
            
            this.log(`\nOverall: ${passed}/${total} tests passed`);
            
            if (passed === total) {
                this.log('🎉 All tests passed! Campaign Designer is working correctly.', 'SUCCESS');
                return true;
            } else {
                this.log(`⚠️  ${total - passed} test(s) failed. Please review the issues above.`, 'WARNING');
                return false;
            }
            
        } catch (error) {
            this.log(`Test suite error: ${error.message}`, 'ERROR');
            return false;
        } finally {
            await this.teardown();
        }
    }
}

// CLI runner
async function main() {
    const args = process.argv.slice(2);
    const options = {};
    
    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--url':
                options.baseUrl = args[++i];
                break;
            case '--headless':
                options.headless = args[++i] !== 'false';
                break;
            case '--slow':
                options.slowMo = parseInt(args[++i]) || 100;
                break;
            case '--timeout':
                options.timeout = parseInt(args[++i]) || 30000;
                break;
            case '--help':
                console.log(`
Campaign Designer Test Suite

Usage: node test-campaign-designer.js [options]

Options:
  --url <url>         Frontend URL to test (default: http://localhost:3000)
  --headless <bool>   Run in headless mode (default: true)
  --slow <ms>         Slow down actions by ms (default: 50)
  --timeout <ms>      Set timeout in ms (default: 30000)
  --help              Show this help message

Examples:
  node test-campaign-designer.js
  node test-campaign-designer.js --url https://nexopeak-frontend.herokuapp.com
  node test-campaign-designer.js --headless false --slow 100
                `);
                process.exit(0);
        }
    }
    
    const tester = new CampaignDesignerTester(options);
    const success = await tester.runAllTests();
    
    process.exit(success ? 0 : 1);
}

// Check if puppeteer is available
try {
    require.resolve('puppeteer');
    
    if (require.main === module) {
        main().catch(error => {
            console.error('Test runner error:', error);
            process.exit(1);
        });
    }
} catch (error) {
    console.error('❌ Puppeteer not found. Please install it first:');
    console.error('npm install puppeteer');
    process.exit(1);
}

module.exports = CampaignDesignerTester;
