import Stripe from 'stripe';
import crypto from 'crypto';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// ============================================
// Payment Service
// ============================================

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  metadata: Record<string, string>;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: { monthly: 499, yearly: 4900 }, // $4.99/$49.00
    features: [
      'Access to all game features',
      'Daily login rewards',
      'Basic support',
      '5GB cloud storage',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: { monthly: 999, yearly: 9900 }, // $9.99/$99.00
    features: [
      'Everything in Basic',
      'Exclusive premium buildings',
      '2x resource production',
      'Priority support',
      '20GB cloud storage',
      'Custom avatar frame',
    ],
  },
  {
    id: 'pro',
    name: 'Professional',
    price: { monthly: 2999, yearly: 29900 }, // $29.99/$299.00
    features: [
      'Everything in Premium',
      'API access',
      'Custom branding',
      'Dedicated support',
      '100GB cloud storage',
      'Early access to features',
      'White-label options',
    ],
  },
];

// ============================================
// Create Payment Intent
// ============================================

export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata: Record<string, string> = {}
): Promise<PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
    });

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'pending',
      metadata: paymentIntent.metadata,
    };
  } catch (error) {
    console.error('Create payment intent error:', error);
    throw new Error('Failed to create payment intent');
  }
}

// ============================================
// Create Subscription
// ============================================

export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata: Record<string, string> = {}
) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata,
    });

    return {
      id: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      clientSecret: (subscription.latest_invoice as any).payment_intent?.client_secret,
    };
  } catch (error) {
    console.error('Create subscription error:', error);
    throw new Error('Failed to create subscription');
  }
}

// ============================================
// Cancel Subscription
// ============================================

export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return {
      id: subscription.id,
      status: subscription.status,
      cancelAt: new Date(subscription.cancel_at * 1000),
    };
  } catch (error) {
    console.error('Cancel subscription error:', error);
    throw new Error('Failed to cancel subscription');
  }
}

// ============================================
// Get Subscription
// ============================================

export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return {
      id: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      planId: subscription.items.data[0]?.price.id,
    };
  } catch (error) {
    console.error('Get subscription error:', error);
    throw new Error('Failed to get subscription');
  }
}

// ============================================
// Create Customer
// ============================================

export async function createCustomer(
  email: string,
  name: string,
  metadata: Record<string, string> = {}
) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });

    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
    };
  } catch (error) {
    console.error('Create customer error:', error);
    throw new Error('Failed to create customer');
  }
}

// ============================================
// Get Customer
// ============================================

export async function getCustomer(customerId: string) {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    console.error('Get customer error:', error);
    throw new Error('Failed to get customer');
  }
}

// ============================================
// Get Customer by User ID
// ============================================

export async function getCustomerByUserId(userId: string) {
  try {
    const customers = await stripe.customers.list({
      limit: 1,
      expand: ['data.metadata'],
    });

    const customer = customers.data.find(
      (c) => (c as any).metadata?.userId === userId
    );

    return customer;
  } catch (error) {
    console.error('Get customer by user ID error:', error);
    throw new Error('Failed to get customer');
  }
}

// ============================================
// Create Checkout Session
// ============================================

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string> = {}
) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });

    return {
      id: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Create checkout session error:', error);
    throw new Error('Failed to create checkout session');
  }
}

// ============================================
// Create One-Time Payment Session
// ============================================

export async function createOneTimePaymentSession(
  amount: number,
  productName: string,
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string> = {}
) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });

    return {
      id: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Create one-time payment session error:', error);
    throw new Error('Failed to create payment session');
  }
}

// ============================================
// Handle Webhook
// ============================================

export async function handleWebhook(
  payload: string,
  signature: string
): Promise<{ type: string; data: any }> {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    return {
      type: event.type,
      data: event.data.object,
    };
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error('Webhook signature verification failed');
  }
}

// ============================================
// Get Payment History
// ============================================

export async function getPaymentHistory(customerId: string, limit: number = 10) {
  try {
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit,
    });

    return paymentIntents.data.map((pi) => ({
      id: pi.id,
      amount: pi.amount / 100,
      currency: pi.currency,
      status: pi.status,
      created: new Date(pi.created * 1000),
    }));
  } catch (error) {
    console.error('Get payment history error:', error);
    throw new Error('Failed to get payment history');
  }
}

// ============================================
// Get Invoice History
// ============================================

export async function getInvoiceHistory(customerId: string, limit: number = 10) {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    });

    return invoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      amount: invoice.amount_due / 100,
      currency: invoice.currency,
      status: invoice.status,
      created: new Date(invoice.created * 1000),
      pdfUrl: invoice.invoice_pdf,
    }));
  } catch (error) {
    console.error('Get invoice history error:', error);
    throw new Error('Failed to get invoice history');
  }
}

// ============================================
// Refund
// ============================================

export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: string
) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason as any,
    });

    return {
      id: refund.id,
      status: refund.status,
      amount: refund.amount / 100,
    };
  } catch (error) {
    console.error('Create refund error:', error);
    throw new Error('Failed to create refund');
  }
}

// ============================================
// Price ID Mapping
// ============================================

export const PRICE_IDS = {
  basic_monthly: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID!,
  basic_yearly: process.env.STRIPE_BASIC_YEARLY_PRICE_ID!,
  premium_monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
  premium_yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!,
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
};

export default {
  stripe,
  createPaymentIntent,
  createSubscription,
  cancelSubscription,
  getSubscription,
  createCustomer,
  getCustomer,
  getCustomerByUserId,
  createCheckoutSession,
  createOneTimePaymentSession,
  handleWebhook,
  getPaymentHistory,
  getInvoiceHistory,
  createRefund,
  SUBSCRIPTION_PLANS,
  PRICE_IDS,
};
