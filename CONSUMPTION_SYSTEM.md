# Solana AI City 消耗/经济系统

## 💰 资源消耗机制

### 核心资源

| 资源 | 用途 | 消耗场景 |
|------|------|---------|
| ⚡ 能量 | 行动点数 | 建造, 战斗, 探索 |
| 💎 USDC | 货币 | 购买, 升级, 抽奖 |
| 🪙 金币 | 基础货币 | 建造, 交易税 |
| 🏆 声望 | 等级 | 解锁功能, 公会 |

---

## ⚡ 能量系统

### 能量恢复

```typescript
class EnergySystem {
  MAX_ENERGY = 100;
  ENERGY_REGEN_PER_HOUR = 10;
  ENERGY_REGEN_INTERVAL = 60 * 60 * 1000; // 1小时
  
  async regenEnergy(userId: string) {
    const user = await this.getUser(userId);
    const now = Date.now();
    const hoursPassed = (now - user.lastEnergyRegen) / this.ENERGY_REGEN_INTERVAL;
    
    const newEnergy = Math.min(
      user.energy + Math.floor(hoursPassed * this.ENERGY_REGEN_PER_HOUR),
      this.MAX_ENERGY
    );
    
    await this.updateEnergy(userId, newEnergy, now);
  }
}
```

### 能量消耗表

| 动作 | 消耗能量 | 说明 |
|------|---------|------|
| 🏠 建造普通建筑 | 5-10 | 根据建筑类型 |
| 🏰 建造特殊建筑 | 20-50 | 城堡, 研究所 |
| ⚔️ 进入地牢 | 15 | 每次进入 |
| 🎯 战斗行动 | 3/次 | 每回合 |
| 🔮 使用技能 | 10-30 | 根据技能强度 |
| 🚀 加速建造 | 5/次 | 跳过等待时间 |
| 📦 打开背包 | 0 | 免费 |
| 🛡️ 升级建筑 | 10-25 | 根据等级 |

### 能量购买

```typescript
const ENERGY_PACKS = {
  small: { energy: 20, price: 1 },      // 1 USDC = 20能量
  medium: { energy: 100, price: 4 },     // 4 USDC = 100能量 (省20%)
  large: { energy: 250, price: 8 },      // 8 USDC = 250能量 (省37.5%)
  mega: { energy: 600, price: 18 },     // 18 USDC = 600能量 (省50%)
};
```

---

## 💎 USDC消耗

### 主要消耗

| 用途 | 消耗量 | 说明 |
|------|--------|------|
| 🏠 购买土地 | 10-100 USDC | 根据位置和大小 |
| 🏗️ 建造建筑 | 5-500 USDC | 高级建筑更贵 |
| ⬆️ 升级建筑 | 10-1000 USDC | 根据等级 |
| 🎰 抽奖盲盒 | 10/50/100 USDC | 传说/神话池 |
| 📜 解锁技能 | 5-50 USDC | 永久解锁 |
| 🏆 公会战报名 | 20 USDC | 每赛季 |
| 🛒 市场手续费 | 2.5% | 买卖NFT |

### USDC赚取

| 方式 | 收益 | 说明 |
|------|------|------|
| 🎮 赢得地牢 | 5-50 USDC | 根据层数 |
| 🏆 排行榜奖励 | 100-1000 USDC | 每周/每月 |
| 🤝 市场交易 | 差价利润 | 低买高卖 |
| 📈 质押收益 | 128% APY | 年化 |
| 🏅 公会分红 | 公会收入% | 根据贡献 |

---

## 🪙 金币消耗

### 金币获取

| 来源 | 数量 | 条件 |
|------|------|------|
| 🏠 建筑产出 | 1-10/秒 | 根据建筑 |
| 📋 每日任务 | 100-500 | 完成任务 |
| 🎯 成就奖励 | 50-1000 | 达成成就 |
| ⚔️ 战斗奖励 | 10-100 | 赢得战斗 |

### 金币消耗

| 用途 | 消耗 | 说明 |
|------|------|------|
| 🏗️ 建造普通建筑 | 100-1000 | 基础建筑 |
| 🔧 维修建筑 | 金币×10% | 建筑受损时 |
| 📦 背包扩展 | 500/10格 | 最大1000格 |
| 🏷️ 市场出售费 | 5% | 上架费 |
| 🎰 抽奖(低级) | 1000/次 | 免费次数外 |

