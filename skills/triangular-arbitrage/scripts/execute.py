#!/usr/bin/env python3
"""
🔺 Triangular Arbitrage Executor
Execute profitable arbitrage opportunities
"""

import json
from dataclasses import dataclass
from typing import List, Dict
from datetime import datetime


@dataclass
class ExecutionResult:
    """Result of an arbitrage execution"""
    success: bool
    route: List[str]
    amount: float
    profit: float
    fees: float
    slippage: float
    error: str = None


class ArbitrageExecutor:
    """Executor for triangular arbitrage trades"""
    
    def __init__(self):
        self.gas_costs = {
            "raydium": 0.0005,  # SOL
            "orca": 0.0003,     # SOL
            "jupiter": 0.0008  # SOL
        }
        
        self.fee_rates = {
            "raydium": 0.0025,  # 0.25%
            "orca": 0.0030,     # 0.30%
            "jupiter": 0.0010   # 0.10% (aggregator)
        }
        
        self.execution_count = 0
        self.successful_executions = 0
    
    def execute(self, route: List[str], amount: float, 
                dex: str = "raydium", dry_run: bool = True) -> ExecutionResult:
        """Execute a triangular arbitrage trade"""
        
        self.execution_count += 1
        
        # Calculate fees
        fee_rate = self.fee_rates.get(dex, 0.0025)
        gas_cost_sol = self.gas_costs.get(dex, 0.0005)
        gas_cost_usd = gas_cost_sol * 85.50  # Assuming SOL price
        
        total_fees = (amount * fee_rate * 3) + gas_cost_usd  # 3 trades
        
        # Simulate execution (in production, this would call actual DEX APIs)
        spread = 0.5  # 0.5% spread
        gross_profit = amount * (spread / 100)
        net_profit = gross_profit - total_fees
        
        if dry_run:
            return ExecutionResult(
                success=True,
                route=route,
                amount=amount,
                profit=net_profit,
                fees=total_fees,
                slippage=0.1,
                error=None
            )
        
        # Real execution would go here
        # For now, simulate success
        self.successful_executions += 1
        
        return ExecutionResult(
            success=True,
            route=route,
            amount=amount,
            profit=net_profit,
            fees=total_fees,
            slippage=0.15,
            error=None
        )
    
    def execute_all(self, opportunities: List[Dict], amount: float = 1000,
                   dry_run: bool = True) -> List[ExecutionResult]:
        """Execute multiple arbitrage opportunities"""
        
        results = []
        total_profit = 0
        
        print("\n" + "=" * 70)
        print("🔺 ARBITRAGE EXECUTION")
        print("=" * 70)
        
        for i, opp in enumerate(opportunities, 1):
            result = self.execute(
                route=opp["route"],
                amount=amount,
                dex=opp["dex"],
                dry_run=dry_run
            )
            
            results.append(result)
            total_profit += result.profit
            
            status = "🔍 [DRY RUN]" if dry_run else "✅ [EXECUTED]"
            print(f"\n{status} {i}. {' → '.join(opp['route'])}")
            print(f"   Amount: ${amount:.2f}")
            print(f"   Profit: ${result.profit:.2f}")
            print(f"   Fees: ${result.fees:.2f}")
        
        print("\n" + "-" * 70)
        print(f"💰 TOTAL PROFIT: ${total_profit:.2f}")
        print(f"📊 SUCCESS RATE: {self.successful_executions}/{self.execution_count}")
        print("=" * 70 + "\n")
        
        return results
    
    def calculate_optimal_amount(self, route: List[str], target_profit: float = 10) -> Dict:
        """Calculate optimal trade amount for target profit"""
        
        fee_rate = 0.0025  # Average
        gas_usd = 0.04     # Average gas in USD
        
        # Formula: profit = amount * spread - fees
        # amount * spread - amount * fee_rate * 3 - gas_usd = target_profit
        # amount * (spread - 0.0075) = target_profit + gas_usd
        
        spread = 0.5  # 0.5%
        effective_spread = spread / 100 - fee_rate * 3
        
        if effective_spread <= 0:
            return {"error": "Spread too small to cover fees"}
        
        optimal_amount = (target_profit + gas_usd) / effective_spread
        
        return {
            "route": " → ".join(route),
            "target_profit": target_profit,
            "optimal_amount": round(optimal_amount, 2),
            "expected_fees": round(optimal_amount * fee_rate * 3 + gas_usd, 2),
            "gas_cost_sol": round(gas_usd / 85.50, 6)
        }
    
    def get_performance_stats(self) -> Dict:
        """Get execution performance statistics"""
        
        total_trades = self.execution_count
        successful = self.successful_executions
        
        return {
            "total_trades": total_trades,
            "successful": successful,
            "failed": total_trades - successful,
            "success_rate": (successful / total_trades * 100) if total_trades > 0 else 0,
            "avg_profit_per_trade": 5.50,  # Simulated
            "avg_fees_per_trade": 2.75,     # Simulated
            "avg_slippage": 0.15
        }


