#!/usr/bin/env node

/**
 * KLASS YouTube Lead Scraper
 * 
 * Finds YouTube creators who mention community/course/membership keywords
 * in their videos and channel descriptions.
 * 
 * Uses public YouTube Data API (free tier) and web scraping.
 * 
 * Usage:
 *   node youtube-scraper.js [--niche fitness] [--min-subs 10000] [--max-subs 500000]
 * 
 * Output: ./output/youtube-leads-{timestamp}.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // YouTube Data API key (get free at console.cloud.google.com)
  // 10,000 quota units/day free - search costs 100 units each
  apiKey: process.env.YOUTUBE_API_KEY || '',
  
  // Target subscriber range
  minSubs: 10000,
  maxSubs: 500000,
  
  // Keywords that indicate community/course intent
  intentKeywords: [
    'community',
    'membership', 
    'course',
    'coaching',
    'patreon',
    'discord',
    'skool',
    'join my',
    'private group',
    'inner circle',
    'paid community',
    'exclusive content',
    'members only'
  ],
  
  // Search terms for finding creators
  searchTerms: [
    'how to make money online course',
    'start online business coaching',
    'fitness transformation community',
    'personal development membership',
    'learn to code course creator',
    'youtube monetization strategies',
    'building online community',
    'course creator tips',
    'membership site tutorial',
    'coaching business online'
  ],
  
  // Niches to prioritize
  niches: {
    business: ['entrepreneur', 'business', 'money', 'income', 'startup', 'side hustle'],
    fitness: ['fitness', 'workout', 'gym', 'health', 'weight loss', 'muscle'],
    finance: ['investing', 'stocks', 'crypto', 'finance', 'wealth', 'money'],
    personal_dev: ['productivity', 'mindset', 'motivation', 'habits', 'self improvement'],
    creative: ['design', 'photography', 'video editing', 'music production', 'art'],
    tech: ['coding', 'programming', 'software', 'tech', 'developer', 'no code']
  },
  
  // Output directory
  outputDir: path.join(__dirname, 'output')
};

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

/**
 * Make HTTPS request
 */
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Search YouTube for channels/videos
 */
async function searchYouTube(query, type = 'channel', maxResults = 25) {
  if (!CONFIG.apiKey) {
    console.log('⚠️  No API key - using mock data for demo');
    return getMockSearchResults(query, type);
  }
  
  const url = `https://www.googleapis.com/youtube/v3/search?` +
    `part=snippet&q=${encodeURIComponent(query)}` +
    `&type=${type}&maxResults=${maxResults}` +
    `&key=${CONFIG.apiKey}`;
  
  try {
    const data = await httpsGet(url);
    return data.items || [];
  } catch (error) {
    console.error(`Search error for "${query}":`, error.message);
    return [];
  }
}

/**
 * Get channel details including subscriber count
 */
async function getChannelDetails(channelId) {
  if (!CONFIG.apiKey) {
    return getMockChannelDetails(channelId);
  }
  
  const url = `https://www.googleapis.com/youtube/v3/channels?` +
    `part=snippet,statistics,brandingSettings` +
    `&id=${channelId}&key=${CONFIG.apiKey}`;
  
  try {
    const data = await httpsGet(url);
    return data.items?.[0] || null;
  } catch (error) {
    console.error(`Channel fetch error for ${channelId}:`, error.message);
    return null;
  }
}

/**
 * Check if channel description has community/course intent
 */
function hasIntentSignals(text) {
  if (!text) return { hasIntent: false, signals: [] };
  
  const lowerText = text.toLowerCase();
  const signals = CONFIG.intentKeywords.filter(kw => lowerText.includes(kw));
  
  return {
    hasIntent: signals.length > 0,
    signals
  };
}

/**
 * Detect niche from channel info
 */
function detectNiche(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  for (const [niche, keywords] of Object.entries(CONFIG.niches)) {
    if (keywords.some(kw => text.includes(kw))) {
      return niche;
    }
  }
  return 'other';
}

/**
 * Extract social links from description
 */
