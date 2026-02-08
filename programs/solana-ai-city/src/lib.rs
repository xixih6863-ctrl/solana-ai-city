/**
 * Solana AI City - Smart Contract
 * 
 * Core game mechanics for AI-powered city simulation game
 */

use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};
use std::collections::HashMap;

declare_id!("AiCity1111111111111111111111111111111111111");

#[program]
pub mod solana_ai_city {
    use super::*;

    // Initialize the game
    pub fn initialize_game(
        ctx: Context<InitializeGame>,
        params: GameParams,
    ) -> Result<()> {
        let game = &mut ctx.accounts.game;
        
        game.admin = ctx.accounts.admin.key();
        game.token_mint = ctx.accounts.token_mint.key();
        game.treasury = ctx.accounts.treasury.key();
        game.name = params.name;
        game.description = params.description;
        game.max_cities = params.max_cities;
        game.current_cities = 0;
        game.game_state = GameState::Active;
        game.fee_percentage = params.fee_percentage;
        game.reward_pool = 0;
        game.total_buildings = 0;
        game.total_population = 0;
        game.cycle = 0;
        game.last_update = Clock::get()?.unix_timestamp;
        
        Ok(())
    }

    // Create a new city
    pub fn create_city(
        ctx: Context<CreateCity>,
        params: CreateCityParams,
    ) -> Result<()> {
        let city = &mut ctx.accounts.city;
        let game = &ctx.accounts.game;
        
        require!(
            game.current_cities < game.max_cities,
            GameError::CityLimitReached
        );
        
        city.owner = ctx.accounts.owner.key();
        city.name = params.name;
        city.level = 1;
        city.population = 100; // Starting population
        city.resources = CityResources {
            gold: 1000,
            wood: 500,
            stone: 250,
            food: 1000,
            energy: 500,
        };
        city.buildings = Vec::new();
        city.score = 100;
        city.created_at = Clock::get()?.unix_timestamp;
        city.last_updated = Clock::get()?.unix_timestamp;
        city.ai_level = params.ai_level;
        city.strategy = params.strategy;
        
        // Create city token account
        city.token_account = ctx.accounts.city_token.key();
        
        // Mint starter resources
        let city_token = &mut ctx.accounts.city_token;
        city_token.amount = 1000;
        
        // Update game state
        let game = &mut ctx.accounts.game;
        game.current_cities += 1;
        game.total_population += city.population;
        
        emit!(CityCreated {
            city: city.key(),
            owner: city.owner,
            name: city.name,
            level: city.level,
        });
        
        Ok(())
    }

    // Build a structure in the city
    pub fn build_structure(
        ctx: Context<BuildStructure>,
        params: BuildStructureParams,
    ) -> Result<()> {
        let city = &mut ctx.accounts.city;
        let building = &mut ctx.accounts.building;
        let owner = &ctx.accounts.owner;
        let game = &ctx.accounts.game;
        
        // Check resources
        let building_data = get_building_template(params.building_type);
        require!(
            city.resources.gold >= building_data.cost.gold,
            GameError::InsufficientResources
        );
        require!(
            city.resources.wood >= building_data.cost.wood,
            GameError::InsufficientResources
        );
        require!(
            city.resources.stone >= building_data.cost.stone,
            GameError::InsufficientResources
        );
        
        // Deduct resources
        city.resources.gold -= building_data.cost.gold;
        city.resources.wood -= building_data.cost.wood;
        city.resources.stone -= building_data.cost.stone;
        
        // Initialize building
        building.city = city.key();
        building.building_type = params.building_type;
        building.level = 1;
        building.production_rate = building_data.production_rate;
        building.maintenance_cost = building_data.maintenance_cost;
        building.population_bonus = building_data.population_bonus;
        building.resource_bonus = building_data.resource_bonus;
        building.created_at = Clock::get()?.unix_timestamp;
        
        // Add to city's buildings
        city.buildings.push(building.key());
        
        // Update city stats
        city.population += building_data.population_bonus;
        city.score += building_data.score_bonus;
        city.last_updated = Clock::get()?.unix_timestamp;
        
        // Update game stats
        let game = &mut ctx.accounts.game;
        game.total_buildings += 1;
        game.total_population += building_data.population_bonus;
        
        emit!(BuildingBuilt {
            city: city.key(),
            building: building.key(),
            building_type: params.building_type,
            level: 1,
        });
        
        Ok(())
    }

