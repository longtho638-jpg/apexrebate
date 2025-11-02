const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

// Initialize Firebase Admin
admin.initializeApp();

// Configuration from environment variables (Functions v2)
const APP_URL = process.env.APP_URL || 'https://ssr-fyesnthnra-uc.a.run.app';
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key-123';

// Manual Payout Process - Concierge Service
exports.manualPayout = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { userId, amount, broker, period } = req.body;

      // Validate input
      if (!userId || !amount || !broker || !period) {
        return res.status(400).json({ 
          error: 'Missing required fields: userId, amount, broker, period' 
        });
      }

      // Log manual payout for transparency
      const payoutRecord = {
        userId,
        amount,
        broker,
        period,
        status: 'processed',
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        processedBy: 'concierge', // Manual process
        type: 'manual_payout'
      };

      // Save to Firestore
      await admin.firestore()
        .collection('payouts')
        .add(payoutRecord);

      // Update user's total savings
      const userRef = admin.firestore().collection('users').doc(userId);
      await userRef.update({
        totalSavings: admin.firestore.FieldValue.increment(amount),
        lastPayoutAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(200).json({
        success: true,
        message: `Manual payout of $${amount} processed for ${userId}`,
        record: payoutRecord
      });

    } catch (error) {
      console.error('Manual payout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// User Intake Form Handler
exports.submitIntakeForm = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { 
        email, 
        tradingVolume, 
        preferredBroker, 
        experience,
        referralSource 
      } = req.body;

      // Validate required fields
      if (!email || !tradingVolume || !preferredBroker) {
        return res.status(400).json({ 
          error: 'Missing required fields: email, tradingVolume, preferredBroker' 
        });
      }

      // Create user record
      const userRecord = {
        email,
        tradingVolume: parseFloat(tradingVolume),
        preferredBroker,
        experience: experience || 'beginner',
        referralSource: referralSource || 'organic',
        status: 'pending_onboarding',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        stage: 'seed' // HẠT GIỐNG stage
      };

      // Save to Firestore
      const userDoc = await admin.firestore()
        .collection('users')
        .add(userRecord);

      // Calculate potential savings (for concierge email)
      const monthlyFees = tradingVolume * 0.0004; // 0.04% typical fee
      const estimatedSavings = monthlyFees * 0.4 * 0.1; // 40% broker share * 10% ApexRebate

      res.status(200).json({
        success: true,
        userId: userDoc.id,
        estimatedMonthlySavings: estimatedSavings,
        message: 'Application received. Our concierge team will contact you within 24 hours.'
      });

    } catch (error) {
      console.error('Intake form error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Wall of Fame Data
exports.getWallOfFame = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      const snapshot = await admin.firestore()
        .collection('users')
        .where('totalSavings', '>', 0)
        .orderBy('totalSavings', 'desc')
        .limit(50)
        .get();

      const wallOfFame = snapshot.docs.map(doc => ({
        id: doc.id,
        anonymousName: `Trader ${doc.id.substring(0, 6)}`,
        totalSavings: doc.data().totalSavings,
        broker: doc.data().preferredBroker,
        memberSince: doc.data().createdAt
      }));

      res.status(200).json({
        success: true,
        data: wallOfFame,
        totalSaved: wallOfFame.reduce((sum, user) => sum + user.totalSavings, 0)
      });

    } catch (error) {
      console.error('Wall of Fame error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Broker Mock Integration
exports.getBrokerData = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      const { broker } = req.query;

      // Mock broker data for development
      const brokerMocks = {
        binance: {
          name: 'Binance',
          affiliateRate: 0.4, // 40% of trading fees
          typicalFee: 0.0004, // 0.04% typical trading fee
          processingTime: '24-48 hours'
        },
        bybit: {
          name: 'Bybit',
          affiliateRate: 0.35, // 35% of trading fees
          typicalFee: 0.00045, // 0.045% typical trading fee
          processingTime: '24-48 hours'
        },
        okx: {
          name: 'OKX',
          affiliateRate: 0.3, // 30% of trading fees
          typicalFee: 0.0005, // 0.05% typical trading fee
          processingTime: '48-72 hours'
        }
      };

      const brokerData = brokerMocks[broker.toLowerCase()] || {
        name: broker,
        affiliateRate: 0.3,
        typicalFee: 0.0005,
        processingTime: '48-72 hours'
      };

      res.status(200).json({
        success: true,
        data: brokerData
      });

    } catch (error) {
      console.error('Broker data error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Scheduled Cron Job - Free History Processing
// Note: Firebase Functions v5 pubsub.schedule requires second-gen functions
// For now, using HTTP trigger that can be called by Cloud Scheduler
exports.scheduledCronJobs = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      console.log('🕐 Running scheduled cron jobs...');
      
      // Verify Cloud Scheduler header
      const schedulerHeader = req.headers['x-cloudscheduler'];
      const authHeader = req.headers['authorization'];
      
      if (!schedulerHeader && (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Call the cron jobs endpoint
      console.log('Calling cron endpoint:', APP_URL);
      const response = await fetch(`${APP_URL}/api/cron/run-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CRON_SECRET}`
        }
      });

      const result = await response.json();
      console.log('✅ Cron jobs completed:', result);
      
      res.status(200).json({
        success: true,
        message: 'Scheduled cron jobs executed',
        data: result
      });
    } catch (error) {
      console.error('❌ Cron job execution failed:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });
});

// Manual Cron Job Trigger
exports.triggerCronJobs = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      console.log('🚀 Manual cron job trigger initiated...');

      // Call the cron jobs endpoint
      console.log('Calling cron endpoint:', APP_URL);
      const response = await fetch(`${APP_URL}/api/cron/run-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CRON_SECRET}`
        }
      });

      const result = await response.json();

      res.status(200).json({
        success: true,
        message: 'Cron jobs executed successfully',
        data: result
      });

    } catch (error) {
      console.error('Cron job trigger error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to trigger cron jobs',
        details: error.message 
      });
    }
  });
});

// Next.js SSR Function for hosting
const next = require('next');
const nextApp = next({ 
  dev: false, 
  conf: { distDir: '../.next' } 
});
const handle = nextApp.getRequestHandler();

exports.ssr = functions.https.onRequest(async (req, res) => {
  await nextApp.prepare();
  return handle(req, res);
});