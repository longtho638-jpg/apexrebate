const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const next = require('next');

// Initialize Firebase Admin
admin.initializeApp();

// Next.js SSR handler
const app = next({ dev: false });
const handle = app.getRequestHandler();

exports.nextServer = functions.https.onRequest(async (req, res) => {
  await app.prepare();
  return handle(req, res);
});

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