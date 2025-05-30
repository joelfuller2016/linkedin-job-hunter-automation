// Multi-Source Job Aggregation Configuration
// Configure this file to match your skills and preferences

export const skillMatrix = {
  // Core Skills (Highest Priority - Weight 4-5)
  core: {
    'c#': { 
      weight: 5, 
      aliases: ['csharp', 'c-sharp', 'c sharp'],
      description: 'Primary programming language'
    },
    '.net': { 
      weight: 5, 
      aliases: ['dotnet', 'dot net', '.net core', '.net framework', 'asp.net core'],
      description: 'Core Microsoft framework'
    },
    'sql': { 
      weight: 4, 
      aliases: ['sql server', 'tsql', 't-sql', 'database', 'mssql'],
      description: 'Database and query expertise'
    },
    'azure': { 
      weight: 4, 
      aliases: ['microsoft azure', 'azure cloud', 'azure devops'],
      description: 'Cloud platform experience'
    }
  },

  // Bonus Skills (Medium Priority - Weight 2-3)
  bonus: {
    'powershell': { 
      weight: 3, 
      aliases: ['ps1', 'power shell', 'pwsh'],
      description: 'Automation and scripting'
    },
    'asp.net': { 
      weight: 3, 
      aliases: ['aspnet', 'asp net', 'asp.net mvc', 'asp.net web api'],
      description: 'Web application development'
    },
    'mvc': { 
      weight: 2, 
      aliases: ['model view controller', 'asp.net mvc'],
      description: 'Architecture pattern knowledge'
    },
    'entity framework': { 
      weight: 3, 
      aliases: ['ef', 'ef core', 'entity framework core'],
      description: 'Object-relational mapping'
    },
    'rest api': { 
      weight: 2, 
      aliases: ['restful', 'web api', 'api development', 'rest'],
      description: 'API development experience'
    },
    'devops': { 
      weight: 2, 
      aliases: ['ci/cd', 'deployment', 'build automation'],
      description: 'Development operations'
    },
    'microservices': {
      weight: 2,
      aliases: ['microservice', 'distributed systems', 'service architecture'],
      description: 'Modern architecture patterns'
    },
    'docker': {
      weight: 2,
      aliases: ['containerization', 'containers', 'kubernetes'],
      description: 'Containerization technology'
    }
  },

  // Exclusion Criteria (Negative Weight)
  exclude: {
    'angular': { 
      weight: -5, 
      aliases: ['angularjs', 'angular 2+', 'ng'],
      description: 'Frontend framework to avoid'
    },
    'react': { 
      weight: -3, 
      aliases: ['reactjs', 'react.js', 'jsx'],
      description: 'Frontend library to avoid'
    },
    'vue': { 
      weight: -3, 
      aliases: ['vuejs', 'vue.js'],
      description: 'Frontend framework to avoid'
    },
    'frontend only': { 
      weight: -4, 
      aliases: ['ui only', 'front-end only', 'client-side only'],
      description: 'Frontend-only positions'
    },
    'designer': { 
      weight: -5, 
      aliases: ['ui/ux', 'graphic design', 'web design', 'visual design'],
      description: 'Design-focused roles'
    },
    'junior': {
      weight: -4,
      aliases: ['entry level', 'jr', 'graduate', 'intern', 'trainee'],
      description: 'Junior-level positions'
    }
  }
};

// Experience Level Configuration
export const experienceConfig = {
  // Joel has 7+ years of experience
  targetLevel: 'senior',
  yearsExperience: 7,
  
  // Seniority keywords that add points
  seniorityBonus: {
    keywords: ['senior', 'lead', 'principal', 'architect', 'staff', 'manager', 'director'],
    weight: 3,
    description: 'Leadership and senior roles'
  },
  
  // Junior keywords that subtract points
  juniorPenalty: {
    keywords: ['junior', 'jr', 'entry', 'intern', 'graduate', 'trainee', '0-2 years'],
    weight: -5,
    description: 'Entry-level positions to avoid'
  }
};

