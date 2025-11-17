<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Image Editor

AI-powered image editing and generation web application using Google Gemini API, with Neon PostgreSQL database integration.

## Features

- ✨ **Image Editing**: Upload and edit images with AI-powered prompts
- 🎨 **Image Generation**: Generate images from text descriptions
- 📊 **Usage Tracking**: Track generation limits per user
- 🖼️ **Image Gallery**: Save and manage your generated images
- 💳 **Subscription Plans**: Free, Starter, Pro, and Business tiers
- ☁️ **Cloud Storage**: Google Drive integration

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **AI**: Google Gemini 2.5 Flash Image
- **Database**: Neon PostgreSQL
- **Authentication**: localStorage (with Neon Auth/Stack Auth support)
- **Backend**: Netlify Functions
- **Payment**: Stripe

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_NETLIFY_FUNCTIONS_URL=http://localhost:8888/.netlify/functions
   
   # Neon Database Configuration
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   
   # Optional: For admin panel link
   VITE_NEON_PROJECT_ID=your_neon_project_id
   
   # Stripe Configuration (Client-side)
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   VITE_STRIPE_STARTER_MONTHLY_PRICE_ID=price_...
   VITE_STRIPE_STARTER_ANNUAL_PRICE_ID=price_...
   VITE_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
   VITE_STRIPE_PRO_ANNUAL_PRICE_ID=price_...
   VITE_STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_...
   VITE_STRIPE_BUSINESS_ANNUAL_PRICE_ID=price_...
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

   Or with Netlify Functions:
   ```bash
   npm run dev:netlify
   ```

## Deployment

### Netlify

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify Dashboard:
   - `VITE_GEMINI_API_KEY`: Your Gemini API key (must start with VITE_)
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `VITE_NEON_PROJECT_ID`: Your Neon project ID (optional, for admin panel)
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
   - `VITE_STRIPE_*_PRICE_ID`: Your Stripe Price IDs for each tier
3. Deploy!

## User Authentication

The app includes a complete user management system with:
- **Sign Up / Sign In**: User registration and authentication via localStorage
- **User Portal**: Profile management and subscription status
- **Database Integration**: User data stored in Neon PostgreSQL
- **localStorage Fallback**: Works for development/testing

### Setting Up Neon Database

1. Create a Neon project at [neon.tech](https://neon.tech)
2. Get your connection string from the Neon Console
3. Run the database schema from `database/schema.sql` in the Neon SQL Editor
4. Set `DATABASE_URL` in your environment variables

The site will automatically build and deploy on every push to main.
