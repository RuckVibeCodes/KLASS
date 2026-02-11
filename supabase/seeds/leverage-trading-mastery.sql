-- ============================================
-- LEVERAGE TRADING MASTERY - KLASS SEED DATA
-- Run in Supabase SQL Editor
-- ============================================

-- Community
INSERT INTO communities (id, name, slug, description, logo_url, primary_color, accent_color, settings_json)
VALUES (
  'a1b2c3d4-5678-90ab-cdef-111111111111',
  'Leverage Trading Mastery',
  'leverage-trading-mastery',
  'Master leverage trading from zero to pro. A comprehensive, self-paced curriculum with 10 phases covering mindset, math, charts, technical analysis, platform execution, and advanced strategies. Built for working professionals who want professional-grade trading skills.',
  NULL,
  '#0f172a',
  '#22c55e',
  '{"features": {"chat": true, "events": true, "resources": true}}'
);

-- Community Modules
INSERT INTO community_modules (community_id, key, label, enabled, order_index) VALUES
('a1b2c3d4-5678-90ab-cdef-111111111111', 'feed', 'Community Feed', true, 1),
('a1b2c3d4-5678-90ab-cdef-111111111111', 'programs', 'Courses', true, 2),
('a1b2c3d4-5678-90ab-cdef-111111111111', 'chat', 'Chat', true, 3),
('a1b2c3d4-5678-90ab-cdef-111111111111', 'events', 'Live Sessions', true, 4),
('a1b2c3d4-5678-90ab-cdef-111111111111', 'resources', 'Resources', true, 5);

-- Program: Complete Trading Curriculum
INSERT INTO programs (id, community_id, title, description, thumbnail_url, visibility, published, order_index)
VALUES (
  'b1b2c3d4-5678-90ab-cdef-222222222222',
  'a1b2c3d4-5678-90ab-cdef-111111111111',
  'Complete Trading Curriculum',
  'The full 10-phase journey from beginner to certified leverage trader. Covers mindset, math, chart reading, technical analysis, platform execution, confluence systems, leverage management, strategy development, trading psychology, and advanced topics.',
  NULL,
  'paid',
  true,
  1
);

-- ============================================
-- PHASE 1 LESSONS (10 total)
-- ============================================

-- Lesson 1.1.1: Course Overview & Learning Path
INSERT INTO lessons (id, program_id, title, content, order_index, visibility, published)
VALUES (
  'c1111111-5678-90ab-cdef-333333333333',
  'b1b2c3d4-5678-90ab-cdef-222222222222',
  'Course Overview & Learning Path',
  '# Course Overview & Learning Path

Welcome to **Leverage Trading Mastery** — a comprehensive, self-paced curriculum designed to take you from complete beginner to confident leverage trader.

<Callout type="info" title="Who This Course Is For">
This program is built for working professionals (ages 20-50) who want to develop professional-grade trading skills without the overwhelming complexity of traditional finance education.
</Callout>

## The 10-Phase Journey

You''ll progress through ten carefully designed phases:

<Steps>
  <Step number={1} title="Foundation">
    Build your trading mindset and master the essential math
  </Step>
  <Step number={2} title="Chart Mastery">
    Learn to read candlesticks, support/resistance, and trends
  </Step>
  <Step number={3} title="Technical Analysis">
    Master indicators, patterns, and volume analysis
  </Step>
  <Step number={4} title="Platform Proficiency">
    Execute trades with precision on real exchanges
  </Step>
  <Step number={5} title="Confluence Systems">
    Stack multiple factors to find high-probability setups
  </Step>
  <Step number={6} title="Leverage Management">
    Use leverage safely without blowing up your account
  </Step>
  <Step number={7} title="Strategy Development">
    Build and backtest your personal trading edge
  </Step>
  <Step number={8} title="Psychology & Performance">
    Master the inner game that separates winners from losers
  </Step>
  <Step number={9} title="Advanced Topics">
    Market microstructure, hedging, portfolio management
  </Step>
  <Step number={10} title="Capstone Certification">
    Prove your skills and earn your certificate
  </Step>
</Steps>

## Time Commitment

<Callout type="tip" title="Flexible Learning">
- **Fast track:** 3-6 months (30-45 min daily)
- **Casual pace:** 6-12 months (a few sessions per week)
- **Recommended:** 90-minute focused sessions with 15-minute breaks
</Callout>

## Why Crypto First?

We focus on cryptocurrency trading because:

- **24/7 markets** — Practice anytime, not just market hours
- **Low minimums** — Start with as little as $10-100
- **Clean price action** — No earnings surprises or CEO scandals
- **Accelerated learning** — Patterns that take months in stocks happen in days

<Callout type="warning" title="Skills Transfer">
Everything you learn here applies to stocks, forex, and futures. Crypto is just the best classroom for beginners.
</Callout>

## What You''ll Need

- A computer or tablet with internet access
- A free TradingView account
- A demo trading account (we''ll set this up in Phase 4)
- 30-45 minutes per day to study

<Choice
  question="How long should your focused study sessions be?"
  options={[
    { text: "10-15 minutes", correct: false, explanation: "Too short to build deep understanding. Aim for at least 30 minutes." },
    { text: "30-45 minutes with breaks", correct: true, explanation: "Correct! This is optimal for adult learning without cognitive overload." },
    { text: "3-4 hours non-stop", correct: false, explanation: "Marathon sessions lead to burnout. Quality over quantity." },
    { text: "It doesn''t matter", correct: false, explanation: "Session length matters. Research shows 30-45 minute blocks are optimal." }
  ]}
/>

## Your Success Metrics

By the end of this course, you will:

- ✅ Understand risk management deeply (most traders never do)
- ✅ Read charts with confidence
- ✅ Execute trades on real platforms
- ✅ Have a tested, personal trading strategy
- ✅ Control your emotions during trades
- ✅ Know exactly when to trade and when to sit out

<Callout type="success" title="Let''s Begin">
Ready to start your journey? Head to the next lesson: **Why Crypto First?**
</Callout>',
  1,
  'public',
  true
);

