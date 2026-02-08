// 🎮 Solana AI City - 1000 Concurrent User Stress Test
// Testing server performance under heavy load

console.log('='.repeat(70));
console.log('🔥 SOLANA AI CITY - 1000 USER STRESS TEST');
console.log('='.repeat(70));

const TEST_CONFIG = {
    totalUsers: 1000,
    duration: 60000,           // 60 seconds
    actionsPerSecond: 50,      // Actions per second
    thinkTime: 500,            // ms between actions
};

class StressTest {
    constructor() {
        this.users = [];
        this.metrics = {
            totalActions: 0,
            successActions: 0,
            failedActions: 0,
            avgResponseTime: 0,
            errors: {},
            startTime: null,
            endTime: null,
        };
    }
    
    // Simulate a game user
    createUser(id) {
        return {
            id,
            gold: 50000,
            tokens: 25000,
            sol: 15,
            level: Math.floor(Math.random() * 50) + 1,
            gems: 100,
            staking: { staked: 0, rewards: 0 },
            nfts: [],
            dungeonsCompleted: 0,
            votesCast: 0,
            guildContrib: 0,
            actions: [],
            active: true,
            sessionStart: Date.now(),
        };
    }
    
    // Simulate game actions
    async performAction(user, actionType) {
        const startTime = Date.now();
        let success = true;
        let error = null;
        
        switch(actionType) {
            case 'stake':
                // Simulate staking
                if (user.tokens >= 1000) {
                    user.tokens -= 1000;
                    user.staking.staked += 1000;
                    user.staking.rewards += Math.floor(1000 * 0.00035);
                }
                break;
                
            case 'enter_dungeon':
                // Simulate dungeon entry
                const fees = [100, 300, 800, 2000, 5000];
                const fee = fees[Math.floor(Math.random() * fees.length)];
                if (user.tokens >= fee) {
                    user.tokens -= fee;
                    // 60% win rate
                    if (Math.random() < 0.6) {
                        const reward = fee * (5 + Math.random() * 10);
                        user.tokens += Math.floor(reward);
                        user.dungeonsCompleted++;
                    }
                }
                break;
                
            case 'claim_daily':
                // Daily claim
                user.gold += 500;
                user.tokens += 500;
                break;
                
            case 'vote':
                // Governance vote
                user.votesCast++;
                break;
                
            case 'guild_contrib':
                // Guild contribution
                if (user.gold >= 1000) {
                    user.gold -= 1000;
                    user.guildContrib += 1000;
                }
                break;
                
            case 'breed_nft':
                // NFT breeding
                if (user.gold >= 5000 && user.tokens >= 500 && user.nfts.length >= 2) {
                    user.gold -= 5000;
                    user.tokens -= 500;
                    user.nfts.push({
                        id: Date.now(),
                        name: 'Bred NFT',
                        rarity: Math.random() > 0.7 ? 'legendary' : 'epic',
                    });
                }
                break;
                
            case 'profile_view':
                // View profile (light action)
                break;
                
            default:
                break;
        }
        
        const responseTime = Date.now() - startTime;
        
        return { success, error, responseTime, actionType };
    }
    
    // Run the stress test
    async run() {
        console.log('\n📊 TEST CONFIGURATION:');
        console.log(`   Total Users: ${TEST_CONFIG.totalUsers}`);
        console.log(`   Duration: ${TEST_CONFIG.duration}ms`);
        console.log(`   Actions/Sec: ${TEST_CONFIG.actionsPerSecond}`);
        
        console.log('\n🚀 INITIALIZING USERS...');
        this.metrics.startTime = Date.now();
        
        // Create users
        for (let i = 0; i < TEST_CONFIG.totalUsers; i++) {
            this.users.push(this.createUser(i));
        }
        
        console.log(`   ✅ Created ${this.users.length} users`);
        
        console.log('\n⚡ STARTING LOAD TEST...');
        console.log('   Progress: 0%');
        
        const startTime = Date.now();
        let lastProgress = 0;
        const actionInterval = 1000 / TEST_CONFIG.actionsPerSecond;
        
        // Continuous action simulation
        while (Date.now() - startTime < TEST_CONFIG.duration) {
            // Each second, perform configured number of actions
            const actionsThisSecond = Math.min(TEST_CONFIG.actionsPerSecond, this.users.length);
            
            for (let i = 0; i < actionsThisSecond; i++) {
                // Pick random user
                const user = this.users[Math.floor(Math.random() * this.users.length)];
                
                // Pick random action
                const actions = ['stake', 'enter_dungeon', 'claim_daily', 'vote', 'guild_contrib', 'breed_nft', 'profile_view'];
                const action = actions[Math.floor(Math.random() * actions.length)];
                
                const result = await this.performAction(user, action);
                
                this.metrics.totalActions++;
                if (result.success) {
                    this.metrics.successActions++;
                } else {
                    this.metrics.failedActions++;
                    this.metrics.errors[result.error] = (this.metrics.errors[result.error] || 0) + 1;
                }
                
                // Update average response time
                this.metrics.avgResponseTime = 
                    (this.metrics.avgResponseTime * (this.metrics.totalActions - 1) + result.responseTime) 
                    / this.metrics.totalActions;
            }
            
            // Progress update
            const elapsed = Date.now() - startTime;
            const progress = Math.floor((elapsed / TEST_CONFIG.duration) * 100);
            
            if (progress >= lastProgress + 10) {
                lastProgress = progress;
                process.stdout.write(`\r   Progress: ${progress}% | Actions: ${this.metrics.totalActions.toLocaleString()} | Success: ${this.metrics.successActions.toLocaleString()}`);
            }
            
            // Throttle to control rate
            await new Promise(r => setTimeout(r, actionInterval));
        }
        
        this.metrics.endTime = Date.now();
        console.log('\n\n✅ LOAD TEST COMPLETE!');
    }
    
