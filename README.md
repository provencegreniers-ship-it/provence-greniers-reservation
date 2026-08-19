SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxxxxxxxxxxx

STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx

SITE_URL=https://ton-site.vercel.app

node_modules
.next
.env.local
.DS_Store

# Guide de mise en ligne — Provence Greniers Réservation

Ce guide suppose que tu n'as jamais déployé de site. Suis les étapes dans l'ordre.
Compte environ 45-60 minutes la première fois.

## Étape 1 — Créer un compte GitHub (5 min)

1. Va sur https://github.com et crée un compte gratuit.
2. Clique sur "New repository", nomme-le `provence-greniers-reservation`, laisse-le "Public" ou "Private", ne coche rien d'autre, clique "Create repository".
3. Sur la page qui s'affiche, clique sur "uploading an existing file".
4. Glisse-dépose TOUS les fichiers et dossiers de ce projet (sauf `node_modules` s'il existe) dans la zone.
5. Clique "Commit changes".

## Étape 2 — Créer la base de données sur Supabase (10 min)

1. Va sur https://supabase.com, crée un compte gratuit (tu peux te connecter avec GitHub).
2. Clique "New project". Donne-lui un nom (ex: provence-greniers), choisis un mot de passe pour la base (note-le quelque part), choisis la région "Europe (Paris)" si disponible.
3. Attends 1-2 minutes que le projet soit prêt.
4. Dans le menu de gauche, clique sur "SQL Editor" → "New query".
5. Ouvre le fichier `supabase-schema.sql` de ce projet, copie tout son contenu, colle-le dans l'éditeur, clique "Run".
6. Dans le menu de gauche, clique sur "Project Settings" (roue crantée) → "API".
7. Note deux valeurs que tu utiliseras à l'étape 4 :
   - "Project URL" → c'est ta `SUPABASE_URL`
   - "service_role" (sous "Project API keys", clique "Reveal" pour la voir) → c'est ta `SUPABASE_SERVICE_ROLE_KEY`

⚠️ La clé "service_role" est secrète — ne la partage jamais publiquement, ne la mets jamais dans du code visible sur GitHub en clair (elle restera uniquement dans les variables d'environnement Vercel, jamais dans le code).

## Étape 3 — Récupérer tes clés Stripe (5 min)

1. Va sur https://dashboard.stripe.com, connecte-toi à ton compte existant.
2. Vérifie que tu es bien en mode **Live** (pas Test) en haut à droite.
3. Menu "Développeurs" → "Clés API".
4. Note ta "Clé secrète" (commence par `sk_live_...`) → c'est ta `STRIPE_SECRET_KEY`. Clique "Révéler la clé" pour la voir.

Tu configureras le webhook (`STRIPE_WEBHOOK_SECRET`) à l'étape 5, une fois le site en ligne.

## Étape 4 — Déployer sur Vercel (10 min)

1. Va sur https://vercel.com, crée un compte gratuit en te connectant avec GitHub.
2. Clique "Add New..." → "Project".
3. Trouve ton dépôt `provence-greniers-reservation` dans la liste, clique "Import".
4. Avant de cliquer "Deploy", ouvre la section "Environment Variables" et ajoute une par une :
   - `SUPABASE_URL` → la valeur notée à l'étape 2
   - `SUPABASE_SERVICE_ROLE_KEY` → la valeur notée à l'étape 2
   - `STRIPE_SECRET_KEY` → la valeur notée à l'étape 3
   - `STRIPE_WEBHOOK_SECRET` → mets temporairement `whsec_temp` (tu la corrigeras à l'étape 5)
   - `SITE_URL` → mets temporairement `https://temp.vercel.app` (tu la corrigeras juste après)
5. Clique "Deploy". Attends 1-2 minutes.
6. Une fois déployé, Vercel te donne une URL du type `https://provence-greniers-reservation.vercel.app` — copie-la.
7. Va dans Project Settings → Environment Variables, modifie `SITE_URL` avec cette vraie URL, puis va dans l'onglet "Deployments", clique les "..." du dernier déploiement → "Redeploy" pour appliquer le changement.

## Étape 5 — Connecter le webhook Stripe (5 min)

C'est l'étape qui permet à Stripe de dire à ton site "le paiement a réussi, décompte une place".

1. Retourne sur https://dashboard.stripe.com → "Développeurs" → "Webhooks".
2. Clique "Ajouter un endpoint".
3. Dans "URL de l'endpoint", mets : `https://TON-URL-VERCEL.vercel.app/api/webhook`
4. Dans "Sélectionner les événements", cherche et coche `checkout.session.completed`.
5. Clique "Ajouter l'endpoint".
6. Sur la page de l'endpoint créé, clique "Révéler" sous "Secret de signature" → copie la valeur (commence par `whsec_...`).
7. Retourne sur Vercel → Project Settings → Environment Variables, modifie `STRIPE_WEBHOOK_SECRET` avec cette vraie valeur.
8. Redeploie une dernière fois (onglet Deployments → "..." → Redeploy).

## Étape 6 — Activer l'email de confirmation automatique

1. Sur Stripe Dashboard, va dans Paramètres → "Emails aux clients".
2. Active "Envoyer les reçus des paiements réussis".

## Étape 7 — Tester

1. Ouvre ton site déployé (`https://TON-URL.vercel.app`).
2. Choisis une date, un tarif, 1 place, clique "Payer avec Stripe".
3. Effectue un vrai paiement test avec une carte réelle (petit montant, ex: tarif résident 15€) — ou utilise le mode Test de Stripe temporairement si tu veux vérifier sans payer (il faudra alors remettre les clés `sk_test_...` et un webhook Test le temps du test, puis remettre les clés Live).
4. Vérifie dans Supabase → Table Editor → `reservations` que la ligne est passée en statut `paid`.
5. Vérifie que le compteur de places restantes a diminué sur le site.

## Ensuite

Pour intégrer ce parcours de réservation à ton site vitrine existant (`provence-greniers.html`), le plus simple est de faire pointer le bouton "Réserver" vers l'URL Vercel (`https://TON-URL.vercel.app`), ou d'héberger les deux ensemble — dis-le-moi et je t'aiderai pour cette étape aussi.

Si tu bloques à une étape, reviens vers moi avec le message d'erreur exact et une capture d'écran si possible.

{
  "name": "provence-greniers-reservation",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "next": "14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "stripe": "^16.8.0"
  }
}

-- À exécuter dans Supabase > SQL Editor > New query > Run

create table dates (
  id serial primary key,
  label text not null,
  event_date date not null,
  total_spots int not null default 150
);

create table reservations (
  id serial primary key,
  date_id int references dates(id) not null,
  tarif text not null,
  quantity int not null default 1,
  amount_total int not null,
  customer_email text,
  stripe_session_id text unique,
  status text not null default 'pending',
  created_at timestamptz default now()
);

-- Les 4 dates de la saison 2026 (places partagées entre tous les tarifs)
insert into dates (label, event_date, total_spots) values
  ('26-27 septembre 2026', '2026-09-26', 150),
  ('3-4 octobre 2026', '2026-10-03', 150),
  ('10-11 octobre 2026', '2026-10-10', 150),
  ('17-18 octobre 2026', '2026-10-17', 150);

import { createClient } from '@supabase/supabase-js';

// Utilise la clé "service_role" côté serveur uniquement (jamais exposée au navigateur)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Prix en centimes (Stripe travaille toujours en centimes)
export const TARIFS = {
  resident: {
    label: 'Résident de Châteaurenard (13)',
    price: 1500,
    dimensions: '5 x 4 mètres',
  },
  non_resident: {
    label: 'Non-résident de Châteaurenard (13)',
    price: 1800,
    dimensions: '5 x 4 mètres',
  },
  professionnel: {
    label: 'Professionnel',
    price: 2000,
    dimensions: '5 x 4 mètres',
  },
  food_truck: {
    label: 'Food truck',
    price: 3500,
    dimensions: 'Emplacement dédié',
  },
};

export default function Confirmation() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '64px 20px', textAlign: 'center', fontFamily: 'system-ui, sans-serif', color: '#2C2619' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
      <h1 style={{ fontSize: '1.6rem', marginBottom: 12 }}>Réservation confirmée !</h1>
      <p style={{ color: '#5A5142' }}>
        Merci pour votre réservation. Un email de confirmation avec votre reçu de paiement
        vous a été envoyé automatiquement par Stripe.
      </p>
      <a href="/" style={{ display: 'inline-block', marginTop: 24, color: '#7B2635' }}>
        ← Retour à l'accueil
      </a>
    </main>
  );
}

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

