import { Injectable } from '@nestjs/common';

interface PaymentIntent {
  amount: number;
  currency: string;
  customerId?: string;
  description?: string;
  metadata?: Record<string, string>;
}

@Injectable()
export class PaymentService {
  // Stripe
  async createPaymentIntent(data: PaymentIntent) {
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        amount: data.amount.toString(),
        currency: data.currency,
        ...(data.customerId && { customer: data.customerId }),
        ...(data.description && { description: data.description })
      })
    });

    const paymentIntent = await response.json();
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  }

  async createCustomer(email: string, name: string) {
    const response = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ email, name })
    });

    const customer = await response.json();
    return { customerId: customer.id };
  }

  async createSubscription(customerId: string, priceId: string) {
    const response = await fetch('https://api.stripe.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        customer: customerId,
        'items[0][price]': priceId
      })
    });

    const subscription = await response.json();
    return {
      subscriptionId: subscription.id,
      status: subscription.status
    };
  }

  async getPaymentStatus(paymentIntentId: string) {
    const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
      }
    });

    const paymentIntent = await response.json();
    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    };
  }

  // PayPal
  async createPayPalOrder(amount: number, currency = 'USD') {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString('base64');

    const response = await fetch(`${process.env.PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: currency, value: amount.toString() }
        }]
      })
    });

    return response.json();
  }

  async capturePayPalOrder(orderId: string) {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString('base64');

    const response = await fetch(
      `${process.env.PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}` }
      }
    );

    return response.json();
  }
}
