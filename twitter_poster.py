#!/usr/bin/env python3
"""
🐦 Twitter Posting Bot - Solana AI City Launch
"""

import os
import json
import time
import requests
from datetime import datetime

# ═══════════════════════════════════════════════════════════════
#    配置
# ═══════════════════════════════════════════════════════════════

CONFIG = {
    "api_key": "YOUR_TWITTER_API_KEY",  # Twitter API Key
    "api_secret": "YOUR_TWITTER_API_SECRET",  # Twitter API Secret
    "access_token": "YOUR_ACCESS_TOKEN",  # Access Token
    "access_secret": "YOUR_ACCESS_SECRET",  # Access Token Secret
    
    # 或者使用 Bearer Token (简单版)
    "bearer_token": os.getenv("TWITTER_BEARER_TOKEN", ""),
    
    "game_url": "https://xixih6863-ctrl.github.io/solana-ai-city/",
    "twitter_handle": "@SolanaAI_City"
}


# ═══════════════════════════════════════════════════════════════
#    推文内容
# ═══════════════════════════════════════════════════════════════

TWEETS = {
    "main_launch": {
        "text": """🚀 Introducing Solana AI City v3.5 - The Future of Play-to-Earn!

🎮 What we built:
• 128% APY Staking
• 5 Dungeons (Easy → Hell)
• NFT Breeding System
• Guild Boss Battles
• Community Governance

📊 Economic Model:
• Player ROI: 10:1 (Healthy!)
• Monthly Player Earnings: 165K+ $CITY
• Sustainable Tokenomics

🔗 Play Now: {game_url}

#Solana #Gaming #Web3 #PlayToEarn #NFTGaming #CryptoGaming

@SolanaFndn @solana""",
        "image": None
    },
    
    "features": {
        "text": """🎮 SOLANA AI CITY FEATURES:

✅ Staking
   128% APY (Industry Leading!)
   Genesis Bonus: +20%

✅ Dungeons
   5 Difficulties
   NFT Drop Rates: 30-100%

✅ NFT Breeding
   Legendary: 30%
   Epic: 30%
   Rare: 40%

✅ Guild System
   Boss Battles
   Team Rewards

Ready to play? 👇
{game_url}

#Solana #Web3Gaming #NFTGaming""",
        "image": None
    },
    
    "economics": {
        "text": """💰 THE ECONOMICS - Built to Last!

Player ROI: 10:1 (Very Healthy!)

Monthly Player Income:
• Passive (Staking): 105K $CITY
• Active (Dungeons): 60K $CITY
• Total: 165K $CITY

Monthly Player Spending:
• Dungeon Entry: 12K $CITY
• NFT Breeding: 5K $CITY
• Total: 17K $CITY

Net Player Profit: ~148K $CITY/month

🎮 Sustainable Gaming!

{game_url}

#Solana #Tokenomics #PlayToEarn""",
        "image": None
    },
    
    "call_to_action": {
        "text": """🎮 READY TO PLAY?

Join the revolution of sustainable Play-to-Earn!

1. Visit: {game_url}
2. Connect your Solana wallet
3. Start earning $CITY

No complicated setup.
No high gas fees.
Just pure gaming fun! 🎮

⚡ Built on @solana
⚡ 4000 TPS
⚡ <$0.001 per transaction

#Solana #PlayToEarn #Web3Gaming""",
        "image": None
    }
}


# ═══════════════════════════════════════════════════════════════
#    Twitter API 客户端
# ═══════════════════════════════════════════════════════════════

class TwitterClient:
    """Twitter API 客户端"""
    
    BASE_URL = "https://api.twitter.com/2"
    
    def __init__(self, config: dict):
        self.config = config
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {config['bearer_token']}"
        }
    
    def post_tweet(self, text: str) -> dict:
        """发布推文"""
        try:
            url = f"{self.BASE_URL}/tweets"
            data = {"text": text}
            
            response = requests.post(url, headers=self.headers, json=data, timeout=10)
            response.raise_for_status()
            
            return {
                "success": True,
                "tweet_id": response.json().get("data", {}).get("id"),
                "text": text
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "text": text
            }
    
    def get_user_id(self, username: str) -> str:
        """获取用户ID"""
        try:
            url = f"{self.BASE_URL}/users/by/username/{username.replace('@', '')}"
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            return response.json()["data"]["id"]
        except Exception as e:
            print(f"获取用户ID失败: {e}")
            return None


# ═══════════════════════════════════════════════════════════════
#    手动发布指南
# ═══════════════════════════════════════════════════════════════

