#!/usr/bin/env python3
"""
📊 Triangular Arbitrage Analyzer
Analyze profitability and optimize arbitrage strategies
"""

import json
from typing import Dict, List
from datetime import datetime, timedelta


class ArbitrageAnalyzer:
    """Analyzer for triangular arbitrage strategies"""
    
    def __init__(self):
        self.gas_costs = {
            "raydium": {"sol": 0.0005, "usd": 0.04},
            "orca": {"sol": 0.0003, "usd": 0.03},
            "jupiter": {"sol": 0.0008, "usd": 0.07}
        }
        
        self.fee_rates = {
            "raydium": 0.0025,
            "orca": 0.0030,
            "jupiter": 0.0010
        }
    
    def analyze_profitability(self, amount: float, spread: float,
                            dex: str = "raydium") -> Dict:
        """Analyze profitability for given parameters"""
        
        fee_rate = self.fee_rates.get(dex, 0.0025)
        gas_usd = self.gas_costs.get(dex, {}).get("usd", 0.04)
        
        gross_profit = amount * (spread / 100)
        fees = amount * fee_rate * 3  # 3 trades
        net_profit = gross_profit - fees - gas_usd
        
        return {
            "input_amount": amount,
            "spread": spread,
            "dex": dex,
            "gross_profit": round(gross_profit, 4),
            "fees": round(fees, 4),
            "gas_cost": round(gas_usd, 4),
            "net_profit": round(net_profit, 4),
            "net_roi": round((net_profit / amount) * 100, 4),
            "profitable": net_profit > 0
        }
    
    def calculate_breakeven(self, amount: float, dex: str = "raydium") -> Dict:
        """Calculate breakeven spread for given amount"""
        
        fee_rate = self.fee_rates.get(dex, 0.0025)
        gas_usd = self.gas_costs.get(dex, {}).get("usd", 0.04)
        
        # breakeven: amount * spread/100 - fees - gas = 0
        # spread/100 = (fees + gas) / amount
        breakeven_spread = ((fee_rate * 3 * amount) + gas_usd) / amount * 100
        
        return {
            "amount": amount,
            "dex": dex,
            "breakeven_spread": round(breakeven_spread, 4),
            "min_profitable_spread": round(breakeven_spread + 0.1, 4),
            "fees": round(fee_rate * 3 * amount, 4),
            "gas_cost": round(gas_usd, 4)
        }
    
    def analyze_multiple_amounts(self, spreads: List[float] = None,
                                amounts: List[float] = None) -> Dict:
        """Analyze profitability across multiple amounts and spreads"""
        
        if spreads is None:
            spreads = [0.2, 0.3, 0.5, 0.75, 1.0, 1.5, 2.0]
        if amounts is None:
            amounts = [100, 500, 1000, 2500, 5000, 10000]
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "analysis": []
        }
        
        for spread in spreads:
            spread_row = {"spread": f"{spread}%"}
            for amount in amounts:
                analysis = self.analyze_profitability(amount, spread)
                profit_str = f"${analysis['net_profit']:.2f}"
                roi_str = f"{analysis['net_roi']:.2f}%"
                spread_row[f"${amount}"] = profit_str
            
            results["analysis"].append(spread_row)
        
        return results
    
    def get_recommended_strategy(self, capital: float, risk_tolerance: str = "medium") -> Dict:
        """Get recommended strategy based on capital and risk"""
        
        strategies = {
            "conservative": {
                "target_spread": 0.5,
                "dex": "jupiter",  # Lowest fees
                "max_position": capital * 0.5,
                "stop_loss": 0.2
            },
            "medium": {
                "target_spread": 0.3,
                "dex": "raydium",  # Balanced
                "max_position": capital * 0.7,
                "stop_loss": 0.15
            },
            "aggressive": {
                "target_spread": 0.2,
                "dex": "orca",  # Higher fees but more opportunities
                "max_position": capital * 1.0,
                "stop_loss": 0.1
            }
        }
        
        strategy = strategies.get(risk_tolerance, strategies["medium"])
        
        # Calculate expected returns
        expected_daily_trades = 20 if risk_tolerance == "aggressive" else 10
        avg_profit = capital * (strategy["target_spread"] / 100) * 0.8  # After fees
        
        return {
            "capital": capital,
            "risk_tolerance": risk_tolerance,
            "strategy": strategy,
            "expected_daily_trades": expected_daily_trades,
            "expected_daily_profit": round(avg_profit * expected_daily_trades, 2),
            "expected_monthly_profit": round(avg_profit * expected_daily_trades * 30, 2),
            "roi_monthly": round((avg_profit * expected_daily_trades * 30) / capital * 100, 2)
        }


