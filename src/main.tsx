import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.tsx'
import './index.css'
import './utils/errorSuppression' // Suppress development environment errors

console.log('🚀 TradeLayout initializing...');

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn("⚠️ Missing Clerk Publishable Key - app will use mock auth");
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ Failed to find the root element");
} else {
  try {
    console.log("✅ Creating React root and rendering application...");
    const root = createRoot(rootElement);
    
    // Wrap with ClerkProvider if key exists, otherwise just AuthProvider handles mock auth
    const AppWithAuth = () => (
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    
    if (CLERK_PUBLISHABLE_KEY) {
      root.render(
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
          <AppWithAuth />
        </ClerkProvider>
      );
    } else {
      root.render(<AppWithAuth />);
    }
    
    console.log("🎉 TradeLayout application rendered successfully!");
    
  } catch (error) {
    console.error("❌ Error rendering application:", error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif; background: #f8f9fa; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 600px;">
          <h2 style="color: #e53e3e; margin-bottom: 16px;">🚨 Application Error</h2>
          <p style="margin-bottom: 20px; color: #4a5568;">There was a problem loading the TradeLayout application.</p>
          <button onclick="window.location.reload()" style="padding: 12px 24px; background: #3182ce; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
            🔄 Refresh Page
          </button>
        </div>
      </div>
    `;
  }
}