    // Upgrade a structure
    pub fn upgrade_structure(
        ctx: Context<UpgradeStructure>,
        params: UpgradeParams,
    ) -> Result<()> {
        let building = &mut ctx.accounts.building;
        let city = &mut ctx.accounts.city;
        let owner = &ctx.accounts.owner;
        
        require!(
            building.level < params.max_level,
            GameError::MaxLevelReached
        );
        
        let upgrade_cost = calculate_upgrade_cost(building.level);
        
        require!(
            city.resources.gold >= upgrade_cost.gold,
            GameError::InsufficientResources
        );
        require!(
            city.resources.wood >= upgrade_cost.wood,
            GameError::InsufficientResources
        );
        
        // Deduct resources
        city.resources.gold -= upgrade_cost.gold;
        city.resources.wood -= upgrade_cost.wood;
        
        // Upgrade building
        building.level += 1;
        building.production_rate = (building.production_rate * 15) / 10; // +50%
        building.maintenance_cost = (building.maintenance_cost * 12) / 10; // +20%
        
        // Update city
        city.score += 50 * building.level;
        city.last_updated = Clock::get()?.unix_timestamp;
        
        emit!(StructureUpgraded {
            building: building.key(),
            new_level: building.level,
        });
        
        Ok(())
    }

    // Game tick - processes one cycle
    pub fn game_tick(ctx: Context<GameTick>) -> Result<()> {
        let city = &mut ctx.accounts.city;
        let game = &mut ctx.accounts.game;
        
        // AI-based resource production
        let ai_bonus = calculate_ai_bonus(city.ai_level);
        
        // Calculate production from buildings
        let mut production = HashMap::new();
        for building_key in &city.buildings {
            // In real implementation, would fetch building account
            let building_data = get_building_template(BuildingType::House); // Placeholder
            let rate = building_data.production_rate;
            
            for (resource, amount) in rate {
                let ai_amount = (amount as f64 * ai_bonus) as u64;
                *production.entry(resource).or_insert(0) += ai_amount;
            }
        }
        
        // Apply production to resources
        for (resource, amount) in production {
            match resource {
                ResourceType::Gold => city.resources.gold += amount,
                ResourceType::Wood => city.resources.wood += amount,
                ResourceType::Stone => city.resources.stone += amount,
                ResourceType::Food => city.resources.food += amount,
                ResourceType::Energy => city.resources.energy += amount,
            }
        }
        
        // Population growth
        let population_growth = calculate_population_growth(city);
        city.population += population_growth;
        
        // Update game stats
        game.cycle += 1;
        game.total_population += population_growth;
        game.last_update = Clock::get()?.unix_timestamp;
        
        // Distribute rewards
        let reward = calculate_reward(city);
        city.resources.gold += reward;
        
        emit!(GameTickProcessed {
            city: city.key(),
            cycle: game.cycle,
            population: city.population,
            gold: city.resources.gold,
        });
        
        Ok(())
    }

    // AI Strategy Update
    pub fn update_ai_strategy(
        ctx: Context<UpdateAIStrategy>,
        params: AIStrategyParams,
    ) -> Result<()> {
        let city = &mut ctx.accounts.city;
        
        city.ai_level = params.ai_level;
        city.strategy = params.strategy;
        
        emit!(AIStrategyUpdated {
            city: city.key(),
            ai_level: city.ai_level,
            strategy: city.strategy,
        });
        
        Ok(())
    }
}

// ============= Accounts =============

#[account]
pub struct Game {
    pub admin: Pubkey,
    pub token_mint: Pubkey,
    pub treasury: Pubkey,
    pub name: String,
    pub description: String,
    pub max_cities: u32,
    pub current_cities: u32,
    pub game_state: GameState,
    pub fee_percentage: u8,
    pub reward_pool: u64,
    pub total_buildings: u64,
    pub total_population: u64,
    pub cycle: u64,
    pub last_update: i64,
}

