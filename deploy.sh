#!/bin/bash

# Configuration
PROJECT_ID="castit-coming-soon"
SERVICE_NAME="castit-coming-soon"
REGION="us-central1"

echo "🚀 Deploying Castit Coming Soon to Google Cloud Run..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "❌ Not authenticated with gcloud. Running 'gcloud auth login'..."
    gcloud auth login
fi

# Get current project
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)

if [ -z "$CURRENT_PROJECT" ]; then
    echo "❌ No project set. Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📋 Using project: $CURRENT_PROJECT"

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com containerregistry.googleapis.com

# Build and deploy
echo "🏗️  Building and deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars="NODE_ENV=production" \
    --memory 512Mi \
    --cpu 1 \
    --timeout 60 \
    --concurrency 80 \
    --min-instances 0 \
    --max-instances 100

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')
    echo "🌐 Your app is live at: $SERVICE_URL"
    echo ""
    echo "⚠️  Don't forget to set environment variables in Cloud Run:"
    echo "   - SENDBLUE_API_KEY"
    echo "   - SENDBLUE_API_SECRET"
    echo "   - YOUR_PHONE_NUMBER"
    echo ""
    echo "You can set them using:"
    echo "gcloud run services update $SERVICE_NAME --update-env-vars SENDBLUE_API_KEY=xxx,SENDBLUE_API_SECRET=xxx,YOUR_PHONE_NUMBER=+1234567890 --region $REGION"
else
    echo "❌ Deployment failed!"
    exit 1
fi