import { useEffect, useState } from 'react';
import { TARIFS } from '../lib/tarifs';

export default function Home() {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTarif, setSelectedTarif] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/dates')
      .then((r) => r.json())
      .then(setDates);
  }, []);

  const remaining = selectedDate
    ? dates.find((d) => d.id === selectedDate)?.remaining ?? 0
    : 0;

  const price = selectedTarif ? TARIFS[selectedTarif].price / 100 : 0;
  const total = price * quantity;

  async function handlePay() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date_id: selectedDate, tarif: selectedTarif, quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.');
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch (e) {
      setError('Impossible de contacter le serveur.');
      setLoading(false);
    }
  }

  const canPay = selectedDate && selectedTarif && quantity >= 1 && quantity <= remaining;

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px', fontFamily: 'system-ui, sans-serif', color: '#2C2619' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Réserver un emplacement</h1>
      <p style={{ color: '#5A5142', marginBottom: 32 }}>Provence Greniers — Châteaurenard (13)</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>1. Choisissez une date</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {dates.map((d) => (
            <button
              key={d.id}
              onClick={() => { setSelectedDate(d.id); setQuantity(1); }}
              disabled={d.remaining === 0}
              style={{
                textAlign: 'left',
                padding: '14px 16px',
                borderRadius: 10,
                border: selectedDate === d.id ? '2px solid #7B2635' : '1px solid #ddd',
                background: d.remaining === 0 ? '#f2f2f2' : '#fff',
                cursor: d.remaining === 0 ? 'not-allowed' : 'pointer',
                opacity: d.remaining === 0 ? 0.5 : 1,
              }}
            >
              <strong>{d.label}</strong>
              <div style={{ fontSize: '0.85rem', color: '#5A5142' }}>
                {d.remaining === 0 ? 'Complet' : `${d.remaining} places restantes sur ${d.total_spots}`}
              </div>
            </button>
          ))}
        </div>
      </section>

      {selectedDate && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>2. Choisissez votre profil</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {Object.entries(TARIFS).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setSelectedTarif(key)}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: selectedTarif === key ? '2px solid #7B2635' : '1px solid #ddd',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                <strong>{t.label}</strong> — {(t.price / 100).toFixed(0)}€
                <div style={{ fontSize: '0.85rem', color: '#5A5142' }}>{t.dimensions}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {selectedTarif && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>3. Nombre de places</h2>
          <input
            type="number"
            min="1"
            max={remaining}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(remaining, Number(e.target.value))))}
            style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', width: 100, fontSize: '1rem' }}
          />
          <span style={{ marginLeft: 10, color: '#5A5142', fontSize: '0.9rem' }}>
            ({remaining} disponibles)
          </span>
        </section>
      )}

      {canPay && (
        <section style={{ padding: 20, background: '#F5EEE0', borderRadius: 12, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span>Total à payer</span>
            <strong style={{ fontSize: '1.3rem' }}>{total.toFixed(0)}€</strong>
          </div>
          <button
            onClick={handlePay}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 10,
              border: 'none',
              background: '#7B2635',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            {loading ? 'Redirection vers Stripe...' : 'Payer avec Stripe'}
          </button>
        </section>
      )}

      {error && <p style={{ color: '#c0392b' }}>{error}</p>}
    </main>
  );
}