---

## 🏆 声望系统

### 声望获取

| 方式 | 声望 | 说明 |
|------|------|------|
| 🏆 赢得战斗 | +5~50 | 根据难度 |
| 📋 完成每日任务 | +10~30 | 根据任务 |
| 🎯 达成成就 | +50~500 | 根据成就 |
| 🏅 公会贡献 | +20/次 | 公会任务 |
| 📈 连续登录 | +5/天 | 最多+35 |

### 声望等级

| 等级 | 声望要求 | 解锁内容 |
|------|---------|---------|
| 1 | 0 | 基础功能 |
| 2 | 100 | 解锁地牢 |
| 3 | 500 | 解锁公会 |
| 4 | 2000 | 解锁高级建筑 |
| 5 | 5000 | 解锁PvP |
| 6 | 15000 | 解锁神话建筑 |
| 7 | 50000 | 解锁特殊称号 |
| 8 | 100000 | 解锁创世NFT |

---

## 🔄 资源转换

### 兑换比例

| 转换 | 比例 | 手续费 |
|------|------|--------|
| 金币 → USDC | 1000:1 | 2% |
| USDC → 金币 | 1:800 | 2% |
| 能量 → USDC | 10:1 | 5% |
| 声望 → 金币 | 100:1 | 0% |

```typescript
class ResourceExchange {
  async exchange(
    userId: string,
    fromResource: string,
    toResource: string,
    amount: number
  ): Promise<boolean> {
    const rate = this.getExchangeRate(fromResource, toResource);
    const fee = this.getExchangeFee(fromResource, toResource);
    
    const finalAmount = amount * rate * (1 - fee);
    
    // 扣款
    await this.deductResource(userId, fromResource, amount);
    
    // 到账
    await this.addResource(userId, toResource, finalAmount);
    
    return true;
  }
}
```

---

## 📊 经济平衡

### 资源产出/消耗比

| 玩家阶段 | 金币产出 | 金币消耗 | USDC消耗 | 状态 |
|---------|---------|---------|---------|------|
| 新手期 | 100/小时 | 500/天 | 0 | 🟢 健康 |
| 成长期 | 500/小时 | 2000/天 | 10/周 | 🟢 健康 |
| 成熟期 | 2000/小时 | 5000/天 | 50/周 | 🟡 平衡 |
| 高级期 | 10000/小时 | 20000/天 | 200/周 | 🔴 消耗大 |

### 防止通货膨胀

1. **消耗型NFT**: 使用后销毁
2. **建筑维护费**: 每日消耗金币
3. **战争损耗**: 战斗消耗资源
4. **市场税**: 交易手续费烧毁

```typescript
class InflationControl {
  // 每日烧毁机制
  async burnExcessSupply() {
    const totalSupply = await this.getTotalSupply();
    const targetSupply = this.getTargetSupply();
    
    if (totalSupply > targetSupply * 1.2) {
      // 烧毁超额部分
      const burnAmount = (totalSupply - targetSupply) * 0.1;
      await this.burnToken(burnAmount);
    }
  }
}
```

---

## 🎮 消耗UI设计

```tsx
function ResourcePanel() {
  return (
    <div className="resource-panel">
      <div className="energy">
        <span className="icon">⚡</span>
        <span className="value">{user.energy}/{MAX_ENERGY}</span>
        <ProgressBar value={user.energy / MAX_ENERGY} />
        <button onClick={buyEnergy}>购买 (+20)</button>
      </div>
      
      <div className="usdc">
        <span className="icon">💎</span>
        <span className="value">{formatUSDC(user.usdc)}</span>
      </div>
      
      <div className="gold">
        <span className="icon">🪙</span>
        <span className="value">{formatNumber(user.gold)}</span>
      </div>
      
      <div className="reputation">
        <span className="icon">🏆</span>
        <span className="level">Lv.{user.reputationLevel}</span>
        <ProgressBar value={user.reputation / this.getNextLevelReq()} />
      </div>
    </div>
  );
}
```

---

## ✅ 已实现功能

| 系统 | 状态 | 文件 |
|------|------|------|
| 能量系统 | ✅ | energy.ts |
| 金币系统 | ✅ | gold.ts |
| USDC系统 | ✅ | token.ts |
| 声望系统 | ✅ | reputation.ts |
| 资源兑换 | ⏳ | exchange.ts |

---

*最后更新: 2026-02-08*
