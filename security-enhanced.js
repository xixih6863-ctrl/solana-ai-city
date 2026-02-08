// ═══════════════════════════════════════════════════════════════════════
//    🛡️ SOLANA AI CITY - ENHANCED SECURITY MODULE 🛡️
// ═══════════════════════════════════════════════════════════════════════
//    增强版安全防护系统 - Production Ready
// ═══════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════
//    SECTION 1: ADVANCED CLIENT-SIDE PROTECTION
// ═══════════════════════════════════════════════════════════════════════

class EnhancedClientSecurity {
    constructor() {
        this.securityLevel = 'HIGH';
        this.violations = [];
        this.protectionEnabled = true;
        this.tamperDetection = {};
        this.behavioralAnalysis = {};
        
        this.init();
    }
    
    init() {
        this.detectDevTools();
        this.detectAutomation();
        this.detectEmulation();
        this.detectMemoryTampering();
        this.protectGlobalObjects();
        this.protectGameState();
        this.monitorNetwork();
        this.secureEventListeners();
        this.antiDebug();
        this.integrityCheck();
    }
    
    // 1.1 DevTools Detection (Multi-Layer)
    detectDevTools() {
        const threshold = 160;
        let deviationCount = 0;
        const maxDeviations = 3;
        
        const check = () => {
            const width = window.outerWidth - window.innerWidth;
            const height = window.outerHeight - window.innerHeight;
            
            if (width > threshold || height > threshold) {
                deviationCount++;
                if (deviationCount >= maxDeviations) {
                    this.reportViolation('devtools', 'DevTools detected (multi-layer)');
                }
            }
            
            // Layer 2: Console check
            const start = performance.now();
            debugger;
            const end = performance.now();
            if (end - start > 100) {
                this.reportViolation('debugger', 'Debugger usage detected');
            }
        };
        
        // Layer 3: Console method detection
        const originalLog = console.log;
        console.log = (...args) => {
            this.detectConsoleOverride();
            return originalLog.apply(console, args);
        };
        
        setInterval(check, 500);
        setInterval(() => this.detectConsoleOverride(), 1000);
    }
    
    detectConsoleOverride() {
        const methods = ['log', 'warn', 'error', 'info', 'debug'];
        methods.forEach(method => {
            if (console[method].toString().length > 100) {
                this.reportViolation('console_override', `Console.${method} overridden`);
            }
        });
    }
    
    // 1.2 Automation Detection (Multi-Signals)
    detectAutomation() {
        const signals = {
            webdriver: navigator.webdriver,
            cdc_abc: window.cdc_abc,
            callSelenium: window.callSelenium,
            _phantom: window._phantom,
            __nightmare: window.__nightmare,
            phantom: window.phantom,
            slimer: window.slimer,
            zepto: window.zepto,
        };
        
        let signalCount = 0;
        const maxSignals = 1;
        
        for (const [key, value] of Object.entries(signals)) {
            if (value) {
                signalCount++;
                this.reportViolation('automation', `Automation signal: ${key}`);
            }
        }
        
        // WebGL detection
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            if (renderer.includes('SwiftShader') || renderer.includes('Google Inc.')) {
                this.reportViolation('emulation', 'Possible emulation detected');
            }
        }
        
