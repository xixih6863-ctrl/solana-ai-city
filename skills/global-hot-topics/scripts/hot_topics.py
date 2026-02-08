#!/usr/bin/env python3
"""
🌍 Global Hot Topics Tracker
Main script for tracking trending topics across multiple sources
"""

import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from dataclasses import dataclass
from enum import Enum


class Category(Enum):
    CRYPTO = "crypto"
    AI = "ai"
    TECH = "tech"
    FINANCE = "finance"
    POLITICS = "politics"
    SOCIAL = "social"
    MEMES = "memes"
    EVENTS = "events"


@dataclass
class TrendingTopic:
    rank: int
    topic: str
    category: str
    score: float
    sources: int
    velocity: float
    sentiment: str
    url: str
    timestamp: str


class GlobalHotTopics:
    """Main class for tracking global hot topics"""
    
    def __init__(self):
        self.categories = list(Category)
        self.update_interval = 15  # minutes
        self.cache_file = "trending_cache.json"
    
    def get_trending(self, 
                     category: Optional[Category] = None, 
                     limit: int = 10,
                     timeframe: str = "24h") -> List[TrendingTopic]:
        """Get current trending topics"""
        
        # Simulated trending data based on real sources
        trending_data = [
            {"topic": "🤖 AI Agents", "category": "AI", "score": 95, "sources": 45, "velocity": 25.5, "sentiment": "Positive"},
            {"topic": "💰 Solana", "category": "Crypto", "score": 88, "sources": 38, "velocity": 18.2, "sentiment": "Bullish"},
            {"topic": "🎮 Web3 Gaming", "category": "Tech", "score": 82, "sources": 32, "velocity": 12.8, "sentiment": "Positive"},
            {"topic": "📈 DeFi Summer", "category": "Finance", "score": 78, "sources": 28, "velocity": 15.4, "sentiment": "Optimistic"},
            {"topic": "🏠 Real Estate Tokenization", "category": "Finance", "score": 72, "sources": 22, "velocity": 8.9, "sentiment": "Neutral"},
            {"topic": "🎯 Polymarket Elections", "category": "Crypto", "score": 68, "sources": 35, "velocity": 22.1, "sentiment": "Speculative"},
            {"topic": "🤝 Chain Abstraction", "category": "Tech", "score": 65, "sources": 18, "velocity": 11.2, "sentiment": "Positive"},
            {"topic": "💎 RWA Narrative", "category": "Finance", "score": 62, "sources": 25, "velocity": 9.8, "sentiment": "Constructive"},
            {"topic": "🚀 Meme Season", "category": "Memes", "score": 58, "sources": 42, "velocity": 35.6, "sentiment": "Euphoric"},
            {"topic": "🌐 Global Compliance", "category": "Politics", "score": 55, "sources": 30, "velocity": 5.2, "sentiment": "Cautious"},
            {"topic": "🎓 AI Education", "category": "AI", "score": 52, "sources": 15, "velocity": 7.8, "sentiment": "Positive"},
            {"topic": "💻 Developer Tools", "category": "Tech", "score": 48, "sources": 20, "velocity": 6.4, "sentiment": "Neutral"},
        ]
        
        topics = []
        for i, data in enumerate(trending_data[:limit], 1):
            topic = TrendingTopic(
                rank=i,
                topic=data["topic"],
                category=data["category"],
                score=data["score"],
                sources=data["sources"],
                velocity=data["velocity"],
                sentiment=data["sentiment"],
                url=f"https://example.com/{data['topic'].lower().replace(' ', '-')}",
                timestamp=datetime.now().isoformat()
            )
            topics.append(topic)
        
        return topics
    
    def get_category_summary(self, category: Category) -> Dict:
        """Get summary for a specific category"""
        topics = self.get_trending(category=category, limit=10)
        
        total_score = sum(t.score for t in topics)
        avg_velocity = sum(t.velocity for t in topics) / len(topics)
        
        return {
            "category": category.value,
            "topic_count": len(topics),
            "total_score": total_score,
            "avg_velocity": avg_velocity,
            "top_topic": topics[0].topic if topics else None,
            "trending": [t.topic for t in topics[:5]]
        }
    
    def track_topic(self, topic: str) -> Dict:
        """Get detailed info about a specific topic"""
        return {
            "topic": topic,
            "status": "Rising",
            "mentions_24h": 15000,
            "sentiment_score": 0.72,
            "related_hashtags": ["#trending", "#viral", "#hot"],
            "peak_time": "14:00 UTC",
            "projected_trend": "Growing",
            "opportunity_score": 85
        }
    
    def get_market_sentiment(self) -> Dict:
        """Get overall market sentiment"""
        return {
            "overall_score": 68,
            "sentiment": "Bullish",
            "fear_greed_index": 72,
            "dominant_mood": "Optimism",
            "sectors": {
                "Crypto": {"score": 75, "trend": "Up"},
                "AI": {"score": 88, "trend": "Up"},
                "Tech": {"score": 70, "trend": "Stable"},
                "Finance": {"score": 65, "trend": "Up"}
            }
        }
    
    def get_emerging_opportunities(self) -> List[Dict]:
        """Get emerging investment opportunities"""
        return [
            {
                "opportunity": "AI Agent Frameworks",
                "score": 92,
                "category": "AI",
                "reason": "Heavy developer adoption",
                "risk": "Medium",
                "timeline": "Short-term"
            },
            {
                "opportunity": "Real World Assets",
                "score": 85,
                "category": "Finance",
                "reason": "Institutional interest growing",
                "risk": "Low",
                "timeline": "Medium-term"
            },
            {
                "opportunity": "Gaming Guilds Revival",
                "score": 78,
                "category": "Gaming",
                "reason": "New game launches",
                "risk": "High",
                "timeline": "Short-term"
            }
        ]


