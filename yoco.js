/**
 * Yoco Payment Service
 * 
 * File location: src/services/yoco.js
 * 
 * This service:
 * - Calls Firebase Cloud Functions (no direct API calls)
 * - Never handles secret keys client-side
 * - Provides payment processing interface for the app
 */

import {
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import { functions } from "../config/firebase";

// For local development only
if (import.meta.env.MODE === "development") {
  try {
    connectFunctionsEmulator(functions, "localhost", 5001);
  } catch (e) {
    // Already connected, ignore
  }
}

/**
 * Create a payment with Yoco
 * 
 * @param {Object} paymentData
 * @param {number} paymentData.amount - Amount in cents (e.g., 1000 for R10.00)
 * @param {string} paymentData.currency - Currency code (e.g., "ZAR")
 * @param {string} paymentData.description - Payment description
 * @param {Object} paymentData.metadata - Additional metadata (orderId, customerId, etc.)
 * @returns {Promise<Object>} Payment response with checkoutUrl
 */
export const createPayment = async (paymentData) => {
  try {
    const createYocoPayment = httpsCallable(
      functions,
      "createYocoPayment"
    );

    const response = await createYocoPayment({
      amount: paymentData.amount,
      currency: paymentData.currency || "ZAR",
      description: paymentData.description,
      metadata: paymentData.metadata || {},
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Payment creation error:", error);
    return {
      success: false,
      error: error.message || "Payment creation failed",
    };
  }
};

/**
 * Get payment status from Yoco
 * 
 * @param {string} checkoutId - Yoco checkout ID
 * @returns {Promise<Object>} Payment status
 */
export const getPaymentStatus = async (checkoutId) => {
  try {
    const getYocoPaymentStatus = httpsCallable(
      functions,
      "getYocoPaymentStatus"
    );

    const response = await getYocoPaymentStatus({
      checkoutId: checkoutId,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Payment status error:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch payment status",
    };
  }
};

/**
 * Initialize payment (for WhatsApp or other channels)
 * 
 * @param {Object} paymentConfig
 * @returns {Promise<Object>} Payment initialization response
 */
export const initializePayment = async (paymentConfig) => {
  const { amount, description, customerId, orderId } = paymentConfig;

  return createPayment({
    amount: amount,
    currency: "ZAR",
    description: description || `Payment for order ${orderId}`,
    metadata: {
      customerId: customerId,
      orderId: orderId,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Process payment via payment link
 * 
 * Note: This uses the merchant's pre-configured payment link
 * Setup in Yoco dashboard
 */
export const getPaymentLink = () => {
  const paymentLink = import.meta.env.VITE_YOCO_PAYMENT_LINK_URL;
  return paymentLink;
};

/**
 * Verify payment webhook signature (if needed)
 * 
 * Yoco includes signature headers in webhooks for verification
 */
export const verifyWebhookSignature = (signature, body) => {
  // Implement signature verification here
  // Compare HMAC signature from Yoco with computed signature
  // This is optional but recommended for production
  return true; // Placeholder
};

export default {
  createPayment,
  getPaymentStatus,
  initializePayment,
  getPaymentLink,
  verifyWebhookSignature,
};
