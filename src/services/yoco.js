// src/services/yoco.js
// Yoco payment link generation
// NOTE: In production the secret key call should go through a Firebase Function.
// For now we call the Yoco API directly from the browser using your keys.

/**
 * Creates a Yoco payment checkout and returns the payment URL.
 * @param {number} amountCents  - Amount in CENTS (e.g. R 100.00 = 10000)
 * @param {string} description  - Description shown on the payment page
 * @param {string} currency     - Currency code, default 'ZAR'
 * @returns {Promise<{id, url}>} - Checkout ID and payment URL
 */
export const createYocoCheckout = async (
  amountCents,
  description = "Payment",
  currency = "ZAR",
) => {
  const secretKey = import.meta.env.VITE_YOCO_SECRET_KEY;
  const linkUrl =
    import.meta.env.VITE_YOCO_PAYMENT_LINK_URL ||
    "https://payments.yoco.com/api/checkouts";

  if (!secretKey)
    throw new Error("Yoco secret key not configured. Check your .env file.");

  const response = await fetch(linkUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secretKey}`,
    },
    body: JSON.stringify({
      amount: amountCents,
      currency,
      description,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.displayMessage || err.message || `Yoco error: ${response.status}`,
    );
  }

  const data = await response.json();

  // Yoco returns: { id, url, status, ... }
  return {
    id: data.id,
    url: data.url || data.redirectUrl || data.checkoutUrl,
    raw: data,
  };
};

/**
 * Builds a WhatsApp deep link that opens a chat with a pre-filled message.
 * @param {string} number  - Phone number with country code, digits only (e.g. "27821234567")
 * @param {string} message - The message text
 */
export const buildWhatsAppLink = (number, message) => {
  const clean = number.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
};

/**
 * Builds an SMS link (works on mobile)
 */
export const buildSmsLink = (number, message) => {
  const clean = number.replace(/\D/g, "");
  return `sms:${clean}?body=${encodeURIComponent(message)}`;
};

/**
 * Builds a mailto link
 */
export const buildEmailLink = (email, subject, body) => {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

/**
 * Formats a payment message for WhatsApp / SMS
 */
export const formatPaymentMessage = (
  businessName,
  amount,
  currency,
  paymentUrl,
  description,
) => {
  return `Hi! Here is your payment link from ${businessName}.

Amount: ${currency} ${Number(amount).toFixed(2)}${description ? `\nFor: ${description}` : ""}

Pay securely here:
${paymentUrl}

Thank you! 🙏`;
};
