# Castit Email Backend API Documentation

## Overview
The Castit email backend is a lightweight Express.js service deployed on Google Cloud Run that handles email subscriptions for the coming soon landing page.

## Base URL
```
https://castit-email-backend-928327063539.us-central1.run.app
```

## Authentication
Admin endpoints require API key authentication. Include the API key in the request header:
```
X-API-Key: 84fd92df0e0670e91b164aeac7b29d4a81f34201b007f6de546344ad7dd21ab8
```

## Endpoints

### 1. Health Check
**GET /**
- No authentication required
- Returns service health status

Example:
```bash
curl https://castit-email-backend-928327063539.us-central1.run.app/
```

Response:
```json
{
  "status": "healthy",
  "service": "castit-email-backend"
}
```

### 2. Subscribe Email
**POST /api/subscribe**
- No authentication required
- Adds email to subscriber list

Request Body:
```json
{
  "email": "user@example.com"
}
```

Example:
```bash
curl -X POST https://castit-email-backend-928327063539.us-central1.run.app/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

Success Response (201):
```json
{
  "success": true,
  "message": "Successfully subscribed!"
}
```

Error Response (409 - Duplicate):
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### 3. Get Statistics (Admin)
**GET /api/admin/stats**
- Requires API key authentication
- Returns subscriber count

Example:
```bash
curl -H "X-API-Key: 84fd92df0e0670e91b164aeac7b29d4a81f34201b007f6de546344ad7dd21ab8" \
  https://castit-email-backend-928327063539.us-central1.run.app/api/admin/stats
```

Response:
```json
{
  "totalSubscribers": 3,
  "lastUpdated": "2025-07-02T02:30:17.798Z"
}
```

### 4. List All Subscribers (Admin)
**GET /api/admin/subscribers**
- Requires API key authentication
- Returns all subscriber details

Example:
```bash
curl -H "X-API-Key: 84fd92df0e0670e91b164aeac7b29d4a81f34201b007f6de546344ad7dd21ab8" \
  https://castit-email-backend-928327063539.us-central1.run.app/api/admin/subscribers
```

Response:
```json
{
  "count": 3,
  "subscribers": [
    {
      "email": "user@example.com",
      "subscribedAt": "2025-07-02T02:22:47.891Z",
      "source": "landing_page",
      "status": "active"
    }
  ]
}
```

## CORS Configuration
The backend allows requests from:
- https://castit.ai
- https://www.castit.ai
- http://localhost:3000
- https://castit-coming-soon-928327063539.us-central1.run.app

## Environment Variables
- `PORT`: Server port (default: 8080)
- `GOOGLE_CLOUD_PROJECT`: GCP project ID
- `ADMIN_API_KEY`: API key for admin endpoints
- `SENDBLUE_API_KEY`: Sendblue API key (for future SMS integration)
- `SENDBLUE_API_SECRET`: Sendblue API secret (for future SMS integration)

## Database
Emails are stored in Google Firestore with the following structure:
```
Collection: email_subscribers
Document ID: email address
Fields:
  - email: string
  - subscribedAt: ISO date string
  - source: string (default: "landing_page")
  - status: string (default: "active")
```

## Deployment
The backend is deployed on Google Cloud Run and automatically scales based on traffic.

To redeploy:
```bash
cd backend
docker build --platform linux/amd64 -t gcr.io/titanium-vision-455301-c4/castit-email-backend:latest .
docker push gcr.io/titanium-vision-455301-c4/castit-email-backend:latest
gcloud run deploy castit-email-backend --image gcr.io/titanium-vision-455301-c4/castit-email-backend:latest --region us-central1
```

## Security Notes
- The API key should be rotated regularly
- The `/api/admin/subscribers` endpoint should be removed or further secured before production
- Consider implementing rate limiting for the subscribe endpoint
- Add input validation and sanitization for email addresses