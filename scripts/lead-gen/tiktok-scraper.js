#!/usr/bin/env node

/**
 * KLASS TikTok Lead Scraper
 * 
 * Finds TikTok creators who mention community/course/membership keywords.
 * Uses public web scraping (no official API required).
 * 
 * Usage:
 *   node tiktok-scraper.js [--niche fitness] [--min-followers 10000] [--max-followers 500000]
 * 
 * Output: ./output/tiktok-leads-{timestamp}.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Target follower range
  minFollowers: 10000,
  maxFollowers: 500000,
  
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
    'link in bio',
    'free community',
    'paid community',
    'mastermind',
    'exclusive',
    'dm me'
  ],
  
  // Hashtags to search for finding creators
  searchHashtags: [
    'coursecreator',
    'onlinebusiness',
    'digitalproducts',
    'coachingbusiness',
    'communitybusiness',
    'passiveincome',
    'sidehustle',
    'buildyourbrand',
    'contentcreator',
    'creatoreconomy',
    'smallbusinessowner',
    'entrepreneurlife',
    'onlinecoach',
    'membershipsite',
    'skoolcommunity'
  ],
  
  // Creators who are likely in the target ICP (seed list to scrape)
  seedCreators: [
    // Business/entrepreneurship
    'alexhormozi',
    'garyvee',
    'codie_sanchez',
    'themrsginger',
    
    // Fitness
    'chriswilliamsonpod',
    'drmikeisraetel',
    'jeffnippard',
    
    // Finance
    'humphrey_yang',
    'personalfinanceclub',
    'investwithqueenie',
    
    // Personal development
    'thejordanharbinger',
    'lewishowes',
    'jayshettytiktok'
  ],
  
  // Niches
  niches: {
    business: ['entrepreneur', 'business', 'money', 'income', 'startup', 'side hustle', 'ceo'],
    fitness: ['fitness', 'workout', 'gym', 'health', 'weight loss', 'muscle', 'coach'],
    finance: ['investing', 'stocks', 'crypto', 'finance', 'wealth', 'money'],
    personal_dev: ['productivity', 'mindset', 'motivation', 'habits', 'self improvement'],
    creative: ['design', 'photography', 'video', 'music', 'art', 'creator'],
    tech: ['coding', 'programming', 'software', 'tech', 'developer', 'app']
  },
  
  // Output directory
  outputDir: path.join(__dirname, 'output')
};

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

/**
 * Make HTTPS request with headers
 */
