#!/usr/bin/env python3
"""
🔺 Triangular Arbitrage Scanner
Scans Solana DeFi markets for arbitrage opportunities
"""

import json
from dataclasses import dataclass
from typing import List, Dict, Optional
from datetime import datetime


@dataclass
class ArbitrageOpportunity:
    """Represents an arbitrage opportunity"""
    token_a: str
    token_b: str
    token_c: str
    route: List[str]
    spread: float
    profit_usd: float
    roi: float
    dex: str
    timestamp: str


class ArbitrageScanner:
    """Scanner for triangular arbitrage opportunities"""
    
    def __init__(self):
        self.dex_pools = {
            "raydium": [
                {"base": "SOL", "quote": "USDC"},
                {"base": "SOL", "quote": "RAY"},
                {"base": "USDC", "quote": "RAY"},
                {"base": "SOL", "quote": "USDT"},
                {"base": "SOL", "quote": "ETH"},
            ],
            "orca": [
                {"base": "SOL", "quote": "USDC"},
                {"base": "SOL", "quote": "ORCA"},
                {"base": "USDC", "quote": "ORCA"},
            ]
        }
        
        # Simulated current prices (in production, fetch from RPC)
        self.prices = {
            "SOL": 85.50,
            "USDC": 1.00,
            "RAY": 2.15,
            "USDT": 1.00,
            "ETH": 1850.00,
            "BONK": 0.000025,
            "ORCA": 4.80
        }
    
    def scan(self, dex: str = "all", min_spread: float = 0.3) -> List[ArbitrageOpportunity]:
        """Scan for arbitrage opportunities"""
        
        opportunities = []
        
        dexs = [dex] if dex != "all" else list(self.dex_pools.keys())
        
        for dex_name in dexs:
            pools = self.dex_pools.get(dex_name, [])
            
            # Check triangular opportunities
            for i, pool1 in enumerate(pools):
                for j, pool2 in enumerate(pools):
                    if i >= j:
                        continue
                    for k, pool3 in enumerate(pools):
                        if k == i or k == j:
                            continue
                        
                        # Check if pools form a triangle
                        tokens = [pool1["base"], pool1["quote"], 
                                 pool2["base"], pool2["quote"],
                                 pool3["base"], pool3["quote"]]
                        
                        unique_tokens = set(tokens)
                        if len(unique_tokens) != 3:
                            continue
                        
                        # Calculate potential arbitrage
                        opportunity = self._check_triangle(
                            pool1, pool2, pool3, dex_name
                        )
                        
                        if opportunity and opportunity.spread >= min_spread:
                            opportunities.append(opportunity)
        
        # Sort by spread (highest first)
        opportunities.sort(key=lambda x: x.spread, reverse=True)
        
        return opportunities
    
    def _check_triangle(self, pool1: Dict, pool2: Dict, pool3: Dict, 
                       dex: str) -> Optional[ArbitrageOpportunity]:
        """Check if three pools form a profitable triangle"""
        
        tokens = list(set([
            pool1["base"], pool1["quote"],
            pool2["base"], pool2["quote"],
            pool3["base"], pool3["quote"]
        ]))
        
        if len(tokens) != 3:
            return None
        
        token_a, token_b, token_c = tokens
        
        # Simulate triangular trade
        # A → B → C → A
        start_amount = 1000  # USDC
        amount = start_amount
        
        # Simulated prices with small inefficiencies
        price_ab = self.prices.get(token_a, 1) / self.prices.get(token_b, 1)
        price_bc = self.prices.get(token_b, 1) / self.prices.get(token_c, 1)
        price_ca = self.prices.get(token_c, 1) / self.prices.get(token_a, 1)
        
        # Add small price differences (arb opportunity)
        spread = 0.5  # 0.5% spread
        price_ab = price_ab * (1 + spread/100)
        
        # Calculate conversion
        amount_b = amount * price_ab
        amount_c = amount_b * price_bc
        amount_final = amount_c * price_ca
        
        profit = amount_final - amount
        roi = (profit / amount) * 100
        
        if profit > 0:
            return ArbitrageOpportunity(
                token_a=token_a,
                token_b=token_b,
                token_c=token_c,
                route=[f"{token_a}→{token_b}", f"{token_b}→{token_c}", f"{token_c}→{token_a}"],
                spread=spread,
                profit_usd=profit,
                roi=roi,
                dex=dex,
                timestamp=datetime.now().isoformat()
            )
        
        return None
    
    def get_pool_status(self) -> Dict:
        """Get status of all monitored pools"""
        return {
            "timestamp": datetime.now().isoformat(),
            "pools": {
                "raydium": {
                    "SOL-USDC": {"tvl": "$45M", "volume": "$12M/24h", "apy": "12%"},
                    "SOL-RAY": {"tvl": "$8M", "volume": "$2M/24h", "apy": "45%"},
                    "USDC-RAY": {"tvl": "$3M", "volume": "$1M/24h", "apy": "35%"}
                },
                "orca": {
                    "SOL-USDC": {"tvl": "$22M", "volume": "$8M/24h", "apy": "10%"},
                    "SOL-ORCA": {"tvl": "$5M", "volume": "$1.5M/24h", "apy": "38%"}
                }
            },
            "prices": self.prices
        }


