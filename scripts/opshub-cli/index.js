#!/usr/bin/env node

const { Command } = require('commander');
const fetch = require('node-fetch');
const { Firestore } = require('@google-cloud/firestore');
const fs = require('fs');
const path = require('path');

const program = new Command();

// Load config
function loadConfig() {
  const configPath = path.join(process.cwd(), '.opshub.json');
  if (!fs.existsSync(configPath)) {
    console.error('Error: .opshub.json not found. Run deploy-opshub.sh --init first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

// Initialize Firestore
function initFirestore() {
  const config = loadConfig();
  return new Firestore({
    projectId: config.project_id
  });
}

// CI command
program
  .command('ci <action>')
  .description('CI/CD operations')
  .option('--status <status>', 'CI status (success|failure)')
  .option('--project <project>', 'Project name', 'ApexRebate')
  .option('--branch <branch>', 'Branch name', 'main')
  .option('--commit <commit>', 'Commit hash')
  .option('--preview-url <url>', 'Preview URL')
  .action(async (action, options) => {
    const config = loadConfig();

    if (action === 'status') {
      const data = {
        project: options.project,
        branch: options.branch,
        status: options.status,
        commit: options.commit,
        preview_url: options.previewUrl,
        timestamp: new Date().toISOString()
      };

      try {
        const response = await fetch(`${config.hub_url}/ci`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          console.log('✅ CI status logged successfully');
        } else {
          console.error('❌ Failed to log CI status');
        }
      } catch (error) {
        console.error('Error:', error.message);
      }
    } else if (action === 'logs') {
      const db = initFirestore();
      try {
        const snapshot = await db.collection('ci_logs')
          .orderBy('created', 'desc')
          .limit(10)
          .get();

        console.log('Recent CI Logs:');
        snapshot.forEach(doc => {
          const data = doc.data();
          console.log(`- ${data.project} | ${data.branch} | ${data.status} | ${data.created.toDate().toISOString()}`);
        });
      } catch (error) {
        console.error('Error fetching logs:', error.message);
      }
    }
  });

// Alert command
program
  .command('alert <message>')
  .description('Send system alert')
  .option('--level <level>', 'Alert level (info|warn|error)', 'info')
  .option('--project <project>', 'Project name', 'ApexRebate')
  .action(async (message, options) => {
    const config = loadConfig();
    const data = {
      project: options.project,
      level: options.level,
      message: message,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(`${config.hub_url}/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        console.log('✅ Alert sent successfully');
      } else {
        console.error('❌ Failed to send alert');
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  });

// Metrics command
program
  .command('metrics <action>')
  .description('Performance metrics operations')
  .option('--env <env>', 'Environment (dev|prod)', 'prod')
  .option('--build-time <time>', 'Build time in seconds')
  .option('--bundle-size <size>', 'Bundle size in MB')
  .option('--p95-latency <latency>', 'P95 latency in ms')
  .option('--error-rate <rate>', 'Error rate percentage')
  .option('--commit <commit>', 'Commit hash')
  .action(async (action, options) => {
    const config = loadConfig();

    if (action === 'log') {
      const data = {
        env: options.env,
        buildTime: parseFloat(options.buildTime),
        bundleSize: parseFloat(options.bundleSize),
        p95Latency: parseFloat(options.p95Latency),
        errorRate: parseFloat(options.errorRate),
        commit: options.commit,
        timestamp: new Date().toISOString()
      };

      try {
        const response = await fetch(`${config.hub_url}/metrics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          console.log('✅ Metrics logged successfully');
        } else {
          console.error('❌ Failed to log metrics');
        }
      } catch (error) {
        console.error('Error:', error.message);
      }
    } else if (action === 'view') {
      const db = initFirestore();
      try {
        const snapshot = await db.collection('metrics')
          .orderBy('timestamp', 'desc')
          .limit(5)
          .get();

        console.log('Recent Metrics:');
        snapshot.forEach(doc => {
          const data = doc.data();
          console.log(`- ${data.env} | Build: ${data.buildTime}s | Bundle: ${data.bundleSize}MB | P95: ${data.p95Latency}ms | Errors: ${data.errorRate}%`);
        });
      } catch (error) {
        console.error('Error fetching metrics:', error.message);
      }
    }
  });

// Deploy command
program
  .command('deploy')
  .description('Deploy OpsHub infrastructure')
  .action(() => {
    const deployScript = path.join(__dirname, '..', 'deploy-opshub.sh');
    const { spawn } = require('child_process');

    const child = spawn('bash', [deployScript, '--update'], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('exit', (code) => {
      process.exit(code);
    });
  });

// Health check
program
  .command('health')
  .description('Check OpsHub health')
  .action(async () => {
    const config = loadConfig();

    try {
      const response = await fetch(`${config.hub_url}/health`);
      const health = await response.json();

      console.log('OpsHub Health Status:');
      console.log(`- Status: ${health.status}`);
      console.log(`- Timestamp: ${health.timestamp}`);
      console.log(`- Endpoints: ${health.endpoints.join(', ')}`);
      console.log(`- Hub URL: ${config.hub_url}`);
      console.log(`- Script URL: ${config.script_url}`);
    } catch (error) {
      console.error('Health check failed:', error.message);
    }
  });

program
  .name('opshub')
  .description('Google Ops Hub CLI for ApexRebate')
  .version('1.0.0');

program.parse();
