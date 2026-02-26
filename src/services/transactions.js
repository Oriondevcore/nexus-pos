// src/services/transactions.js
// Save and manage transactions in Firestore

import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Save a new transaction to Firestore
 */
export const saveTransaction = async ({
  tenantId,
  amount,          // in Rands (float)
  amountCents,     // in cents (int)
  description,
  gateway,         // 'yoco' | 'stripe' | 'mpesa'
  checkoutId,      // gateway's transaction ID
  paymentUrl,      // the link sent to client
  sendMethod,      // 'whatsapp' | 'sms' | 'email' | 'qr'
  sendTo,          // phone number or email
  clientName,      // optional
  clientId,        // optional
  signatureDataUrl,// base64 signature image
  vatAmount,       // calculated VAT
  vatRate,
  status = 'pending',
}) => {
  const txn = {
    tenantId,
    amount:          Number(amount),
    amountCents:     Number(amountCents),
    description:     description || '',
    gateway,
    checkoutId:      checkoutId || '',
    paymentUrl:      paymentUrl || '',
    sendMethod,
    sendTo:          sendTo || '',
    clientName:      clientName || '',
    clientId:        clientId || null,
    signatureDataUrl: signatureDataUrl || null,
    vatAmount:       vatAmount || 0,
    vatRate:         vatRate || 0,
    status,          // pending | paid | failed | expired
    createdAt:       serverTimestamp(),
    updatedAt:       serverTimestamp(),
  }

  const docRef = await addDoc(collection(db, 'transactions'), txn)
  return { id: docRef.id, ...txn }
}

/**
 * Update a transaction's status (called by webhook or manual check)
 */
export const updateTransactionStatus = async (transactionId, status) => {
  await updateDoc(doc(db, 'transactions', transactionId), {
    status,
    updatedAt: serverTimestamp(),
  })
}