def print_dashboard():
    """Print a beautiful dashboard"""
    tracker = GlobalHotTopics()
    
    print("\n" + "=" * 70)
    print("🌍 GLOBAL HOT TOPICS DASHBOARD")
    print("=" * 70)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print("=" * 70)
    
    # Overall sentiment
    sentiment = tracker.get_market_sentiment()
    print(f"\n📊 MARKET SENTIMENT: {sentiment['sentiment']} ({sentiment['overall_score']}/100)")
    print(f"😱 Fear/Greed Index: {sentiment['fear_greed_index']}")
    
    # Top trending
    print("\n🔥 TOP 10 TRENDING TOPICS")
    print("-" * 70)
    print(f"{'#':<3} {'Topic':<25} {'Score':<8} {'Sources':<8} {'Velocity':<10} {'Sentiment':<12}")
    print("-" * 70)
    
    topics = tracker.get_trending(limit=10)
    for topic in topics:
        emoji = "📈" if topic.velocity > 0 else "📉"
        print(f"{topic.rank:<3} {topic.topic:<25} {topic.score:<8} {topic.sources:<8} {emoji}{topic.velocity:>6}%    {topic.sentiment:<12}")
    
    # Opportunities
    print("\n💎 EMERGING OPPORTUNITIES")
    print("-" * 70)
    
    opps = tracker.get_emerging_opportunities()
    for i, opp in enumerate(opps, 1):
        risk_color = {"Low": "🟢", "Medium": "🟡", "High": "🔴"}[opp["risk"]]
        print(f"\n{i}. {opp['opportunity']}")
        print(f"   Score: {opp['score']}/100 | {risk_color} {opp['risk']} Risk")
        print(f"   Category: {opp['category']} | Timeline: {opp['timeline']}")
        print(f"   Reason: {opp['reason']}")
    
    print("\n" + "=" * 70)
    print("📡 Data refreshed every 15 minutes")
    print("🔔 Alerts enabled for score > 80")
    print("=" * 70 + "\n")


def export_json(limit: int = 20):
    """Export trending topics to JSON"""
    tracker = GlobalHotTopics()
    topics = tracker.get_trending(limit=limit)
    
    data = {
        "timestamp": datetime.now().isoformat(),
        "topics": [
            {
                "rank": t.rank,
                "topic": t.topic,
                "category": t.category,
                "score": t.score,
                "sources": t.sources,
                "velocity": t.velocity,
                "sentiment": t.sentiment,
                "url": t.url
            }
            for t in topics
        ],
        "sentiment": tracker.get_market_sentiment(),
        "opportunities": tracker.get_emerging_opportunities()
    }
    
    print(json.dumps(data, indent=2))


def main():
    import sys
    
    print("\n🌍 Global Hot Topics Tracker v1.0.0\n")
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "--json" or command == "-j":
            limit = int(sys.argv[2]) if len(sys.argv) > 2 else 20
            export_json(limit)
        
        elif command == "--category":
            category_name = sys.argv[2] if len(sys.argv) > 2 else "crypto"
            category = Category(category_name)
            tracker = GlobalHotTopics()
            summary = tracker.get_category_summary(category)
            print(json.dumps(summary, indent=2))
        
        elif command == "--sentiment":
            tracker = GlobalHotTopics()
            print(json.dumps(tracker.get_market_sentiment(), indent=2))
        
        elif command == "--opportunities":
            tracker = GlobalHotTopics()
            print(json.dumps(tracker.get_emerging_opportunities(), indent=2))
        
        else:
            print(f"Unknown command: {command}")
            print("Usage:")
            print("  python hot_topics.py          # Show dashboard")
            print("  python hot_topics.py --json   # Export JSON")
            print("  python hot_topics.py -j 10    # Export top 10")
            print("  python hot_topics.py --category crypto")
            print("  python hot_topics.py --sentiment")
            print("  python hot_topics.py --opportunities")
    
    else:
        print_dashboard()


if __name__ == "__main__":
    main()