def print_profitability_table():
    """Print profitability analysis table"""
    analyzer = ArbitrageAnalyzer()
    
    spreads = [0.2, 0.3, 0.5, 0.75, 1.0, 1.5, 2.0]
    amounts = [100, 500, 1000, 2500, 5000, 10000]
    
    print("\n" + "=" * 80)
    print("📊 TRIANGULAR ARBITRAGE PROFITABILITY TABLE")
    print("=" * 80)
    print(f"\n{'Spread':<8}", end="")
    for amount in amounts:
        print(f"{'$'+str(amount):<12}", end="")
    print()
    print("-" * 80)
    
    for spread in spreads:
        print(f"{spread:<.1f}%  ", end="")
        for amount in amounts:
            analysis = analyzer.analyze_profitability(amount, spread)
            profit = analysis["net_profit"]
            if profit > 0:
                print(f"+${profit:<10.2f}", end="")
            else:
                print(f"-${abs(profit):<10.2f}", end="")
        print()
    
    print("=" * 80)
    print("\n💡 Green = Profitable, Red = Loss (after fees)")
    print("   Assumes 0.25% fee per trade, 0.0005 SOL gas cost")
    print()


def print_strategy_recommendation(capital: float = 5000, risk: str = "medium"):
    """Print strategy recommendation"""
    analyzer = ArbitrageAnalyzer()
    strategy = analyzer.get_recommended_strategy(capital, risk)
    
    print("\n" + "=" * 70)
    print("🎯 STRATEGY RECOMMENDATION")
    print("=" * 70)
    
    print(f"\n💰 Capital: ${strategy['capital']}")
    print(f"🎚️ Risk Tolerance: {strategy['risk_tolerance'].upper()}")
    
    print(f"\n📋 Recommended Settings:")
    print(f"   Target Spread: {strategy['strategy']['target_spread']}%")
    print(f"   DEX: {strategy['strategy']['dex'].upper()}")
    print(f"   Max Position: ${strategy['strategy']['max_position']}")
    print(f"   Stop Loss: {strategy['strategy']['stop_loss']*100}%")
    
    print(f"\n📈 Expected Returns:")
    print(f"   Daily Trades: {strategy['expected_daily_trades']}")
    print(f"   Daily Profit: ${strategy['expected_daily_profit']}")
    print(f"   Monthly Profit: ${strategy['expected_monthly_profit']}")
    print(f"   Monthly ROI: {strategy['roi_monthly']}%")
    
    print("\n" + "=" * 70)


def main():
    import sys
    
    print("\n📊 Triangular Arbitrage Analyzer v1.0.0\n")
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "--table":
            print_profitability_table()
        
        elif command == "--strategy":
            capital = float(sys.argv[2]) if len(sys.argv) > 2 else 5000
            risk = sys.argv[3] if len(sys.argv) > 3 else "medium"
            print_strategy_recommendation(capital, risk)
        
        elif command == "--breakeven":
            amount = float(sys.argv[2]) if len(sys.argv) > 2 else 1000
            analyzer = ArbitrageAnalyzer()
            result = analyzer.calculate_breakeven(amount)
            print(json.dumps(result, indent=2))
        
        elif command == "--analyze":
            amount = float(sys.argv[2]) if len(sys.argv) > 2 else 1000
            spread = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
            analyzer = ArbitrageAnalyzer()
            result = analyzer.analyze_profitability(amount, spread)
            print(json.dumps(result, indent=2))
        
        elif command == "--multi":
            analyzer = ArbitrageAnalyzer()
            results = analyzer.analyze_multiple_amounts()
            print(json.dumps(results, indent=2))
        
        else:
            print_strategy_recommendation()
            print_profitability_table()
    else:
        print_strategy_recommendation()
        print_profitability_table()
        
        print("\n📖 Usage:")
        print("   python analyze.py --table         # Profitability table")
        print("   python analyze.py --strategy 5000 medium  # Custom strategy")
        print("   python analyze.py --breakeven 1000  # Breakeven analysis")
        print("   python analyze.py --analyze 1000 0.5  # Single analysis")


if __name__ == "__main__":
    main()
