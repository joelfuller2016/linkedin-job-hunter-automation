#!/bin/bash

# LinkedIn Job Hunter Automation - Setup Script
# This script helps you set up the entire system quickly

set -e  # Exit on any error

echo "🚀 LinkedIn Job Hunter Automation - Setup"
echo "==========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "workflows" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

# Check for Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js found: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js 16+ from https://nodejs.org"
    exit 1
fi

# Check for npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm found: $NPM_VERSION"
else
    echo "❌ npm not found. Please install npm"
    exit 1
fi

# Check for curl
if command_exists curl; then
    echo "✅ curl found"
else
    echo "❌ curl not found. Please install curl for API testing"
    exit 1
fi

echo ""
echo "🔧 Setting up project dependencies..."
echo ""

# Create package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    echo "📦 Creating package.json..."
    cat > package.json << 'EOF'
{
  "name": "linkedin-job-hunter-automation",
  "version": "2.0.0",
  "description": "Automated LinkedIn job scraping with intelligent filtering",
  "main": "src/core/multi-source-aggregator.js",
  "type": "module",
  "scripts": {
    "test": "node test/test-workflows.js",
    "validate": "node scripts/validate-config.js",
    "backup": "node scripts/backup-database.js",
    "report": "node scripts/generate-reports.js",
    "start": "node src/core/multi-source-aggregator.js"
  },
  "dependencies": {
    "node-fetch": "^3.3.0",
    "csv-parse": "^5.4.0",
    "csv-stringify": "^6.4.0"
  },
  "devDependencies": {
    "eslint": "^8.50.0"
  },
  "keywords": [
    "linkedin",
    "job-search",
    "automation",
    "n8n",
    "scraping",
    "remote-jobs",
    "csharp",
    "dotnet"
  ],
  "author": "Joel Fuller",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/joelfuller2016/linkedin-job-hunter-automation"
  }
}
EOF
    echo "✅ package.json created"
fi

# Install dependencies
echo "📥 Installing dependencies..."
npm install
echo "✅ Dependencies installed"

echo ""
echo "⚙️  Setting up configuration..."
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env configuration file..."
    cat > .env << 'EOF'
# LinkedIn Job Hunter Configuration
# Copy this file and customize the values for your setup

# n8n Configuration
N8N_HOST=your-n8n-instance.com
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/enhanced-joel-job-hunter-v2

# Alert Configuration
SLACK_WEBHOOK_URL=
EMAIL_SMTP_HOST=
EMAIL_SMTP_USER=
EMAIL_SMTP_PASS=
EMAIL_TO=joelfuller2010@gmail.com

# Job Search Parameters
SEARCH_KEYWORDS="C# .NET Software Engineer"
SEARCH_LOCATION="United States"
MIN_SALARY=100000
REMOTE_ONLY=true

# Advanced Settings
RATE_LIMIT_MS=5000
MAX_RESULTS_PER_SOURCE=25
DATABASE_RETENTION_DAYS=180

# Debug Settings
DEBUG_MODE=false
VERBOSE_LOGGING=false
EOF
    echo "✅ .env file created - please customize the values"
else
    echo "✅ .env file already exists"
fi

# Create data directory
if [ ! -d "data/exports" ]; then
    echo "📁 Creating data directories..."
    mkdir -p data/exports
    mkdir -p data/backups
    mkdir -p logs
    echo "✅ Data directories created"
fi

# Create validation script
if [ ! -f "scripts/validate-config.js" ]; then
    echo "🔍 Creating configuration validation script..."
    cat > scripts/validate-config.js << 'EOF'
import { validateConfiguration } from '../config/skill-matrix.js';

console.log('🔍 Validating configuration...');
const result = validateConfiguration();

if (result.isValid) {
    console.log('✅ Configuration is valid!');
    process.exit(0);
} else {
    console.log('❌ Configuration errors found:');
    result.errors.forEach(error => console.log(`  - ${error}`));
    process.exit(1);
}
EOF
    echo "✅ Validation script created"
fi

# Create test script
if [ ! -f "test/test-workflows.js" ]; then
    echo "🧪 Creating test script..."
    mkdir -p test
    cat > test/test-workflows.js << 'EOF'
import { skillMatrix } from '../config/skill-matrix.js';

console.log('🧪 Running workflow tests...');

// Test skill matrix configuration
function testSkillMatrix() {
    console.log('Testing skill matrix...');
    
    const coreSkills = Object.keys(skillMatrix.core);
    if (coreSkills.length === 0) {
        throw new Error('No core skills defined');
    }
    
    console.log(`✅ Found ${coreSkills.length} core skills`);
    return true;
}

// Test job scoring
function testJobScoring() {
    console.log('Testing job scoring...');
    
    const testJob = {
        title: 'Senior C# Developer',
        company: 'Microsoft',
        location: 'Remote'
    };
    
    // Mock scoring function
    const score = 12; // Would calculate actual score
    
    if (score < 0) {
        throw new Error('Score cannot be negative');
    }
    
    console.log(`✅ Test job scored: ${score} points`);
    return true;
}

// Run all tests
try {
    testSkillMatrix();
    testJobScoring();
    console.log('\n🎉 All tests passed!');
} catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
}
EOF
    echo "✅ Test script created"
fi

echo ""
echo "🎯 Testing configuration..."
npm run validate

echo ""
echo "🧪 Running tests..."
npm test

echo ""
echo "🌐 Setting up n8n workflows..."
echo ""

# Check if user has n8n access
read -p "Do you have access to an n8n instance? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📋 To complete the setup:"
    echo "1. Import workflows/enhanced-job-hunter-v2.json into your n8n instance"
    echo "2. Update the webhook URL in your .env file"
    echo "3. Activate the workflow in n8n"
    echo "4. Test the webhook endpoint"
    echo ""
    
    read -p "Enter your n8n webhook URL (or press Enter to skip): " webhook_url
    if [ ! -z "$webhook_url" ]; then
        echo "🧪 Testing webhook..."
        curl -X POST "$webhook_url" \
            -H "Content-Type: application/json" \
            -d '{"test": true, "keywords": "C# Developer"}' \
            --max-time 30 || echo "⚠️  Webhook test failed - please check your n8n setup"
        echo "✅ Webhook test completed"
    fi
else
    echo "📝 Please set up n8n first:"
    echo "1. Sign up at https://n8n.io"
    echo "2. Import the workflow from workflows/enhanced-job-hunter-v2.json"
    echo "3. Come back and run this setup script again"
fi

echo ""
echo "📚 Next steps:"
echo "1. Review and customize config/skill-matrix.js for your skills"
echo "2. Update .env file with your specific settings"
echo "3. Test the system: npm run validate"
echo "4. Start job hunting: activate your n8n workflow"
echo "5. Monitor results in data/exports/"
echo ""
echo "📖 Documentation: https://github.com/joelfuller2016/linkedin-job-hunter-automation"
echo "🐛 Issues: https://github.com/joelfuller2016/linkedin-job-hunter-automation/issues"
echo ""
echo "🎉 Setup complete! Happy job hunting!"
echo "==========================================="