#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import ora from 'ora';
import chalk from 'chalk';
import figlet from 'figlet';

const program = new Command();

// ============================================
// Utility Functions
// ============================================

function runCommand(command: string, cwd?: string) {
  try {
    execSync(command, { cwd, stdio: 'inherit', shell: true });
  } catch (error) {
    console.error(chalk.red(`Error running command: ${command}`));
    process.exit(1);
  }
}

async function confirm(message: string): Promise<boolean> {
  const { confirm: result } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message,
      default: false,
    },
  ]);
  return result;
}

// ============================================
// Display Banner
// ============================================

console.log(
  chalk.cyan(figlet.textSync('Solana AI City', { font: 'Big' }))
);
console.log(chalk.gray('━'.repeat(50)));
console.log(chalk.green('CLI Tool v1.0.0'));
console.log(chalk.gray('━'.repeat(50)));
console.log();

// ============================================
// Commands
// ============================================

// Development
program
  .command('dev')
  .description('Start development environment')
  .option('--frontend', 'Start only frontend')
  .option('--backend', 'Start only backend')
  .action(async (options) => {
    console.log(chalk.blue('\n🚀 Starting development environment...\n'));
    
    if (options.frontend) {
      console.log(chalk.yellow('Starting frontend...'));
      runCommand('cd frontend && npm run dev');
    } else if (options.backend) {
      console.log(chalk.yellow('Starting backend...'));
      runCommand('cd backend && npm run dev');
    } else {
      runCommand('npm run dev');
    }
  });

// Build
program
  .command('build')
  .description('Build all services')
  .option('--frontend', 'Build only frontend')
  .option('--backend', 'Build only backend')
  .action(async (options) => {
    const spinner = ora('Building...').start();
    
    try {
      if (options.frontend) {
        spinner.text = 'Building frontend...';
        runCommand('cd frontend && npm run build');
      } else if (options.backend) {
        spinner.text = 'Building backend...';
        runCommand('cd backend && npm run build');
      } else {
        spinner.text = 'Building frontend...';
        runCommand('npm run build:frontend');
        spinner.succeed();
        spinner.start('Building backend...');
        runCommand('npm run build:backend');
      }
      spinner.succeed(chalk.green('Build complete!'));
    } catch (error) {
      spinner.fail(chalk.red('Build failed!'));
      process.exit(1);
    }
  });

// Docker
program
  .command('docker:up')
  .description('Start Docker containers')
  .action(async () => {
    const spinner = ora('Starting Docker containers...').start();
    try {
      runCommand('docker-compose up -d');
      spinner.succeed(chalk.green('Docker containers started!'));
      console.log(chalk.blue('\n📦 Services:'));
      console.log('  - Frontend: http://localhost:3000');
      console.log('  - Backend:  http://localhost:4000');
      console.log('  - API:      http://localhost:4000/api');
      console.log('  - GraphQL:  http://localhost:4000/graphql');
      console.log('  - Grafana:  http://localhost:3001');
    } catch (error) {
      spinner.fail(chalk.red('Failed to start Docker!'));
    }
  });

