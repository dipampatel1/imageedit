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
- 💳 **Subscription Plans**: Free, Pro, and Business tiers
- ☁️ **Cloud Storage**: Google Drive integration

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **AI**: Google Gemini 2.5 Flash Image
- **Database**: Neon PostgreSQL
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
   DATABASE_URL=your_neon_connection_string
   
   # Optional: Neon Auth (Stack Auth) credentials
   # Get these from your Neon project after provisioning Neon Auth
   VITE_STACK_PROJECT_ID=your_stack_project_id
   VITE_STACK_PUBLISHABLE_CLIENT_KEY=your_publishable_client_key
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
   - `VITE_STACK_PROJECT_ID`: Your Neon Auth project ID (optional, for user authentication)
   - `VITE_STACK_PUBLISHABLE_CLIENT_KEY`: Your Neon Auth publishable client key (optional)
3. Deploy!

## User Authentication

The app includes a complete user management system with:
- **Sign Up / Sign In**: User registration and authentication
- **User Portal**: Profile management and subscription status
- **Neon Auth Integration**: Optional integration with Neon Auth (Stack Auth) for production-ready authentication
- **localStorage Fallback**: Works without Neon Auth for development/testing

### Setting Up Neon Auth (Optional)

1. Go to your Neon project dashboard
2. Navigate to the Neon Auth section
3. Provision Neon Auth for your project
4. Copy your Project ID and Publishable Client Key
5. Add them to your environment variables (see above)

If Neon Auth is not configured, the app will automatically use localStorage for authentication (suitable for development/testing).

The site will automatically build and deploy on every push to main.
