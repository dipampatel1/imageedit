<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Image Editor

AI-powered image editing and generation web application using Google Gemini API, with Supabase PostgreSQL database integration.

## Features

- ✨ **Image Editing**: Upload and edit images with AI-powered prompts
- 🎨 **Image Generation**: Generate images from text descriptions
- 📊 **Usage Tracking**: Track generation limits per user
- 🖼️ **Image Gallery**: Save and manage your generated images
- 💳 **Subscription Plans**: Free, Pro, and Business tiers
- ☁️ **Cloud Storage**: Google Drive integration

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **AI**: Google Gemini 2.5 Flash Image
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
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
   
   # Supabase Configuration
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Optional: For admin panel link
   VITE_SUPABASE_PROJECT_REF=your_project_ref
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
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for server-side functions)
   - `VITE_SUPABASE_URL`: Your Supabase project URL (for client-side)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key (for client-side)
   - `VITE_SUPABASE_PROJECT_REF`: Your Supabase project reference (optional, for admin panel)
3. Deploy!

## User Authentication

The app includes a complete user management system with:
- **Sign Up / Sign In**: User registration and authentication via Supabase Auth
- **User Portal**: Profile management and subscription status
- **Supabase Auth**: Production-ready authentication with Supabase
- **localStorage Fallback**: Works without Supabase for development/testing

### Setting Up Supabase

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions on:
- Creating a Supabase project
- Getting your credentials
- Setting up the database schema
- Configuring environment variables
- Setting up Row Level Security (RLS) policies

If Supabase is not configured, the app will automatically use localStorage for authentication (suitable for development/testing).

The site will automatically build and deploy on every push to main.