program
  .command('docker:down')
  .description('Stop Docker containers')
  .action(async () => {
    const spinner = ora('Stopping Docker containers...').start();
    try {
      runCommand('docker-compose down');
      spinner.succeed(chalk.green('Docker containers stopped!'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to stop Docker!'));
    }
  });

program
  .command('docker:logs')
  .description('View Docker logs')
  .option('--frontend', 'Frontend logs')
  .option('--backend', 'Backend logs')
  .action(async (options) => {
    if (options.frontend) {
      runCommand('docker-compose logs -f frontend');
    } else if (options.backend) {
      runCommand('docker-compose logs -f backend');
    } else {
      runCommand('docker-compose logs -f');
    }
  });

// Database
program
  .command('db:migrate')
  .description('Run database migrations')
  .action(async () => {
    const spinner = ora('Running migrations...').start();
    try {
      runCommand('cd backend && npm run migrate');
      spinner.succeed(chalk.green('Migrations complete!'));
    } catch (error) {
      spinner.fail(chalk.red('Migration failed!'));
    }
  });

program
  .command('db:seed')
  .description('Seed database with initial data')
  .action(async () => {
    const spinner = ora('Seeding database...').start();
    try {
      runCommand('cd backend && npm run seed');
      spinner.succeed(chalk.green('Database seeded!'));
    } catch (error) {
      spinner.fail(chalk.red('Seeding failed!'));
    }
  });

program
  .command('db:reset')
  .description('Reset database (WARNING: deletes all data)')
  .action(async () => {
    const confirmed = await confirm(chalk.red('⚠️  This will DELETE all data. Continue?'));
    if (confirmed) {
      const spinner = ora('Resetting database...').start();
      try {
        runCommand('cd backend && npm run db:reset');
        spinner.succeed(chalk.green('Database reset!'));
      } catch (error) {
        spinner.fail(chalk.red('Reset failed!'));
      }
    }
  });

// Testing
program
  .command('test')
  .description('Run all tests')
  .option('--frontend', 'Test only frontend')
  .option('--backend', 'Test only backend')
  .option('--coverage', 'Generate coverage report')
  .action(async (options) => {
    const spinner = ora('Running tests...').start();
    try {
      if (options.frontend) {
        runCommand('cd frontend && npm run test');
      } else if (options.backend) {
        runCommand('cd backend && npm run test');
      } else {
        runCommand('npm run test');
      }
      spinner.succeed(chalk.green('Tests complete!'));
    } catch (error) {
      spinner.fail(chalk.red('Tests failed!'));
    }
  });

// Linting
program
  .command('lint')
  .description('Run linters')
  .action(() => {
    console.log(chalk.blue('\n🔍 Running linters...\n'));
    runCommand('npm run lint');
    console.log(chalk.green('\n✅ Linting complete!'));
  });

// Deploy
program
  .command('deploy')
  .description('Deploy to production')
  .option('--platform <platform>', 'Deployment platform (vercel|railway|docker)')
  .action(async (options) => {
    console.log(chalk.blue('\n🚀 Starting deployment...\n'));
    
    const platform = options.platform || 'vercel';
    
    switch (platform) {
      case 'vercel':
        console.log(chalk.yellow('Deploying to Vercel...'));
        runCommand('vercel --prod');
        break;
      case 'railway':
        console.log(chalk.yellow('Deploying to Railway...'));
        runCommand('railway up');
        break;
      case 'docker':
        console.log(chalk.yellow('Building Docker images...'));
        runCommand('docker-compose -f docker-compose.prod.yml build');
        runCommand('docker-compose -f docker-compose.prod.yml push');
        break;
      default:
        console.log(chalk.red(`Unknown platform: ${platform}`));
    }
    
    console.log(chalk.green('\n✅ Deployment complete!'));
  });

// Dashboard
program
  .command('dashboard')
  .description('Open monitoring dashboards')
  .action(() => {
    console.log(chalk.blue('\n📊 Opening dashboards...\n'));
    console.log('1. Grafana:      http://localhost:3001');
    console.log('2. Prometheus:   http://localhost:9090');
    console.log('3. Health:       http://localhost:4000/health');
    console.log();
  });

// Status
program
  .command('status')
  .description('Check application status')
  .action(async () => {
    console.log(chalk.blue('\n📊 Checking status...\n'));
    
    const checks = [
      { name: 'Frontend', url: 'http://localhost:3000' },
      { name: 'Backend', url: 'http://localhost:4000/health' },
      { name: 'MongoDB', cmd: 'docker exec solana-ai-city-db pg_isready' },
      { name: 'Redis', cmd: 'docker exec solana-ai-city-redis ping' },
    ];

    for (const check of checks) {
      try {
        if (check.cmd) {
          execSync(check.cmd, { stdio: 'pipe' });
          console.log(chalk.green(`✅ ${check.name}`));
        } else {
          const response = await fetch(check.url);
          if (response.ok) {
            console.log(chalk.green(`✅ ${check.name}`));
          } else {
            console.log(chalk.red(`❌ ${check.name} - ${response.statusText}`));
          }
        }
      } catch (error) {
        console.log(chalk.red(`❌ ${check.name} - Not running`));
      }
    }
  });

// Create Admin User
program
  .command('create:admin')
  .description('Create an admin user')
  .action(async () => {
    const { username, walletAddress, email } = await inquirer.prompt([
      { type: 'input', name: 'username', message: 'Username:' },
      { type: 'input', name: 'walletAddress', message: 'Wallet Address:' },
      { type: 'input', name: 'email', message: 'Email (optional):' },
    ]);

    const spinner = ora('Creating admin user...').start();
    try {
      // This would call the backend API
      runCommand(`cd backend && npm run create:admin -- --username=${username} --wallet=${walletAddress} --email=${email}`);
      spinner.succeed(chalk.green('Admin user created!'));
    } catch (error) {
      spinner.fail(chalk.red('Failed to create admin!'));
    }
  });

// Generate API Key
program
  .command('generate:apikey')
  .description('Generate a new API key')
  .action(() => {
    const apiKey = crypto.randomUUID();
    console.log(chalk.green('\n🔑 New API Key:'));
    console.log(chalk.yellow(apiKey));
    console.log(chalk.gray('\n⚠️  Save this key - it won\'t be shown again!\n'));
  });

// Help
program
  .command('help')
  .description('Show help')
  .action(() => {
    program.outputHelp();
  });

// ============================================
// Parse Arguments
// ============================================

program.parse(process.argv);

// ============================================
// Handle No Command
// ============================================

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