def print_dashboard():
    """Print arbitrage dashboard"""
    scanner = ArbitrageScanner()
    
    print("\n" + "=" * 70)
    print("🔺 TRIANGULAR ARBITRAGE SCANNER")
    print("=" * 70)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print("=" * 70)
    
    # Pool status
    status = scanner.get_pool_status()
    
    print("\n📊 POOL STATUS")
    print("-" * 70)
    
    for dex, pools in status["pools"].items():
        print(f"\n🏛️ {dex.upper()}")
        for pool, info in pools.items():
            print(f"   {pool:<12} TVL: {info['tvl']:>8} Vol: {info['volume']:>12} APY: {info['apy']}")
    
    # Current prices
    print("\n💰 CURRENT PRICES")
    print("-" * 70)
    for token, price in status["prices"].items():
        if price >= 1:
            print(f"   {token:<6} ${price:>10.2f}")
        else:
            print(f"   {token:<6} ${price:>12.8f}")
    
    # Scan for opportunities
    print("\n🔍 SCANNING FOR OPPORTUNITIES...")
    opportunities = scanner.scan(min_spread=0.3)
    
    if opportunities:
        print(f"\n✅ Found {len(opportunities)} opportunities!")
        print("\n📈 TOP OPPORTUNITIES")
        print("-" * 70)
        
        for i, opp in enumerate(opportunities[:5], 1):
            print(f"\n{i}. {opp.dex.upper()}")
            print(f"   Route: {' → '.join(opp.route)}")
            print(f"   Spread: {opp.spread:.2f}%")
            print(f"   Profit (1000 USDC): ${opp.profit_usd:.2f}")
            print(f"   ROI: {opp.roi:.2f}%")
    else:
        print("\n⚠️ No opportunities found (min spread: 0.3%)")
        print("   Market is efficient or spreads are too thin")
    
    print("\n" + "=" * 70)
    print("💡 Tips:")
    print("   - Run continuously to catch fleeting opportunities")
    print("   - Use Jupiter aggregator for best execution")
    print("   - Monitor gas costs to ensure profitability")
    print("=" * 70 + "\n")


def export_json(min_spread: float = 0.3):
    """Export opportunities to JSON"""
    scanner = ArbitrageScanner()
    opportunities = scanner.scan(min_spread=min_spread)
    
    data = {
        "timestamp": datetime.now().isoformat(),
        "min_spread": min_spread,
        "opportunities": [
            {
                "route": opp.route,
                "spread": opp.spread,
                "profit_usd": opp.profit_usd,
                "roi": opp.roi,
                "dex": opp.dex
            }
            for opp in opportunities
        ]
    }
    
    print(json.dumps(data, indent=2))


def main():
    import sys
    
    print("\n🔺 Triangular Arbitrage Scanner v1.0.0\n")
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "--json" or command == "-j":
            min_spread = float(sys.argv[2]) if len(sys.argv) > 2 else 0.3
            export_json(min_spread)
        
        elif command == "--dex":
            dex = sys.argv[2] if len(sys.argv) > 2 else "raydium"
            scanner = ArbitrageScanner()
            opportunities = scanner.scan(dex=dex)
            print(f"\n🔍 Found {len(opportunities)} opportunities on {dex}")
        
        elif command == "--min-spread":
            min_spread = float(sys.argv[2]) if len(sys.argv) > 2 else 0.3
            scanner = ArbitrageScanner()
            opportunities = scanner.scan(min_spread=min_spread)
            print(f"\n🔍 Found {len(opportunities)} opportunities (min spread: {min_spread}%)")
        
        elif command == "--status":
            scanner = ArbitrageScanner()
            print(json.dumps(scanner.get_pool_status(), indent=2))
        
        else:
            print_dashboard()
    else:
        print_dashboard()


if __name__ == "__main__":
    main()
