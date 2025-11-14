
import type { EditedImage, UserProfile } from '../types';
import { base64ToBlob } from './blobUtils';

// Let TypeScript know about the google global objects
declare const google: any;
declare const gapi: any;

// Global type declarations for Google API objects on the window
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

// IMPORTANT: Your Google Client ID should be set as an environment variable.
// This is a placeholder for development and should be replaced.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';


let tokenClient: any = null;
let gapiInited = false;
let gisInited = false;

// GAPI script has loaded, now load the client part
async function initializeGapiClient() {
  await gapi.client.init({
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
}

// GIS script has loaded, now initialize the token client
function initializeGisClient() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    scope: SCOPES,
    callback: () => {}, // Initially empty, will be populated by initTokenClient
  });
  gisInited = true;
}

// Helper to ensure Google scripts from index.html are loaded and initialized
export function loadGapiScript(onReady: () => void) {
    // This function polls for the scripts to be ready, preventing duplicate loading.
    const pollInterval = setInterval(() => {
        if (window.gapi && window.google) {
            clearInterval(pollInterval);
            
            // Scripts are loaded, now initialize them
            gapi.load('client', initializeGapiClient);
            initializeGisClient();

            // Poll until both are fully initialized
            const initInterval = setInterval(() => {
                if(gapiInited && gisInited) {
                    clearInterval(initInterval);
                    onReady();
                }
            }, 100);
        }
    }, 100);
}


export function initTokenClient(onSignIn: (profile: UserProfile) => void) {
    if (!tokenClient) {
        console.error("GIS client not initialized.");
        return;
    }
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
        console.error("Google Client ID is not configured. Please set it in your environment variables.");
        return;
    }

    tokenClient.config.client_id = GOOGLE_CLIENT_ID;
    tokenClient.config.callback = async (resp: any) => {
        if (resp.error !== undefined) {
          throw (resp);
        }
        
        // Fetch user profile info
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { 'Authorization': `Bearer ${resp.access_token}` }
        });
        const profile = await response.json();
        
        onSignIn({
            name: profile.name,
            email: profile.email,
            imageUrl: profile.picture
        });
      };
}


export function signIn() {
    if (!tokenClient) {
        console.error("Cannot sign in: Token client not ready.");
        return;
    }
    if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

export function signOut() {
    const token = gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token, () => {
        gapi.client.setToken(null);
      });
    }
}

export async function uploadImageToDrive(image: EditedImage): Promise<void> {
    const accessToken = gapi.client.getToken()?.access_token;
    if (!accessToken) {
        throw new Error("User not signed in or token expired.");
    }
    
    const imageBlob = base64ToBlob(image.base64, image.mimeType);

    const metadata = {
        name: `edited-${image.originalName}`,
        mimeType: image.mimeType,
    };
    
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', imageBlob);
    
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: form
    });
    
    if (!response.ok) {
        const errorBody = await response.json();
        console.error("Google Drive API Error:", errorBody);
        throw new Error(`Failed to upload file. Status: ${response.status}`);
    }
}