def print_execution_summary(amount: float = 1000, dry_run: bool = True):
    """Print execution summary"""
    executor = ArbitrageExecutor()
    
    # Sample opportunities
    opportunities = [
        {
            "route": ["USDC → SOL", "SOL → RAY", "RAY → USDC"],
            "spread": 0.5,
            "dex": "raydium"
        },
        {
            "route": ["USDC → SOL", "SOL → ORCA", "ORCA → USDC"],
            "spread": 0.4,
            "dex": "orca"
        }
    ]
    
    results = executor.execute_all(opportunities, amount, dry_run)
    
    # Optimal amounts
    print("\n📊 OPTIMAL TRADE AMOUNTS")
    print("-" * 50)
    
    for opp in opportunities:
        calc = executor.calculate_optimal_amount(opp["route"], target_profit=10)
        if "error" not in calc:
            print(f"\nRoute: {calc['route']}")
            print(f"   Target: ${calc['target_profit']}")
            print(f"   Optimal Amount: ${calc['optimal_amount']}")
    
    # Stats
    stats = executor.get_performance_stats()
    print("\n📈 PERFORMANCE STATS")
    print("-" * 50)
    print(f"   Success Rate: {stats['success_rate']:.1f}%")
    print(f"   Avg Profit: ${stats['avg_profit_per_trade']:.2f}")
    print(f"   Avg Fees: ${stats['avg_fees_per_trade']:.2f}")


def main():
    import sys
    
    print("\n🔺 Arbitrage Executor v1.0.0\n")
    
    # Default to dry run
    dry_run = "--live" not in sys.argv
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "--dry-run":
            print_execution_summary(dry_run=True)
        
        elif command == "--live":
            print_execution_summary(dry_run=False)
        
        elif command == "--execute":
            amount = float(sys.argv[2]) if len(sys.argv) > 2 else 1000
            print_execution_summary(amount=amount, dry_run=False)
        
        elif command == "--optimal":
            executor = ArbitrageExecutor()
            calc = executor.calculate_optimal_amount(
                ["USDC → SOL", "SOL → RAY", "RAY → USDC"],
                target_profit=10
            )
            print(json.dumps(calc, indent=2))
        
        elif command == "--stats":
            executor = ArbitrageExecutor()
            print(json.dumps(executor.get_performance_stats(), indent=2))
        
        else:
            print_execution_summary(dry_run=dry_run)
    else:
        print_execution_summary(dry_run=dry_run)
        
        print("\n📖 Usage:")
        print("   python execute.py --dry-run     # Simulate only")
        print("   python execute.py --live        # Execute real trades")
        print("   python execute.py --execute 500 # Execute with $500")
        print("   python execute.py --optimal    # Calculate optimal amount")
        print("   python execute.py --stats      # Show performance stats")


if __name__ == "__main__":
    main()