// Remote Work Configuration
export const remoteConfig = {
  // Joel specifically wants remote work
  required: true,
  
  // Remote work keywords that add points
  remoteBonus: {
    keywords: ['remote', 'work from home', 'wfh', 'distributed', 'anywhere', 'home office'],
    weight: 2,
    description: 'Remote work indicators'
  },
  
  // On-site keywords that may subtract points
  onsitePenalty: {
    keywords: ['on-site only', 'office required', 'no remote', 'in-person only'],
    weight: -2,
    description: 'Non-remote work indicators'
  }
};

// Salary Configuration
export const salaryConfig = {
  // Minimum acceptable salary
  minimumSalary: 100000,
  
  // Target salary range
  targetRange: {
    min: 120000,
    max: 180000
  },
  
  // Salary bonus scoring
  salaryBonus: {
    above_120k: 1,
    above_140k: 2,
    above_160k: 3
  }
};

// Company Preferences
export const companyConfig = {
  // Dream companies (extra points)
  dreamCompanies: [
    'Microsoft', 'Google', 'Amazon', 'Meta', 'Apple', 
    'Netflix', 'Spotify', 'GitHub', 'Stack Overflow',
    'Atlassian', 'Slack', 'Zoom', 'Docker', 'HashiCorp'
  ],
  dreamCompanyBonus: 2,
  
  // Company size preferences
  sizePreference: {
    startup: 0,      // 1-50 employees
    small: 1,        // 51-200 employees  
    medium: 2,       // 201-1000 employees
    large: 2,        // 1000+ employees
    enterprise: 1    // Fortune 500
  },
  
  // Industry preferences
  industryPreference: {
    'software': 2,
    'technology': 2,
    'fintech': 1,
    'healthcare tech': 1,
    'e-commerce': 1,
    'saas': 2,
    'cloud services': 2,
    'cybersecurity': 1
  }
};

// Job Board Configuration
export const jobBoardConfig = {
  linkedin: {
    enabled: true,
    priority: 1,
    rateLimit: 5000, // milliseconds between requests
    maxResultsPerSearch: 25,
    searchFilters: {
      f_WT: '2',        // Remote work
      f_TPR: 'r86400',  // Last 24 hours
      f_E: '4,5,6'      // Experience levels: Associate, Mid-Senior, Director
    }
  },
  
  indeed: {
    enabled: true,
    priority: 2,
    rateLimit: 7000,
    maxResultsPerSearch: 20,
    searchFilters: {
      remotejob: 'true',
      fromage: '1',     // Last day
      sort: 'date'
    }
  },
  
  dice: {
    enabled: true,
    priority: 3,
    rateLimit: 6000,
    maxResultsPerSearch: 15,
    searchFilters: {
      radius: '50',
      remotework: 'true',
      sort: 'date'
    }
  },
  
  stackoverflow: {
    enabled: true,
    priority: 4,
    rateLimit: 8000,
    maxResultsPerSearch: 10,
    searchFilters: {
      r: 'true',        // Remote
      sort: 'i'         // Interest level
    }
  }
};

// Alert Configuration
export const alertConfig = {
  // Score thresholds for different alert types
  thresholds: {
    urgent: 10,       // Perfect match - apply immediately
    high: 8,          // Excellent match - high priority
    medium: 6,        // Good match - consider applying
    low: 4            // Marginal match - review carefully
  },
  
  // Notification channels
  channels: {
    webhook: true,    // n8n webhook notifications
    email: false,     // Email notifications (configure SMTP)
    slack: false,     // Slack notifications (configure webhook)
    sms: false        // SMS notifications (configure Twilio)
  },
  
  // Alert frequency limits
  limits: {
    maxAlertsPerHour: 10,
    maxUrgentAlertsPerDay: 5,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00',
      timezone: 'America/New_York'
    }
  }
};

