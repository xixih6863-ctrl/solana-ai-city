# Solana AI City Lottery/Gacha System

## 抽奖/盲盒系统设计

### 奖池类型

| 奖池 | 价格 | 包含内容 | 稀有度 |
|------|------|---------|--------|
| 🆓 免费抽奖 | 0 USDC | 基础NFT碎片, 金币 | 常见: 80% |
| 💎 稀有奖池 | 10 USDC | 稀有NFT, 装备 | 稀有: 15% |
| 👑 传说奖池 | 50 USDC | 传说NFT, 限定道具 | 传说: 4.9% |
| 🌟 神话奖池 | 100 USDC | 神话NFT, 特殊称号 | 神话: 0.1% |

### 抽奖概率

```typescript
interface LootBox {
  id: string;
  name: string;
  price: number;
  items: LootItem[];
}

const LOOT_TABLE = {
  free: [
    { item: "金币x100", probability: 0.40 },
    { item: "建筑碎片", probability: 0.30 },
    { item: "能量x10", probability: 0.20 },
    { item: "稀有NFT碎片", probability: 0.10 },
  ],
  rare: [
    { item: "稀有NFT", probability: 0.15 },
    { item: "史诗装备", probability: 0.25 },
    { item: "建筑材料", probability: 0.40 },
    { item: "传说碎片", probability: 0.20 },
  ],
  legendary: [
    { item: "传说NFT", probability: 0.049 },
    { item: "限定皮肤", probability: 0.10 },
    { item: "稀有NFT", probability: 0.30 },
    { item: "大量金币", probability: 0.551 },
  ],
  mythic: [
    { item: "神话NFT", probability: 0.001 },
    { item: "传说NFT", probability: 0.05 },
    { item: "稀有NFT", probability: 0.20 },
    { item: "大量资源", probability: 0.749 },
  ]
};
```

### 每日免费抽奖

```typescript
class DailyLottery {
  async claimFreeDraw(userId: string): Promise<LootResult> {
    // 每日凌晨重置
    const lastClaim = await this.getLastClaim(userId);
    const now = Date.now();
    
    if (now - lastClaim < 24 * 60 * 60 * 1000) {
      throw new Error("明天再来!");
    }
    
    // 免费抽奖
    const result = this.drawFromTable('free');
    await this.giveReward(userId, result);
    await this.updateLastClaim(userId, now);
    
    return result;
  }
}
```

### 排行榜抽奖

```typescript
class LeaderboardLottery {
  // 每周排行榜前100名可参与
  async enterWeeklyLottery(userId: string): Promise<boolean> {
    const rank = await this.getUserRank(userId);
    
    if (rank > 100) {
      throw new Error("需要排行榜前100名!");
    }
    
    const entries = await this.getLotteryEntries(userId);
    if (entries >= 3) {
      throw new Error("已达最大参与次数!");
    }
    
    await this.addEntry(userId);
    return true;
  }
}
```

### NFT盲盒

```typescript
class NFTCGacha {
  async openBox(boxType: 'common' | 'rare' | 'legendary'): Promise<NFT> {
    const price = this.getBoxPrice(boxType);
    await this.chargeUser(price);
    
    // 链上随机数生成
    const seed = await this.requestRandomSeed();
    const nft = this.rollNFT(seed, boxType);
    
    // 铸造NFT
    await this.mintNFT(nft);
    
    return nft;
  }
}
```

---

## 界面设计