-- Lesson 1.1.2: Why Crypto First? Asset Class Comparison
INSERT INTO lessons (id, program_id, title, content, order_index, visibility, published)
VALUES (
  'c2222222-5678-90ab-cdef-333333333333',
  'b1b2c3d4-5678-90ab-cdef-222222222222',
  'Why Crypto First? Asset Class Comparison',
  '# Why Crypto First? Asset Class Comparison

Before we dive into charts and strategies, let''s understand why cryptocurrency is the **ideal training ground** for new traders.

<Callout type="info" title="Key Insight">
Crypto isn''t just an asset class — it''s a 24/7 trading gym where you can build skills faster than any other market.
</Callout>

## Asset Class Comparison

| Feature | Crypto | Stocks | Forex | Futures |
|---------|--------|--------|-------|---------|
| Market Hours | 24/7/365 | 6.5 hrs/day | 24/5 | ~23 hrs/day |
| Minimum Capital | $10-100 | $1,000+ | $100+ | $5,000+ |
| Leverage Available | 1-125x | 2-4x | 50-500x | 10-50x |
| Pattern Speed | Fast (days) | Slow (weeks) | Medium | Medium |
| News Impact | Clean | Earnings, CEO | Central banks | Complex |
| Weekend Trading | ✅ Yes | ❌ No | ❌ No | ❌ No |

## The Learning Advantages

<Steps>
  <Step number={1} title="24/7 Access">
    Practice anytime — before work, lunch breaks, weekends. No waiting for market open.
  </Step>
  <Step number={2} title="Low Minimums">
    Start with $50-100. Make mistakes with small money before scaling up.
  </Step>
  <Step number={3} title="Accelerated Patterns">
    Price patterns that take months in stocks happen in days in crypto. More reps = faster learning.
  </Step>
  <Step number={4} title="Clean Price Action">
    No earnings surprises, CEO scandals, or dividend adjustments. Just supply and demand.
  </Step>
</Steps>

## The Volatility Advantage

<Callout type="warning" title="Volatility Is Your Friend (When Managed)">
High volatility = more opportunities. A 5% move in BTC happens weekly. That same move in SPY might take months.
</Callout>

### Daily Volatility Comparison (Average)

- **Bitcoin:** 3-5% daily moves common
- **S&P 500:** 0.5-1% daily moves typical
- **EUR/USD:** 0.3-0.5% daily moves
- **Gold:** 0.5-1% daily moves

More volatility means:
- More entry opportunities
- Faster feedback on your trades
- More chances to practice reading price action

## Skills That Transfer

Everything you learn trading crypto applies directly to other markets:

<Callout type="success" title="Universal Skills">
- Chart reading (candlesticks, patterns, S/R)
- Risk management (position sizing, stop losses)
- Technical indicators (RSI, MACD, MAs)
- Trading psychology (discipline, patience)
- Order execution (limits, stops, market)
</Callout>

Once you''re profitable in crypto, transitioning to stocks or forex is just learning the specific quirks of that market.

<Choice
  question="Why is crypto considered an ideal training ground for beginners?"
  options={[
    { text: "It''s easier to predict", correct: false, explanation: "Crypto is NOT easier to predict — it''s more volatile. But that volatility creates more learning opportunities." },
    { text: "24/7 markets, low minimums, fast pattern cycles", correct: true, explanation: "Correct! These factors let you get more practice, make mistakes with small money, and learn faster." },
    { text: "It always goes up", correct: false, explanation: "Crypto definitely does NOT always go up. 80% drops happen. The advantage is learning speed, not guaranteed profits." },
    { text: "There''s no risk in crypto", correct: false, explanation: "Crypto is HIGH risk. The advantage is you can manage that risk with small position sizes while learning." }
  ]}
/>

<Choice
  question="A price pattern that takes 3 months to form in stocks might form in ___ in crypto:"
  options={[
    { text: "3 years", correct: false, explanation: "Crypto moves faster than stocks, not slower." },
    { text: "3 weeks", correct: false, explanation: "Close, but patterns in crypto are even faster than this." },
    { text: "3-7 days", correct: true, explanation: "Correct! Crypto''s higher volatility compresses timeframes significantly." },
    { text: "3 hours", correct: false, explanation: "That''s too fast even for crypto. While there are fast moves, pattern formation still takes days." }
  ]}
/>

## The Bottom Line

<Callout type="tip" title="Start Crypto, Master Anywhere">
Learn the hard lessons with small money in a 24/7 market. Then apply those skills anywhere — stocks, forex, futures. The skills transfer; the scars don''t have to be expensive.
</Callout>

**Next up:** The Trader''s Mindset — the mental foundations that separate winners from losers.',
  2,
  'public',
  true
);

-- Lesson 1.1.3: The Trader's Mindset
INSERT INTO lessons (id, program_id, title, content, order_index, visibility, published)
VALUES (
  'c3333333-5678-90ab-cdef-333333333333',
  'b1b2c3d4-5678-90ab-cdef-222222222222',
  'The Trader''s Mindset: Discipline, Patience, Control',
  '# The Trader''s Mindset: Discipline, Patience, Control

The difference between profitable traders and everyone else isn''t intelligence or secret strategies — it''s **mindset**.

<Callout type="danger" title="The Hard Truth">
80-90% of traders lose money. The edge isn''t in the charts — it''s in your head.
</Callout>

## The Three Pillars

<Steps>
  <Step number={1} title="Discipline">
    Following your rules even when emotions scream otherwise
  </Step>
  <Step number={2} title="Patience">
    Waiting for A+ setups instead of forcing trades
  </Step>
  <Step number={3} title="Emotional Control">
    Making decisions from logic, not fear or greed
  </Step>
</Steps>

## Discipline: Your Rules Are Law

Discipline means having a trading plan and following it **every single time**.

<Callout type="warning" title="The Discipline Test">
If you can''t follow your rules on a demo account, you''ll never follow them with real money on the line.
</Callout>

### Signs of Poor Discipline:
- Moving stop losses "just a little"
- Adding to losing positions
- Trading larger than your plan allows
- Entering trades without a clear setup

### Signs of Good Discipline:
- Taking every valid setup your system gives
- Honoring stop losses without exception
- Sizing positions correctly every time
- Walking away when there''s no setup

## Patience: The Hardest Skill

<Callout type="info" title="Quality Over Quantity">
Professional traders often take 3-5 trades per week. Beginners take 3-5 trades per hour. Guess who wins?
</Callout>

### The Patience Paradox

- **More trades ≠ More profits**
- **Waiting for A+ setups = Higher win rate**
- **Forcing trades = Death by a thousand cuts**

Think of yourself as a sniper, not a machine gunner. One perfect shot beats 100 sprayed bullets.

<Choice
  question="A professional trader typically takes how many trades per week?"
  options={[
    { text: "50-100 trades", correct: false, explanation: "That''s overtrading. Quality beats quantity in trading." },
    { text: "20-30 trades", correct: false, explanation: "Still too many. Most pros are very selective." },
    { text: "3-10 trades", correct: true, explanation: "Correct! Pros wait for high-probability setups instead of forcing action." },
    { text: "1 trade per month", correct: false, explanation: "That''s too conservative for most strategies to be practical." }
  ]}
/>

## Emotional Control: Trading Without Tilt

The two emotions that destroy traders:

### 1. Fear
- Fear of losing → Not taking valid setups
- Fear of giving back profits → Cutting winners too early
- Fear of being wrong → Moving stops or not using them

### 2. Greed
- Greed for more → Oversizing positions
- Greed for action → Overtrading
- Greed for recovery → Revenge trading after losses

<Callout type="tip" title="The Zen State">
The goal is to feel **nothing** when you click buy or sell. It''s just another execution of your edge. The outcome of any single trade is irrelevant.
</Callout>

## Building the Right Mindset

<Steps>
  <Step number={1} title="Accept Losses">
    Losses are tuition. You will lose trades. Plan for it.
  </Step>
  <Step number={2} title="Think in Probabilities">
    No trade is certain. You''re playing odds over 100+ trades.
  </Step>
  <Step number={3} title="Detach from Outcomes">
    Judge your trading by process, not individual results.
  </Step>
  <Step number={4} title="Journal Everything">
    Track your emotional state alongside your trades.
  </Step>
</Steps>

<Choice
  question="You just had 3 losing trades in a row. What should you do?"
  options={[
    { text: "Double your position size to recover faster", correct: false, explanation: "This is revenge trading — the #1 account killer. Never size up after losses." },
    { text: "Stop trading for the day and review your trades", correct: true, explanation: "Correct! Step back, review if the trades followed your plan, and protect your mental capital." },
    { text: "Keep trading — losses are just part of it", correct: false, explanation: "While losses are normal, 3 in a row signals you should pause and assess, not push through." },
    { text: "Delete the app and never trade again", correct: false, explanation: "Overreaction. Losing streaks happen to everyone. The key is managing them properly." }
  ]}
/>

## The Professional Difference

| Amateur Mindset | Professional Mindset |
|-----------------|---------------------|
| "I need to make money today" | "I need to follow my process today" |
| "This trade HAS to work" | "This is one of hundreds of trades" |
| "I can''t take another loss" | "Losses are part of the game" |
| "I know where this is going" | "I have a statistical edge over time" |

<Callout type="success" title="Key Takeaway">
Master your mind before you try to master the markets. All the technical analysis in the world won''t help if you can''t execute with discipline.
</Callout>

**Next up:** Setting Up Your Learning Environment',
  3,
  'members',
  true
);

