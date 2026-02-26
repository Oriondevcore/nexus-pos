/**
 * Firebase Cloud Function for Yoco Payment Processing
 * 
 * File location: functions/src/yocoPayment.js
 * 
 * This function:
 * - Receives payment requests from the client (without sensitive data)
 * - Processes Yoco payments server-side with the secret key
 * - Returns payment status to the client
 * - Keeps the secret key completely secure
 * 
 * Deploy with: firebase deploy --only functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

// Initialize Firebase Admin (automatically initialized in Cloud Functions)
admin.initializeApp();

/**
 * Create a Yoco payment
 * 
 * Request body:
 * {
 *   amount: number (in cents),
 *   currency: "ZAR",
 *   description: string,
 *   metadata: {
 *     orderId: string,
 *     customerId: string
 *   }
 * }
 */
exports.createYocoPayment = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  try {
    const { amount, currency, description, metadata } = data;

    // Validate input
    if (!amount || !currency || !description) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields: amount, currency, description"
      );
    }

    // Get secret key from environment variables (set in Cloud Functions)
    const yocoSecretKey = process.env.YOCO_SECRET_KEY;
    if (!yocoSecretKey) {
      throw new Error("YOCO_SECRET_KEY not configured");
    }

    // Create payment with Yoco API
    const yocoResponse = await axios.post(
      "https://api.yoco.com/v1/checkouts",
      {
        amount: Math.round(amount), // Ensure amount is in cents
        currency: currency,
        description: description,
        metadata: {
          ...metadata,
          userId: context.auth.uid, // Automatically track user
        },
        successUrl: `${process.env.APP_URL}/payment/success`,
        cancelUrl: `${process.env.APP_URL}/payment/cancel`,
      },
      {
        auth: {
          username: yocoSecretKey,
          password: "", // Yoco API uses basic auth with just the secret key
        },
      }
    );

    // Log transaction (optional - store in Firestore)
    await admin.firestore().collection("transactions").add({
      userId: context.auth.uid,
      yocoId: yocoResponse.data.id,
      amount: amount,
      currency: currency,
      description: description,
      status: yocoResponse.data.status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      metadata: metadata,
    });

    // Return only safe data to client
    return {
      success: true,
      checkoutUrl: yocoResponse.data.redirectUrl,
      checkoutId: yocoResponse.data.id,
      status: yocoResponse.data.status,
    };
  } catch (error) {
    console.error("Yoco payment error:", error);

    // Don't expose sensitive error details to client
    throw new functions.https.HttpsError(
      "internal",
      "Payment processing failed. Please try again."
    );
  }
});

/**
 * Get payment status
 * 
 * Request: { checkoutId: string }
 */
exports.getYocoPaymentStatus = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    try {
      const { checkoutId } = data;

      if (!checkoutId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "checkoutId is required"
        );
      }

      const yocoSecretKey = process.env.YOCO_SECRET_KEY;

      // Get payment status from Yoco
      const yocoResponse = await axios.get(
        `https://api.yoco.com/v1/checkouts/${checkoutId}`,
        {
          auth: {
            username: yocoSecretKey,
            password: "",
          },
        }
      );

      // Update transaction status in Firestore
      const transactionQuery = await admin
        .firestore()
        .collection("transactions")
        .where("yocoId", "==", checkoutId)
        .where("userId", "==", context.auth.uid)
        .limit(1)
        .get();

      if (!transactionQuery.empty) {
        await transactionQuery.docs[0].ref.update({
          status: yocoResponse.data.status,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return {
        success: true,
        status: yocoResponse.data.status,
        paid: yocoResponse.data.status === "completed",
      };
    } catch (error) {
      console.error("Payment status error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to fetch payment status"
      );
    }
  }
);

/**
 * Webhook handler for Yoco payment notifications
 * Configure webhook URL in Yoco dashboard:
 * https://your-domain.com/yocoWebhook
 */
exports.yocoWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const { id, status } = req.body;

    // Verify webhook (optional but recommended)
    // You can implement signature verification here

    // Update transaction status
    const transactionQuery = await admin
      .firestore()
      .collection("transactions")
      .where("yocoId", "==", id)
      .limit(1)
      .get();

    if (!transactionQuery.empty) {
      await transactionQuery.docs[0].ref.update({
        status: status,
        webhookReceivedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});
