"""
Solana AI City - AI Module

AI-powered city optimization and strategy management
"""

import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import random
import json


class CityStrategy(Enum):
    BALANCED = "balanced"
    ECONOMY = "economy"
    POPULATION = "population"
    MILITARY = "military"
    RESEARCH = "research"


@dataclass
class CityState:
    resources: Dict[str, float]
    population: float
    buildings: Dict[str, int]
    score: float
    cycle: int
    
    def to_vector(self) -> np.ndarray:
        """Convert city state to feature vector for ML model"""
        features = [
            self.resources.get('gold', 0) / 10000,
            self.resources.get('wood', 0) / 10000,
            self.resources.get('stone', 0) / 10000,
            self.resources.get('food', 0) / 10000,
            self.resources.get('energy', 0) / 10000,
            self.population / 10000,
            self.buildings.get('house', 0) / 100,
            self.buildings.get('farm', 0) / 100,
            self.buildings.get('mine', 0) / 50,
            self.buildings.get('factory', 0) / 30,
            self.score / 100000,
        ]
        return np.array(features)


class AICityManager:
    """
    AI Manager for Solana AI City
    
    Responsibilities:
    - Optimize city development
    - Predict optimal builds
    - Manage resource allocation
    - Learn from player behavior
    """
    
    def __init__(self, ai_level: int = 1):
        self.ai_level = ai_level
        self.strategy = CityStrategy.BALANCED
        self.learning_rate = 0.1
        self.weights = self        self.history._initialize_weights()
