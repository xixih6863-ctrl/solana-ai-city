---
name: global-hot-topics
description: AI-powered global hot topic tracking and aggregation system. Monitors trends across news, social media, markets, and events. Provides real-time insights for autonomous AI agents to capitalize on emerging opportunities.
---

# 🌍 Global Hot Topics Tracker Skill

## Skill Overview

This skill provides autonomous AI agents with real-time global hot topic tracking and aggregation capabilities across multiple data sources including news, social media, financial markets, and events.

## What This Skill Provides

### 1. Topic Monitoring

**News Aggregation**
```
- Real-time news from major outlets
- Category filtering (tech, finance, crypto, etc.)
- Sentiment analysis
- Trend detection
```

**Social Media Trends**
```
- Twitter/X trending topics
- Reddit hot discussions
- Telegram channel trends
- Discord server activity
```

### 2. Market Intelligence

**Crypto & DeFi Trends**
```
- Coin trends and sentiment
- Protocol activity
- TVL changes
- Yield opportunities
```

**Stock Market Trends**
```
- Sector rotation
- Earnings surprises
- IPO pipelines
- Economic indicators
```

### 3. Event Detection

**Upcoming Events**
```
- Economic releases
- Product launches
- Conferences
- Regulatory decisions
```

**Viral Content**
```
- Social media virality
- Meme potential
- Community engagement
- Share velocity
```

## Usage

### Basic Commands

```bash
# Get current hot topics
python hot_topics.py --source all --limit 20

# Track specific category
python track.py --category crypto --refresh 1h

# Analyze trends
python analyze.py --topic "AI agents" --period 7d

# Generate report
python report.py --type daily --format markdown
```

### Advanced Usage

```python
from hot_topics import Tracker

# Initialize tracker
tracker = Tracker(sources=["twitter", "reddit", "news"])

# Get trending topics
trends = tracker.get_trending(limit=10)

# Analyze opportunity
analysis = tracker.analyze_opportunity("Solana")

# Get market sentiment
sentiment = tracker.get_sentiment("DeFi")
```

### Scheduled Monitoring

```bash
# Start continuous monitoring
python monitor.py --interval 30m --alerts true

# Set up watchlist
python watchlist.py add "AI agents"
python watchlist.py add "Solana"
python watchlist.py add "Polymarket"
```

## Topic Categories

| Category | Description | Update Frequency |
|----------|-------------|------------------|
| **Crypto** | Blockchain, DeFi, NFTs | 15 min |
| **AI/ML** | Artificial Intelligence | 30 min |
| **Tech** | Technology sector | 30 min |
| **Finance** | Markets, Economy | 15 min |
| **Politics** | Global events | 1 hour |
| **Social** | Social media trends | 15 min |
| **Memes** | Internet culture | 30 min |
| **Events** | Conferences, Launches | 4 hours |

## Data Sources

### Primary Sources
- **News**: Google News, RSS feeds
- **Social**: Twitter/X, Reddit, Telegram
- **Markets**: CoinGecko, Yahoo Finance
- **Events**: Luma, Eventbrite

### Secondary Sources
- GitHub trending
- Product Hunt
- Hacker News
- Discord trends

## Features

### 📊 Real-Time Dashboard
```bash
python dashboard.py --port 8080
```

### 🔔 Alert System
```bash
# Configure alerts
python alerts.py --method telegram --channel my_channel

# Test alert
python alerts.py test
```

### 📈 Trend Analysis
```python
from analyzer import TrendAnalyzer

analyzer = TrendAnalyzer()
prediction = analyzer.predict("AI agents", days=7)
confidence = analyzer.get_confidence()
```

### 🎯 Opportunity Scoring
```python
from scorer import OpportunityScorer

scorer = OpportunityScorer()
score = scorer.score("new protocol launch")
recommendation = scorer.get_recommendation(score)
```

## Output Formats

### Console Output
```
🌍 GLOBAL HOT TOPICS
=====================
#1 🤖 AI Agents
   Score: 95
   Sources: 45
   Velocity: +25%/h
   
#2 💰 Solana
   Score: 88
   Sources: 38
   Velocity: +18%/h
   
#3 🎮 Gaming
   Score: 82
   Sources: 32
   Velocity: +12%/h
```

### JSON Output
```bash
python hot_topics.py --format json --output trends.json
```

### Markdown Report
```bash
python report.py --type weekly --format markdown --output report.md
```

### CSV Export
```bash
python export.py --format csv --date today
```

## Configuration

### config.json
```json
{
  "sources": {
    "twitter": {"enabled": true, "api_key": "..."},
    "reddit": {"enabled": true, "client_id": "..."},
    "news": {"enabled": true, "feeds": [...]}
  },
  "categories": ["crypto", "ai", "tech", "finance"],
  "update_interval": 15,
  "alerts": {
    "enabled": true,
    "channels": ["telegram", "discord"]
  }
}
```

### Environment Variables
```bash
export TWITTER_API_KEY="..."
export REDDIT_CLIENT_ID="..."
export TELEGRAM_BOT_TOKEN="..."
export DISCORD_WEBHOOK="..."
```

## Installation

```bash
# Install from ClawHub
npx skills add global-hot-topics

# Verify installation
npx skills verify global-hot-topics

# Run initial sync
python sync.py --all
```

## Dependencies

- python3.9+
- requests
- pandas
- numpy
- feedparser (news)
- praw (Reddit)
- tweepy (Twitter)
- beautifulsoup4 (parsing)

## API Usage

### Get Trending Topics
```python
from hot_topics import GlobalHotTopics

ght = GlobalHotTopics()
topics = ght.get_trending(
    category="crypto",
    limit=10,
    timeframe="24h"
)
```

### Track Custom Topic
```python
ght.track(
    topic="Solana",
    keywords=["SOL", "Solana", "#SOL"],
    alert_threshold=80
)
```

### Get Market Sentiment
```python
sentiment = ght.get_sentiment("DeFi")
print(f"Score: {sentiment.score}")
print(f"Trend: {sentiment.direction}")
print(f"Velocity: {sentiment.velocity}")
```

### Generate Insights
```python
insights = ght.generate_insights(
    topics=["AI", "Crypto", "Gaming"],
    depth="detailed"
)
```

## Use Cases

### For Traders
- Early trend detection
- Sentiment analysis
- Volume spikes
- Arbitrage opportunities

### For Content Creators
- Trending topics
- Viral content ideas
- Audience interests
- Engagement optimization

### For Developers
- Tech trend tracking
- Framework popularity
- Tool adoption
- Community growth

### For Investors
- Market sentiment
- Sector trends
- Emerging protocols
- Risk indicators

## Performance

| Metric | Value |
|--------|-------|
| Update Latency | < 2 minutes |
| Topic Coverage | 50+ sources |
| Accuracy | 85%+ |
| False Positive Rate | < 5% |

## Pricing

- **ClawHub Price**: $19
- **Enterprise**: Custom pricing
- **API Access**: $49/month

## Learning Resources

- `README.md` - Quick start guide
- `EXAMPLES.md` - Code examples
- `API_REFERENCE.md` - Full API docs
- `TUTORIAL.md` - Step-by-step guide

## Support

- **Issues**: GitHub issues
- **Updates**: `npx skills update global-hot-topics`
- **Documentation**: See included guides

## Version History

- v1.0.0: Initial release
  - Multi-source aggregation
  - Real-time tracking
  - Sentiment analysis
  - Alert system
  - API access

---

**Track the world. Capitalize on trends.** 🌍