-- Lesson 1.1.4: Setting Up Your Learning Environment
INSERT INTO lessons (id, program_id, title, content, order_index, visibility, published)
VALUES (
  'c4444444-5678-90ab-cdef-333333333333',
  'b1b2c3d4-5678-90ab-cdef-222222222222',
  'Setting Up Your Learning Environment',
  '# Setting Up Your Learning Environment

Before we dive into trading math, let''s set up your workspace for success.

<Callout type="info" title="Why Environment Matters">
Professional traders have professional setups. Your environment shapes your habits.
</Callout>

## Essential Tools Checklist

<Steps>
  <Step number={1} title="TradingView Account (Free)">
    Go to tradingview.com and create a free account. This is your charting platform.
  </Step>
  <Step number={2} title="Demo Exchange Account">
    Create a demo/testnet account on Bybit, Binance Testnet, or similar. We''ll practice here first.
  </Step>
  <Step number={3} title="Trading Journal">
    Set up a spreadsheet or use a tool like Notion. You''ll track every trade.
  </Step>
  <Step number={4} title="Note-Taking System">
    Somewhere to take notes during lessons. Digital or paper, your choice.
  </Step>
</Steps>

## TradingView Setup Guide

### Creating Your Account
1. Visit [tradingview.com](https://tradingview.com)
2. Click "Get Started" → Sign up with email or Google
3. Free tier is fine for now — you can upgrade later if needed

### Essential Chart Settings
- **Timeframe buttons:** Add 1H, 4H, 1D to your toolbar
- **Symbol search:** Type "BTCUSDT" to load Bitcoin
- **Theme:** Dark mode recommended (easier on eyes)

<Callout type="tip" title="Pro Tip">
Right-click the chart → "Settings" → Enable "Countdown to bar close" under "Status line". This shows how much time until the current candle closes.
</Callout>

## Your Physical Workspace

### Recommended Setup:
- **Quiet space** — No distractions during study/trading
- **Dual monitors** (ideal) — One for charts, one for execution
- **Good lighting** — Reduce eye strain
- **Ergonomic chair** — You''ll be sitting a lot

### What to Avoid:
- Trading from bed or couch
- Distracting background (TV, social media)
- Poor lighting that strains eyes
- Uncomfortable seating

## Demo Account Setup

<Callout type="warning" title="Demo First, Always">
Never trade real money until you''ve proven consistent profitability on demo for at least 2-3 months.
</Callout>

### Bybit Testnet (Recommended):
1. Visit testnet.bybit.com
2. Create account (separate from real Bybit)
3. Claim free testnet funds
4. Practice trading with fake money

### Why Demo Trading Matters:
- Make mistakes with fake money
- Test strategies risk-free
- Build execution habits
- Prove your edge before risking capital

<Choice
  question="How long should you trade on demo before using real money?"
  options={[
    { text: "1 week", correct: false, explanation: "Way too short. You need months of consistent data to know if your edge is real." },
    { text: "Until you hit one big win", correct: false, explanation: "One big win proves nothing. You need consistent profitability over many trades." },
    { text: "2-3 months of consistent profitability", correct: true, explanation: "Correct! This gives you enough trades to validate your strategy statistically." },
    { text: "You can skip demo if you''re confident", correct: false, explanation: "Never skip demo. Confidence without evidence is just ego." }
  ]}
/>

## Trading Journal Template

Your journal should track:

| Field | Example |
|-------|---------|
| Date/Time | 2026-02-11 08:30 |
| Pair | BTC/USDT |
| Direction | Long |
| Entry | $67,250 |
| Stop Loss | $66,750 |
| Take Profit | $68,750 |
| Position Size | 0.15 BTC |
| R-Risk | $75 (1.5%) |
| Reason | 4H bullish engulfing at support |
| Outcome | +1.8R |
| Notes | Held through pullback, good patience |
| Emotions | Calm, followed plan |

<Callout type="success" title="The Journal Is Your Coach">
Your journal reveals patterns you can''t see in the moment. Review it weekly.
</Callout>

## Study Schedule Template

**Recommended Weekly Schedule:**

| Day | Activity | Time |
|-----|----------|------|
| Mon | Lesson + Practice | 45 min |
| Tue | Chart Analysis | 30 min |
| Wed | Lesson + Practice | 45 min |
| Thu | Demo Trading | 30 min |
| Fri | Lesson + Practice | 45 min |
| Sat | Weekly Review | 30 min |
| Sun | Rest / Light Reading | Optional |

<Callout type="tip" title="Consistency Beats Intensity">
30 minutes daily beats 5 hours on weekends. Build the habit.
</Callout>

<Choice
  question="What should your trading journal track besides trade details?"
  options={[
    { text: "Just profit and loss", correct: false, explanation: "P&L alone doesn''t help you improve. You need context." },
    { text: "Your emotional state and reasoning", correct: true, explanation: "Correct! Understanding WHY you made decisions is crucial for improvement." },
    { text: "Only winning trades", correct: false, explanation: "Losses teach more than wins. Track everything." },
    { text: "Nothing else needed", correct: false, explanation: "The more context you track, the more patterns you''ll discover." }
  ]}
/>

## Ready to Begin

You now have:
- ✅ TradingView account
- ✅ Demo exchange account
- ✅ Trading journal ready
- ✅ Study schedule planned

<Callout type="success" title="Module Complete!">
Great work! You''ve completed Module 1.1. Next up: Essential Trading Mathematics — where we learn the numbers that keep traders alive.
</Callout>',
  4,
  'paid',
  true
);

-- Lesson 1.2.1: Percentage Calculations & Position Sizing
INSERT INTO lessons (id, program_id, title, content, order_index, visibility, published)
VALUES (
  'c5555555-5678-90ab-cdef-333333333333',
  'b1b2c3d4-5678-90ab-cdef-222222222222',
  'Percentage Calculations & Position Sizing',
  '# Percentage Calculations & Position Sizing

Welcome to Module 1.2: **Essential Trading Mathematics**. This is where most traders fail — not because the math is hard, but because they skip it.

<Callout type="danger" title="The Math That Saves Accounts">
Traders who skip position sizing math blow up accounts. Traders who master it survive to profit.
</Callout>

## Why Percentages Matter

In trading, everything is measured in percentages:
- "BTC is up 5% today"
- "I risk 2% per trade"
- "My win rate is 55%"
- "I target 3:1 risk-reward"

If you can''t think in percentages, you can''t trade properly.

## Basic Percentage Calculations

### Calculating Percentage Change

```
Percentage Change = ((New Price - Old Price) / Old Price) × 100
```

**Example:** BTC moves from $60,000 to $63,000
- Change = (($63,000 - $60,000) / $60,000) × 100
- Change = ($3,000 / $60,000) × 100
- Change = **+5%**

<Choice
  question="BTC drops from $70,000 to $63,000. What is the percentage change?"
  options={[
    { text: "-7%", correct: false, explanation: "Check your math: ($63k - $70k) / $70k = -10%" },
    { text: "-10%", correct: true, explanation: "Correct! ($63,000 - $70,000) / $70,000 = -10%" },
    { text: "-11%", correct: false, explanation: "Close but not quite. The drop is exactly 10%." },
    { text: "+10%", correct: false, explanation: "The price went DOWN, so the percentage is negative." }
  ]}
/>

## Position Sizing Fundamentals

<Callout type="info" title="The Golden Rule">
Position size is NOT "how much do I want to buy?" It''s "how much can I afford to LOSE?"
</Callout>

### The Position Sizing Formula

```
Position Size = Account Risk $ / Stop Loss Distance $
```

Where:
- **Account Risk $** = Account Balance × Risk % (e.g., $10,000 × 2% = $200)
- **Stop Loss Distance $** = Entry Price - Stop Loss Price

### Step-by-Step Example

**Setup:**
- Account: $5,000
- Risk: 2% per trade
- BTC Entry: $65,000
- Stop Loss: $64,000

**Calculation:**
1. Account Risk = $5,000 × 2% = **$100**
2. Stop Distance = $65,000 - $64,000 = **$1,000**
3. Position Size = $100 / $1,000 = **0.1 BTC**

**Verification:**
- If stopped out: 0.1 BTC × $1,000 loss = $100 (exactly 2%)

<SignalBox
  type="bullish"
  entry="$65,000"
  stopLoss="$64,000"
  target="$68,000"
  riskReward="1:3"
/>

## The Leverage Connection

<Callout type="warning" title="Leverage Follows Position Size">
You don''t choose leverage first. You calculate position size first, then leverage is whatever''s needed.
</Callout>

From our example:
- Position Size: 0.1 BTC = $6,500 notional
- Account: $5,000
- Required Leverage: $6,500 / $5,000 = **1.3x**

That''s why proper position sizing often means LOW leverage, even on leveraged platforms.

<Choice
  question="You have $2,000, risk 1% per trade. Entry $50,000, stop $49,500. Position size?"
  options={[
    { text: "0.02 BTC", correct: false, explanation: "Risk = $20. Stop distance = $500. $20/$500 = 0.04 BTC" },
    { text: "0.04 BTC", correct: true, explanation: "Correct! $2,000 × 1% = $20 risk. $20 / $500 stop = 0.04 BTC" },
    { text: "0.1 BTC", correct: false, explanation: "That would risk $50 (2.5%), exceeding your 1% limit." },
    { text: "1 BTC", correct: false, explanation: "That would risk $500 (25% of account!) — way too much." }
  ]}
/>

## Common Position Sizing Mistakes

<Steps>
  <Step number={1} title="Sizing by Dollar Amount">
    ❌ "I''ll buy $500 of BTC"
    ✅ "I''ll risk $50 with a stop at X"
  </Step>
  <Step number={2} title="Sizing by Feel">
    ❌ "This feels like a 5x trade"
    ✅ "My formula says 0.3 BTC at 2.1x"
  </Step>
  <Step number={3} title="Ignoring Stop Distance">
    ❌ "I''ll figure out my stop later"
    ✅ "My stop defines my position size"
  </Step>
  <Step number={4} title="Fixed Position Sizes">
    ❌ "I always trade 0.5 BTC"
    ✅ "My size adjusts based on each setup''s stop distance"
  </Step>
</Steps>

## Practice Problems

Work through these to build intuition:

**Problem 1:**
- Account: $10,000
- Risk: 2%
- Entry: $45,000
- Stop: $44,100

<Callout type="tip" title="Answer">
Risk = $200. Stop distance = $900. Position = $200/$900 = 0.222 BTC
</Callout>

**Problem 2:**
- Account: $3,000
- Risk: 1.5%
- Entry: $62,000
- Stop: $61,000

<Callout type="tip" title="Answer">
Risk = $45. Stop distance = $1,000. Position = $45/$1,000 = 0.045 BTC
</Callout>

<Choice
  question="Why should stop loss distance determine position size?"
  options={[
    { text: "It doesn''t — use the same size every trade", correct: false, explanation: "Fixed sizes mean inconsistent risk. A tight stop with big size = massive % risk." },
    { text: "So your dollar risk stays constant regardless of setup", correct: true, explanation: "Correct! Each trade risks the same %, whether stop is tight or wide." },
    { text: "To maximize position size", correct: false, explanation: "The goal isn''t max size — it''s consistent, controlled risk." },
    { text: "Stop losses don''t matter", correct: false, explanation: "Stop losses are the foundation of risk management. They absolutely matter." }
  ]}
/>

<Callout type="success" title="Key Takeaway">
Position sizing isn''t optional — it''s the difference between surviving long enough to become profitable and blowing up in month one. Calculate it for EVERY trade.
</Callout>

**Next up:** The R% Framework — standardizing your risk language.',
  5,
  'paid',
  true
);

-- Lesson 1.2.2: The R% Framework
INSERT INTO lessons (id, program_id, title, content, order_index, visibility, published)
VALUES (
  'c6666666-5678-90ab-cdef-333333333333',
  'b1b2c3d4-5678-90ab-cdef-222222222222',
  'The R% Framework: 1-2% Rule Per Trade',
  '# The R% Framework: The 1-2% Rule Per Trade

This lesson covers the most important concept in all of trading: **capital preservation through position sizing**.

<Callout type="danger" title="The #1 Rule of Trading">
Never risk more than 1-2% of your account on any single trade. This rule has saved more trading careers than any strategy ever created.
</Callout>

## What is the R% Framework?

The "R" in R% stands for **Risk**. Your R-value is the dollar amount you''re willing to lose on a single trade.

For a **$10,000 account at 2% risk**:
- R = $10,000 × 2% = **$200**
- This means you risk $200 maximum per trade
- A "2R" profit would be $400 (2 × $200)
- A "-1R" loss would be -$200

## Why 1-2%?

<Callout type="info" title="The Math of Survival">
- At **1% risk**: You survive approximately 100 consecutive losses
- At **2% risk**: You survive approximately 50 consecutive losses
- At **5% risk**: You survive approximately 20 consecutive losses
- At **10% risk**: You''re probably done after 10 bad trades
</Callout>

## Position Sizing Formula

The formula connects your risk % to actual position size:

```
Position Size = (Account Balance × Risk %) ÷ (Entry Price − Stop Loss Price)
```

### Example: Long Trade

<SignalBox
  type="bullish"
  entry="$67,000"
  stopLoss="$66,500"
  target="$69,000"
  riskReward="1:4"
/>

**Your Account:** $5,000
**Risk %:** 2%
**Max Dollar Risk:** $5,000 × 2% = $100

**Stop Distance:** $67,000 − $66,500 = $500 (0.75%)

**Position Size Calculation:**
- $100 ÷ $500 = 0.2 BTC
- Notional value: 0.2 × $67,000 = $13,400
- Effective leverage: $13,400 ÷ $5,000 = **2.68x**

### Example: Short Trade

<SignalBox
  type="bearish"
  entry="$68,000"
  stopLoss="$68,800"
  target="$66,400"
  riskReward="1:2"
/>

**Your Account:** $5,000
**Risk %:** 1%
**Max Dollar Risk:** $5,000 × 1% = $50

**Stop Distance:** $68,800 − $68,000 = $800 (1.18%)

**Position Size Calculation:**
- $50 ÷ $800 = 0.0625 BTC
- Notional value: 0.0625 × $68,000 = $4,250
- Effective leverage: $4,250 ÷ $5,000 = **0.85x** (less than 1x!)

<Callout type="tip" title="Key Insight">
Notice how wider stops = smaller positions = lower effective leverage. The R% framework automatically adjusts your size based on the trade setup.
</Callout>

## R-Multiple Tracking

Using R-multiples standardizes your performance tracking:

| Trade Result | Dollar P/L | R-Multiple |
|-------------|------------|------------|
| Win | +$400 | +2R |
| Win | +$150 | +0.75R |
| Loss | -$200 | -1R |
| Loss | -$100 | -0.5R (partial) |

This lets you compare performance across different account sizes and time periods.

## When to Adjust Risk %

<Steps>
  <Step number={1} title="Start Conservative">
    Begin with 1% risk until you have 50+ trades logged
  </Step>
  <Step number={2} title="Gradual Increase">
    Move to 1.5-2% after proving positive expectancy
  </Step>
  <Step number={3} title="Advanced Sizing">
    Experienced traders may use 2-3% on A+ setups with multiple confluence factors
  </Step>
  <Step number={4} title="Scale Down in Drawdowns">
    If you hit -10% drawdown, cut risk to 0.5% until you recover
  </Step>
</Steps>

<Choice
  question="You have a $10,000 account at 2% risk. BTC is at $60,000 and your stop loss is at $59,400. What is your max position size?"
  options={[
    { text: "0.33 BTC", correct: true, explanation: "Correct! $200 risk ÷ $600 stop distance = 0.33 BTC" },
    { text: "0.2 BTC", correct: false, explanation: "Check your math: $200 ÷ $600 = 0.33, not 0.2" },
    { text: "1 BTC", correct: false, explanation: "That would risk $600 (6% of account) — way too much!" },
    { text: "0.5 BTC", correct: false, explanation: "That would risk $300 (3% of account) — exceeds your 2% limit" }
  ]}
/>

<Choice
  question="A 50% loss requires what % gain to recover?"
  options={[
    { text: "50%", correct: false, explanation: "If you have $100 and lose 50%, you have $50. A 50% gain on $50 is only $25, leaving you at $75." },
    { text: "75%", correct: false, explanation: "Close but not quite. 75% of $50 is $37.50, giving you $87.50." },
    { text: "100%", correct: true, explanation: "Correct! You need to double your remaining $50 to get back to $100. This is why avoiding big losses is critical." },
    { text: "200%", correct: false, explanation: "That would triple your money. You only need to double it." }
  ]}
/>

<Callout type="success" title="Key Takeaway">
The R% framework isn''t about limiting your gains — it''s about ensuring you survive long enough to learn, improve, and eventually thrive. Protect your capital first; profits follow.
</Callout>',
  6,
  'paid',
  true
);

-- Lesson 1.2.3: Risk-to-Reward Ratios
INSERT INTO lessons (id, program_id, title, content, order_index, visibility, published)
VALUES (
  'c7777777-5678-90ab-cdef-333333333333',
  'b1b2c3d4-5678-90ab-cdef-222222222222',
  'Risk-to-Reward Ratios',
  '# Risk-to-Reward Ratios

The risk-to-reward ratio (R:R) is how we measure if a trade is worth taking.

<Callout type="info" title="The Core Concept">
R:R compares what you might lose (risk) to what you might gain (reward). A 1:3 R:R means you''re risking $1 to potentially make $3.
</Callout>

## Calculating Risk-to-Reward

```
R:R Ratio = (Target Price - Entry) / (Entry - Stop Loss)
```

### Long Trade Example

<SignalBox
  type="bullish"
  entry="$50,000"
  stopLoss="$49,000"
  target="$53,000"
  riskReward="1:3"
/>

- Risk: $50,000 - $49,000 = $1,000
- Reward: $53,000 - $50,000 = $3,000
- R:R = $3,000 / $1,000 = **1:3**

### Short Trade Example

<SignalBox
  type="bearish"
  entry="$48,000"
  stopLoss="$48,600"
  target="$46,200"
  riskReward="1:3"
/>

- Risk: $48,600 - $48,000 = $600
- Reward: $48,000 - $46,200 = $1,800
- R:R = $1,800 / $600 = **1:3**

## Why R:R Matters

<Callout type="warning" title="The Win Rate Connection">
Your R:R determines the minimum win rate you need to be profitable.
</Callout>

### Breakeven Win Rates by R:R

| R:R Ratio | Breakeven Win Rate |
|-----------|-------------------|
| 1:1 | 50% |
| 1:2 | 33% |
| 1:3 | 25% |
| 1:4 | 20% |
| 1:5 | 17% |

<Callout type="success" title="The Math">
At 1:3 R:R, you only need to win 25% of trades to break even. Win 35%? You''re very profitable.
</Callout>

<Choice
  question="At a 1:2 risk-to-reward ratio, what win rate do you need to break even?"
  options={[
    { text: "50%", correct: false, explanation: "That''s for 1:1. At 1:2, you need less because winners pay 2x." },
    { text: "33%", correct: true, explanation: "Correct! Win 1 out of 3 trades at 1:2 and you break even (1×2R - 2×1R = 0)." },
    { text: "25%", correct: false, explanation: "That''s for 1:3 R:R. At 1:2 you need slightly more." },
    { text: "66%", correct: false, explanation: "Way too high. The whole point of good R:R is needing LOWER win rates." }
  ]}
/>

## Minimum R:R Guidelines

<Steps>
  <Step number={1} title="Never Below 1:1.5">
    Trades below 1:1.5 require very high win rates — not sustainable for most.
  </Step>
  <Step number={2} title="Aim for 1:2 Minimum">
    Most professionals won''t take trades below 1:2.
  </Step>
  <Step number={3} title="Sweet Spot: 1:2 to 1:4">
    This range balances frequency with profitability.
  </Step>
  <Step number={4} title="Beyond 1:5">
    Rare setups. Don''t force high R:R — it often means unrealistic targets.
  </Step>
</Steps>

## The R:R Trap

<Callout type="danger" title="Don''t Force R:R">
Beginners often set unrealistic targets to "improve" their R:R. A 1:10 trade that never hits target is worse than a 1:2 that frequently works.
</Callout>

### Realistic vs Fantasy R:R

**Realistic 1:3 Setup:**
- Entry at clear support
- Stop below support structure
- Target at visible resistance
- Price has room to run

**Fantasy 1:5 Setup:**
- Entry wherever
- Tight stop for "better R:R"
- Target in the sky
- Stops out 80% of the time

<Choice
  question="Why is a 1:10 R:R trade NOT always better than 1:2?"
  options={[
    { text: "Bigger rewards are always better", correct: false, explanation: "Bigger potential rewards often mean lower probability of success." },
    { text: "Very high R:R often means unrealistic targets that rarely hit", correct: true, explanation: "Correct! A 1:10 that hits 5% of the time is worse than 1:2 that hits 45%." },
    { text: "The math doesn''t work out", correct: false, explanation: "The math can work, but the probability of hitting extreme targets is usually low." },
    { text: "1:2 is the legal maximum", correct: false, explanation: "There''s no legal or rule-based maximum R:R." }
  ]}
/>

## Combining R:R with Position Sizing

Your R-value from the previous lesson combines with R:R:

**Example:**
- Account: $5,000 at 2% risk = $100 R-value
- Trade R:R = 1:3
- Maximum loss: $100 (1R)
- Target profit: $300 (3R)

This standardization makes tracking performance simple:
- "+3R trade" means you made 3× your risk
- "-1R trade" means you lost your full risk amount
- "+1.5R trade" means you took partial profits

<Callout type="success" title="Key Takeaway">
Good R:R lets you be wrong more often and still profit. Aim for minimum 1:2, prefer 1:3 when the chart structure supports it.
</Callout>

**Next up:** CAGR — Measuring Long-Term Performance',
  7,
  'paid',
  true
);

-- Lesson 1.2.4: CAGR - Measuring Long-Term Performance
INSERT INTO lessons (id, program_id, title, content, order_index, visibility, published)
VALUES (
  'c8888888-5678-90ab-cdef-333333333333',
  'b1b2c3d4-5678-90ab-cdef-222222222222',
  'CAGR: Measuring Long-Term Performance',
  '# CAGR: Measuring Long-Term Performance

CAGR (Compound Annual Growth Rate) is how professionals measure and compare performance over time.

<Callout type="info" title="Why CAGR Matters">
"I made 50% this month" means nothing without context. CAGR standardizes returns so you can compare strategies, funds, and your own performance over different time periods.
</Callout>

## The CAGR Formula

```
CAGR = (Ending Value / Beginning Value)^(1/Years) - 1
```

### Example 1: Simple Calculation

You grew $10,000 to $25,000 over 3 years.

CAGR = ($25,000 / $10,000)^(1/3) - 1
CAGR = (2.5)^0.333 - 1
CAGR = 1.357 - 1
CAGR = **35.7% per year**

<Callout type="tip" title="Interpretation">
A 35.7% CAGR means if you compounded at that rate for 3 years, you''d get from $10k to $25k. The actual path may have varied, but the average annual compound rate is 35.7%.
</Callout>

## CAGR vs Simple Returns

| Metric | Calculation | Year 1 | Year 2 | Year 3 | Total |
|--------|-------------|--------|--------|--------|-------|
| Simple Returns | Add each year | +50% | -20% | +30% | +60% |
| Actual Value | Compound | $15,000 | $12,000 | $15,600 | +56% |
| CAGR | Smoothed | 16.0% | 16.0% | 16.0% | +56% |

<Callout type="warning" title="Simple Returns Lie">
Simple returns (+50% -20% +30% = +60%) overstate performance. The actual compounded result is +56%, and CAGR correctly shows ~16% annual growth.
</Callout>

<Choice
  question="You turned $5,000 into $10,000 in 2 years. What is your CAGR?"
  options={[
    { text: "100%", correct: false, explanation: "That''s the total return. CAGR measures annual compound rate." },
    { text: "50%", correct: false, explanation: "That would be simple annual return. CAGR accounts for compounding." },
    { text: "41.4%", correct: true, explanation: "Correct! CAGR = (10000/5000)^(1/2) - 1 = 2^0.5 - 1 = 1.414 - 1 = 41.4%" },
    { text: "25%", correct: false, explanation: "Check your math. The correct calculation gives 41.4%." }
  ]}
/>

## Realistic CAGR Benchmarks

<Steps>
  <Step number={1} title="S&P 500 Average">
    ~10% CAGR over long periods. This is the benchmark to beat.
  </Step>
  <Step number={2} title="Good Active Trader">
    20-40% CAGR is excellent and sustainable.
  </Step>
  <Step number={3} title="Elite Performance">
    50%+ CAGR is rare and usually involves higher risk.
  </Step>
  <Step number={4} title="Unsustainable">
    100%+ CAGR year after year is nearly impossible. Beware anyone claiming it.
  </Step>
</Steps>

<Callout type="danger" title="Red Flag">
Anyone promising 10% monthly returns (214% CAGR) is either a scam or taking extreme risk that will eventually blow up.
</Callout>

## Using CAGR to Evaluate Your Trading

Your trading journal should track CAGR over time:

| Period | Starting | Ending | CAGR |
|--------|----------|--------|------|
| Year 1 | $5,000 | $6,200 | 24% |
| Year 2 | $6,200 | $8,900 | 43.5% |
| Year 3 | $8,900 | $7,800 | -12.4% |
| Overall | $5,000 | $7,800 | 16.0% |

<Callout type="tip" title="The Honest Measure">
CAGR forces you to face reality. Big wins followed by big losses result in mediocre CAGR.
</Callout>

<Choice
  question="What is a realistic sustainable CAGR target for an active crypto trader?"
  options={[
    { text: "10% monthly (214% annual)", correct: false, explanation: "This is unrealistic for sustained periods. It''s often a scam signal." },
    { text: "20-40% annually", correct: true, explanation: "Correct! This is excellent, sustainable performance that compounds significantly over years." },
    { text: "5% annually", correct: false, explanation: "This is below market averages. You''d be better off in index funds at that rate." },
    { text: "500% annually", correct: false, explanation: "Lottery territory. Not a realistic target for consistent trading." }
  ]}
/>

## The Power of Compounding

<Callout type="success" title="Compound Growth">
At 30% CAGR, your money doubles every ~2.6 years. In 10 years, $10,000 becomes $137,858.
</Callout>

**$10,000 at Different CAGRs over 10 Years:**

| CAGR | Year 5 | Year 10 |
|------|--------|---------|
| 10% | $16,105 | $25,937 |
| 20% | $24,883 | $61,917 |
| 30% | $37,129 | $137,858 |
| 40% | $53,782 | $289,255 |

This is why consistent, sustainable returns beat flashy big wins. The compounding effect over years is enormous.

<Callout type="success" title="Key Takeaway">
Track your CAGR religiously. It''s the honest measure of performance. Aim for sustainable 20-40% — that''s life-changing over a decade.
</Callout>

**Next up:** Sharpe Ratio Basics — measuring risk-adjusted returns.',
  8,
  'paid',
  true
);

-- Lesson 1.2.5: Sharpe Ratio Basics
INSERT INTO lessons (id, program_id, title, content, order_index, visibility, published)
VALUES (
  'c9999999-5678-90ab-cdef-333333333333',
  'b1b2c3d4-5678-90ab-cdef-222222222222',
  'Sharpe Ratio Basics',
  '# Sharpe Ratio Basics

The Sharpe Ratio answers a critical question: **Are your returns worth the risk you''re taking?**

<Callout type="info" title="The Core Idea">
Two traders both make 50% annual returns. One had a smooth equity curve. The other had 80% drawdowns. The Sharpe Ratio shows who traded better.
</Callout>

## The Sharpe Ratio Formula

```
Sharpe Ratio = (Portfolio Return - Risk-Free Rate) / Standard Deviation of Returns
```

Simplified for traders:
```
Sharpe = Average Return / Volatility of Returns
```

## Understanding the Components

<Steps>
  <Step number={1} title="Average Return">
    Your mean return over the period (daily, monthly, or annual)
  </Step>
  <Step number={2} title="Risk-Free Rate">
    What you''d earn risk-free (treasury bonds, ~4-5% currently). Often ignored for crypto.
  </Step>
  <Step number={3} title="Standard Deviation">
    How much your returns bounce around. Higher = more volatile = more risk.
  </Step>
</Steps>

## Sharpe Ratio Interpretation

| Sharpe Ratio | Interpretation |
|-------------|----------------|
| < 0 | Losing money (bad) |
| 0 - 0.5 | Poor risk-adjusted returns |
| 0.5 - 1.0 | Acceptable |
| 1.0 - 2.0 | Good |
| 2.0 - 3.0 | Excellent |
| > 3.0 | Exceptional (verify it''s real) |

<Callout type="tip" title="What Pros Target">
Professional fund managers aim for Sharpe > 1.0. Anything above 2.0 is considered excellent.
</Callout>

## Example Comparison

**Trader A:**
- Annual return: 60%
- Monthly returns vary wildly: -30%, +50%, -20%, +40%...
- Standard deviation: 25%
- Sharpe ≈ 60% / 25% = **2.4**

**Trader B:**
- Annual return: 40%
- Monthly returns smooth: +3%, +4%, +2%, +3%...
- Standard deviation: 5%
- Sharpe ≈ 40% / 5% = **8.0**

<Callout type="success" title="Key Insight">
Trader B has lower absolute returns but FAR better risk-adjusted performance. They''re a more skilled trader.
</Callout>

<Choice
  question="Which is more important: total returns or Sharpe Ratio?"
  options={[
    { text: "Total returns — money is money", correct: false, explanation: "High returns from high risk often lead to blowups. Sustainability matters." },
    { text: "Sharpe Ratio tells you if returns are worth the risk", correct: true, explanation: "Correct! Sharpe measures quality of returns. High Sharpe = sustainable edge." },
    { text: "Neither — just trade more", correct: false, explanation: "Trading more without edge just increases losses faster." },
    { text: "They''re the same thing", correct: false, explanation: "They measure different things. High returns can have low Sharpe if very volatile." }
  ]}
/>

## Why Sharpe Matters for Your Trading

<Callout type="warning" title="The Blowup Warning">
Low Sharpe strategies eventually blow up. High volatility means big drawdowns are inevitable — it''s just math.
</Callout>

### High Sharpe Benefits:
- Smoother equity curve
- Smaller drawdowns
- More predictable income
- Better for compounding
- Less emotional stress

### Low Sharpe Problems:
- Wild swings in account value
- Large drawdowns that take forever to recover
- Emotional decision-making
- Hard to size positions properly
- Can''t trust the strategy

## Improving Your Sharpe Ratio

<Steps>
  <Step number={1} title="Consistent Position Sizing">
    Use the R% framework for every trade
  </Step>
  <Step number={2} title="Wait for A+ Setups">
    Fewer, higher-quality trades reduce volatility
  </Step>
  <Step number={3} title="Use Stop Losses">
    Capping downside reduces negative volatility
  </Step>
  <Step number={4} title="Diversify Strategies">
    Uncorrelated strategies smooth returns
  </Step>
</Steps>

<Choice
  question="A trader has 100% annual returns but a Sharpe of 0.3. What does this tell you?"
  options={[
    { text: "They''re an amazing trader", correct: false, explanation: "Low Sharpe means those returns came with massive risk. Probably unsustainable." },
    { text: "They took huge risks for those returns — likely unsustainable", correct: true, explanation: "Correct! Sharpe 0.3 is poor. Those returns came from extreme volatility that will eventually cause major losses." },
    { text: "Sharpe doesn''t matter for high returns", correct: false, explanation: "Sharpe matters MORE for high returns — it tells you if they''re real skill or lucky gambling." },
    { text: "They should trade more", correct: false, explanation: "Trading more with a 0.3 Sharpe just accelerates the eventual blowup." }
  ]}
/>

<Callout type="success" title="Key Takeaway">
Chase Sharpe Ratio, not just returns. A 30% annual return with Sharpe 2.0 beats 100% with Sharpe 0.5 in the long run. Consistency compounds.
</Callout>

**Next up:** Standard Deviation, Skewness & Kurtosis — advanced statistics for traders.',
  9,
  'paid',
  true
);

-- Lesson 1.2.6: Standard Deviation, Skewness & Kurtosis
INSERT INTO lessons (id, program_id, title, content, order_index, visibility, published)
VALUES (
  'caaaaaaa-5678-90ab-cdef-333333333333',
  'b1b2c3d4-5678-90ab-cdef-222222222222',
  'Standard Deviation, Skewness & Kurtosis',
  '# Standard Deviation, Skewness & Kurtosis

These three statistics describe the **shape** of your returns distribution. Understanding them helps you know what to expect from your trading.

<Callout type="info" title="Why This Matters">
Average return tells you the center. These stats tell you the shape around that center — how wild, how lopsided, and how prone to extreme events.
</Callout>

## Standard Deviation: The Spread

Standard deviation measures how spread out your returns are from the average.

<Steps>
  <Step number={1} title="Low Standard Deviation">
    Returns cluster near the average. Consistent performance.
  </Step>
  <Step number={2} title="High Standard Deviation">
    Returns scatter widely. Volatile, unpredictable performance.
  </Step>
</Steps>

### Example

**Trader A** monthly returns: +5%, +3%, +4%, +6%, +2%
- Average: +4%
- Std Dev: ~1.4%
- Interpretation: Consistent, low volatility

**Trader B** monthly returns: +20%, -15%, +30%, -10%, +5%
- Average: +6%
- Std Dev: ~17%
- Interpretation: Wild swings, high volatility

<Callout type="tip" title="Quick Rule">
68% of returns fall within 1 standard deviation of the mean. 95% within 2.
</Callout>

<Choice
  question="A strategy has 10% average monthly return with 15% standard deviation. What does this mean?"
  options={[
    { text: "You''ll make 10% every month", correct: false, explanation: "With 15% std dev, actual returns will range from roughly -5% to +25% most months." },
    { text: "Monthly returns are highly volatile, ranging widely around 10%", correct: true, explanation: "Correct! High std dev means big swings. You might make 25% or lose 5% in any given month." },
    { text: "The strategy is low risk", correct: false, explanation: "15% std dev on monthly returns is VERY high risk." },
    { text: "You should use more leverage", correct: false, explanation: "Never add leverage to already-volatile strategies." }
  ]}
/>

## Skewness: The Lean

Skewness measures if returns lean left (negative) or right (positive).

| Skewness | Shape | Meaning |
|----------|-------|---------|
| Positive (+) | Right tail longer | More frequent small losses, occasional big wins |
| Zero | Symmetric | Balanced gains and losses |
| Negative (-) | Left tail longer | More frequent small wins, occasional big losses |

<Callout type="warning" title="Most Trading Strategies Have Negative Skew">
Strategies that "work until they don''t" (selling options, mean reversion) often have negative skew — many small wins, then one catastrophic loss.
</Callout>

### Which Is Better?

**Positive skew** (trend following):
- Small losses are common
- Big winners occasionally
- Emotionally harder (lots of losing trades)
- More robust to black swans

**Negative skew** (mean reversion):
- Small wins are common
- Big losers occasionally
- Emotionally easier (high win rate)
- Vulnerable to black swans

<Choice
  question="A strategy wins 80% of trades for small gains, but the 20% losses are massive. What skewness does it have?"
  options={[
    { text: "Positive skew", correct: false, explanation: "Positive skew has small losses and big wins — the opposite of this." },
    { text: "Negative skew", correct: true, explanation: "Correct! High win rate with occasional catastrophic losses = negative skew. Common in selling premium or mean reversion." },
    { text: "Zero skew", correct: false, explanation: "Zero skew would have balanced win/loss sizes." },
    { text: "Skewness doesn''t apply here", correct: false, explanation: "Skewness describes exactly this type of return distribution." }
  ]}
/>

## Kurtosis: The Tails

Kurtosis measures how "fat" the tails of your distribution are — how often extreme events occur.

<Steps>
  <Step number={1} title="Normal Distribution (Kurtosis = 3)">
    Extreme events happen at expected frequencies
  </Step>
  <Step number={2} title="Fat Tails (Kurtosis > 3)">
    Extreme events happen MORE often than expected
  </Step>
  <Step number={3} title="Thin Tails (Kurtosis < 3)">
    Extreme events happen LESS often than expected
  </Step>
</Steps>

<Callout type="danger" title="Crypto Has Fat Tails">
Crypto returns have kurtosis far above 3. "Once in a century" crashes happen every few years. Plan for them.
</Callout>

### Why Fat Tails Matter

Standard risk models assume normal distributions. But crypto has fat tails, meaning:
- 5-sigma events happen way more than predicted
- Risk models underestimate tail risk
- Stop losses and position sizing are even more critical

<Choice
  question="What does high kurtosis (fat tails) mean for your trading?"
  options={[
    { text: "Returns are more predictable", correct: false, explanation: "Fat tails mean LESS predictable — extreme events happen more often." },
    { text: "Extreme gains and losses happen more often than normal models predict", correct: true, explanation: "Correct! High kurtosis = more black swans. Always prepare for the unexpected." },
    { text: "You can use more leverage safely", correct: false, explanation: "Fat tails mean you need LESS leverage and MORE protection against extremes." },
    { text: "Standard deviation doesn''t matter", correct: false, explanation: "Standard deviation still matters, but kurtosis tells you the tails are fatter than expected." }
  ]}
/>

## Putting It All Together

The ideal trading strategy has:

| Metric | Ideal | Why |
|--------|-------|-----|
| Low Std Dev | Consistent | Smooth compounding |
| Positive Skew | Capped losses, uncapped gains | Survives black swans |
| Low Kurtosis | Predictable | Fewer surprises |

<Callout type="tip" title="Reality Check">
Most strategies can''t have all three. Trend following has positive skew but high std dev. Mean reversion has low std dev but negative skew. Know your tradeoffs.
</Callout>

## Phase 1 Complete! 🎉

<Callout type="success" title="You''ve Mastered the Foundations">
Congratulations! You now understand:
- ✅ The trader''s mindset (discipline, patience, control)
- ✅ Position sizing and the R% framework
- ✅ Risk-to-reward ratios
- ✅ CAGR and performance measurement
- ✅ Sharpe ratio and risk-adjusted returns
- ✅ Distribution statistics (std dev, skew, kurtosis)

**Next:** Phase 2 — Chart Mastery, where we learn to read the market''s language.
</Callout>',
  10,
  'paid',
  true
);

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- Run this after insertion to verify:
-- SELECT 
--   c.name as community,
--   p.title as program,
--   COUNT(l.id) as lesson_count
-- FROM communities c
-- JOIN programs p ON p.community_id = c.id
-- JOIN lessons l ON l.program_id = p.id
-- WHERE c.slug = 'leverage-trading-mastery'
-- GROUP BY c.name, p.title;
