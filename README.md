# 🛒 Integra DApp

<h4 align="center">
  <a href="#features">Features</a> |
  <a href="#quickstart">Quickstart</a> |
  <a href="#usage">Usage Guide</a>
</h4>

🚀 A decentralized marketplace platform built on Ethereum that enables secure trading with comprehensive whitelist management. Integra DApp provides a complete solution for buyers, sellers, and administrators to interact in a trustless environment.

⚙️ Built using NextJS, RainbowKit, Wagmi, Viem, and Typescript.

## Features

- 🏠 **Home Dashboard**: Central hub with overview of all marketplace features and quick navigation
- 📋 **Whitelist Management**: Add, remove, and verify addresses with real-time status checking
- 🛒 **Buyer Marketplace**: Browse assets, filter by category, manage watchlists, and make purchases
- 🏪 **Seller Dashboard**: Create listings, manage inventory, track sales analytics and revenue
- 🔐 **Wallet Integration**: Seamless connection with multiple wallet providers via RainbowKit
- 💎 **Web3 UI Components**: Professional interface with Address displays, Balance checking, and ETH input fields

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Project Structure

```
integra-scaffold/
├── packages/
│   └── nextjs/
│       ├── app/
│       │   ├── page.tsx          # Home dashboard
│       │   ├── whitelist/
│       │   │   └── page.tsx      # Whitelist management
│       │   ├── buyers/
│       │   │   └── page.tsx      # Buyer marketplace
│       │   ├── sellers/
│       │   │   └── page.tsx      # Seller dashboard
│       │   └── debug/            # Smart contract debugging
│       └── components/
│           ├── Header.tsx        # Navigation with custom links
│           └── scaffold-eth/     # Web3 UI components
```

## Quickstart

To get started with Integra DApp, follow the steps below:

1. Install dependencies if it was skipped in CLI:

```bash
cd integra-scaffold
yarn install
```

2. Start your NextJS app:

```bash
yarn start
```

Visit your app on: `http://localhost:3000`. You can explore the marketplace features, manage whitelists, and browse the buyer/seller dashboards. The `Debug Contracts` page allows you to interact with smart contracts once deployed.


## Usage

### 🏠 Home Dashboard
Navigate through the application using the main dashboard. Connect your wallet to get started with marketplace features.

### 📋 Whitelist Management
- **Add Addresses**: Use the address input to add new addresses to the whitelist
- **Check Status**: Verify if an address is whitelisted with real-time validation
- **View Current List**: Browse all currently whitelisted addresses

### 🛒 Buyer Marketplace
- **Browse Assets**: View available items with filtering by category (Art, Gaming, Music)
- **Manage Watchlist**: Add items to your personal watchlist for later viewing
- **Purchase Items**: Buy assets directly through the marketplace interface
- **Track Activity**: Monitor your purchase history and favorite categories

### 🏪 Seller Dashboard
- **Create Listings**: Add new assets with name, price, category, and description
- **Manage Inventory**: Edit or remove your active listings
- **Sales Analytics**: Track revenue, active listings, and total sales
- **Performance Metrics**: View listing views and engagement statistics

### 🔧 Development Notes
- Currently uses mock data for demonstration purposes
- Smart contract integration can be added through the Debug Contracts page
- All UI components are built with Scaffold-ETH's Web3-ready component library

## Built With Scaffold-ETH 2

This project leverages the power of Scaffold-ETH 2 framework. Visit the [Scaffold-ETH docs](https://docs.scaffoldeth.io) to learn more about the underlying technology stack.