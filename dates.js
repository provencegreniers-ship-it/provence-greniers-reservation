import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  const { data: dates, error } = await supabaseAdmin
    .from('dates')
    .select('*')
    .order('event_date', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  // Pour chaque date, on calcule les places déjà réservées (payées)
  const results = [];
  for (const d of dates) {
    const { data: reservations } = await supabaseAdmin
      .from('reservations')
      .select('quantity')
      .eq('date_id', d.id)
      .eq('status', 'paid');

    const taken = (reservations || []).reduce((sum, r) => sum + r.quantity, 0);
    results.push({
      ...d,
      remaining: Math.max(0, d.total_spots - taken),
    });
  }

  res.status(200).json(results);
}