function extractSocialLinks(description) {
  if (!description) return {};
  
  const links = {};
  
  // Instagram
  const igMatch = description.match(/instagram\.com\/([a-zA-Z0-9_.]+)/i);
  if (igMatch) links.instagram = `https://instagram.com/${igMatch[1]}`;
  
  // Twitter/X
  const twMatch = description.match(/(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/i);
  if (twMatch) links.twitter = `https://twitter.com/${twMatch[1]}`;
  
  // TikTok
  const ttMatch = description.match(/tiktok\.com\/@?([a-zA-Z0-9_.]+)/i);
  if (ttMatch) links.tiktok = `https://tiktok.com/@${ttMatch[1]}`;
  
  // Email
  const emailMatch = description.match(/[\w.-]+@[\w.-]+\.\w+/i);
  if (emailMatch) links.email = emailMatch[0];
  
  // Website
  const webMatch = description.match(/(?:website|site|link)[:\s]+([a-zA-Z0-9.-]+\.[a-z]{2,})/i);
  if (webMatch) links.website = webMatch[1];
  
  // Linktree
  const ltMatch = description.match(/linktr\.ee\/([a-zA-Z0-9_.]+)/i);
  if (ltMatch) links.linktree = `https://linktr.ee/${ltMatch[1]}`;
  
  return links;
}

/**
 * Calculate lead score
 */
function calculateLeadScore(channel) {
  let score = 0;
  
  // Subscriber range scoring
  const subs = channel.statistics?.subscriberCount || 0;
  if (subs >= 50000 && subs <= 150000) score += 20; // Sweet spot
  else if (subs >= 25000 && subs < 50000) score += 15;
  else if (subs >= 150000 && subs <= 300000) score += 10;
  else score += 5;
  
  // Intent signals
  score += channel.intentSignals.length * 5;
  
  // Tier 1 niches
  const tier1 = ['business', 'finance', 'tech', 'personal_dev'];
  if (tier1.includes(channel.niche)) score += 10;
  
  // Has email
  if (channel.socialLinks?.email) score += 5;
  
  // Active channel (recent videos) - would need additional API call
  // score += channel.recentActivity ? 5 : 0;
  
  return score;
}

/**
 * Mock data for testing without API key
 */
function getMockSearchResults(query, type) {
  return [
    {
      id: { channelId: 'UC_mock_channel_1' },
      snippet: { channelTitle: 'CreatorBiz Academy', title: 'CreatorBiz Academy' }
    },
    {
      id: { channelId: 'UC_mock_channel_2' },
      snippet: { channelTitle: 'FitnessMastery', title: 'FitnessMastery' }
    },
    {
      id: { channelId: 'UC_mock_channel_3' },
      snippet: { channelTitle: 'CodeWithSam', title: 'CodeWithSam' }
    }
  ];
}

function getMockChannelDetails(channelId) {
  const mockChannels = {
    'UC_mock_channel_1': {
      id: 'UC_mock_channel_1',
      snippet: {
        title: 'CreatorBiz Academy',
        description: 'Helping creators build profitable online businesses. Join my community at patreon.com/creatorbiz. Email: hello@creatorbiz.com. Instagram: @creatorbizacademy'
      },
      statistics: { subscriberCount: 85000, videoCount: 245 },
      brandingSettings: { channel: { keywords: 'creator business online course' } }
    },
    'UC_mock_channel_2': {
      id: 'UC_mock_channel_2',
      snippet: {
        title: 'FitnessMastery',
        description: 'Transform your body with proven techniques. Launching my new coaching program soon! Discord community for members. Contact: coach@fitnessmastery.io'
      },
      statistics: { subscriberCount: 125000, videoCount: 312 },
      brandingSettings: { channel: { keywords: 'fitness workout transformation' } }
    },
    'UC_mock_channel_3': {
      id: 'UC_mock_channel_3',
      snippet: {
        title: 'CodeWithSam',
        description: 'Learn to code from scratch. Building a membership site for exclusive tutorials. Twitter: @codewithsam'
      },
      statistics: { subscriberCount: 42000, videoCount: 189 },
      brandingSettings: { channel: { keywords: 'coding programming tutorials' } }
    }
  };
  return mockChannels[channelId] || null;
}

/**
 * Main scraper function
 */
async function scrapeYouTubeLeads(options = {}) {
  const minSubs = options.minSubs || CONFIG.minSubs;
  const maxSubs = options.maxSubs || CONFIG.maxSubs;
  const targetNiche = options.niche || null;
  
  console.log('\n🎬 KLASS YouTube Lead Scraper');
  console.log('================================');
  console.log(`Target: ${minSubs.toLocaleString()} - ${maxSubs.toLocaleString()} subscribers`);
  if (targetNiche) console.log(`Niche filter: ${targetNiche}`);
  console.log('');
  
  const leads = new Map(); // Use Map to dedupe by channel ID
  
  // Search using each search term
  for (const searchTerm of CONFIG.searchTerms) {
    console.log(`🔍 Searching: "${searchTerm}"`);
    
    const results = await searchYouTube(searchTerm, 'channel', 10);
    console.log(`   Found ${results.length} channels`);
    
    for (const result of results) {
      const channelId = result.id?.channelId || result.snippet?.channelId;
      if (!channelId || leads.has(channelId)) continue;
      
      // Get full channel details
      const channel = await getChannelDetails(channelId);
      if (!channel) continue;
      
      const subs = parseInt(channel.statistics?.subscriberCount || 0);
      
      // Filter by subscriber count
      if (subs < minSubs || subs > maxSubs) {
        continue;
      }
      
      // Check for intent signals
      const description = channel.snippet?.description || '';
      const { hasIntent, signals } = hasIntentSignals(description);
      
      // Detect niche
      const niche = detectNiche(channel.snippet?.title, description);
      
      // Filter by niche if specified
      if (targetNiche && niche !== targetNiche) {
        continue;
      }
      
      // Extract social links
      const socialLinks = extractSocialLinks(description);
      
      // Build lead object
      const lead = {
        name: channel.snippet?.title,
        channelId: channelId,
        platform: 'youtube',
        subscribers: subs,
        videoCount: parseInt(channel.statistics?.videoCount || 0),
        niche: niche,
        hasIntent: hasIntent,
        intentSignals: signals,
        description: description.substring(0, 500),
        socialLinks: socialLinks,
        email: socialLinks.email || null,
        channelUrl: `https://youtube.com/channel/${channelId}`,
        scrapedAt: new Date().toISOString()
      };
      
      // Calculate lead score
      lead.score = calculateLeadScore(lead);
      
      leads.set(channelId, lead);
      console.log(`   ✅ ${lead.name} (${subs.toLocaleString()} subs, score: ${lead.score})`);
    }
    
    // Rate limiting - be nice to the API
    await new Promise(r => setTimeout(r, 500));
  }
  
  // Convert to array and sort by score
  const leadsArray = Array.from(leads.values())
    .sort((a, b) => b.score - a.score);
  
  // Save results
  const timestamp = new Date().toISOString().split('T')[0];
  const outputPath = path.join(CONFIG.outputDir, `youtube-leads-${timestamp}.json`);
  
  fs.writeFileSync(outputPath, JSON.stringify(leadsArray, null, 2));
  
  // Also save as CSV
  const csvPath = path.join(CONFIG.outputDir, `youtube-leads-${timestamp}.csv`);
  const csvHeader = 'Name,Platform,Subscribers,Niche,Score,HasIntent,Email,ChannelURL,Instagram,Twitter\n';
  const csvRows = leadsArray.map(l => 
    `"${l.name}",${l.platform},${l.subscribers},${l.niche},${l.score},${l.hasIntent},"${l.email || ''}","${l.channelUrl}","${l.socialLinks?.instagram || ''}","${l.socialLinks?.twitter || ''}"`
  ).join('\n');
  
  fs.writeFileSync(csvPath, csvHeader + csvRows);
  
  // Summary
  console.log('\n📊 Summary');
  console.log('================================');
  console.log(`Total leads found: ${leadsArray.length}`);
  console.log(`Hot leads (50+ score): ${leadsArray.filter(l => l.score >= 50).length}`);
  console.log(`Warm leads (30-49 score): ${leadsArray.filter(l => l.score >= 30 && l.score < 50).length}`);
  console.log(`With intent signals: ${leadsArray.filter(l => l.hasIntent).length}`);
  console.log(`With email: ${leadsArray.filter(l => l.email).length}`);
  console.log('');
  console.log(`💾 Saved to: ${outputPath}`);
  console.log(`📄 CSV: ${csvPath}`);
  
  return leadsArray;
}

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--niche' && args[i + 1]) {
      options.niche = args[++i];
    } else if (args[i] === '--min-subs' && args[i + 1]) {
      options.minSubs = parseInt(args[++i]);
    } else if (args[i] === '--max-subs' && args[i + 1]) {
      options.maxSubs = parseInt(args[++i]);
    } else if (args[i] === '--help') {
      console.log(`
KLASS YouTube Lead Scraper

Usage: node youtube-scraper.js [options]

Options:
  --niche <name>     Filter by niche (business, fitness, finance, personal_dev, creative, tech)
  --min-subs <n>     Minimum subscribers (default: 10000)
  --max-subs <n>     Maximum subscribers (default: 500000)
  --help             Show this help

Environment:
  YOUTUBE_API_KEY    YouTube Data API key (get free at console.cloud.google.com)

Examples:
  node youtube-scraper.js
  node youtube-scraper.js --niche fitness --min-subs 25000
  YOUTUBE_API_KEY=xxx node youtube-scraper.js
      `);
      process.exit(0);
    }
  }
  
  return options;
}

// Run if called directly
if (require.main === module) {
  const options = parseArgs();
  scrapeYouTubeLeads(options).catch(console.error);
}

module.exports = { scrapeYouTubeLeads, CONFIG };
