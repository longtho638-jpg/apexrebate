const express = require('express');
const fetch = require('node-fetch');
const { Firestore } = require('@google-cloud/firestore');

const app = express();
app.use(express.json());

const db = new Firestore();

// CI/CD endpoint - logs to Firestore and forwards to Apps Script
app.post('/ci', async (req, res) => {
  try {
    const data = req.body;
    console.log('Received CI data:', data);

    // Log to Firestore
    await db.collection('ci_logs').add({
      ...data,
      created: new Date(),
      source: 'github-action'
    });

    // Forward to Apps Script if configured
    const gasUrl = process.env.GAS_EXEC_URL;
    if (gasUrl) {
      try {
        await fetch(gasUrl, {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'ci', ...data })
        });
      } catch (err) {
        console.error('Failed to forward to Apps Script:', err);
      }
    }

    res.json({ ok: true, logged: true });
  } catch (error) {
    console.error('CI endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Alert endpoint - logs alerts and forwards to Apps Script
app.post('/alert', async (req, res) => {
  try {
    const data = req.body;
    console.log('Received alert:', data);

    // Log to Firestore
    await db.collection('alerts').add({
      ...data,
      created: new Date(),
      source: 'system'
    });

    // Forward to Apps Script
    const gasUrl = process.env.GAS_EXEC_URL;
    if (gasUrl) {
      try {
        await fetch(gasUrl, {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'alert', ...data })
        });
      } catch (err) {
        console.error('Failed to forward alert to Apps Script:', err);
      }
    }

    res.json({ ok: true, alerted: true });
  } catch (error) {
    console.error('Alert endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Metrics endpoint - logs performance metrics
app.post('/metrics', async (req, res) => {
  try {
    const data = req.body;
    console.log('Received metrics:', data);

    // Log to Firestore
    await db.collection('metrics').add({
      ...data,
      created: new Date(),
      source: 'build-system'
    });

    // Forward to Apps Script for Sheet logging
    const gasUrl = process.env.GAS_EXEC_URL;
    if (gasUrl) {
      try {
        await fetch(gasUrl, {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'metrics', ...data })
        });
      } catch (err) {
        console.error('Failed to forward metrics to Apps Script:', err);
      }
    }

    res.json({ ok: true, metrics_logged: true });
  } catch (error) {
    console.error('Metrics endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: ['/ci', '/alert', '/metrics']
  });
});

exports.opShub = app;