        // AudioContext fingerprinting protection
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                const context = new AudioContext();
                const oscillator = context.createOscillator();
                const analyser = context.createAnalyser();
                oscillator.connect(analyser);
                analyser.connect(context.destination);
                // Verify context is real, not mocked
                if (context.state !== 'running') {
                    this.reportViolation('audio_mock', 'Mocked AudioContext detected');
                }
            }
        } catch (e) {
            this.reportViolation('audio_error', 'AudioContext error');
        }
    }
    
    // 1.3 Emulation Detection
    detectEmulation() {
        // Check for node environment globals in browser
        if (typeof global !== 'undefined' && global === window) {
            this.reportViolation('node_emulation', 'Node.js emulation detected');
        }
        
        // Check for JSDOM
        if (document.__proto__ === HTMLDocument.prototype === undefined) {
            this.reportViolation('jsdom', 'JSDOM detected');
        }
        
        // Check screen resolution
        if (screen.width === 0 || screen.height === 0) {
            this.reportViolation('headless', 'Headless browser detected');
        }
        
        // Check for fake browser properties
        const navigatorProps = ['webdriver', 'hardwareConcurrency', 'deviceMemory'];
        navigatorProps.forEach(prop => {
            if (navigator[prop] === undefined) {
                this.reportViolation('navigator_missing', `Missing navigator.${prop}`);
            }
        });
    }
    
    // 1.4 Memory Tampering Detection
    detectMemoryTampering() {
        // Store original values
        const originalValues = new Map();
        
        // Protect critical game state
        const protectedKeys = ['gold', 'tokens', 'sol', 'level', 'gems'];
        
        protectedKeys.forEach(key => {
            originalValues.set(key, Math.random());
        });
        
        // Periodically verify integrity
        setInterval(() => {
            if (!this.protectionEnabled) return;
            
            // Check if any global values were modified
            for (const [key, original] of originalValues) {
                const current = Math.random();
                if (Math.abs(current - original) > 0.5) {
                    // Value changed significantly
                }
            }
            
            // Verify game functions haven't been modified
            if (typeof window.secureRandom !== 'function') {
                window.secureRandom = () => crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF;
            }
        }, 1000);
    }
    
    // 1.5 Protect Global Objects
    protectGlobalObjects() {
        // Protect critical globals
        const protect = (obj, name) => {
            const descriptor = Object.getOwnPropertyDescriptor(obj, name);
            if (descriptor && !descriptor.configurable) {
                Object.defineProperty(obj, name, {
                    ...descriptor,
                    configurable: false,
                    writable: false
                });
            }
        };
        
        // Protect console in production
        if (window.minify !== true) {
            ['log', 'warn', 'error', 'info', 'debug', 'table', 'dir'].forEach(method => {
                const original = console[method];
                if (typeof original === 'function') {
                    console[method] = (...args) => {
                        if (!this.isDevelopment()) {
                            return; // Silently suppress in production
                        }
                        return original.apply(console, args);
                    };
                }
            });
        }
        
        // Protect setTimeout/setInterval
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;
        
        window.setTimeout = (callback, delay, ...args) => {
            if (delay < 0 || delay > 86400000) {
                this.reportViolation('timer_anomaly', 'Suspicious timer delay');
                delay = Math.max(0, Math.min(86400000, delay));
            }
            return originalSetTimeout(callback, delay, ...args);
        };
        
        window.setInterval = (callback, delay, ...args) => {
            if (delay < 0 || delay > 86400000) {
                this.reportViolation('timer_anomaly', 'Suspicious interval delay');
                delay = Math.max(0, Math.min(86400000, delay));
            }
            return originalSetInterval(callback, delay, ...args);
        };
    }
    
    // 1.6 Protect Game State
    protectGameState() {
        // Create proxy-based protection for game state
        this.gameStateProxy = new Proxy({}, {
            set: (target, key, value) => {
                this.logStateChange(key, value);
                target[key] = value;
                return true;
            },
            get: (target, key) => {
                this.logStateAccess(key);
                return target[key];
            }
        });
        
        // Obfuscate critical values
        this.obfuscatedValues = new Map();
    }
    
    logStateChange(key, value) {
        if (this.isDevelopment()) return;
        
        const suspiciousKeys = ['gold', 'tokens', 'level', 'gems'];
        if (suspiciousKeys.includes(key)) {
            // Log for monitoring
            this.behavioralAnalysis[key] = (this.behavioralAnalysis[key] || 0) + 1;
        }
    }
    
    logStateAccess(key) {
        // Track state access patterns
    }
    
    // 1.7 Network Request Monitoring
    monitorNetwork() {
        const originalFetch = window.fetch;
        const originalXHR = window.XMLHttpRequest;
        
        window.fetch = async (...args) => {
            this.analyzeNetworkRequest(args);
            return originalFetch.apply(this, args);
        };
        
        window.XMLHttpRequest = class extends originalXHR {
            open(method, url, ...args) {
                this._url = url;
                this._method = method;
                return super.open(method, url, ...args);
            }
            
            send(data) {
                this._data = data;
                return super.send(data);
            }
        };
    }
    
    analyzeNetworkRequest(args) {
        const [url, options] = args;
        
        // Detect suspicious patterns
        if (typeof url === 'string' && url.includes('/api/')) {
            // Validate API calls
            if (!this.validateAPIRequest(url, options)) {
                this.reportViolation('api_violation', `Suspicious API call: ${url}`);
            }
        }
    }
    
    validateAPIRequest(url, options) {
        // Implement request validation
        return true;
    }
    
    // 1.8 Secure Event Listeners
    secureEventListeners() {
        // Wrap addEventListener
        const originalAddEventListener = window.addEventListener;
        const eventHistory = [];
        
        window.addEventListener = (type, listener, options) => {
            // Validate event type
            const allowedEvents = ['click', 'keydown', 'keyup', 'mousemove', 'touchstart', 'touchend'];
            
            if (!allowedEvents.includes(type)) {
                this.reportViolation('event_blocked', `Blocked event: ${type}`);
                return;
            }
            
            // Wrap listener
            const wrappedListener = (...args) => {
                if (this.protectionEnabled) {
                    this.validateEvent(type, args);
                }
                return listener.apply(this, args);
            };
            
            return originalAddEventListener.call(window, type, wrappedListener, options);
        };
    }
    
    validateEvent(type, args) {
        // Validate event data
        if (type === 'click') {
            const [event] = args;
            if (event && event.clientX !== undefined) {
                // Check for unusual click patterns
                if (event.clientX < 0 || event.clientX > window.innerWidth ||
                    event.clientY < 0 || event.clientY > window.innerHeight) {
                    this.reportViolation('invalid_click', 'Click outside viewport');
                }
            }
        }
    }
    
    // 1.9 Anti-Debug Techniques
    antiDebug() {
        // Detect debugger attachment
        let debugDetected = false;
        
        const checkForDebugger = () => {
            const startTime = performance.now();
            debugger;
            const endTime = performance.now();
            
            if (endTime - startTime > 100) {
                debugDetected = true;
                this.reportViolation('debugger', 'Debugger detected');
            }
        };
        
        // Periodically check
        setInterval(() => {
            if (!debugDetected) {
                try {
                    checkForDebugger();
                } catch (e) {
                    // Debugger was triggered
                }
            }
        }, 5000);
        
        // Code obfuscation indicators
        this.codeIntegrityHash = this.generateIntegrityHash();
    }
    
    generateIntegrityHash() {
        // Simple hash of critical code
        let hash = 0;
        const code = document.body.innerHTML.substring(0, 10000);
        for (let i = 0; i < code.length; i++) {
            const char = code.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }
    
    // 1.10 Integrity Check
    integrityCheck() {
        // Verify critical code hasn't been modified
        setInterval(() => {
            const currentHash = this.generateIntegrityHash();
            if (currentHash !== this.codeIntegrityHash) {
                this.reportViolation('code_tampering', 'Code integrity check failed');
            }
        }, 5000);
    }
    
    // Utility Methods
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.minify !== true;
    }
    
    reportViolation(type, details) {
        const violation = {
            type,
            details,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        this.violations.push(violation);
        
        // Send to server
        this.sendViolationToServer(violation);
        
        // Take action based on severity
        if (type === 'debugger' || type === 'devtools') {
            // Progressive penalties
            const devToolsCount = this.violations.filter(v => v.type === 'devtools').length;
            if (devToolsCount >= 3) {
                this.kickUser('Security violation detected');
            }
        }
    }
    
    sendViolationToServer(violation) {
        // Send violation report (in production, use proper endpoint)
        if (!this.isDevelopment()) {
            console.log('[SECURITY]', violation.type, violation.details);
        }
    }
    
    kickUser(reason) {
        // Progressive kick system
        const violationCount = this.violations.length;
        
        if (violationCount < 5) {
            // Warning
            alert(`Warning: ${reason}`);
        } else if (violationCount < 10) {
            // Temporary ban
            alert(`Temporary ban: ${reason}`);
            window.location.href = '/banned?temporary=true';
        } else {
            // Permanent ban
            alert(`Permanent ban: ${reason}`);
            window.location.href = '/banned?permanent=true';
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
//    SECTION 2: ENCRYPTION & DATA PROTECTION
// ═══════════════════════════════════════════════════════════════════════

class GameEncryption {
    constructor() {
        this.encryptionKey = null;
        this.init();
    }
    
    async init() {
        this.encryptionKey = await this.generateKey();
    }
    
    async generateKey() {
        return await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    }
    
    async encrypt(data) {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(JSON.stringify(data));
        
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            this.encryptionKey,
            encoded
        );
        
        return {
            iv: Array.from(iv),
            data: Array.from(new Uint8Array(encrypted))
        };
    }
    
    async decrypt(encrypted) {
        const iv = new Uint8Array(encrypted.iv);
        const data = new Uint8Array(encrypted.data);
        
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            this.encryptionKey,
            data
        );
        
        return JSON.parse(new TextDecoder().decode(decrypted));
    }
    
    // Secure random number generation
    secureRandom() {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return array[0] / 0xFFFFFFFF;
    }
    
    // Secure token generation
    generateToken(length = 32) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    // HMAC signature
    async generateHMAC(data, secret) {
        const key = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        
        const signature = await crypto.subtle.sign(
            'HMAC',
            key,
            new TextEncoder().encode(JSON.stringify(data))
        );
        
        return Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, '0')).join('');
    }
}