// Export Configuration
export const exportConfig = {
  // Default export formats
  formats: {
    csv: {
      enabled: true,
      filename: 'joel-job-search-{date}.csv',
      columns: [
        'score', 'title', 'company', 'location', 'url', 
        'matchedSkills', 'salary', 'postedDate', 'source'
      ]
    },
    
    json: {
      enabled: true,
      filename: 'job-data-{date}.json',
      includeMetadata: true,
      pretty: true
    },
    
    excel: {
      enabled: false,
      filename: 'job-analysis-{date}.xlsx',
      includeCharts: true
    }
  },
  
  // Automatic exports
  schedule: {
    daily: true,
    weekly: true,
    monthly: false
  }
};

// Analytics Configuration
export const analyticsConfig = {
  // Metrics to track
  metrics: {
    jobsCollected: true,
    averageScore: true,
    sourceDistribution: true,
    skillTrends: true,
    companyTrends: true,
    salaryTrends: true,
    responseRates: true
  },
  
  // Data retention
  retention: {
    rawJobs: '6 months',
    analytics: '2 years',
    exports: '1 year'
  },
  
  // Privacy settings
  privacy: {
    anonymizeCompanyData: false,
    excludePersonalInfo: true,
    dataSharing: false
  }
};

// Usage Examples and Validation
export function validateConfiguration() {
  const errors = [];
  
  // Validate skill weights
  Object.entries(skillMatrix.core).forEach(([skill, config]) => {
    if (config.weight < 1 || config.weight > 5) {
      errors.push(`Core skill '${skill}' weight must be between 1-5`);
    }
  });
  
  // Validate salary configuration
  if (salaryConfig.minimumSalary < 50000) {
    errors.push('Minimum salary seems too low for senior developer');
  }
  
  // Validate experience configuration
  if (experienceConfig.yearsExperience < 3) {
    errors.push('Years of experience should be 3+ for senior roles');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Helper function to get total possible score
export function getMaxPossibleScore() {
  const coreMax = Object.values(skillMatrix.core).reduce((sum, skill) => sum + skill.weight, 0);
  const bonusMax = Object.values(skillMatrix.bonus).reduce((sum, skill) => sum + skill.weight, 0);
  const seniorityMax = experienceConfig.seniorityBonus.weight;
  const remoteMax = remoteConfig.remoteBonus.weight;
  const dreamCompanyMax = companyConfig.dreamCompanyBonus;
  
  return coreMax + bonusMax + seniorityMax + remoteMax + dreamCompanyMax;
}

// Example usage in n8n workflow
export const exampleUsage = {
  // How to use in n8n function node:
  workflow: `
    // Import configuration
    const { skillMatrix, experienceConfig } = require('./skill-matrix.js');
    
    // Calculate job score
    function calculateJobScore(job) {
      const jobText = job.title + ' ' + job.description;
      let score = 0;
      
      // Check core skills
      Object.entries(skillMatrix.core).forEach(([skill, config]) => {
        const allSkills = [skill, ...config.aliases];
        if (allSkills.some(s => jobText.toLowerCase().includes(s))) {
          score += config.weight;
        }
      });
      
      return score;
    }
  `,
  
  // Expected output format
  output: {
    jobTitle: "Senior C# Developer",
    company: "Microsoft",
    score: 12,
    breakdown: {
      core: 9,      // C# + .NET + SQL
      bonus: 2,     // ASP.NET
      seniority: 3, // Senior role
      remote: 2,    // Remote work
      company: 2    // Dream company
    }
  }
};

export default {
  skillMatrix,
  experienceConfig,
  remoteConfig,
  salaryConfig,
  companyConfig,
  jobBoardConfig,
  alertConfig,
  exportConfig,
  analyticsConfig,
  validateConfiguration,
  getMaxPossibleScore
};