#[account]
pub struct City {
    pub owner: Pubkey,
    pub name: String,
    pub level: u8,
    pub population: u64,
    pub resources: CityResources,
    pub buildings: Vec<Pubkey>,
    pub score: u64,
    pub created_at: i64,
    pub last_updated: i64,
    pub ai_level: u8,
    pub strategy: CityStrategy,
    pub token_account: Pubkey,
}

#[account]
pub struct Building {
    pub city: Pubkey,
    pub building_type: BuildingType,
    pub level: u8,
    pub production_rate: HashMap<ResourceType, u64>,
    pub maintenance_cost: HashMap<ResourceType, u64>,
    pub population_bonus: u64,
    pub resource_bonus: HashMap<ResourceType, u64>,
    pub created_at: i64,
}

// ============= Enums & Structs =============

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum GameState {
    Inactive,
    Active,
    Paused,
    Ended,
}

#[derive(Clone, Copy, PartialEq)]
pub enum BuildingType {
    House,
    Farm,
    Mine,
    LumberMill,
    PowerPlant,
    Factory,
    Hospital,
    School,
    ResearchLab,
    TradingPost,
    DefenseTower,
}

#[derive(Clone, Copy, PartialEq)]
pub enum ResourceType {
    Gold,
    Wood,
    Stone,
    Food,
    Energy,
}