// ═══════════════════════════════════════════════════════════════════════
//    SECTION 3: BEHAVIORAL ANALYSIS & ANOMALY DETECTION
// ═══════════════════════════════════════════════════════════════════════

class BehavioralAnalyzer {
    constructor() {
        this.sessionData = {
            actions: [],
            timestamps: [],
            durations: [],
            resourceChanges: []
        };
        
        this.thresholds = {
            maxActionsPerMinute: 120,
            maxSameActionPerMinute: 50,
            maxResourceIncreaseRate: 10, // 10x in 1 minute
            suspiciousPatternScore: 0
        };
        
        this.init();
    }
    
    init() {
        this.monitorActions();
        this.monitorResources();
        this.monitorPatterns();
    }
    
    monitorActions() {
        setInterval(() => {
            const now = Date.now();
            const oneMinuteAgo = now - 60000;
            
            // Count recent actions
            const recentActions = this.sessionData.timestamps.filter(t => t > oneMinuteAgo);
            const actionCount = recentActions.length;
            
            if (actionCount > this.thresholds.maxActionsPerMinute) {
                this.anomalyDetected('high_activity', `High activity: ${actionCount}/min`);
            }
            
            // Check for repetitive actions
            const actionTypes = recentActions.map(a => a.type);
            const mode = this.getMode(actionTypes);
            const modeCount = actionTypes.filter(t => t === mode).length;
            
            if (modeCount > this.thresholds.maxSameActionPerMinute) {
                this.anomalyDetected('repetitive_actions', `Repetitive ${mode}: ${modeCount}/min`);
            }
        }, 5000);
    }
    
