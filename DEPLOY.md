# Deploying to DigitalOcean App Platform

This app uses **PostgreSQL** (DigitalOcean Managed Database) for persistent storage — no volumes needed.

---

## Step 1 — Generate a secure admin password hash

Run this once on your computer:

```bash
cd spanish-quiz-app
npm install
node -e "const b=require('bcryptjs'); b.hash('YourChosenPassword',12).then(console.log)"
```

Copy the `$2a$12$...` output — you'll paste it into DigitalOcean.

---

## Step 2 — Push to a private GitHub repo

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/spanish-quiz.git
git push -u origin main
```

Make sure to create the repo as **Private** on GitHub first.

---

## Step 3 — Create a Managed PostgreSQL Database

1. In your DigitalOcean dashboard, click **Create → Databases**
2. Choose **PostgreSQL** (latest version is fine)
3. Pick the **$15/month** plan (smallest available)
4. Choose the same region you'll use for your app (e.g., New York)
5. Name it something like `spanish-quiz-db`
6. Click **Create Database Cluster** — takes about 1-2 minutes

---

## Step 4 — Create the App

1. Click **Create → Apps**
2. Choose **GitHub** as your source
3. Select your `spanish-quiz` repo, branch `main`
4. DigitalOcean detects the `Dockerfile` automatically
5. Choose the **Basic** plan ($5/month)
6. Set **HTTP Port** to `8080`

---

## Step 5 — Attach the Database

1. Still in the app creation wizard, look for **Add a Database**  
   *(or go to: App → Settings → App-Level → Add Component → Database)*
2. Select **Previously Created Database**
3. Choose the `spanish-quiz-db` cluster you just made
4. DigitalOcean will automatically inject a `DATABASE_URL` environment variable into your app — you don't need to copy/paste the connection string manually

---

## Step 6 — Add Environment Variables

In the App settings under **App-Level Environment Variables**, add:

| Key | Value | Encrypted? |
|-----|-------|-----------|
| `NODE_ENV` | `production` | No |
| `PORT` | `8080` | No |
| `SESSION_SECRET` | *(run: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)* | **Yes** |
| `ADMIN_PASSWORD_HASH` | *(the `$2a$12$...` hash from Step 1)* | **Yes** |

> `DATABASE_URL` is injected automatically by DigitalOcean when you attach the database — don't add it manually.

---

## Step 7 — Deploy

Click **Deploy**. DigitalOcean builds the Docker image and launches it. Takes about 2-3 minutes.

Your app will be at something like:
`https://spanish-quiz-abc123.ondigitalocean.app`

---

## Step 8 — Test it

1. Open the app URL — you should see the quiz start screen
2. Take a quick test as "Bmylo"
3. Go to `https://your-app-url/admin`
4. Log in with your chosen password
5. Confirm the attempt appears and open response grading works

---

## Updating the app

Push to the `main` branch on GitHub — DigitalOcean auto-deploys.

---

## Customizing questions

All questions and passages live server-side:
- `src/questions.js` — 110 MC questions (Fiesta Fatal, Preterite, Imperfect, Vocab)
- `src/readings.js` — 10 reading passages (one per version)

Edit, commit, push. Bmylo's browser never sees these files.

---

## Local development

```bash
# Create a .env file from the template
cp .env.example .env
# Edit .env — set DATABASE_URL to a local Postgres instance
# and ADMIN_PASSWORD to something simple

npm install
npm run dev    # uses nodemon for auto-restart
```

---

## Security summary

- Correct answers never leave the server
- Admin panel: bcrypt-hashed password + httpOnly session cookie (4hr expiration)
- Rate limiting: 300 req/15min on quiz API, 100 req/15min on admin
- Helmet.js with strict CSP headers
- Source maps blocked from being served
- PostgreSQL with SSL enforced in production
