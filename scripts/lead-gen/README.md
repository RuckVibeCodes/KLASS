# KLASS Lead Generation Scripts

Automated system for finding and qualifying YouTube/TikTok creators who would benefit from KLASS.

## Quick Start

```bash
cd scripts/lead-gen
node index.js
```

This runs all scrapers and outputs combined results to `./output/`.

## Scripts

### `index.js` - Combined Runner
Runs all scrapers and combines results with deduplication.

```bash
node index.js [--niche fitness] [--min 10000] [--max 500000]
```

### `youtube-scraper.js` - YouTube Channel Finder
Finds YouTube creators using the YouTube Data API.

```bash
# With API key (real data)
YOUTUBE_API_KEY=your-key node youtube-scraper.js

# Without API key (mock data for testing)
node youtube-scraper.js
```

**Get a free API key:** [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- Create a project
- Enable "YouTube Data API v3"
- Create an API key (no OAuth needed)
- Free tier: 10,000 quota units/day (search = 100 units each)

### `tiktok-scraper.js` - TikTok Creator Finder
Finds TikTok creators using public data.

```bash
node tiktok-scraper.js [--niche business] [--min-followers 25000]
```

**Note:** TikTok heavily rate-limits scraping. The script uses mock data by default. For production:
- Use Puppeteer with residential proxies
- Integrate with third-party TikTok APIs (RapidAPI, etc.)
- Use social listening tools (Brandwatch, Sprout Social, etc.)

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--niche <name>` | Filter by niche | all |
| `--min <n>` | Min followers/subs | 10,000 |
| `--max <n>` | Max followers/subs | 500,000 |

**Niches:** business, fitness, finance, personal_dev, creative, tech

## Output

All files are saved to `./output/`:

```
output/
├── youtube-leads-2024-01-15.json     # YouTube results
├── youtube-leads-2024-01-15.csv
├── tiktok-leads-2024-01-15.json      # TikTok results  
├── tiktok-leads-2024-01-15.csv
├── all-leads-2024-01-15.json         # Combined results
├── all-leads-2024-01-15.csv
└── lead-report-2024-01-15.json       # Summary statistics
```

### Lead Schema

```json
{
  "name": "CreatorBiz Academy",
  "platform": "youtube",
  "subscribers": 85000,
  "niche": "business",
  "score": 45,
  "hasIntent": true,
  "intentSignals": ["community", "patreon"],
  "email": "hello@creatorbiz.com",
  "channelUrl": "https://youtube.com/channel/UCxxx",
  "socialLinks": {
    "instagram": "https://instagram.com/creatorbiz",
    "twitter": "https://twitter.com/creatorbiz"
  },
  "scrapedAt": "2024-01-15T12:00:00Z"
}
```

### Lead Scoring

| Signal | Points |
|--------|--------|
| 50K-150K subscribers (sweet spot) | +20 |
| Intent keyword in description | +5 each |
| Tier 1 niche (business/finance/tech) | +10 |
| Has public email | +5 |
| Has link in bio | +3 |

**Score Tiers:**
- 🔥 Hot: 50+ points
- 🌡️ Warm: 30-49 points
- ❄️ Cold: <30 points

## Intent Keywords

The scrapers look for these keywords in bios/descriptions:

- community, membership, course, coaching
- patreon, discord, skool
- join my, private group, inner circle
- paid community, exclusive content, members only

## Customization

### Add Search Terms

Edit `CONFIG.searchTerms` in each scraper:

```javascript
searchTerms: [
  'your custom search term',
  // ...
]
```

### Add Niches

Edit `CONFIG.niches`:

```javascript
niches: {
  your_niche: ['keyword1', 'keyword2', 'keyword3'],
  // ...
}
```

### Add Intent Keywords

Edit `CONFIG.intentKeywords`:

```javascript
intentKeywords: [
  'your keyword',
  // ...
]
```

## Production Setup

### For Real YouTube Data

1. Get API key from Google Cloud Console
2. Set environment variable: `export YOUTUBE_API_KEY=your-key`
3. Run scraper

### For Real TikTok Data

Options:
1. **Puppeteer scraping** - Add puppeteer-based scraping with residential proxies
2. **Third-party APIs** - RapidAPI has TikTok scrapers ($50-200/month)
3. **Social listening** - Brandwatch, Sprout Social, etc.

### Recommended Stack for Scale

```
┌─────────────────────────────────────────────────────┐
│                  Lead Pipeline                       │
├─────────────────────────────────────────────────────┤
│  1. Scrapers (this repo)                            │
│     └─> Raw leads to JSON/CSV                       │
│                                                      │
│  2. Data enrichment (optional)                      │
│     └─> Hunter.io, Clearbit for emails             │
│                                                      │
│  3. CRM import                                      │
│     └─> Notion, Airtable, or HubSpot               │
│                                                      │
│  4. Outreach automation                             │
│     └─> Instantly.ai, Lemlist, or manual           │
└─────────────────────────────────────────────────────┘
```

## Cron Setup

Run daily at 6am:

```bash
# Add to crontab -e
0 6 * * * cd /path/to/KLASS/scripts/lead-gen && node index.js >> /var/log/klass-leads.log 2>&1
```

## Related Docs

- [ICP.md](../../docs/ICP.md) - Ideal Customer Profile
- [outreach-templates.md](../../docs/outreach-templates.md) - DM/email templates

## Contributing

PRs welcome! Ideas for improvement:
- Instagram scraper
- Twitter/X scraper  
- Podcast scraper (for hosts launching communities)
- Email finder integration
- CRM auto-sync
