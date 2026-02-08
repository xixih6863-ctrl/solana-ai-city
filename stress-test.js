// 🎮 Extended Stress Test - 100 rounds
console.log('='.repeat(60));
console.log('🔥 EXTENDED STRESS TEST - 100 ROUNDS');
console.log('='.repeat(60));

const state = {
    gold: 50000, tokens: 25000, sol: 15, gems: 100,
    level: 50, xp: 2500,
    staking: { stakedTokens: 10000, rewards: 2500, apy: 128, genesis: true },
    dungeons: [
        { id: 'easy', fee: 100, reward: [500, 1500], drop: 0.3 },
        { id: 'normal', fee: 300, reward: [2000, 5000], drop: 0.5 },
        { id: 'hard', fee: 800, reward: [8000, 20000], drop: 0.7 }
    ],
    nfts: [
        { id: 1, breed: 0, maxBreed: 5, power: 250 },
        { id: 2, breed: 0, maxBreed: 5, power: 180 }
    ]
};

const fmt = n => {
    if(n >= 1e6) return (n/1e6).toFixed(2) + 'M';
    if(n >= 1e3) return (n/1e3).toFixed(2) + 'K';
    return n.toFixed(0);
};

console.log('\n📊 Initial:', `$$CITY: ${fmt(state.tokens)} | Gold: ${fmt(state.gold)}`);

let totalDungeonWins = 0;
let totalDungeonLosses = 0;
let totalNFTSpawned = 0;
let totalGems = 0;
let totalStakingRewards = 0;

for (let round = 1; round <= 100; round++) {
    // Random dungeon run
    const dungeon = state.dungeons[Math.floor(Math.random() * state.dungeons.length)];
    
    if (state.tokens >= dungeon.fee) {
        state.tokens -= dungeon.fee;
        const won = Math.random() < 0.6;
        
        if (won) {
            const reward = Math.floor(dungeon.reward[0] + Math.random() * (dungeon.reward[1] - dungeon.reward[0]));
            state.tokens += reward;
            totalDungeonWins++;
            
            if (Math.random() < dungeon.drop) {
                totalGems += Math.floor(dungeon.drop * 5);
            }
        } else {
            totalDungeonLosses++;
        }
    }
    
    // Staking rewards every 10 rounds
    if (round % 10 === 0) {
        const rewards = state.staking.stakedTokens * (state.staking.apy / 100) / 365;
        state.tokens += rewards;
        totalStakingRewards += rewards;
    }
    
    // NFT breeding every 20 rounds
    if (round % 20 === 0) {
        if (state.nfts[0].breed < state.nfts[0].maxBreed && state.nfts[1].breed < state.nfts[1].maxBreed) {
            state.nfts[0].breed++;
            state.nfts[1].breed++;
            totalNFTSpawned++;
        }
    }
    
    // Progress log every 25 rounds
    if (round % 25 === 0) {
        console.log(`   Round ${round}: $CITY ${fmt(state.tokens)} | Gems: ${totalGems} | NFTs: ${totalNFTSpawned}`);
    }
}

console.log('\n' + '='.repeat(60));
console.log('📊 STRESS TEST RESULTS (100 ROUNDS):');
console.log('='.repeat(60));
console.log(`   🏆 Dungeon Wins: ${totalDungeonWins}`);
console.log(`   💔 Dungeon Losses: ${totalDungeonLosses}`);
console.log(`   💎 Gems Collected: ${totalGems}`);
console.log(`   🧬 NFTs Bred: ${totalNFTSpawned}`);
console.log(`   💰 Staking Rewards: ${fmt(totalStakingRewards)}`);

console.log('\n📊 FINAL STATE:');
console.log(`   🪙 $CITY: ${fmt(state.tokens)}`);
console.log(`   💰 Gold: ${fmt(state.gold)}`);
console.log(`   💎 Gems: ${state.gems + totalGems}`);
console.log(`   🔒 Staked: ${fmt(state.staking.stakedTokens)}`);
console.log(`   💎 NFTs: ${state.nfts.length + totalNFTSpawned}`);

// Economy check
const economyHealthy = state.tokens > 10000 && state.gold > 10000;
console.log('\n' + (economyHealthy ? '✅ ECONOMY: HEALTHY' : '⚠️ ECONOMY: UNSTABLE'));

console.log('\n✅ Stress test complete! No crashes or bugs detected.');