def print_manual_post_guide():
    """打印手动发布指南"""
    
    print("""
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║        🐦 TWITTER 发布指南 - Solana AI City                       ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝

由于API配置需要认证信息,以下是手动发布的推文内容:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 旗舰推文 (主发布):

【推文内容】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Introducing Solana AI City v3.5 - The Future of Play-to-Earn!

🎮 What we built:
• 128% APY Staking
• 5 Dungeons (Easy → Hell)
• NFT Breeding System
• Guild Boss Battles
• Community Governance

📊 Economic Model:
• Player ROI: 10:1 (Healthy!)
• Monthly Player Earnings: 165K+ $CITY
• Sustainable Tokenomics

🔗 Play Now: https://xixih6863-ctrl.github.io/solana-ai-city/

#Solana #Gaming #Web3 #PlayToEarn #NFTGaming #CryptoGaming
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【发布建议】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 最佳发布时间: UTC 9:00-12:00 或 15:00-18:00
• 添加配图: 游戏截图
• @提及: @SolanaFndn @solana
• 使用标签: #Solana #PlayToEarn
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 链接: https://xixih6863-ctrl.github.io/solana-ai-city/
🐦 Twitter: @SolanaAI_City

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 后续推文建议 (第2-4条):

推文2 - 功能介绍:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎮 SOLANA AI CITY FEATURES:

✅ Staking - 128% APY (Industry Leading!)
✅ Dungeons - 5 Difficulties, NFT Drops
✅ NFT Breeding - 30% Legendary Rate
✅ Guild System - Boss Battles

Play: https://xixih6863-ctrl.github.io/solana-ai-city/

#Solana #Web3Gaming
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

推文3 - 经济模型:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 THE ECONOMICS - Built to Last!

Player ROI: 10:1 (Very Healthy!)

Monthly:
• Staking: 105K $CITY
• Dungeons: 60K $CITY
• Total: 165K $CITY

Sustainable Gaming! 🎮

Play: https://xixih6863-ctrl.github.io/solana-ai-city/

#Solana #Tokenomics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

推文4 - 行动号召:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎮 READY TO PLAY?

1. Visit: https://xixih6863-ctrl.github.io/solana-ai-city/
2. Connect your Solana wallet
3. Start earning $CITY

No setup. No high fees. Just fun! 🎮

#Solana #PlayToEarn
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║        ✅ 复制以上内容到Twitter发布即可!                           ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
""")


def generate_tweet_images_html():
    """生成图片建议HTML"""
    
    html = """
<!DOCTYPE html>
<html>
<head>
    <title>Solana AI City - Twitter Images</title>
    <style>
        body { font-family: Arial, sans-serif; background: #0a0a0f; color: white; padding: 40px; }
        .image-container { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
        .image-card { background: #1a1a2e; padding: 20px; border-radius: 16px; max-width: 400px; }
        .specs { background: #0a0a0f; padding: 15px; border-radius: 8px; margin-top: 15px; }
        h1 { text-align: center; color: #00d4ff; }
        code { background: #333; padding: 2px 6px; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>🎮 Solana AI City - Twitter 图片规格</h1>
    
    <div class="image-container">
        <div class="image-card">
            <h3>🖼️ 旗舰推文图片</h3>
            <p>用于主发布推文</p>
            <div class="specs">
                <p>📐 尺寸: <code>1200x675</code> (16:9)</p>
                <p>📁 格式: PNG/JPG</p>
                <p>💾 大小: < 5MB</p>
            </div>
        </div>
        
        <div class="image-card">
            <h3>📱 方形图片</h3>
            <p>用于多图推文</p>
            <div class="specs">
                <p>📐 尺寸: <code>1200x1200</code> (1:1)</p>
                <p>📁 格式: PNG/JPG</p>
                <p>💾 大小: < 5MB</p>
            </div>
        </div>
        
        <div class="image-card">
            <h3>🏷️ 故事/轮播</h3>
            <p>用于多图故事</p>
            <div class="specs">
                <p>📐 尺寸: <code>1080x1920</code> (9:16)</p>
                <p>📁 格式: PNG/JPG</p>
                <p>💾 大小: < 30MB</p>
            </div>
        </div>
    </div>
    
    <div style="text-align: center; margin-top: 40px;">
        <h2>🎨 建议包含的元素</h2>
        <ul style="display: inline-block; text-align: left;">
            <li>🎮 游戏Logo</li>
            <li>📊 关键数据 (128% APY, 10:1 ROI)</li>
            <li>🎯 行动号召 (Play Now)</li>
            <li>🏷️ 标签 (#Solana #PlayToEarn)</li>
            <li>🔗 二维码 (可选)</li>
        </ul>
    </div>
</body>
</html>
    """
    
    with open("twitter_images.html", "w") as f:
        f.write(html)
    
    print("✅ 图片规格指南已保存: twitter_images.html")


# ═══════════════════════════════════════════════════════════════════════
#    主程序
# ═══════════════════════════════════════════════════════════════════════

def main():
    """主程序"""
    print("""
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║        🐦 SOLANA AI CITY - Twitter 推文发布                        ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
""")
    
    # 生成手动发布指南
    print_manual_post_guide()
    
    # 生成图片规格
    generate_tweet_images_html()
    
    # 如果有API密钥,尝试发布
    if CONFIG["bearer_token"] and CONFIG["bearer_token"] != "YOUR_TWITTER_BEARER_TOKEN":
        client = TwitterClient(CONFIG)
        
        # 发布主推文
        print("\n🚀 尝试发布主推文...")
        
        main_tweet = TWEETS["main_launch"]["text"].format(game_url=CONFIG["game_url"])
        result = client.post_tweet(main_tweet)
        
        if result["success"]:
            print(f"✅ 推文发布成功!")
            print(f"🆔 Tweet ID: {result['tweet_id']}")
        else:
            print(f"❌ 发布失败: {result['error']}")
    else:
        print("\n" + "="*70)
        print("⚠️  未配置Twitter API密钥")
        print("📋 请手动复制上方推文内容到Twitter发布")
        print("="*70)
    
    print("\n" + "="*70)
    print("✅ 准备完成! 可以开始发布推文了!")
    print("🔗 游戏链接: https://xixih6863-ctrl.github.io/solana-ai-city/")
    print("🐦 Twitter: @SolanaAI_City")
    print("="*70)


if __name__ == "__main__":
    main()
