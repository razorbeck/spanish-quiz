# Deploying to DigitalOcean App Platform

This guide walks you through deploying the Spanish Quiz app on DigitalOcean App Platform using Docker.

---

## Prerequisites

- A DigitalOcean account (digitalocean.com)
- Git installed on your computer
- Node.js 18+ (for generating the bcrypt hash locally)

---

## Step 1 — Generate a secure admin password hash

Run this once on your computer to turn your chosen password into a bcrypt hash:

```bash
cd spanish-quiz-app
npm install
node -e "const b=require('bcryptjs'); b.hash('YourChosenPassword',12).then(console.log)"
```

Copy the output hash — it looks like `$2a$12$...`. You'll paste it into DigitalOcean's environment variables.

---

## Step 2 — Push to GitHub

1. Create a new **private** GitHub repository (private is important — keep answers off the internet)
2. From the `spanish-quiz-app` folder:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/spanish-quiz.git
git push -u origin main
```

Make sure `.gitignore` is committed first so `.env` and `data/` are excluded.

---

## Step 3 — Create the App on DigitalOcean

1. Log in to **cloud.digitalocean.com**
2. Click **Create → Apps**
3. Choose **GitHub** as your source
4. Select your `spanish-quiz` repo, branch `main`
5. DigitalOcean will detect the `Dockerfile` automatically
6. Choose the **Basic** plan ($5/month is sufficient)
7. Set the **HTTP Port** to `8080`

---

## Step 4 — Add Environment Variables

In the App settings, go to **App-Level Environment Variables** and add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `8080` |
| `SESSION_SECRET` | *(run: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)* |
| `ADMIN_PASSWORD_HASH` | *(the `$2a$12$...` hash from Step 1)* |
| `DB_DIR` | `/var/data` |

Mark `SESSION_SECRET` and `ADMIN_PASSWORD_HASH` as **Encrypted**.

---

## Step 5 — Add a Persistent Volume

The SQLite database must survive redeploys. Without a volume, scores are lost every time the app restarts.

1. In App settings, go to **Components → your web service → Storage**
2. Click **Attach Storage Volume**
3. Set Mount Path: `/var/data`
4. Size: 1 GB is plenty
5. Save

---

## Step 6 — Deploy

Click **Deploy**. DigitalOcean will build your Docker image and launch it. Takes about 2-3 minutes.

Your app will be available at a URL like:
`https://spanish-quiz-abc123.ondigitalocean.app`

---

## Step 7 — Test it

1. Open the app URL — you should see the quiz start screen
2. Take a test quiz as Bmylo
3. Go to `https://your-app-url/admin`
4. Log in with the password you chose in Step 1
5. Verify the attempt appears and you can grade the open response

---

## Updating the app

Push changes to GitHub → DigitalOcean auto-deploys on every push to `main`.

---

## Customizing questions

All questions and passages live in:
- `src/questions.js` — 110 MC questions (Fiesta Fatal, Preterite, Imperfect, Vocab)
- `src/readings.js` — 10 reading passages (one per version)

Edit those files, commit, and push. The question bank is **server-side only** — Bmylo can never see them in the browser.

---

## Security notes

- Correct answers never leave the server
- Admin panel is behind bcrypt-hashed password + httpOnly session cookie
- Rate limiting: 300 req/15min on quiz API, 100 req/15min on admin
- Helmet.js sets strict Content-Security-Policy headers
- Source maps are blocked from being served
- SQLite WAL mode for safe concurrent writes

---

## Troubleshooting

**App crashes on startup**: Check that all environment variables are set, especially `SESSION_SECRET` and `DB_DIR`.

**Database errors**: Make sure the persistent volume is attached at `/var/data`.

**Admin password not working**: Make sure `ADMIN_PASSWORD_HASH` is set (not `ADMIN_PASSWORD`) in production. The plain-text fallback is only for development.

**Questions look different every session**: This is by design — the server randomly samples from the question bank each time.
