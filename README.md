# Castit Coming Soon Page

A beautiful coming soon page for Castit with email signup and SMS notifications.

## Features

- 🌊 Animated gradient waves
- 📧 Email signup with validation
- 📱 SMS notifications via Sendblue when someone signs up
- 🚀 Deployed on Google Cloud Run
- 🔒 Rate limiting and security headers

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required variables:
- `SENDBLUE_API_KEY`: Your Sendblue API key
- `SENDBLUE_API_SECRET`: Your Sendblue API secret
- `YOUR_PHONE_NUMBER`: Your phone number in E.164 format (e.g., +1234567890)

### 3. Run locally
```bash
npm start
# or for development with auto-reload
npm run dev
```

Visit http://localhost:8080

## Deployment to Google Cloud Run

### Prerequisites
- Google Cloud account
- `gcloud` CLI installed and authenticated
- A Google Cloud project

### Deploy
```bash
./deploy.sh
```

After deployment, set your environment variables:
```bash
gcloud run services update castit-coming-soon \
  --update-env-vars SENDBLUE_API_KEY=your_key,SENDBLUE_API_SECRET=your_secret,YOUR_PHONE_NUMBER=+1234567890 \
  --region us-central1
```

## How it works

1. Users enter their email on the landing page
2. Email is validated and saved to `signups.json`
3. An SMS notification is sent to your phone via Sendblue
4. User receives a success message

## SMS Notification Format
```
🎉 New Castit signup!

Email: user@example.com
Time: 12/29/2024, 3:45:00 PM

Total signups: Check signups.json
```

## Security

- Rate limiting: 5 signups per IP per 15 minutes
- Helmet.js for security headers
- Input validation
- CORS protection

## File Structure
```
castit-coming-soon/
├── public/           # Frontend files
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── server.js         # Express server
├── package.json      # Dependencies
├── Dockerfile        # Container config
├── deploy.sh         # Deployment script
└── signups.json      # Email storage (created automatically)
```