import Stripe from 'stripe';
import { supabaseAdmin } from '../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe a besoin du corps brut de la requête pour vérifier la signature
export const config = {
  api: { bodyParser: false },
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on('data', (chunk) => chunks.push(chunk));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Erreur de signature webhook: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // On marque la réservation comme payée
    await supabaseAdmin
      .from('reservations')
      .update({
        status: 'paid',
        customer_email: session.customer_details?.email || null,
      })
      .eq('stripe_session_id', session.id);
  }

  res.status(200).json({ received: true });
}
