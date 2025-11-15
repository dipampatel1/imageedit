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
    
    if (!projectId || !publishableClientKey) {
      return null;
    }

    const module = await loadStackAuth();
    if (module) {
      try {
        const { StackClientApp } = module;
        stackClient = new StackClientApp({
          projectId,
          publishableClientKey,
        });
      } catch (error) {
        console.warn('Failed to initialize Stack Auth:', error);
        return null;
      }
    } else {
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