#[derive(Clone, Copy)]
pub enum CityStrategy {
    Balanced,        // Equal focus on all areas
    EconomyFocus,     // Focus on gold/resources
    PopulationFocus, // Focus on population growth
    MilitaryFocus,   // Focus on defense
    ResearchFocus,   // Focus on AI research
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct GameParams {
    pub name: String,
    pub description: String,
    pub max_cities: u32,
    pub fee_percentage: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateCityParams {
    pub name: String,
    pub ai_level: u8,
    pub strategy: CityStrategy,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct BuildStructureParams {
    pub building_type: BuildingType,
    pub location_x: u16,
    pub location_y: u16,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpgradeParams {
    pub max_level: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct AIStrategyParams {
    pub ai_level: u8,
    pub strategy: CityStrategy,
}

#[derive(Clone)]
pub struct CityResources {
    pub gold: u64,
    pub wood: u64,
    pub stone: u64,
    pub food: u64,
    pub energy: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct BuildingCost {
    pub gold: u64,
    pub wood: u64,
    pub stone: u64,
}

// ============= Contexts =============

#[derive(Accounts)]
pub struct InitializeGame<'info> {
    #[account(init, payer = admin, space = 8 + 2000)]
    pub game: Account<'info, Game>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_mint: Account<'info, anchor_spl::token::Mint>,
    #[account(init, payer = admin, space = 1000)]
    pub treasury: Account<'info, TokenAccount>,
}

#[derive(Accounts)]
pub struct CreateCity<'info> {
    #[account(mut)]
    pub game: Account<'info, Game>,
    #[account(init, payer = owner, space = 8 + 2000)]
    pub city: Account<'info, City>,
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(init, payer = owner, space = 200)]
    pub city_token: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BuildStructure<'info> {
    #[account(mut)]
    pub city: Account<'info, City>,
    #[account(init, payer = owner, space = 500)]
    pub building: Account<'info, Building>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub game: Account<'info, Game>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpgradeStructure<'info> {
    #[account(mut)]
    pub building: Account<'info, Building>,
    #[account(mut)]
    pub city: Account<'info, City>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct GameTick<'info> {
    #[account(mut)]
    pub city: Account<'info, City>,
    #[account(mut)]
    pub game: Account<'info, Game>,
}

#[derive(Accounts)]
pub struct UpdateAIStrategy<'info> {
    #[account(mut)]
    pub city: Account<'info, City>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

// ============= Errors =============

#[error_code]
pub enum GameError {
    #[msg("City limit has been reached")]
    CityLimitReached,
    
    #[msg("Insufficient resources to perform this action")]
    InsufficientResources,
    
    #[msg("Building has reached maximum level")]
    MaxLevelReached,
    
    #[msg("Invalid building type")]
    InvalidBuildingType,
    
    #[msg("Not authorized to perform this action")]
    Unauthorized,
    
    #[msg("Game is not in active state")]
    GameNotActive,
}

// ============= Helper Functions =============

fn get_building_template(building_type: BuildingType) -> BuildingData {
    match building_type {
        BuildingType::House => BuildingData {
            cost: BuildingCost { gold: 100, wood: 50, stone: 25 },
            production_rate: HashMap::new(),
            maintenance_cost: HashMap::new(),
            population_bonus: 50,
            resource_bonus: HashMap::new(),
            score_bonus: 10,
        },
        BuildingType::Farm => BuildingData {
            cost: BuildingCost { gold: 50, wood: 100, stone: 0 },
            production_rate: vec![(ResourceType::Food, 10)].into_iter().collect(),
            maintenance_cost: HashMap::new(),
            population_bonus: 10,
            resource_bonus: vec![(ResourceType::Food, 5)].into_iter().collect(),
            score_bonus: 15,
        },
        BuildingType::Mine => BuildingData {
            cost: BuildingCost { gold: 200, wood: 50, stone: 100 },
            production_rate: vec![(ResourceType::Gold, 5), (ResourceType::Stone, 10)].into_iter().collect(),
            maintenance_cost: vec![(ResourceType::Energy, 5)].into_iter().collect(),
            population_bonus: 0,
            resource_bonus: HashMap::new(),
            score_bonus: 20,
        },
        BuildingType::LumberMill => BuildingData {
            cost: BuildingCost { gold: 100, wood: 50, stone: 25 },
            production_rate: vec![(ResourceType::Wood, 15)].into_iter().collect(),
            maintenance_cost: HashMap::new(),
            population_bonus: 5,
            resource_bonus: HashMap::new(),
            score_bonus: 15,
        },
        BuildingType::PowerPlant => BuildingData {
            cost: BuildingCost { gold: 300, wood: 100, stone: 150 },
            production_rate: vec![(ResourceType::Energy, 20)].into_iter().collect(),
            maintenance_cost: HashMap::new(),
            population_bonus: 10,
            resource_bonus: HashMap::new(),
            score_bonus: 25,
        },
        _ => BuildingData {
            cost: BuildingCost { gold: 500, wood: 250, stone: 250 },
            production_rate: HashMap::new(),
            maintenance_cost: HashMap::new(),
            population_bonus: 20,
            resource_bonus: HashMap::new(),
            score_bonus: 30,
        },
    }
}

fn calculate_upgrade_cost(level: u8) -> BuildingCost {
    let multiplier = 2u64.pow(level as u32);
    BuildingCost {
        gold: 200 * multiplier,
        wood: 100 * multiplier,
        stone: 100 * multiplier,
    }
}

fn calculate_ai_bonus(ai_level: u8) -> f64 {
    1.0 + (ai_level as f64 * 0.1)
}

fn calculate_population_growth(city: &City) -> u64 {
    let food_factor = if city.resources.food > city.population * 2 {
        1.2
    } else if city.resources.food > city.population {
        1.0
    } else {
        0.5
    };
    
    let housing_factor = (city.buildings.len() as f64 / 10.0).min(2.0);
    
    let base_growth = city.population / 100;
    (base_growth as f64 * food_factor * housing_factor) as u64
}

fn calculate_reward(city: &City) -> u64 {
    city.score / 1000
}

// ============= Events =============

#[event]
pub struct CityCreated {
    pub city: Pubkey,
    pub owner: Pubkey,
    pub name: String,
    pub level: u8,
}

#[event]
pub struct BuildingBuilt {
    pub city: Pubkey,
    pub building: Pubkey,
    pub building_type: BuildingType,
    pub level: u8,
}

#[event]
pub struct StructureUpgraded {
    pub building: Pubkey,
    pub new_level: u8,
}

#[event]
pub struct GameTickProcessed {
    pub city: Pubkey,
    pub cycle: u64,
    pub population: u64,
    pub gold: u64,
}

#[event]
pub struct AIStrategyUpdated {
    pub city: Pubkey,
    pub ai_level: u8,
    pub strategy: CityStrategy,
}

// ============= Struct Definitions =============

struct BuildingData {
    cost: BuildingCost,
    production_rate: HashMap<ResourceType, u64>,
    maintenance_cost: HashMap<ResourceType, u64>,
    population_bonus: u64,
    resource_bonus: HashMap<ResourceType, u64>,
    score_bonus: u64,
}