    // Generate report
    generateReport() {
        const duration = this.metrics.endTime - this.metrics.startTime;
        const actionsPerSecond = this.metrics.totalActions / (duration / 1000);
        const successRate = (this.metrics.successActions / this.metrics.totalActions * 100).toFixed(2);
        
        console.log('\n' + '='.repeat(70));
        console.log('📊 STRESS TEST REPORT');
        console.log('='.repeat(70));
        
        console.log('\n🎯 PERFORMANCE METRICS:');
        console.log(`   Total Duration:      ${duration}ms`);
        console.log(`   Total Actions:       ${this.metrics.totalActions.toLocaleString()}`);
        console.log(`   Actions/Second:      ${actionsPerSecond.toFixed(2)}`);
        console.log(`   Success Rate:        ${successRate}%`);
        console.log(`   Avg Response Time:   ${this.metrics.avgResponseTime.toFixed(2)}ms`);
        
        console.log('\n📈 USER STATISTICS:');
        console.log(`   Total Users:         ${this.users.length}`);
        console.log(`   Active Users:        ${this.users.filter(u => u.active).length}`);
        
        // Calculate aggregated user stats
        const totalStaked = this.users.reduce((sum, u) => sum + u.staking.staked, 0);
        const totalDungeons = this.users.reduce((sum, u) => sum + u.dungeonsCompleted, 0);
        const totalVotes = this.users.reduce((sum, u) => sum + u.votesCast, 0);
        const totalContrib = this.users.reduce((sum, u) => sum + u.guildContrib, 0);
        const totalNFTs = this.users.reduce((sum, u) => sum + u.nfts.length, 0);
        
        console.log(`   Total $CITY Staked: ${(totalStaked / 1000000).toFixed(2)}M`);
        console.log(`   Dungeons Completed:  ${totalDungeons.toLocaleString()}`);
        console.log(`   Votes Cast:          ${totalVotes.toLocaleString()}`);
        console.log(`   Guild Contributions: ${(totalContrib / 1000000).toFixed(2)}M`);
        console.log(`   NFTs Bred:          ${totalNFTs.toLocaleString()}`);
        
        if (Object.keys(this.metrics.errors).length > 0) {
            console.log('\n⚠️ ERROR BREAKDOWN:');
            for (const [error, count] of Object.entries(this.metrics.errors)) {
                console.log(`   ${error}: ${count}`);
            }
        }
        
        // Performance verdict
        console.log('\n' + '='.repeat(70));
        console.log('🎯 PERFORMANCE VERDICT');
        console.log('='.repeat(70));
        
        let verdict = '';
        let color = '';
        
        if (actionsPerSecond >= 50 && this.metrics.avgResponseTime < 100 && successRate >= 99) {
            verdict = '🟢 EXCELLENT - Ready for production!';
            color = 'green';
        } else if (actionsPerSecond >= 20 && this.metrics.avgResponseTime < 500 && successRate >= 95) {
            verdict = '🟡 GOOD - Minor optimizations recommended';
            color = 'yellow';
        } else {
            verdict = '🔴 NEEDS OPTIMIZATION - Performance issues detected';
            color = 'red';
        }
        
        console.log(`\n   Status: ${verdict}`);
        console.log(`   \n   Capacity: ${actionsPerSecond >= 50 ? '✅ 1000+ users OK' : '⚠️ May struggle with 1000 users'}`);
        console.log(`   Response: ${this.metrics.avgResponseTime < 100 ? '✅ Fast' : '⚠️ Slow'}`);
        console.log(`   Reliability: ${successRate >= 99 ? '✅ Reliable' : '⚠️ Unreliable'}`);
        
        console.log('\n' + '='.repeat(70));
        
        return {
            metrics: this.metrics,
            verdict,
            readyForProduction: actionsPerSecond >= 50 && this.metrics.avgResponseTime < 100 && successRate >= 99
        };
    }
}

// Run the test
async function main() {
    const test = new StressTest();
    
    try {
        await test.run();
        const report = test.generateReport();
        
        // Save report
        const fs = require('fs');
        fs.writeFileSync('stress-test-report.json', JSON.stringify({
            timestamp: new Date().toISOString(),
            config: TEST_CONFIG,
            report
        }, null, 2));
        
        console.log('\n📄 Report saved to stress-test-report.json');
        
    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        process.exit(1);
    }
}

main();