```tsx
function LotteryPage() {
  return (
    <div className="lottery-container">
      <h1>🎰 Solana AI City 抽奖中心</h1>
      
      <div className="loot-boxes">
        {/* 免费奖池 */}
        <div className="loot-box free">
          <h3>🆓 每日免费</h3>
          <button onClick={claimFree}>立即抽奖</button>
          <p>剩余时间: {countdown}</p>
        </div>
        
        {/* 稀有奖池 */}
        <div className="loot-box rare">
          <h3>💎 稀有奖池 - 10 USDC</h3>
          <div className="preview">
            <img src="rare-preview.png" />
          </div>
          <button onClick={() => openBox('rare')}>开启盲盒</button>
        </div>
        
        {/* 传说奖池 */}
        <div className="loot-box legendary">
          <h3>👑 传说奖池 - 50 USDC</h3>
          <div className="preview">
            <img src="legendary-preview.png" />
          </div>
          <button onClick={() => openBox('legendary')}>开启盲盒</button>
        </div>
        
        {/* 神话奖池 */}
        <div className="loot-box mythic">
          <h3>🌟 神话奖池 - 100 USDC</h3>
          <div className="preview">
            <img src="mythic-preview.png" />
          </div>
          <button onClick={() => openBox('m开启盲盒ythic')}></button>
        </div>
      </div>
      
      {/* 我的奖品 */}
      <div className="my-rewards">
        <h2>🎁 我的奖品</h2>
        <NFTGrid items={userNFTs} />
      </div>
    </div>
  );
}
```

---

## 运营活动

### 新用户抽奖

| 活动 | 奖励 |
|------|------|
| 注册即送 | 1次免费抽奖 |
| 首次充值 | 必中稀有NFT |
| 连续7天登录 | 传说碎片x7 |

### 节日活动

- 🎄 圣诞节: 限定雪花NFT
- 🎆 国庆节: 限定烟花称号
- 🎂 周年庆: 限定周年NFT

### 公会战奖励

| 名次 | 公会奖励 | 个人奖励 |
|------|---------|---------|
| 🥇 第一名 | 1000 USDC池分配 | 神话NFTx1 |
| 🥈 第二名 | 500 USDC池分配 | 传说NFTx1 |
| 🥉 第三名 | 200 USDC池分配 | 稀有NFTx1 |

---

## 技术实现

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SolanaCityLottery is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    
    uint256 public constant MYTHIC_RATE = 1;      // 0.1%
    uint256 public constant LEGENDARY_RATE = 50;   // 5%
    uint256 public constant RARE_RATE = 150;      // 15%
    
    mapping(address => uint256) public lastFreeDraw;
    mapping(uint256 => string) public tokenRarities;
    
    function freeDraw() external {
        require(
            block.timestamp - lastFreeDraw[msg.sender] >= 24 hours,
            "Come back tomorrow!"
        );
        
        lastFreeDraw[msg.sender] = block.timestamp;
        uint256 rarity = _rollRarity();
        _mintNFT(msg.sender, rarity);
    }
    
    function paidDraw(uint256 boxType) external payable {
        uint256 price = _getPrice(boxType);
        require(msg.value >= price, "Insufficient funds");
        
        uint256 rarity = _rollRarityForBox(boxType);
        _mintNFT(msg.sender, rarity);
    }
    
    function _rollRarity() internal view returns (uint256) {
        uint256 rand = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender
        ))) % 1000;
        
        if (rand < MYTHIC_RATE) return 4; // 神话
        if (rand < MYTHIC_RATE + LEGENDARY_RATE) return 3; // 传说
        if (rand < MYTHIC_RATE + LEGENDARY_RATE + RARE_RATE) return 2; // 稀有
        return 1; // 普通
    }
}
```

---

## 已实现功能

| 功能 | 状态 | 文件 |
|------|------|------|
| 免费每日抽奖 | ⏳ 待开发 | lottery/free-daily.ts |
| 付费盲盒 | ⏳ 待开发 | lottery/gacha.ts |
| NFT盲盒 | ⏳ 待开发 | lottery/nft-box.ts |
| 排行榜抽奖 | ⏳ 待开发 | lottery/leaderboard.ts |
| 节日活动 | ⏳ 待开发 | lottery/events.ts |

---

## 快速开始

```bash
# 安装
npm install @solana/wallet-adapter-react

# 运行演示
npm run demo:lottery
```

---

*最后更新: 2026-02-08*