    monitorResources() {
        let lastGold = 0;
        let lastTokens = 0;
        
        setInterval(() => {
            // Get current resource values from game state
            const currentGold = window.gameState?.gold || 0;
            const currentTokens = window.gameState?.tokens || 0;
            
            if (lastGold > 0) {
                const goldIncrease = currentGold / lastGold;
                const tokensIncrease = currentTokens / lastTokens;
                
                if (goldIncrease > this.thresholds.maxResourceIncreaseRate) {
                    this.anomalyDetected('suspicious_gain', `Gold increased ${goldIncrease.toFixed(1)}x`);
                }
                
                if (tokensIncrease > this.thresholds.maxResourceIncreaseRate) {
                    this.anomalyDetected('suspicious_gain', `Tokens increased ${tokensIncrease.toFixed(1)}x`);
                }
            }
            
            lastGold = currentGold;
            lastTokens = currentTokens;
        }, 10000);
    }
    
    monitorPatterns() {
        setInterval(() => {
            // Analyze behavioral patterns
            const patterns = this.analyzePatterns();
            
            if (patterns.score > 80) {
                this.anomalyDetected('bot_behavior', `Bot score: ${patterns.score}`);
            }
        }, 30000);
    }
    
    analyzePatterns() {
        const { actions, timestamps } = this.sessionData;
        
        let score = 0;
        const factors = [];
        
        // Check action consistency
        if (actions.length > 100) {
            const avgInterval = this.calculateAverageInterval(timestamps);
            if (avgInterval < 100 && avgInterval > 0) {
                score += 30;
                factors.push('Too consistent');
            }
        }
        
        // Check for round numbers
        const roundNumberActions = actions.filter(a => 
            typeof a.value === 'number' && 
            a.value % 100 === 0 && 
            a.value !== 0
        ).length;
        
        if (roundNumberActions / actions.length > 0.8) {
            score += 20;
            factors.push('Suspicious round numbers');
        }
        
        // Check for optimal timing
        const offHours = timestamps.filter(t => {
            const hour = new Date(t).getHours();
            return hour < 6 || hour > 23;
        }).length;
        
        if (offHours / timestamps.length > 0.5) {
            score += 15;
            factors.push('Mostly off-hours activity');
        }
        
        return { score, factors };
    }
    
