// ═══════════════════════════════════════════════════════════════════════════════
//    🛡️ SOLANA AI CITY - SECURE GAME STATE MANAGER
// ═══════════════════════════════════════════════════════════════════════════════
//    增强版游戏状态管理 - 带完整的安全验证
// ═══════════════════════════════════════════════════════════════════════════════

class SecureGameState {
    constructor() {
        this.state = {
            // User assets
            gold: 50000,
            tokens: 25000,
            sol: 15,
            gems: 100,
            souls: 0,
            
            // Level system
            level: 1,
            xp: 0,
            xpToNext: 100,
            
            // NFT assets
            nfts: [],
            
            // Game progress
            dungeonsCompleted: 0,
            questsCompleted: 0,
            achievementsUnlocked: [],
            
            // Guild
            guild: null,
            
            // Timestamps
            lastDailyClaim: 0,
            lastStakingClaim: 0,
            
            // Session
            sessionStart: Date.now(),
            actionsThisSession: 0,
            
            // History for validation
            actionHistory: [],
        };
        
        this.history = [];
        this.encryption = null;
        this.security = null;
        this.init();
    }
    
    async init() {
        // Initialize encryption
        if (typeof GameEncryption !== 'undefined') {
            this.encryption = new GameEncryption();
            await this.encryption.init();
        }
        
        console.log('[GAME STATE] Secure game state initialized');
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //    SECURE PROPERTY ACCESS
    // ═══════════════════════════════════════════════════════════════════════
    
    get(key) {
        if (!this.state.hasOwnProperty(key)) {
            console.warn(`[GAME STATE] Unknown property: ${key}`);
            return null;
        }
        
        // Track access
        this.trackAccess('get', key, this.state[key]);
        
        return this.state[key];
    }
    
    set(key, value, reason = '') {
        if (!this.state.hasOwnProperty(key)) {
            console.warn(`[GAME STATE] Cannot set unknown property: ${key}`);
            return false;
        }
        
        const oldValue = this.state[key];
        const action = {
            type: 'set',
            key,
            oldValue,
            newValue: value,
            reason,
            timestamp: Date.now(),
            valid: true
        };
        
        // Validate the change
        if (!this.validateChange(action)) {
            console.warn(`[GAME STATE] Invalid change blocked: ${key}`);
            action.valid = false;
            this.trackAccess('blocked', key, value, reason);
            return false;
        }
        
        // Apply change
        this.state[key] = value;
        this.history.push(action);
        
        // Keep history manageable
        if (this.history.length > 1000) {
            this.history = this.history.slice(-500);
        }
        
        this.trackAccess('set', key, value, reason);
        
        return true;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //    VALIDATION SYSTEM
    // ═══════════════════════════════════════════════════════════════════════
    
    validateChange(action) {
        const { key, newValue } = action;
        
        // Type validation
        if (!this.validateType(key, newValue)) {
            console.warn(`[GAME STATE] Type mismatch for ${key}`);
            return false;
        }
        
        // Range validation
        if (!this.validateRange(key, newValue)) {
            console.warn(`[GAME STATE] Out of range: ${key}`);
            return false;
        }
        
        // Rate limiting
        if (!this.checkRateLimit(key)) {
            console.warn(`[GAME STATE] Rate limit exceeded: ${key}`);
            return false;
        }
        
        // Suspicious pattern detection
        if (this.detectSuspiciousPattern(key, newValue)) {
            console.warn(`[GAME STATE] Suspicious pattern detected: ${key}`);
            return false;
        }
        
        return true;
    }
    
    validateType(key, value) {
        const types = {
            gold: 'number',
            tokens: 'number',
            sol: 'number',
            gems: 'number',
            level: 'number',
            xp: 'number',
            nfts: 'object',
            guild: ['object', 'null'],
        };
        
        const expectedType = types[key];
        if (!expectedType) return true;
        
        const actualType = Array.isArray(value) ? 'object' : typeof value;
        
        if (Array.isArray(expectedType)) {
            return expectedType.includes(actualType) || actualType === 'null';
        }
        
        return actualType === expectedType;
    }
    
    validateRange(key, value) {
        const ranges = {
            gold: [0, 1000000000],      // 0 to 1B
            tokens: [0, 100000000],      // 0 to 100M
            sol: [0, 100000],           // 0 to 100K
            gems: [0, 100000],          // 0 to 100K
            level: [1, 999],            // 1 to 999
            xp: [0, 1000000],           // 0 to 1M
        };
        
        const range = ranges[key];
        if (!range) return true;
        
        return value >= range[0] && value <= range[1];
    }
    
    // Rate limiting for state changes
    rateLimits = {};
    
    checkRateLimit(key) {
        const now = Date.now();
        const limit = 100; // Max 100 changes per key per minute
        const window = 60000;
        
        if (!this.rateLimits[key]) {
            this.rateLimits[key] = { count: 0, windowStart: now };
        }
        
        const rl = this.rateLimits[key];
        
        if (now - rl.windowStart > window) {
            rl.count = 0;
            rl.windowStart = now;
        }
        
        rl.count++;
        return rl.count <= limit;
    }
    
    // Detect suspicious patterns
    suspiciousPatterns = [];
    
    detectSuspiciousPattern(key, value) {
        // Check for unusual increases
        if (typeof value === 'number') {
            const oldValue = this.state[key];
            if (oldValue && oldValue > 0) {
                const increase = value / oldValue;
                
                // More than 10x increase is suspicious
                if (increase > 10) {
                    this.suspiciousPatterns.push({
                        key,
                        oldValue,
                        newValue: value,
                        increase,
                        timestamp: Date.now()
                    });
                    
                    // Report to security
                    if (window.gameSecurity?.client) {
                        window.gameSecurity.client.reportViolation(
                            'suspicious_gain',
                            `${key}: ${oldValue} → ${value} (${increase.toFixed(1)}x)`
                        );
                    }
                    
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //    SECURE VALUE MODIFICATIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    addGold(amount, reason = '') {
        if (typeof amount !== 'number' || amount < 0) return false;
        
        return this.set('gold', this.state.gold + amount, reason);
    }
    
    removeGold(amount, reason = '') {
        if (typeof amount !== 'number' || amount < 0) return false;
        if (this.state.gold < amount) return false;
        
        return this.set('gold', this.state.gold - amount, reason);
    }
    
    addTokens(amount, reason = '') {
        if (typeof amount !== 'number' || amount < 0) return false;
        
        return this.set('tokens', this.state.tokens + amount, reason);
    }
    
    removeTokens(amount, reason = '') {
        if (typeof amount !== 'number' || amount < 0) return false;
        if (this.state.tokens < amount) return false;
        
        return this.set('tokens', this.state.tokens - amount, reason);
    }
    
    addXP(amount, reason = '') {
        if (typeof amount !== 'number' || amount < 0) return false;
        
        const newXP = this.state.xp + amount;
        
        // Handle level up
        if (newXP >= this.state.xpToNext) {
            const overflow = newXP - this.state.xpToNext;
            this.levelUp();
            return this.set('xp', overflow, reason);
        }
        
        return this.set('xp', newXP, reason);
    }
    
    levelUp() {
        this.set('level', this.state.level + 1, 'Level up');
        this.set('xpToNext', Math.floor(this.state.xpToNext * 1.5), 'XP threshold update');
        
        // Level up rewards
        this.addSol(0.5, 'Level up bonus');
        this.addTokens(1000, 'Level up bonus');
        
        console.log(`[GAME STATE] Level up! Now level ${this.state.level}`);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //    NFT MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════
    
    addNFT(nft) {
        if (!nft || typeof nft !== 'object') return false;
        if (!nft.id || !nft.name) return false;
        if (this.state.nfts.find(n => n.id === nft.id)) return false;
        
        const newNFTs = [...this.state.nfts, nft];
        return this.set('nfts', newNFTs, `Added NFT: ${nft.name}`);
    }
    
    removeNFT(nftId) {
        const index = this.state.nfts.findIndex(n => n.id === nftId);
        if (index === -1) return false;
        
        const nft = this.state.nfts[index];
        const newNFTs = [...this.state.nfts];
        newNFTs.splice(index, 1);
        
        return this.set('nfts', newNFTs, `Removed NFT: ${nft.name}`);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //    DAILY CLAIMS
    // ═══════════════════════════════════════════════════════════════════════
    
    canClaimDaily() {
        const now = Date.now();
        const hoursSinceClaim = (now - this.state.lastDailyClaim) / 3600000;
        return hoursSinceClaim >= 24;
    }
    
    claimDaily() {
        if (!this.canClaimDaily()) {
            console.warn('[GAME STATE] Cannot claim daily yet');
            return false;
        }
        
        const baseReward = 500;
        const bonus = this.state.level * 100;
        const totalReward = baseReward + bonus;
        
        const success = this.addGold(totalReward, 'Daily claim');
        if (success) {
            this.set('lastDailyClaim', Date.now(), 'Daily claim timestamp');
        }
        
        return { success, amount: totalReward };
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //    PERSISTENCE & SYNC
    // ═══════════════════════════════════════════════════════════════════════
    
    toJSON() {
        return {
            ...this.state,
            historyCount: this.history.length,
            suspiciousPatternsCount: this.suspiciousPatterns.length
        };
    }
    
    async toEncryptedJSON() {
        if (!this.encryption) {
            return this.toJSON();
        }
        
        return await this.encryption.encrypt(this.toJSON());
    }
    
    async loadFromJSON(data) {
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error('[GAME STATE] Failed to parse save data');
                return false;
            }
        }
        
        // Validate loaded data
        for (const [key, value] of Object.entries(data)) {
            if (this.state.hasOwnProperty(key)) {
                if (!this.validateType(key, value) || !this.validateRange(key, value)) {
                    console.warn(`[GAME STATE] Invalid value for ${key}, using default`);
                    continue;
                }
                this.state[key] = value;
            }
        }
        
        return true;
    }
    
    async loadFromEncrypted(data) {
        if (!this.encryption) {
            return this.loadFromJSON(data);
        }
        
        try {
            const decrypted = await this.encryption.decrypt(data);
            return this.loadFromJSON(decrypted);
        } catch (e) {
            console.error('[GAME STATE] Failed to decrypt save data');
            return false;
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    //    TRACKING & ANALYTICS
    // ═══════════════════════════════════════════════════════════════════════
    
    accessLog = [];
    
    trackAccess(type, key, value, reason = '') {
        this.accessLog.push({
            type,
            key,
            value,
            reason,
            timestamp: Date.now()
        });
        
        // Keep log manageable
        if (this.accessLog.length > 10000) {
            this.accessLog = this.accessLog.slice(-5000);
        }
        
        // Track in session
        this.state.actionsThisSession++;
    }
    
    getHistory() {
        return [...this.history];
    }
    
    getAccessLog() {
        return [...this.accessLog];
    }
    
    getStats() {
        return {
            level: this.state.level,
            gold: this.state.gold,
            tokens: this.state.tokens,
            sol: this.state.sol,
            gems: this.state.gems,
            nftCount: this.state.nfts.length,
            sessionTime: Date.now() - this.state.sessionStart,
            actionsThisSession: this.state.actionsThisSession,
            blockedChanges: this.history.filter(h => !h.valid).length,
            suspiciousPatterns: this.suspiciousPatterns.length
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//    EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SecureGameState };
}

// Auto-initialize
window.secureGameState = new SecureGameState();

console.log('🛡️ Solana AI City - Secure Game State Manager Loaded');