function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/json',
        ...headers
      }
    };
    
    https.get(options, (res) => {
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
 * Scrape TikTok user profile (public data only)
 * Note: TikTok heavily rate-limits, so this uses conservative delays
 */
async function scrapeTikTokProfile(username) {
  // TikTok's public web page embeds JSON data
  // We'll simulate what we'd get from a real scrape
  
  // In production, you'd use:
  // 1. TikTok's unofficial oembed endpoint
  // 2. Web scraping with puppeteer
  // 3. Third-party TikTok data providers
  
  try {
    // Try oembed endpoint (limited data but doesn't need auth)
    const oembedUrl = `https://www.tiktok.com/oembed?url=https://www.tiktok.com/@${username}`;
    
    const data = await httpsGet(oembedUrl);
    
    if (data && data.author_name) {
      return {
        username: username,
        displayName: data.author_name,
        profileUrl: `https://tiktok.com/@${username}`,
        // oembed doesn't return follower count, would need web scrape
        followersEstimated: true
      };
    }
  } catch (e) {
    // oembed failed, return mock
  }
  
  // Return mock data for demo
  return getMockTikTokProfile(username);
}

/**
 * Mock TikTok data for testing without scraping
 */
function getMockTikTokProfile(username) {
  const mockProfiles = {
    'alexhormozi': {
      username: 'alexhormozi',
      displayName: 'Alex Hormozi',
      followers: 2500000,
      bio: 'Building $100M+ businesses. Join Skool Games at acquisition.com. Free community for entrepreneurs. DM for coaching inquiries.',
      niche: 'business',
      hasIntent: true,
      intentSignals: ['community', 'skool', 'coaching']
    },
    'garyvee': {
      username: 'garyvee',
      displayName: 'Gary Vaynerchuk',
      followers: 12000000,
      bio: 'CEO of VaynerMedia. NFTs, business, and motivation. Link in bio for my community.',
      niche: 'business',
      hasIntent: true,
      intentSignals: ['community']
    },
    'themrsginger': {
      username: 'themrsginger',
      displayName: 'Mrs Ginger',
      followers: 180000,
      bio: 'Helping moms build online businesses from home. Course dropping soon! Join my free FB group.',
      niche: 'business',
      hasIntent: true,
      intentSignals: ['course', 'join my']
    },
    'drmikeisraetel': {
      username: 'drmikeisraetel',
      displayName: 'Dr. Mike Israetel',
      followers: 450000,
      bio: 'Renaissance Periodization. Science-based fitness. RP membership for serious lifters.',
      niche: 'fitness',
      hasIntent: true,
      intentSignals: ['membership']
    },
    'investwithqueenie': {
      username: 'investwithqueenie',
      displayName: 'Queenie',
      followers: 85000,
      bio: 'Making investing simple. Join my investing community - link in bio! Email: hello@investwithqueenie.com',
      niche: 'finance',
      hasIntent: true,
      intentSignals: ['community', 'join my']
    }
  };
  
  // Return known mock or generate random
  if (mockProfiles[username]) {
    const p = mockProfiles[username];
    return {
      username: p.username,
      displayName: p.displayName,
      followers: p.followers,
      bio: p.bio,
      profileUrl: `https://tiktok.com/@${username}`,
      niche: p.niche,
      hasIntent: p.hasIntent,
      intentSignals: p.intentSignals
    };
  }
  
  // Generate random profile for demo
  const randomFollowers = Math.floor(Math.random() * 400000) + 20000;
  return {
    username: username,
    displayName: username.charAt(0).toUpperCase() + username.slice(1),
    followers: randomFollowers,
    bio: 'Creator | Link in bio for more',
    profileUrl: `https://tiktok.com/@${username}`,
    niche: 'other',
    hasIntent: false,
    intentSignals: []
  };
}

/**
 * Generate discovered creators from hashtag search
 * In production, this would scrape TikTok hashtag pages
 */
function discoverCreatorsFromHashtag(hashtag) {
  // Mock: return some sample creators that would be found
  const creatorsByHashtag = {
    'coursecreator': ['courseboss', 'digitalproductsqueen', 'onlinecoursetips'],
    'onlinebusiness': ['buildyourempire', 'digitalnomadlife', 'ecomqueen'],
    'coachingbusiness': ['lifecoachjess', 'businesscoachmark', 'mindsetmentor'],
    'communitybusiness': ['communitybuilder', 'tribeleader', 'groupcoach'],
    'creatoreconomy': ['creatorbiz', 'contentmoney', 'creatorwealth'],
    'onlinecoach': ['fitcoachamy', 'healthcoachdan', 'wealthcoachpro']
  };
  
  return creatorsByHashtag[hashtag] || [];
}

/**
 * Check bio for intent signals
 */
function analyzeIntentSignals(bio) {
  if (!bio) return { hasIntent: false, signals: [] };
  
  const lowerBio = bio.toLowerCase();
  const signals = CONFIG.intentKeywords.filter(kw => lowerBio.includes(kw));
  
  return {
    hasIntent: signals.length > 0,
    signals
  };
}

/**
 * Detect niche from bio
 */
function detectNiche(username, bio) {
  const text = `${username} ${bio}`.toLowerCase();
  
  for (const [niche, keywords] of Object.entries(CONFIG.niches)) {
    if (keywords.some(kw => text.includes(kw))) {
      return niche;
    }
  }
  return 'other';
}

/**
 * Extract links from bio
 */
function extractLinks(bio) {
  if (!bio) return {};
  
  const links = {};
  
  // Email
  const emailMatch = bio.match(/[\w.-]+@[\w.-]+\.\w+/i);
  if (emailMatch) links.email = emailMatch[0];
  
  // Website mentions
  if (bio.toLowerCase().includes('link in bio')) {
    links.hasLinkInBio = true;
  }
  
  // Linktree
  const ltMatch = bio.match(/linktr\.ee\/([a-zA-Z0-9_.]+)/i);
  if (ltMatch) links.linktree = `https://linktr.ee/${ltMatch[1]}`;
  
  return links;
}

/**
 * Calculate lead score
 */
function calculateLeadScore(lead) {
  let score = 0;
  
  // Follower range scoring (prefer sweet spot)
  const followers = lead.followers || 0;
  if (followers >= 50000 && followers <= 150000) score += 20;
  else if (followers >= 25000 && followers < 50000) score += 15;
  else if (followers >= 150000 && followers <= 300000) score += 10;
  else if (followers >= 10000) score += 5;
  
  // Intent signals
  score += (lead.intentSignals?.length || 0) * 5;
  
  // Tier 1 niches
  const tier1 = ['business', 'finance', 'tech', 'personal_dev'];
  if (tier1.includes(lead.niche)) score += 10;
  
  // Has email
  if (lead.links?.email) score += 5;
  
  // Has link in bio
  if (lead.links?.hasLinkInBio) score += 3;
  
  return score;
}

/**
 * Main scraper function
 */
async function scrapeTikTokLeads(options = {}) {
  const minFollowers = options.minFollowers || CONFIG.minFollowers;
  const maxFollowers = options.maxFollowers || CONFIG.maxFollowers;
  const targetNiche = options.niche || null;
  
  console.log('\n🎵 KLASS TikTok Lead Scraper');
  console.log('================================');
  console.log(`Target: ${minFollowers.toLocaleString()} - ${maxFollowers.toLocaleString()} followers`);
  if (targetNiche) console.log(`Niche filter: ${targetNiche}`);
  console.log('');
  console.log('⚠️  Note: Using mock data. For real scraping, integrate:');
  console.log('   - Puppeteer web scraping');
  console.log('   - Third-party TikTok data APIs');
  console.log('   - Social listening tools');
  console.log('');
  
  const leads = new Map();
  
  // 1. Scrape seed creators
  console.log('📍 Checking seed creators...');
  for (const username of CONFIG.seedCreators) {
    const profile = await scrapeTikTokProfile(username);
    
    if (!profile) continue;
    
    // Check follower range
    const followers = profile.followers || 0;
    if (followers < minFollowers || followers > maxFollowers) {
      console.log(`   ⏭️  ${username} - outside follower range (${followers.toLocaleString()})`);
      continue;
    }
    
    // Analyze intent
    const { hasIntent, signals } = analyzeIntentSignals(profile.bio);
    const niche = profile.niche || detectNiche(username, profile.bio);
    
    // Filter by niche if specified
    if (targetNiche && niche !== targetNiche) continue;
    
    // Extract links
    const links = extractLinks(profile.bio);
    
    const lead = {
      name: profile.displayName,
      username: username,
      platform: 'tiktok',
      followers: followers,
      niche: niche,
      hasIntent: hasIntent,
      intentSignals: signals,
      bio: profile.bio?.substring(0, 500),
      links: links,
      email: links.email || null,
      profileUrl: `https://tiktok.com/@${username}`,
      scrapedAt: new Date().toISOString()
    };
    
    lead.score = calculateLeadScore(lead);
    
    leads.set(username, lead);
    console.log(`   ✅ ${lead.name} (@${username}) - ${followers.toLocaleString()} followers, score: ${lead.score}`);
    
    // Rate limit
    await new Promise(r => setTimeout(r, 300));
  }
  
  // 2. Discover from hashtags
  console.log('\n🔍 Discovering from hashtags...');
  for (const hashtag of CONFIG.searchHashtags.slice(0, 5)) { // Limit for demo
    console.log(`   #${hashtag}`);
    const discoveredUsernames = discoverCreatorsFromHashtag(hashtag);
    
    for (const username of discoveredUsernames) {
      if (leads.has(username)) continue;
      
      const profile = await scrapeTikTokProfile(username);
      if (!profile) continue;
      
      const followers = profile.followers || 0;
      if (followers < minFollowers || followers > maxFollowers) continue;
      
      const { hasIntent, signals } = analyzeIntentSignals(profile.bio);
      const niche = detectNiche(username, profile.bio);
      
      if (targetNiche && niche !== targetNiche) continue;
      
      const links = extractLinks(profile.bio);
      
      const lead = {
        name: profile.displayName,
        username: username,
        platform: 'tiktok',
        followers: followers,
        niche: niche,
        hasIntent: hasIntent,
        intentSignals: signals,
        bio: profile.bio?.substring(0, 500),
        links: links,
        email: links.email || null,
        profileUrl: `https://tiktok.com/@${username}`,
        scrapedAt: new Date().toISOString()
      };
      
      lead.score = calculateLeadScore(lead);
      leads.set(username, lead);
      
      console.log(`      ✅ @${username} - ${followers.toLocaleString()} followers`);
      
      await new Promise(r => setTimeout(r, 200));
    }
  }
  
  // Convert to array and sort by score
  const leadsArray = Array.from(leads.values())
    .sort((a, b) => b.score - a.score);
  
  // Save results
  const timestamp = new Date().toISOString().split('T')[0];
  const outputPath = path.join(CONFIG.outputDir, `tiktok-leads-${timestamp}.json`);
  
  fs.writeFileSync(outputPath, JSON.stringify(leadsArray, null, 2));
  
  // Also save as CSV
  const csvPath = path.join(CONFIG.outputDir, `tiktok-leads-${timestamp}.csv`);
  const csvHeader = 'Name,Username,Platform,Followers,Niche,Score,HasIntent,Email,ProfileURL\n';
  const csvRows = leadsArray.map(l => 
    `"${l.name}","${l.username}",${l.platform},${l.followers},${l.niche},${l.score},${l.hasIntent},"${l.email || ''}","${l.profileUrl}"`
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
    } else if (args[i] === '--min-followers' && args[i + 1]) {
      options.minFollowers = parseInt(args[++i]);
    } else if (args[i] === '--max-followers' && args[i + 1]) {
      options.maxFollowers = parseInt(args[++i]);
    } else if (args[i] === '--help') {
      console.log(`
KLASS TikTok Lead Scraper

Usage: node tiktok-scraper.js [options]

Options:
  --niche <name>         Filter by niche (business, fitness, finance, personal_dev, creative, tech)
  --min-followers <n>    Minimum followers (default: 10000)
  --max-followers <n>    Maximum followers (default: 500000)
  --help                 Show this help

Notes:
  - Uses mock data by default (TikTok heavily rate-limits)
  - For production, integrate with:
    * Puppeteer for web scraping
    * Third-party TikTok APIs (RapidAPI, etc.)
    * Social listening tools (Brandwatch, etc.)

Examples:
  node tiktok-scraper.js
  node tiktok-scraper.js --niche fitness --min-followers 25000
      `);
      process.exit(0);
    }
  }
  
  return options;
}

// Run if called directly
if (require.main === module) {
  const options = parseArgs();
  scrapeTikTokLeads(options).catch(console.error);
}

module.exports = { scrapeTikTokLeads, CONFIG };
