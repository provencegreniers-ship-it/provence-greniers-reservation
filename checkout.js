import Stripe from 'stripe';
import { supabaseAdmin } from '../../lib/supabase';
import { TARIFS } from '../../lib/tarifs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { date_id, tarif, quantity } = req.body;

  if (!date_id || !TARIFS[tarif] || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'Paramètres invalides' });
  }

  // 1. Vérifier la date
  const { data: dateRow, error: dateErr } = await supabaseAdmin
    .from('dates')
    .select('*')
    .eq('id', date_id)
    .single();

  if (dateErr || !dateRow) return res.status(404).json({ error: 'Date introuvable' });

  // 2. Vérifier les places restantes (compte tous tarifs confondus)
  const { data: reservations } = await supabaseAdmin
    .from('reservations')
    .select('quantity')
    .eq('date_id', date_id)
    .eq('status', 'paid');

  const taken = (reservations || []).reduce((sum, r) => sum + r.quantity, 0);
  const remaining = dateRow.total_spots - taken;

  if (quantity > remaining) {
    return res.status(409).json({ error: `Il ne reste que ${remaining} place(s) pour cette date.` });
  }

  // 3. Créer la session Stripe
  const tarifInfo = TARIFS[tarif];
  const amountTotal = tarifInfo.price * quantity;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${tarifInfo.label} — ${dateRow.label}`,
            description: `Emplacement ${tarifInfo.dimensions}`,
          },
          unit_amount: tarifInfo.price,
        },
        quantity,
      },
    ],
    metadata: {
      date_id: String(date_id),
      tarif,
      quantity: String(quantity),
    },
    success_url: `${process.env.SITE_URL}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.SITE_URL}/?annule=1`,
  });

  // 4. Enregistrer la réservation en attente de paiement
  await supabaseAdmin.from('reservations').insert({
    date_id,
    tarif,
    quantity,
    amount_total: amountTotal,
    stripe_session_id: session.id,
    status: 'pending',
  });

  res.status(200).json({ url: session.url });
}