: List[Dict] = []
        
    def _initialize_weights(self) -> np.ndarray:
        """Initialize ML model weights"""
        return np.random.randn(15) * 0.1
    
    def get_optimal_build(
        self, 
        city_state: CityState,
        available_resources: Dict[str, float]
    ) -> Tuple[str, float]:
        """
        Predict optimal building to construct
        
        Returns:
            building_type: Best building to build
            confidence: Model confidence score
        """
        features = self._extract_features(city_state, available_resources)
        scores = self._predict_scores(features)
        
        # Filter by available resources
        building_costs = {
            'house': {'gold': 100, 'wood': 50, 'stone': 25},
            'farm': {'gold': 50, 'wood': 100, 'stone': 0},
            'mine': {'gold': 200, 'wood': 50, 'stone': 100},
            'lumber_mill': {'gold': 100, 'wood': 50, 'stone': 25},
            'power_plant': {'gold': 300, 'wood': 100, 'stone': 150},
            'factory': {'gold': 500, 'wood': 250, 'stone': 200},
        }
        
        # Score each building based on strategy
        building_scores = {}
        for building, cost in building_costs.items():
            # Check affordability
            if all(available_resources.get(r, 0) >= v for r, v in cost.items()):
                base_score = scores.get(building, 0.5)
                strategy_bonus = self._get_strategy_bonus(building)
                building_scores[building] = base_score * (1 + strategy_bonus)
        
        if not building_scores:
            return 'house', 0.0
        
        best_building = max(building_scores, key=building_scores.get)
        confidence = building_scores[best_building] / max(building_scores.values())
        
        return best_building, confidence
    
    def predict_resource_needs(
        self, 
        city_state: CityState,
        horizon: int = 10
    ) -> Dict[str, float]:
        """
        Predict resource needs for next N cycles
        
        Returns:
            resource_needs: Daily resource requirements
        """
        current_needs = {
            'gold': city_state.population * 0.5,
            'food': city_state.population * 0.1,
            'energy': sum(city_state.buildings.values()) * 2,
        }
        
        # Adjust for strategy
        strategy_multiplier = self._get_strategy_multiplier()
        adjusted_needs = {
            k: v * strategy_multiplier for k, v in current_needs.items()
        }
        
        # Predict future needs based on growth
        growth_rate = 1.05  # 5% growth per cycle
        future_needs = {
            k: sum(v * (growth_rate ** i) for i in range(horizon))
            for k, v in adjusted_needs.items()
        }
        
        return future_needs
    
    def optimize_production(
        self,
        city_state: CityState,
        target_output: Dict[str, float]
    ) -> Dict[str, float]:
        """
        Optimize production allocation for target output
        
        Returns:
            production_plan: Optimal production allocation
        """
        # Calculate efficiency based on buildings
        production_efficiency = {
            'gold': 1.0 + (city_state.buildings.get('mine', 0) * 0.1,
            'wood': 1.0 + (city_state.buildings.get('lumber_mill', 0) * 0.1,
            'stone': 1.0 + (city_state.buildings.get('mine', 0) * 0.05,
            'food': 1.0 + (city_state.buildings.get('farm', 0) * 0.1,
            'energy': 1.0 + (city_state.buildings.get('power_plant', 0) * 0.15,
        }
        
        # Apply AI bonus
        ai_bonus = 1 + (self.ai_level * 0.05)
        
        production_plan = {}
        for resource, target in target_output.items():
            efficiency = production_efficiency.get(resource, 1.0)
            production_plan[resource] = target / (efficiency * ai_bonus)
        
        return production_plan
    
    def recommend_strategy(self, city_state: CityState) -> CityStrategy:
        """
        Recommend best city strategy based on current state
        """
        scores = {
            CityStrategy.ECONOMY: 0.0,
            CityStrategy.POPULATION: 0.0,
            CityStrategy.RESEARCH: 0.0,
            CityStrategy.MILITARY: 0.0,
            CityStrategy.BALANCED: 0.5,
        }
        
        # Score based on current resources
        resource_score = sum(city_state.resources.values()) / 50000
        
        # Score based on population
        population_score = city_state.population / 10000
        
        # Score based on buildings
        economy_score = city_state.buildings.get('mine', 0) + city_state.buildings.get('factory', 0)
        population_building_score = city_state.buildings.get('house', 0)
        research_score = city_state.buildings.get('research_lab', 0)
        
        # Adjust scores
        scores[CityStrategy.ECONOMY] = economy_score / 100 + resource_score
        scores[CityStrategy.POPULATION] = population_building_score / 50 + population_score
        scores[CityStrategy.RESEARCH] = research_score / 20
        scores[CityStrategy.BALANCED] = (economy_score + population_building_score + research_score) / 150 + 0.3
        
        # Recommend best strategy
        best_strategy = max(scores, key=scores.get)
        
        return best_strategy
    
    def analyze_market(
        self,
        prices: Dict[str, float],
        city_state: CityState
    ) -> Dict[str, Dict[str, float]]:
        """
        Analyze market conditions and recommend trades
        
        Returns:
            recommendations: Buy/sell recommendations for each resource
        """
        recommendations = {}
        
        # Calculate fair value based on city needs
        fair_values = self._estimate_fair_values(city_state)
        
        for resource, current_price in prices.items():
            fair_value = fair_values.get(resource, 100)
            
            if current_price < fair_value * 0.8:
                # Undervalued - recommend buy
                recommendations[resource] = {
                    'action': 'buy',
                    'amount': min(
                        city_state.resources.get(resource, 0) * 0.3,
                        (fair_value * 0.8 - current_price) * 10
                    ),
                    'confidence': (fair_value - current_price) / fair_value
                }
            elif current_price > fair_value * 1.2:
                # Overvalued - recommend sell
                recommendations[resource] = {
                    'action': 'sell',
                    'amount': min(
                        city_state.resources.get(resource, 0) * 0.3,
                        (current_price - fair_value * 0.8) * 10
                    ),
                    'confidence': (current_price - fair_value) / current_price
                }
            else:
                # Fair value - hold
                recommendations[resource] = {
                    'action': 'hold',
                    'amount': 0,
                    'confidence': 0.5
                }
        
        return recommendations
    
    def learn_from_outcome(
        self,
        city_state: CityState,
        action: str,
        outcome: float,
        new_state: CityState
    ):
        """Update model weights based on action outcome"""
        features = self._extract_features(city_state, city_state.resources)
        
        # Simple Q-learning update
        prediction = self._predict_single(features, action)
        error = outcome - prediction
        
        # Update weights
        self.weights += self.learning_rate * error * features
        
        # Record history
        self.history.append({
            'state': city_state,
            'action': action,
            'outcome': outcome,
            'new_state': new_state,
            'timestamp': __import__('time').time()
        })
        
        # Limit history
        if len(self.history) > 10000:
            self.history = self.history[-5000:]
    
    def _extract_features(
        self,
        city_state: CityState,
        resources: Dict[str, float]
    ) -> np.ndarray:
        """Extract feature vector from city state"""
        features = city_state.to_vector()
        
        # Add strategy feature
        strategy_map = {
            CityStrategy.BALANCED: 0,
            CityStrategy.ECONOMY: 1,
            CityStrategy.POPULATION: 2,
            CityStrategy.MILITARY: 3,
            CityStrategy.RESEARCH: 4,
        }
        strategy_feature = np.zeros(5)
        strategy_feature[strategy_map[self.strategy]] = 1
        features = np.concatenate([features, strategy_feature])
        
        return features
    
    def _predict_scores(self, features: np.ndarray) -> Dict[str, float]:
        """Predict scores for each building type"""
        buildings = ['house', 'farm', 'mine', 'lumber_mill', 'power_plant', 'factory']
        scores = {}
        
        for i, building in enumerate(buildings):
            # Simple linear model (would be neural network in production)
            base_score = np.dot(features, self.weights[i * 3:(i + 1) * 3])
            scores[building] = 1.0 / (1.0 + np.exp(-base_score))  # Sigmoid
        
        return scores
    
    def _predict_single(self, features: np.ndarray, action: str) -> float:
        """Predict score for single action"""
        building_index = ['house', 'farm', 'mine'].index(action) if action in ['house', 'farm', 'mine'] else 0
        return np.dot(features, self.weights[building_index * 3:(building_index + 1) * 3])
    
    def _get_strategy_bonus(self, building: str) -> float:
        """Get bonus multiplier based on strategy"""
        strategy_bonuses = {
            CityStrategy.ECONOMY: {'mine': 0.3, 'factory': 0.2, 'lumber_mill': 0.2},
            CityStrategy.POPULATION: {'house': 0.3, 'farm': 0.2, 'hospital': 0.2},
            CityStrategy.RESEARCH: {'research_lab': 0.4, 'factory': 0.1},
            CityStrategy.MILITARY: {'defense_tower': 0.3, 'barracks': 0.2},
            CityStrategy.BALANCED: {},
        }
        
        return strategy_bonuses.get(self.strategy, {}).get(building, 0.0)
    
    def _get_strategy_multiplier(self) -> float:
        """Get resource need multiplier based on strategy"""
        multipliers = {
            CityStrategy.ECONOMY: 1.2,
            CityStrategy.POPULATION: 0.8,
            CityStrategy.RESEARCH: 1.1,
            CityStrategy.MILITARY: 1.3,
            CityStrategy.BALANCED: 1.0,
        }
        
        return multipliers.get(self.strategy, 1.0)
    
    def _estimate_fair_values(self, city_state: CityState) -> Dict[str, float]:
        """Estimate fair market values based on city state"""
        base_values = {
            'gold': 1.0,
            'wood': 0.8,
            'stone': 0.6,
            'food': 0.5,
            'energy': 1.2,
        }
        
        # Adjust based on scarcity
        for resource, base_value in base_values.items():
            current = city_state.resources.get(resource, 0)
            if current < 100:
                base_values[resource] = base_value * 2
            elif current > 5000:
                base_values[resource] = base_value * 0.5
        
        return base_values
    
    def set_strategy(self, strategy: CityStrategy):
        """Set city development strategy"""
        self.strategy = strategy
    
    def upgrade_ai(self):
        """Upgrade AI level"""
        self.ai_level = min(10, self.ai_level + 1)
    
    def get_ai_info(self) -> Dict:
        """Get AI manager information"""
        return {
            'level': self.ai_level,
            'strategy': self.strategy.value,
            'learning_rate': self.learning_rate,
            'history_size': len(self.history),
        }
    
    def save_model(self, filepath: str):
        """Save model weights to file"""
        data = {
            'weights': self.weights.tolist(),
            'ai_level': self.ai_level,
            'strategy': self.strategy.value,
            'learning_rate': self.learning_rate,
        }
        with open(filepath, 'w') as f:
            json.dump(data, f)
    
    def load_model(self, filepath: str):
        """Load model weights from file"""
        with open(filepath, 'r') as f:
            data = json.load(f)
        self.weights = np.array(data['weights'])
        self.ai_level = data['ai_level']
        self.strategy = CityStrategy(data['strategy'])
        self.learning_rate = data['learning_rate']


# Convenience function
def create_ai_manager(ai_level: int = 1) -> AICityManager:
    """Create and initialize AI manager"""
    return AICityManager(ai_level=ai_level)


if __name__ == "__main__":
    # Demo usage
    ai = create_ai_manager(ai_level=3)
    
    # Sample city state
    city_state = CityState(
        resources={'gold': 5000, 'wood': 3000, 'stone': 2000, 'food': 5000, 'energy': 3000},
        population=500,
        buildings={'house': 10, 'farm': 5, 'mine': 3},
        score=5000,
        cycle=100
    )
    
    # Get optimal build
    best_building, confidence = ai.get_optimal_build(
        city_state,
        {'gold': 1000, 'wood': 500, 'stone': 200}
    )
    
    print(f"Best building: {best_building}")
    print(f"Confidence: {confidence:.2%}")
    
    # Get strategy recommendation
    recommended_strategy = ai.recommend_strategy(city_state)
    print(f"Recommended strategy: {recommended_strategy.value}")
    
    # Get AI info
    print(f"AI Info: {ai.get_ai_info()}")
