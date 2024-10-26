import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { getAbsoluteUrl } from '@/lib/utils';
import { getSubscriptionData } from '@/actions/get-subscription-data';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const settingUrl = getAbsoluteUrl('/settings');

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (!stripe) {
      return new NextResponse('stripe not configured', { status: 500 });
    }

    const userSubscription = await getSubscriptionData(userId);

    if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: settingUrl,
      });

      return new NextResponse(JSON.stringify({ url: stripeSession.url }));
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingUrl,
      cancel_url: settingUrl,
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'required',
      customer_email: user.emailAddresses[0].emailAddress,
      line_items: [
        {
          price_data: {
            currency: 'USD',
            product_data: {
              name: 'Genius Pro',
              description: 'Unlimited AI Generations',
            },
            unit_amount: 1000,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
    });

    return new NextResponse(JSON.stringify({ url: stripeSession.url }), { status: 200 });
  } catch (error) {
    console.log(`[STRIPE_ERROR]: ${error}`);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
