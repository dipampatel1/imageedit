// Neon Auth (Stack Auth) integration service
// Note: This requires @stackframe/js to be installed and configured
// with VITE_STACK_PROJECT_ID and VITE_STACK_PUBLISHABLE_CLIENT_KEY

let stackClient: any = null;
let stackModule: any = null;

const loadStackAuth = async () => {
  if (stackModule) return stackModule;
  
  try {
    stackModule = await import('@stackframe/js');
    return stackModule;
  } catch (error) {
    console.warn('Stack Auth package not available, using localStorage fallback');
    return null;
  }
};

export const getStackClient = async (): Promise<any> => {
  if (typeof window === 'undefined') return null;
  
  if (!stackClient) {
    const projectId = import.meta.env.VITE_STACK_PROJECT_ID;
    const publishableClientKey = import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY;
    
    console.log('Stack Auth config check:', { 
      hasProjectId: !!projectId, 
      hasPublishableKey: !!publishableClientKey,
      projectId: projectId?.substring(0, 10) + '...',
    });
    
    if (!projectId || !publishableClientKey) {
      console.warn('Stack Auth not configured - missing credentials');
      return null;
    }

    const module = await loadStackAuth();
    if (module) {
      try {
        console.log('Stack Auth module loaded, initializing client...');
        const { StackClientApp } = module;
        stackClient = new StackClientApp({
          projectId,
          publishableClientKey,
        });
        console.log('Stack Auth client initialized successfully');
        console.log('Stack client methods:', Object.keys(stackClient));
      } catch (error) {
        console.error('Failed to initialize Stack Auth:', error);
        return null;
      }
    } else {
      console.warn('Stack Auth module not available');
      return null;
    }
  }
  
  return stackClient;
};

export const isNeonAuthConfigured = (): boolean => {
  const projectId = import.meta.env.VITE_STACK_PROJECT_ID;
  const publishableClientKey = import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY;
  
  return !!(projectId && publishableClientKey);
};

