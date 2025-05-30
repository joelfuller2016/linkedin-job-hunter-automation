/**
 * Multi-Source Job Aggregator
 * Collects jobs from LinkedIn, Indeed, Dice, StackOverflow, and more
 * Provides unified scoring and deduplication across all sources
 */

import { skillMatrix, jobBoardConfig, alertConfig } from '../config/skill-matrix.js';

class MultiSourceJobAggregator {
  constructor(options = {}) {
    this.sources = options.sources || jobBoardConfig;
    this.rateLimiter = new Map();
    this.results = {
      jobs: [],
      sources: {},
      errors: [],
      metrics: {}
    };
  }

  /**
   * Main aggregation function - collects from all enabled sources
   */
  async aggregateJobs(searchParams = {}) {
    console.log('🚀 Starting multi-source job aggregation...');
    
    const startTime = Date.now();
    const enabledSources = Object.entries(this.sources)
      .filter(([name, config]) => config.enabled)
      .sort(([,a], [,b]) => a.priority - b.priority);

    // Process each source
    for (const [sourceName, config] of enabledSources) {
      try {
        console.log(`📡 Collecting from ${sourceName}...`);
        
        // Apply rate limiting
        await this.applyRateLimit(sourceName, config.rateLimit);
        
        // Collect jobs from source
        const sourceJobs = await this.collectFromSource(sourceName, config, searchParams);
        
        // Store results
        this.results.sources[sourceName] = {
          jobsFound: sourceJobs.length,
          timestamp: new Date().toISOString(),
          status: 'success'
        };
        
        this.results.jobs.push(...sourceJobs);
        
        console.log(`✅ ${sourceName}: ${sourceJobs.length} jobs collected`);
        
      } catch (error) {
        console.error(`❌ ${sourceName} failed:`, error.message);
        
        this.results.sources[sourceName] = {
          jobsFound: 0,
          timestamp: new Date().toISOString(),
          status: 'error',
          error: error.message
        };
        
        this.results.errors.push({
          source: sourceName,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Post-processing
    const processedJobs = await this.postProcessJobs();
    const executionTime = Date.now() - startTime;
    
    console.log(`🎯 Aggregation complete: ${processedJobs.length} unique jobs in ${executionTime}ms`);
    
    return this.generateSummaryReport(processedJobs, executionTime);
  }

  /**
   * Rate limiting to prevent getting blocked
   */
  async applyRateLimit(sourceName, rateLimit) {
    const lastRequest = this.rateLimiter.get(sourceName);
    if (lastRequest) {
      const timeSinceLastRequest = Date.now() - lastRequest;
      if (timeSinceLastRequest < rateLimit) {
        const waitTime = rateLimit - timeSinceLastRequest;
        console.log(`⏱️  Rate limiting ${sourceName}: waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    this.rateLimiter.set(sourceName, Date.now());
  }

  /**
   * Collect jobs from a specific source
   */
  async collectFromSource(sourceName, config, searchParams) {
    switch (sourceName) {
      case 'linkedin':
        return await this.collectLinkedInJobs(config, searchParams);
      case 'indeed':
        return await this.collectIndeedJobs(config, searchParams);
      case 'dice':
        return await this.collectDiceJobs(config, searchParams);
      case 'stackoverflow':
        return await this.collectStackOverflowJobs(config, searchParams);
      default:
        throw new Error(`Unknown source: ${sourceName}`);
    }
  }

  /**
   * LinkedIn job collection
   */
  async collectLinkedInJobs(config, searchParams) {
    const searches = this.generateLinkedInSearches(searchParams);
    const allJobs = [];

    for (const search of searches) {
      const url = this.buildLinkedInURL(search, config);
      const response = await this.makeRequest(url, {
        'User-Agent': this.getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      });

      if (response.ok) {
        const html = await response.text();
        const jobs = this.parseLinkedInJobs(html, search.keywords);
        allJobs.push(...jobs);
      }
    }

    return allJobs.map(job => ({ ...job, source: 'LinkedIn' }));
  }

  /**
   * Indeed job collection
   */
  async collectIndeedJobs(config, searchParams) {
    const query = this.buildIndeedQuery(searchParams);
    const url = `https://www.indeed.com/jobs?${query}`;
    
    const response = await this.makeRequest(url, {
      'User-Agent': this.getRandomUserAgent()
    });

    if (response.ok) {
      const html = await response.text();
      const jobs = this.parseIndeedJobs(html);
      return jobs.map(job => ({ ...job, source: 'Indeed' }));
    }

    return [];
  }

  /**
   * Dice job collection
   */
  async collectDiceJobs(config, searchParams) {
    const query = this.buildDiceQuery(searchParams);
    const url = `https://www.dice.com/jobs?${query}`;
    
    const response = await this.makeRequest(url, {
      'User-Agent': this.getRandomUserAgent()
    });

    if (response.ok) {
      const html = await response.text();
      const jobs = this.parseDiceJobs(html);
      return jobs.map(job => ({ ...job, source: 'Dice' }));
    }

    return [];
  }

  /**
   * StackOverflow job collection
   */
  async collectStackOverflowJobs(config, searchParams) {
    const query = this.buildStackOverflowQuery(searchParams);
    const url = `https://stackoverflow.com/jobs?${query}`;
    
    const response = await this.makeRequest(url, {
      'User-Agent': this.getRandomUserAgent()
    });

    if (response.ok) {
      const html = await response.text();
      const jobs = this.parseStackOverflowJobs(html);
      return jobs.map(job => ({ ...job, source: 'StackOverflow' }));
    }

    return [];
  }

  /**
   * Generate multiple LinkedIn search queries for comprehensive coverage
   */
  generateLinkedInSearches(searchParams) {
    const baseSearches = [
      { keywords: 'C# Software Engineer -Angular -React remote', priority: 1 },
      { keywords: '.NET Developer "Senior" -Frontend remote', priority: 1 },
      { keywords: 'SQL Server Developer "Lead" remote', priority: 2 },
      { keywords: 'Azure Cloud Engineer "Principal" remote', priority: 2 },
      { keywords: 'Backend Developer C# "Staff" remote', priority: 2 },
      { keywords: 'Full Stack Developer .NET -Angular remote', priority: 3 },
      { keywords: 'Software Architect C# remote', priority: 3 },
      { keywords: 'DevOps Engineer .NET Azure remote', priority: 3 }
    ];

    // Customize based on search parameters
    if (searchParams.keywords) {
      baseSearches.unshift({
        keywords: `${searchParams.keywords} remote`,
        priority: 0
      });
    }

    return baseSearches.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Build LinkedIn search URL
   */
  buildLinkedInURL(search, config) {
    const params = new URLSearchParams({
      keywords: search.keywords,
      location: 'United States',
      ...config.searchFilters,
      count: config.maxResultsPerSearch
    });

    return `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?${params}`;
  }

  /**
   * Parse LinkedIn job results
   */
  parseLinkedInJobs(html, searchQuery) {
    const jobs = [];
    const jobRegex = /<li[^>]*class="[^"]*job-search-card[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
    const matches = html.match(jobRegex) || [];

    matches.forEach((jobHtml, index) => {
      try {
        const job = this.extractJobFromLinkedInHTML(jobHtml, searchQuery);
        if (job) {
          jobs.push(job);
        }
      } catch (error) {
        console.log('LinkedIn parsing error:', error.message);
      }
    });

    return jobs;
  }

  /**
   * Extract job data from LinkedIn HTML
   */
  extractJobFromLinkedInHTML(jobHtml, searchQuery) {
    const extractText = (regex) => {
      const match = jobHtml.match(regex);
      return match ? match[1].replace(/<[^>]*>/g, '').trim() : '';
    };

    const title = extractText(/<h3[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/h3>/i);
    const company = extractText(/<h4[^>]*class="[^"]*subtitle[^"]*"[^>]*>([^<]+)<\/h4>/i);
    const location = extractText(/<span[^>]*class="[^"]*location[^"]*"[^>]*>([^<]+)<\/span>/i);
    const urlMatch = jobHtml.match(/href="([^"]*\/jobs\/view\/[^"]*)"/i);
    const url = urlMatch ? `https://www.linkedin.com${urlMatch[1]}` : '';

    if (!title || !company || title.length < 3) {
      return null;
    }

    return {
      id: `linkedin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      company,
      location: location || 'Remote',
      url,
      searchQuery,
      extractedAt: new Date().toISOString(),
      rawData: jobHtml
    };
  }

  /**
   * Post-process all collected jobs
   */
  async postProcessJobs() {
    console.log('🔄 Post-processing jobs...');
    
    // Remove duplicates
    const uniqueJobs = this.removeDuplicates(this.results.jobs);
    
    // Score all jobs
    const scoredJobs = uniqueJobs.map(job => {
      const score = this.calculateJobScore(job);
      return { ...job, score };
    });
    
    // Filter high-quality jobs only
    const qualityJobs = scoredJobs.filter(job => job.score.total >= 4);
    
    // Sort by score
    qualityJobs.sort((a, b) => b.score.total - a.score.total);
    
    return qualityJobs;
  }

  /**
   * Remove duplicate jobs across all sources
   */
  removeDuplicates(jobs) {
    const seen = new Set();
    const unique = [];

    jobs.forEach(job => {
      // Create multiple keys for duplicate detection
      const urlKey = job.url;
      const titleCompanyKey = `${job.title}_${job.company}`.toLowerCase().replace(/[^a-z0-9]/g, '');
      const fuzzyKey = this.createFuzzyKey(job.title, job.company);

      if (!seen.has(urlKey) && !seen.has(titleCompanyKey) && !seen.has(fuzzyKey)) {
        seen.add(urlKey);
        seen.add(titleCompanyKey);
        seen.add(fuzzyKey);
        unique.push(job);
      }
    });

    console.log(`🧹 Deduplication: ${jobs.length} → ${unique.length} jobs`);
    return unique;
  }

  /**
   * Create fuzzy key for similar job detection
   */
  createFuzzyKey(title, company) {
    const normalizedTitle = title.toLowerCase()
      .replace(/\b(senior|jr|junior|lead|principal|staff)\b/g, '')
      .replace(/\b(engineer|developer|architect)\b/g, 'dev')
      .replace(/[^a-z0-9]/g, '')
      .substr(0, 20);
    
    const normalizedCompany = company.toLowerCase()
      .replace(/\b(inc|llc|ltd|corp|company)\b/g, '')
      .replace(/[^a-z0-9]/g, '')
      .substr(0, 10);

    return `${normalizedTitle}_${normalizedCompany}`;
  }

  /**
   * Calculate job score based on skill matrix
   */
  calculateJobScore(job) {
    const jobText = `${job.title} ${job.company} ${job.location}`.toLowerCase();
    const score = {
      total: 0,
      breakdown: { core: 0, bonus: 0, exclude: 0, seniority: 0, remote: 0, source: 0 },
      matchedSkills: [],
      alerts: []
    };

    // Core skills scoring
    Object.entries(skillMatrix.core).forEach(([skill, config]) => {
      const allSkills = [skill, ...config.aliases];
      if (allSkills.some(s => jobText.includes(s))) {
        score.breakdown.core += config.weight;
        score.total += config.weight;
        score.matchedSkills.push(skill);
      }
    });

    // Bonus skills scoring
    Object.entries(skillMatrix.bonus).forEach(([skill, config]) => {
      const allSkills = [skill, ...config.aliases];
      if (allSkills.some(s => jobText.includes(s))) {
        score.breakdown.bonus += config.weight;
        score.total += config.weight;
        score.matchedSkills.push(skill);
      }
    });

    // Exclusion penalty
    Object.entries(skillMatrix.exclude).forEach(([skill, config]) => {
      const allSkills = [skill, ...config.aliases];
      if (allSkills.some(s => jobText.includes(s))) {
        score.breakdown.exclude += config.weight; // Already negative
        score.total += config.weight;
      }
    });

    // Seniority bonus
    const seniorityKeywords = ['senior', 'lead', 'principal', 'architect', 'staff', 'manager'];
    const juniorKeywords = ['junior', 'jr', 'entry', 'intern', 'graduate'];
    
    if (seniorityKeywords.some(keyword => jobText.includes(keyword))) {
      score.breakdown.seniority += 3;
      score.total += 3;
    } else if (juniorKeywords.some(keyword => jobText.includes(keyword))) {
      score.breakdown.seniority -= 5;
      score.total -= 5;
    }

    // Remote work bonus
    const remoteKeywords = ['remote', 'work from home', 'wfh', 'distributed', 'anywhere'];
    if (remoteKeywords.some(keyword => jobText.includes(keyword))) {
      score.breakdown.remote += 2;
      score.total += 2;
    }

    // Source reliability bonus
    const sourceBonus = {
      'LinkedIn': 1,
      'StackOverflow': 1,
      'Indeed': 0,
      'Dice': 0
    };
    if (sourceBonus[job.source]) {
      score.breakdown.source += sourceBonus[job.source];
      score.total += sourceBonus[job.source];
    }

    // Generate alerts based on score
    if (score.total >= alertConfig.thresholds.urgent) {
      score.alerts.push({
        type: 'URGENT',
        message: `🎯 Perfect match found: ${job.title} at ${job.company}`,
        action: 'Apply immediately'
      });
    } else if (score.total >= alertConfig.thresholds.high) {
      score.alerts.push({
        type: 'HIGH',
        message: `⭐ Excellent match: ${job.title} at ${job.company}`,
        action: 'Review and apply soon'
      });
    }

    return score;
  }

  /**
   * Generate comprehensive summary report
   */
  generateSummaryReport(jobs, executionTime) {
    const sourceStats = Object.entries(this.results.sources).map(([name, data]) => ({
      source: name,
      jobs: data.jobsFound,
      status: data.status,
      error: data.error
    }));

    const urgentJobs = jobs.filter(job => job.score.total >= alertConfig.thresholds.urgent);
    const highJobs = jobs.filter(job => job.score.total >= alertConfig.thresholds.high);
    
    const topCompanies = this.getTopCompanies(jobs);
    const skillTrends = this.getSkillTrends(jobs);

    return {
      summary: {
        executionTime: `${executionTime}ms`,
        totalJobs: jobs.length,
        sourcesProcessed: Object.keys(this.results.sources).length,
        urgentMatches: urgentJobs.length,
        highQualityMatches: highJobs.length,
        averageScore: jobs.length > 0 ? (jobs.reduce((sum, job) => sum + job.score.total, 0) / jobs.length).toFixed(1) : 0,
        timestamp: new Date().toISOString()
      },
      
      sourceStats,
      
      jobs: jobs.slice(0, 50), // Top 50 jobs
      
      topMatches: jobs.slice(0, 10),
      
      analytics: {
        topCompanies,
        skillTrends,
        sourceDistribution: sourceStats.map(s => ({ source: s.source, count: s.jobs })),
        scoreDistribution: this.getScoreDistribution(jobs)
      },
      
      alerts: urgentJobs.length > 0 ? [{
        type: 'SUMMARY',
        message: `🚨 ${urgentJobs.length} urgent job matches found!`,
        jobs: urgentJobs.slice(0, 5)
      }] : [],
      
      errors: this.results.errors
    };
  }

  /**
   * Get top companies by job count
   */
  getTopCompanies(jobs) {
    const companies = {};
    jobs.forEach(job => {
      companies[job.company] = (companies[job.company] || 0) + 1;
    });

    return Object.entries(companies)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([company, count]) => ({ company, jobs: count }));
  }

  /**
   * Get trending skills from job matches
   */
  getSkillTrends(jobs) {
    const skills = {};
    jobs.forEach(job => {
      job.score.matchedSkills.forEach(skill => {
        skills[skill] = (skills[skill] || 0) + 1;
      });
    });

    return Object.entries(skills)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, mentions: count }));
  }

  /**
   * Get score distribution for analytics
   */
  getScoreDistribution(jobs) {
    const distribution = {
      excellent: jobs.filter(j => j.score.total >= 10).length,
      good: jobs.filter(j => j.score.total >= 7 && j.score.total < 10).length,
      fair: jobs.filter(j => j.score.total >= 4 && j.score.total < 7).length,
      poor: jobs.filter(j => j.score.total < 4).length
    };

    return distribution;
  }

  /**
   * Utility functions
   */
  getRandomUserAgent() {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  async makeRequest(url, headers = {}) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }

  // Additional parsing methods for other job boards would go here...
  buildIndeedQuery(searchParams) {
    return new URLSearchParams({
      q: 'C# .NET developer remote',
      l: 'United States',
      remotejob: 'true',
      fromage: '1',
      sort: 'date'
    }).toString();
  }

  buildDiceQuery(searchParams) {
    return new URLSearchParams({
      q: 'C# .NET remote',
      location: 'United States',
      radius: '50',
      remotework: 'true'
    }).toString();
  }

  buildStackOverflowQuery(searchParams) {
    return new URLSearchParams({
      q: '.NET C# remote',
      l: 'United States',
      r: 'true'
    }).toString();
  }

  parseIndeedJobs(html) {
    // Indeed-specific parsing logic
    return [];
  }

  parseDiceJobs(html) {
    // Dice-specific parsing logic
    return [];
  }

  parseStackOverflowJobs(html) {
    // StackOverflow-specific parsing logic
    return [];
  }
}

export default MultiSourceJobAggregator;

// Usage example for n8n
export const n8nUsageExample = `
// In n8n Function node:
const aggregator = new MultiSourceJobAggregator();
const results = await aggregator.aggregateJobs({
  keywords: $json.keywords || 'Senior C# Developer',
  salaryMin: $json.salaryMin || 100000
});

return [{ json: results }];
`;