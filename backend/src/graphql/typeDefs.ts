import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # ============================================
  # Scalars
  # ============================================

  scalar DateTime
  scalar JSON

  # ============================================
  # Enums
  # ============================================

  enum QuestType {
    DAILY
    WEEKLY
    STORY
    CHALLENGE
  }

  enum QuestStatus {
    NOT_STARTED
    IN_PROGRESS
    COMPLETED
    CLAIMED
  }

  enum AchievementRarity {
    COMMON
    UNCOMMON
    RARE
    EPIC
    LEGENDARY
  }

  enum TradeStatus {
    PENDING
    ACCEPTED
    REJECTED
    EXPIRED
    CANCELLED
  }

  enum ResourceType {
    GOLD
    ENERGY
    POPULATION
    TOKENS
  }

  # ============================================
  # Types
  # ============================================

  type User {
    id: ID!
    walletAddress: String!
    username: String!
    avatar: String
    level: Int!
    experience: Int!
    gold: Int!
    energy: Float!
    population: Int!
    points: Int!
    rank: Int
    achievements: [Achievement!]!
    friends: [User!]!
    city: City
    lastActive: DateTime
    createdAt: DateTime!
  }

  type City {
    id: ID!
    owner: User!
    name: String!
    description: String
    buildings: [Building!]!
    resources: CityResources!
    grid: [[Int!]!]!
    settings: CitySettings!
    stats: CityStats!
    lastSave: DateTime
    createdAt: DateTime!
  }

  type Building {
    id: ID!
    type: String!
    position: Position!
    level: Int!
    builtAt: DateTime!
    upgradedAt: DateTime
    stats: BuildingStats!
  }

  type Position {
    x: Int!
    y: Int!
  }

  type BuildingStats {
    goldProduction: Int!
    energyProduction: Int!
    population: Int!
    upgradeCost: Int!
  }

  type CityResources {
    gold: Int!
    energy: Float!
    population: Int!
    tokens: Float!
  }

  type CitySettings {
    isPublic: Boolean!
    allowVisitors: Boolean!
  }

  type CityStats {
    totalBuildings: Int!
    totalValue: Int!
    buildingsLevel: Int!
  }

  type Quest {
    id: ID!
    title: String!
    description: String!
    type: QuestType!
    category: String
    difficulty: Int!
    requirements: [QuestRequirement!]!
    rewards: QuestRewards!
    timeLimit: Int
    prerequisites: [ID!]
    isActive: Boolean!
  }

  type QuestRequirement {
    type: String!
    target: String!
    value: Int!
  }

  type QuestRewards {
    gold: Int
    xp: Int
    tokens: Float
    achievement: Achievement
  }

  type UserQuest {
    id: ID!
    quest: Quest!
    status: QuestStatus!
    progress: [QuestProgress!]!
    startedAt: DateTime
    completedAt: DateTime
    claimedAt: DateTime
  }

  type QuestProgress {
    type: String!
    current: Int!
  }

  type Achievement {
    id: ID!
    name: String!
    description: String!
    icon: String!
    category: String!
    rarity: AchievementRarity!
    requirements: [AchievementRequirement!]!
    rewards: [AchievementReward!]!
    isSecret: Boolean!
    mintedCount: Int!
  }

  type AchievementRequirement {
    type: String!
    target: String!
    value: Int!
  }

  type AchievementReward {
    type: String!
    value: Float!
  }

  type AchievementNFT {
    id: ID!
    achievement: Achievement!
    mintedAt: DateTime!
    metadata: JSON!
    transactionSignature: String!
  }

  type Trade {
    id: ID!
    fromUser: User!
    toUser: User!
    offer: [TradeItem!]!
    request: [TradeItem!]!
    status: TradeStatus!
    expiresAt: DateTime!
    completedAt: DateTime
  }

  type TradeItem {
    type: String!
    itemId: String!
    name: String!
    quantity: Int!
  }

  type WalletBalance {
    sol: Float!
    tokens: [TokenBalance!]!
    nfts: [NFTBalance!]!
  }

  type TokenBalance {
    mint: String!
    symbol: String!
    amount: Float!
    decimals: Int!
  }

  type NFTBalance {
    mint: String!
    name: String!
    symbol: String
    uri: String
  }

  type LeaderboardEntry {
    rank: Int!
    user: User!
    points: Int!
    cityName: String
    change: Int
  }

  type GameStats {
    totalPlayers: Int!
    totalCities: Int!
    totalBuildings: Int!
    activeQuests: Int!
    totalTrades: Int!
  }

  # ============================================
  # Inputs
  # ============================================

  input RegisterInput {
    walletAddress: String!
    username: String!
    email: String
  }

  input UpdateProfileInput {
    username: String
    avatar: String
    settings: UserSettingsInput
  }

  input UserSettingsInput {
    notifications: Boolean
    publicProfile: Boolean
    showOnLeaderboard: Boolean
  }

  input BuildInput {
    buildingType: String!
    position: PositionInput!
  }

  input PositionInput {
    x: Int!
    y: Int!
  }

  input UpgradeInput {
    buildingId: ID!
  }

  input DemolishInput {
    buildingId: ID!
  }

  input CitySettingsInput {
    isPublic: Boolean
    allowVisitors: Boolean
  }

  input TradeOfferInput {
    toUserId: ID!
    offer: [TradeItemInput!]!
    request: [TradeItemInput!]!
    expiresInHours: Int
  }

  input TradeItemInput {
    type: String!
    itemId: String!
    name: String!
    quantity: Int!
  }

  # ============================================
  # Queries
  # ============================================

  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!
    leaderboard(limit: Int, offset: Int): [LeaderboardEntry!]!
    
    # City queries
    myCity: City
    city(id: ID!): City
    publicCities(limit: Int, offset: Int): [City!]!
    
    # Quest queries
    quests(type: QuestType): [Quest!]!
    myQuests: [UserQuest!]!
    quest(id: ID!): Quest
    
    # Achievement queries
    achievements(category: String): [Achievement!]!
    myAchievements: [Achievement!]!
    achievement(id: ID!): Achievement
    myNFTs: [AchievementNFT!]!
    
    # Trade queries
    trades: [Trade!]!
    pendingTrades: [Trade!]!
    
    # Wallet queries
    walletBalance: WalletBalance!
    
    # Game stats
    gameStats: GameStats!
  }

  # ============================================
  # Mutations
  # ============================================

  type Mutation {
    # Auth mutations
    register(input: RegisterInput!): AuthPayload!
    login(walletAddress: String!): AuthPayload!
    updateProfile(input: UpdateProfileInput!): User!
    
    # City mutations
    build(input: BuildInput!): Building!
    upgrade(input: UpgradeInput!): Building!
    demolish(input: DemolishInput!): DemolishResult!
    updateCitySettings(input: CitySettingsInput!): City!
    collectResources(type: ResourceType!): CollectResult!
    
    # Quest mutations
    acceptQuest(questId: ID!): UserQuest!
    completeQuest(questId: ID!): QuestCompletionResult!
    claimQuestReward(questId: ID!): UserQuest!
    
    # Trade mutations
    createTrade(input: TradeOfferInput!): Trade!
    acceptTrade(tradeId: ID!): Trade!
    rejectTrade(tradeId: ID!): Trade!
    cancelTrade(tradeId: ID!): Trade!
    
    # Wallet mutations
    syncWallet(walletAddress: String!): User!
    requestAirdrop(amount: Float): TransactionResult!
    
    # NFT mutations
    mintAchievement(achievementId: ID!): AchievementNFT!
  }

  # ============================================
  # Subscriptions
  # ============================================

  type Subscription {
    cityUpdated: City!
    tradeReceived: Trade!
    questUpdated: UserQuest!
    leaderboardUpdated: [LeaderboardEntry!]!
  }

  # ============================================
  # Payloads
  # ============================================

  type AuthPayload {
    token: String!
    user: User!
  }

  type DemolishResult {
    success: Boolean!
    refund: Int!
    message: String
  }

  type CollectResult {
    success: Boolean!
    collected: Float!
    newBalance: Float!
  }

  type QuestCompletionResult {
    success: Boolean!
    rewards: QuestRewards!
    leveledUp: Boolean!
    newLevel: Int
  }

  type TransactionResult {
    success: Boolean!
    signature: String
    message: String
  }
`;

export default typeDefs;
