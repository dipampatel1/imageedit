# Password Recovery Guide

## Important: How Authentication Works

**Passwords are stored in your browser's localStorage, NOT in the Neon database.**

- **Neon Database**: Only stores subscription tiers, usage counts, and image history
- **Browser localStorage**: Stores your email, password, and login session

This means:
- ✅ Passwords are stored locally in your browser
- ✅ If you clear browser data, you'll need to sign up again
- ✅ Each browser/device has separate accounts
- ❌ Passwords are NOT stored in Neon database (this is correct for security)

## If You Can't Login

### Option 1: Use Forgot Password (Recommended)
1. Click "Sign In" button
2. Click "Forgot Password?" link below the password field
3. Enter your email address
4. If the email exists, you'll be able to set a new password
5. Sign in with your new password

### Option 2: Check Browser localStorage
1. Open browser console (F12)
2. Go to "Application" or "Storage" tab
3. Find "Local Storage" → your website URL
4. Look for `imageedit_users` key
5. This contains all user accounts with passwords

### Option 3: Clear and Re-sign Up
If you've lost access and forgot your email:
1. Clear browser localStorage (or use incognito mode)
2. Sign up again with a new account
3. Your usage data in Neon will be linked to the new account

## Troubleshooting

### "Password was not saved" Error
If you see this error during sign-up:
- The password might not have been saved to localStorage
- Try signing up again
- Check browser console for errors
- Make sure localStorage is enabled in your browser

### "Invalid email or password" Error
Possible causes:
1. **Wrong password**: Use "Forgot Password" to reset it
2. **localStorage cleared**: You'll need to sign up again
3. **Different browser**: Each browser has separate accounts
4. **Password not saved during sign-up**: Sign up again

### Check if Your Account Exists
Open browser console (F12) and run:
```javascript
// Check if you have an account
const users = JSON.parse(localStorage.getItem('imageedit_users') || '[]');
console.log('Your accounts:', users.map(u => ({ email: u.email, hasPassword: !!u.password })));

// Check current session
const session = localStorage.getItem('imageedit_currentUser');
console.log('Current session:', session ? JSON.parse(session) : 'Not logged in');
```

## For Production (Future Enhancement)

In a production app, you would:
1. Use a proper authentication service (Neon Auth, Supabase Auth, Auth0, etc.)
2. Store password hashes (never plain text) in a secure database
3. Send password reset emails
4. Use secure password reset tokens

Currently, the app uses localStorage for simplicity, which is fine for development but not for production.

