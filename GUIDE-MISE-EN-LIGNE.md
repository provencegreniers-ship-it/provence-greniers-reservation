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
