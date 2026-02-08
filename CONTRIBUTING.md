# Contributing to Solana AI City

Welcome! We're excited that you're interested in contributing to Solana AI City. This document provides guidelines and instructions for contributing.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Community](#community)

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ 
- **npm** or **yarn**
- **Git**
- **Solana CLI** (optional, for local development)

### Quick Start

```bash
# 1. Fork the repository
# Visit: https://github.com/xixih6863-ctrl/solana-ai-city/fork

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/solana-ai-city.git
cd solana-ai-city

# 3. Create a feature branch
git checkout -b feature/amazing-new-feature

# 4. Install dependencies
cd frontend && npm install

# 5. Start development server
npm run dev
```

---

## Development Setup

### Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
# .env
VITE_SOLANA_RPC=https://api.mainnet-beta.solana.com
VITE_PROGRAM_ID=your-program-id
VITE_CLUSTER=mainnet-beta
```

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run dev:local   # Start with local RPC

# Building
npm run build        # Production build
npm run preview     # Preview production build

# Testing
npm run test        # Run unit tests
npm run test:watch  # Watch mode
npm run test:coverage # Coverage report

# Linting
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint errors

# Type Checking
npm run type-check  # Run TypeScript compiler check
```

---

## Project Structure

```
solana-ai-city/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ui/          # Base UI components
│   │   │   ├── game/        # Game-specific components
│   │   │   └── web3/        # Web3 components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API and service layers
│   │   ├── stores/          # State management
│   │   ├── types/           # TypeScript definitions
│   │   ├── utils/           # Helper functions
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── public/              # Static assets
│   ├── index.html           # HTML template
│   ├── vite.config.ts       # Vite configuration
│   └── package.json
│
├── programs/                 # Solana programs (Anchor)
│   └── solana-ai-city/
│       ├── src/
│       ├── tests/
│       └── Cargo.toml
│
├── scripts/                  # Utility scripts
├── docs/                    # Documentation
├── .github/                 # GitHub configuration
│   └── workflows/          # CI/CD pipelines
│
├── README.md                # Project README
├── CONTRIBUTING.md          # This file
├── CHANGELOG.md            # Version history
└── package.json            # Root package.json
```

---

## Coding Standards

### TypeScript

We use TypeScript for all code. Always define types for new components and functions.

```typescript
// ❌ Bad
function greet(name) {
  return `Hello, ${name}`;
}

// ✅ Good
interface GreetProps {
  name: string;
}

function greet({ name }: GreetProps): string {
  return `Hello, ${name}`;
}
```

### React Components

Follow these patterns for React components:

```typescript
// ✅ Use functional components
export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick,
  variant = 'primary',
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// ✅ Use TypeScript interfaces
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

// ✅ Export components individually
export { Button };
export { ResourcePanel };
```

### CSS/Styling

We use Tailwind CSS for styling. Follow these guidelines:

```tsx
// ✅ Use Tailwind classes
<div className="flex items-center justify-between p-4 bg-surface rounded-lg">

// ✅ Use design system colors
<div className="text-primary bg-surface-light">

// ✅ Keep classes organized
<div className="
  flex items-center justify-between
  p-4 bg-surface rounded-lg
  hover:bg-primary transition-colors
">
```

### Web3/Solana

Follow these patterns for blockchain interactions:

```typescript
// ✅ Use wallet adapter
import { useWallet } from '@solana/wallet-adapter-react';

// ✅ Always validate inputs
if (!publicKey) {
  throw new Error('Wallet not connected');
}

// ✅ Handle errors gracefully
try {
  await sendTransaction(connection, wallet, transaction);
} catch (error) {
  console.error('Transaction failed:', error);
}

// ✅ Use proper connection config
const connection = new Connection(RPC_ENDPOINT, {
  commitment: 'confirmed',
});
```

---

## Submitting Changes

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

Examples:
feat(game): add new building type
fix(wallet): resolve connection timeout
docs(readme): update installation instructions
refactor(components): improve performance
test(achievements): add unit tests
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Formatting (no code change)
- **refactor**: Code restructuring
- **perf**: Performance improvement
- **test**: Adding tests
- **chore**: Maintenance

### Pull Request Process

1. **Create a Pull Request**
   ```bash
   git checkout -b feature/amazing-feature
   git commit -m "feat: add amazing feature"
   git push origin feature/amazing-feature
   ```

2. **Fill in the PR Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   Describe how you tested the changes

   ## Screenshots
   Add screenshots if applicable

   ## Checklist
   - [ ] My code follows the style guidelines
   - [ ] I have performed a self-review
   - [ ] I have commented complex code
   - [ ] I have made corresponding changes
   - [ ] My changes generate no new warnings
   ```

3. **Review Process**
   - Address any feedback
   - Keep PRs focused and small
   - Squash commits before merging

---

## Code Review Guidelines

### For Reviewers

- Be respectful and constructive
- Focus on the code, not the person
- Explain the "why" behind suggestions
- Offer alternatives when pointing out issues
- Acknowledge good work

### For Contributors

- Respond to all comments
- Don't take feedback personally
- Ask questions if unclear
- Keep discussions focused
- Be patient with the review process

---

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and ideas
- **Discord**: Real-time chat (link in README)

### First-Time Contributors

Looking for places to start?

- [Good First Issues](https://github.com/xixih6863-ctrl/solana-ai-city/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
- [Documentation Improvements](https://github.com/xixih6863-ctrl/solana-ai-city/issues?q=is%3Aissue+is%3Aopen+label%3Adocumentation)
- [Easy Fixes](https://github.com/xixih6863-ctrl/solana-ai-city/issues?q=is%3Aissue+is%3Aopen+label%3Aeasy)

---

## Recognition

Contributors are recognized in:

- [AUTHORS.md](AUTHORS.md)
- [CHANGELOG.md](CHANGELOG.md)
- Project README
- Release announcements

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

## Questions?

If you have questions, feel free to:

1. Check existing [Issues](https://github.com/xixih6863-ctrl/solana-ai-city/issues)
2. Start a [Discussion](https://github.com/xixih6863-ctrl/solana-ai-city/discussions)
3. Reach out on [Discord](https://discord.gg/)

Thank you for contributing! 🎉
