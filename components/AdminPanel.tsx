import React from 'react';

interface AdminPanelProps {
  onClose: () => void;
  neonProjectId?: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, neonProjectId }) => {
  // Construct Neon Console URL
  // Format: https://console.neon.tech/app/projects/{project_id}
  const neonConsoleUrl = neonProjectId 
    ? `https://console.neon.tech/app/projects/${neonProjectId}`
    : 'https://console.neon.tech';

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close admin panel"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Neon Console Link */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Database Management
            </h3>
            <p className="text-slate-300 mb-4">
              Access the Neon Console to manage users, view database tables, run SQL queries, and monitor your database.
            </p>
            <a
              href={neonConsoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open Neon Console
            </a>
          </div>

          {/* Admin Features Info */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-3">Admin Capabilities</h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>View and manage all users in the database</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Update user subscription tiers and limits</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Promote users to admin or demote admins</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Run SQL queries to analyze usage and data</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Monitor database performance and connections</span>
              </li>
            </ul>
          </div>

          {/* Quick SQL Examples */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-3">Quick SQL Queries</h3>
            <p className="text-slate-400 text-sm mb-4">Use these queries in the Neon SQL Editor:</p>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-300 mb-1 font-medium">View all users:</p>
                <code className="block bg-slate-950 p-3 rounded text-xs text-slate-300 overflow-x-auto">
                  SELECT user_id, email, tier, user_level, images_generated FROM user_usage ORDER BY created_at DESC;
                </code>
              </div>
              
              <div>
                <p className="text-sm text-slate-300 mb-1 font-medium">Promote user to admin:</p>
                <code className="block bg-slate-950 p-3 rounded text-xs text-slate-300 overflow-x-auto">
                  UPDATE user_usage SET user_level = 'admin' WHERE email = 'user@example.com';
                </code>
              </div>
              
              <div>
                <p className="text-sm text-slate-300 mb-1 font-medium">View admin users:</p>
                <code className="block bg-slate-950 p-3 rounded text-xs text-slate-300 overflow-x-auto">
                  SELECT * FROM user_usage WHERE user_level = 'admin';
                </code>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