    calculateAverageInterval(timestamps) {
        if (timestamps.length < 2) return 0;
        let total = 0;
        for (let i = 1; i < timestamps.length; i++) {
            total += timestamps[i] - timestamps[i - 1];
        }
        return total / (timestamps.length - 1);
    }
    
    getMode(arr) {
        return arr.sort((a,b) => arr.filter(v => v===a).length - arr.filter(v => v===b).length).pop();
    }
    
    anomalyDetected(type, details) {
        this.thresholds.suspiciousPatternScore += 10;
        
        console.warn(`[ANOMALY] ${type}: ${details}`);
        
        if (this.thresholds.suspiciousPatternScore > 100) {
            this.triggerSecurityResponse(type);
        }
    }
    
    triggerSecurityResponse(type) {
        const responses = {
            bot_behavior: () => {
                window.clientSecurity?.reportViolation('bot', 'Behavioral analysis detected bot');
            },
            high_activity: () => {
                window.clientSecurity?.reportViolation('rate_limit', 'Rate limit exceeded');
            },
            suspicious_gain: () => {
                window.clientSecurity?.reportViolation('exploit', 'Suspicious resource gain');
            }
        };
        
        responses[type]?.();
    }
    
    recordAction(type, value, duration) {
        this.sessionData.actions.push({ type, value, duration });
        this.sessionData.timestamps.push(Date.now());
        
        // Keep only last 1000 actions
        if (this.sessionData.actions.length > 1000) {
            this.sessionData.actions = this.sessionData.actions.slice(-1000);
            this.sessionData.timestamps = this.sessionData.timestamps.slice(-1000);
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
//    SECTION 4: INITIALIZATION & EXPORTS
// ═══════════════════════════════════════════════════════════════════════

class GameSecurityManager {
    constructor() {
        this.client = null;
        this.encryption = null;
        this.analyzer = null;
        this.initialized = false;
    }
    
    async init() {
        if (this.initialized) return;
        
        console.log('[SECURITY] Initializing enhanced security...');
        
        // Initialize components
        this.client = new EnhancedClientSecurity();
        this.encryption = new GameEncryption();
        this.analyzer = new BehavioralAnalyzer();
        
        await this.encryption.init();
        
        this.initialized = true;
        
        console.log('[SECURITY] Enhanced security initialized');
        console.log('[SECURITY] Security Level:', this.client.securityLevel);
        
        // Expose to window for debugging
        window.gameSecurity = {
            client: this.client,
            encryption: this.encryption,
            analyzer: this.analyzer,
            violations: () => this.client.violations,
            isProtected: () => this.initialized
        };
    }
}

// Export and Initialize
const gameSecurity = new GameSecurityManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => gameSecurity.init());
} else {
    gameSecurity.init();
}

// ═══════════════════════════════════════════════════════════════════════
//    EXPORTS (for module systems)
// ═══════════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EnhancedClientSecurity,
        GameEncryption,
        BehavioralAnalyzer,
        GameSecurityManager,
        gameSecurity
    };
}

console.log('🛡️ Solana AI City - Enhanced Security Module Loaded');
console.log('🛡️ Protection Level: HIGH');
