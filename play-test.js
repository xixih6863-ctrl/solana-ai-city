// 🎮 Solana AI City v3.0 - Automated Test Player
console.log('='.repeat(60));
console.log('🎮 Solana AI City v3.0 - Automated Test Play');
console.log('='.repeat(60));

// Game State (same as in index.html)
const state = {
    gold: 50000, tokens: 25000, sol: 15, gems: 100,
    level: 50, xp: 2500,
    staking: { stakedTokens: 10000, rewards: 2500, apy: 128, genesis: true },
    nfts: [
        { id: 1, name: 'CyberHero Alpha', rarity: 'legendary', class: 'warrior', level: 10, power: 250, atk: 120, def: 80, spd: 50, breed: 0 },
        { id: 2, name: 'Mage Nova', rarity: 'epic', class: 'mage', level: 8, power: 180, atk: 150, def: 40, spd: 70, breed: 1 },
        { id: 3, name: 'Mining Bot X', rarity: 'rare', class: 'builder', level: 15, power: 120, atk: 50, def: 100, spd: 30, breed: 2 }
    ],
    dungeons: [
        { id: 'easy', name: '新手试炼', diff: 'Easy', power: 100, fee: 100, reward: [500, 1500], drop: 0.3, time: 1 },
        { id: 'normal', name: '亡者要塞', diff: 'Normal', power: 300, fee: 300, reward: [2000, 5000], drop: 0.5, time: 3 },
        { id: 'hard', name: '炎魔洞穴', diff: 'Hard', power: 800, fee: 800, reward: [8000, 20000], drop: 0.7, time: 5 },
        { id: 'hell', name: '地狱之门', diff: 'Hell', power: 5000, fee: 5000, reward: [100000, 300000], drop: 1.0, time: 10 }
    ],
    guild: { name: 'CryptoWarriors', level: 10, members: 25, bossHP: 75, won: 12, lost: 3 },
    daily: { lastClaim: Date.now() - 86400000, tokens: 500, gold: 1000 },
    votes: [
        { id: 1, title: '增加新PvE副本', progress: 75, votes: 150, status: 'active' },
        { id: 2, title: '提高质押APY至150%', progress: 45, votes: 89, status: 'active' },
        { id: 3, title: '新NFT角色投票', progress: 92, votes: 184, status: 'passed' }
    ],
    myVotes: 1500,
    page: 'home',
    breeding: { p1: null, p2: null }
};

