#!/usr/bin/env node

/**
 * KLASS Lead Generation - Combined Runner
 * 
 * Runs all scrapers and combines results into a single leads file.
 * 
 * Usage:
 *   node index.js [--niche business] [--min 10000] [--max 500000]
 */

const fs = require('fs');
const path = require('path');
const { scrapeYouTubeLeads } = require('./youtube-scraper');
const { scrapeTikTokLeads } = require('./tiktok-scraper');

const OUTPUT_DIR = path.join(__dirname, 'output');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Combine and dedupe leads from all sources
 */
function combineLeads(youtubeLead, tiktokLeads) {
  // Combine all leads
  const allLeads = [...youtubeLead, ...tiktokLeads];
  
  // Sort by score
  allLeads.sort((a, b) => b.score - a.score);
  
  // Try to find cross-platform matches by name similarity
  // In production, you'd use email matching or social link analysis
  
  return allLeads;
}

/**
 * Generate summary report
 */
function generateReport(leads) {
  const report = {
    generatedAt: new Date().toISOString(),
    totalLeads: leads.length,
    byPlatform: {
      youtube: leads.filter(l => l.platform === 'youtube').length,
      tiktok: leads.filter(l => l.platform === 'tiktok').length
    },
    byNiche: {},
    byScore: {
      hot: leads.filter(l => l.score >= 50).length,
      warm: leads.filter(l => l.score >= 30 && l.score < 50).length,
      cold: leads.filter(l => l.score < 30).length
    },
    withIntent: leads.filter(l => l.hasIntent).length,
    withEmail: leads.filter(l => l.email).length,
    topLeads: leads.slice(0, 10).map(l => ({
      name: l.name,
      platform: l.platform,
      followers: l.followers || l.subscribers,
      niche: l.niche,
      score: l.score,
      hasEmail: !!l.email
    }))
  };
  
  // Count by niche
  for (const lead of leads) {
    report.byNiche[lead.niche] = (report.byNiche[lead.niche] || 0) + 1;
  }
  
  return report;
}

/**
 * Main function
 */
async function main(options = {}) {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     KLASS Lead Generation System           ║');
  console.log('║     Finding Your Next Founding Users       ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Run scrapers
  console.log('Starting scrapers...\n');
  
  const [youtubeLeads, tiktokLeads] = await Promise.all([
    scrapeYouTubeLeads(options),
    scrapeTikTokLeads(options)
  ]);
  
  // Combine results
  console.log('\n\n📋 Combining Results');
  console.log('================================');
  
  const allLeads = combineLeads(youtubeLeads, tiktokLeads);
  const report = generateReport(allLeads);
  
  // Save combined JSON
  const combinedPath = path.join(OUTPUT_DIR, `all-leads-${timestamp}.json`);
  fs.writeFileSync(combinedPath, JSON.stringify(allLeads, null, 2));
  
  // Save combined CSV
  const csvPath = path.join(OUTPUT_DIR, `all-leads-${timestamp}.csv`);
  const csvHeader = 'Name,Platform,Followers,Niche,Score,HasIntent,Email,ProfileURL,IntentSignals\n';
  const csvRows = allLeads.map(l => 
    `"${l.name}",${l.platform},${l.followers || l.subscribers || 0},${l.niche},${l.score},${l.hasIntent},"${l.email || ''}","${l.profileUrl || l.channelUrl || ''}","${(l.intentSignals || []).join(';')}"`
  ).join('\n');
  fs.writeFileSync(csvPath, csvHeader + csvRows);
  
  // Save report
  const reportPath = path.join(OUTPUT_DIR, `lead-report-${timestamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Print summary
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║              FINAL REPORT                   ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
  console.log(`📊 Total Leads: ${report.totalLeads}`);
  console.log('');
  console.log('By Platform:');
  console.log(`   YouTube: ${report.byPlatform.youtube}`);
  console.log(`   TikTok:  ${report.byPlatform.tiktok}`);
  console.log('');
  console.log('By Score:');
  console.log(`   🔥 Hot (50+):   ${report.byScore.hot}`);
  console.log(`   🌡️  Warm (30-49): ${report.byScore.warm}`);
  console.log(`   ❄️  Cold (<30):   ${report.byScore.cold}`);
  console.log('');
  console.log('By Niche:');
  for (const [niche, count] of Object.entries(report.byNiche)) {
    console.log(`   ${niche}: ${count}`);
  }
  console.log('');
  console.log(`📧 With Email: ${report.withEmail}`);
  console.log(`🎯 With Intent: ${report.withIntent}`);
  console.log('');
  console.log('🏆 Top 5 Leads:');
  for (const lead of report.topLeads.slice(0, 5)) {
    console.log(`   ${lead.name} (${lead.platform}) - ${(lead.followers || 0).toLocaleString()} followers, score: ${lead.score}`);
  }
  console.log('');
  console.log('📁 Output Files:');
  console.log(`   Combined: ${combinedPath}`);
  console.log(`   CSV:      ${csvPath}`);
  console.log(`   Report:   ${reportPath}`);
  console.log('');
  
  return { leads: allLeads, report };
}

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--niche' && args[i + 1]) {
      options.niche = args[++i];
    } else if ((args[i] === '--min' || args[i] === '--min-subs') && args[i + 1]) {
      options.minSubs = parseInt(args[++i]);
      options.minFollowers = options.minSubs;
    } else if ((args[i] === '--max' || args[i] === '--max-subs') && args[i + 1]) {
      options.maxSubs = parseInt(args[++i]);
      options.maxFollowers = options.maxSubs;
    } else if (args[i] === '--help') {
      console.log(`
KLASS Lead Generation System

Usage: node index.js [options]

Options:
  --niche <name>    Filter by niche (business, fitness, finance, personal_dev, creative, tech)
  --min <n>         Minimum followers/subscribers (default: 10000)
  --max <n>         Maximum followers/subscribers (default: 500000)
  --help            Show this help

Examples:
  node index.js
  node index.js --niche fitness --min 25000 --max 200000

Output:
  ./output/all-leads-{date}.json     Combined leads from all platforms
  ./output/all-leads-{date}.csv      CSV export for CRM import
  ./output/lead-report-{date}.json   Summary statistics

Environment Variables:
  YOUTUBE_API_KEY   YouTube Data API key (optional, uses mock data without)
      `);
      process.exit(0);
    }
  }
  
  return options;
}

// Run if called directly
if (require.main === module) {
  const options = parseArgs();
  main(options).catch(console.error);
}

module.exports = { main };
