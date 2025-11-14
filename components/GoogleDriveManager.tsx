

import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import * as googleDriveService from '../services/googleDriveService';
import { GoogleDriveIcon } from './icons/GoogleDriveIcon';

interface GoogleDriveManagerProps {
  isGapiReady: boolean;
  onSignInSuccess: (profile: UserProfile) => void;
  isSignedIn: boolean;
  clientId: string;
  setClientId: (id: string) => void;
}

export const GoogleDriveManager: React.FC<GoogleDriveManagerProps> = ({ isGapiReady, onSignInSuccess, isSignedIn, clientId, setClientId }) => {
  useEffect(() => {
    if (isGapiReady && clientId) {
        // FIX: The initTokenClient function now expects only one argument (the onSignIn callback).
        // The client ID is handled internally by the googleDriveService.
        googleDriveService.initTokenClient(onSignInSuccess);
    }
  }, [isGapiReady, clientId, onSignInSuccess]);


  return (
    <div>
        <h2 className="text-lg font-semibold text-cyan-400 mb-2 flex items-center gap-2">
            <GoogleDriveIcon className="w-5 h-5"/>
            Google Drive Integration
        </h2>
        
        {!isSignedIn && (
            <div className="space-y-4">
                <div>
                    <label htmlFor="clientId" className="block text-sm font-medium text-slate-300 mb-1">
                        Your Google API Client ID
                    </label>
                    <input
                        type="text"
                        id="clientId"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="Paste your Client ID here"
                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        Sign in to the app and save images to your drive. {' '}
                        <a href="https://developers.google.com/workspace/guides/create-credentials#oauth-client-id" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">
                            How to get a Client ID?
                        </a>
                    </p>
                </div>
                 <p className="text-sm text-slate-400">
                    Sign in via the button in the header to get started.
                </p>
            </div>
        )}
        {isSignedIn && (
             <p className="text-sm text-slate-400">
                You are signed in. You can now save your generated images directly to your Google Drive.
            </p>
        )}
    </div>
  );
};