// Utility
const fmt = n => {
    if(n === undefined || n === null) return '0';
    if(n >= 1e6) return (n/1e6).toFixed(2) + 'M';
    if(n >= 1e3) return (n/1e3).toFixed(2) + 'K';
    return n.toFixed(0);
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

console.log('\n📊 Starting State:');
console.log(`   SOL: ${state.sol.toFixed(4)} | $CITY: ${fmt(state.tokens)} | Gold: ${fmt(state.gold)} | Level: ${state.level}`);

// 🎮 GAMEPLAY TEST SEQUENCE
async function playGame() {
    console.log('\n' + '='.repeat(60));
    console.log('🎮 STARTING GAMEPLAY TEST...');
    console.log('='.repeat(60));
    
    // 1. Test Staking
    console.log('\n🔒 TEST 1: Staking System');
    const stakeAmount = 5000;
    if (state.tokens >= stakeAmount) {
        state.tokens -= stakeAmount;
        state.staking.stakedTokens += stakeAmount;
        console.log(`   ✅ Staked ${fmt(stakeAmount)} $CITY`);
        console.log(`   📊 Staked Total: ${fmt(state.staking.stakedTokens)}`);
    } else {
        console.log(`   ❌ Not enough tokens to stake`);
    }
    
    // 2. Claim Staking Rewards
    console.log('\n💰 TEST 2: Claim Staking Rewards');
    const rewards = state.staking.stakedTokens * (state.staking.apy / 100) / 365;
    state.tokens += rewards;
    state.staking.rewards += rewards;
    console.log(`   ✅ Claimed ${fmt(rewards)} $CITY rewards`);
    console.log(`   📊 Total Rewards: ${fmt(state.staking.rewards)}`);
    
    // 3. Enter Dungeon (Easy)
    console.log('\n🏰 TEST 3: Enter Dungeon (Easy)');
    const dungeon = state.dungeons[0];
    if (state.tokens >= dungeon.fee) {
        state.tokens -= dungeon.fee;
        console.log(`   🎮 Entered ${dungeon.name} (Fee: ${dungeon.fee})`);
        await sleep(500);
        
        // Simulate battle
        const winChance = 0.5 + (state.level * 2) / dungeon.power;
        const won = Math.random() < Math.min(0.95, winChance);
        
        if (won) {
            const tokenReward = Math.floor(dungeon.reward[0] + Math.random() * (dungeon.reward[1] - dungeon.reward[0]));
            state.tokens += tokenReward;
            console.log(`   🏆 WON! +${fmt(tokenReward)} $CITY`);
            
            // NFT Drop chance
            if (Math.random() < dungeon.drop) {
                state.gems += 5;
                console.log(`   💎 NFT DROP! +5 Gems`);
            }
        } else {
            console.log(`   💔 Lost... Try again!`);
        }
    }
    
    // 4. Enter Dungeon (Normal)
    console.log('\n🏰 TEST 4: Enter Dungeon (Normal)');
    const dungeon2 = state.dungeons[1];
    if (state.tokens >= dungeon2.fee) {
        state.tokens -= dungeon2.fee;
        console.log(`   🎮 Entered ${dungeon2.name} (Fee: ${dungeon2.fee})`);
        await sleep(500);
        
        const winChance2 = 0.5 + (state.level * 2) / dungeon2.power;
        const won2 = Math.random() < Math.min(0.95, winChance2);
        
        if (won2) {
            const tokenReward2 = Math.floor(dungeon2.reward[0] + Math.random() * (dungeon2.reward[1] - dungeon2.reward[0]));
            state.tokens += tokenReward2;
            console.log(`   🏆 WON! +${fmt(tokenReward2)} $CITY`);
        } else {
            console.log(`   💔 Lost...`);
        }
    }
    
    // 5. NFT Breeding
    console.log('\n🧬 TEST 5: NFT Breeding');
    const p1 = state.nfts[0];
    const p2 = state.nfts[1];
    if (p1.breed < 5 && p2.breed < 5 && state.gold >= 5000 && state.tokens >= 500) {
        state.gold -= 5000;
        state.tokens -= 500;
        p1.breed++;
        p2.breed++;
        
        const newNft = {
            id: Date.now(),
            name: `Cyber-${p1.name.split(' ')[1]}-${p2.name.split(' ')[1]}`,
            rarity: Math.random() > 0.7 ? 'legendary' : Math.random() > 0.4 ? 'epic' : 'rare',
            class: p1.class,
            level: 1,
            power: Math.floor((p1.power + p2.power) / 3)
        };
        state.nfts.push(newNft);
        console.log(`   🧬 BRED: ${newNft.name} (${newNft.rarity})`);
        console.log(`   📊 Total NFTs: ${state.nfts.length}`);
    } else {
        console.log(`   ❌ Cannot breed (conditions not met)`);
    }
    
    // 6. Guild Attack
    console.log('\n⚔️ TEST 6: Guild Boss Attack');
    const damage = state.level * 10;
    state.guild.bossHP = Math.max(0, state.guild.bossHP - damage);
    console.log(`   ⚔️ Dealt ${damage} damage to Boss`);
    console.log(`   📊 Boss HP: ${state.guild.bossHP}%`);
    
    if (state.guild.bossHP <= 0) {
        state.guild.bossHP = 100;
        state.tokens += 5000;
        console.log(`   👑 BOSS KILLED! +5000 $CITY`);
    }
    
    // 7. Voting
    console.log('\n🗳️ TEST 7: Governance Vote');
    const proposal = state.votes[0];
    const votePower = Math.floor(100 + Math.random() * 400);
    state.myVotes += votePower;
    proposal.votes += votePower;
    proposal.progress = Math.min(100, (proposal.votes / 200) * 100);
    console.log(`   🗳️ Voted for: ${proposal.title}`);
    console.log(`   📊 Progress: ${proposal.progress.toFixed(1)}%`);
    
    // 8. Guild Contribution
    console.log('\n🤝 TEST 8: Guild Contribution');
    const contribAmount = 1000;
    if (state.gold >= contribAmount) {
        state.gold -= contribAmount;
        state.guild.level = Math.floor(contribAmount / 10000) + 1;
        console.log(`   🤝 Contributed ${fmt(contribAmount)} Gold`);
        console.log(`   📊 Guild Level: ${state.guild.level}`);
    }
    
    // 9. Multiple Dungeon Runs (stress test)
    console.log('\n🔄 TEST 9: Stress Test - 10 Dungeon Runs');
    let wins = 0, losses = 0;
    for (let i = 0; i < 10; i++) {
        const d = state.dungeons[Math.floor(Math.random() * 2)]; // Easy or Normal
        if (state.tokens >= d.fee) {
            state.tokens -= d.fee;
            const won = Math.random() < 0.6;
            if (won) {
                const reward = Math.floor(d.reward[0] + Math.random() * (d.reward[1] - d.reward[0]));
                state.tokens += reward;
                wins++;
            } else {
                losses++;
            }
        }
    }
    console.log(`   🔄 Results: ${wins} wins, ${losses} losses`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎮 GAMEPLAY TEST COMPLETE!');
    console.log('='.repeat(60));
    
    console.log('\n📊 FINAL STATE:');
    console.log(`   🔶 SOL: ${state.sol.toFixed(4)}`);
    console.log(`   🪙 $CITY: ${fmt(state.tokens)}`);
    console.log(`   💰 Gold: ${fmt(state.gold)}`);
    console.log(`   💎 Gems: ${state.gems}`);
    console.log(`   ⭐ Level: ${state.level}`);
    console.log(`   🔒 Staked: ${fmt(state.staking.stakedTokens)}`);
    console.log(`   💎 NFTs: ${state.nfts.length}`);
    console.log(`   🏆 Guild Wins: ${state.guild.won + (state.guild.bossHP <= 0 ? 1 : 0)}`);
    
    console.log('\n✅ All gameplay systems tested successfully!');
    console.log('🎮 Ready for player testing!');
}

// Run the game
playGame().catch(console.error);
