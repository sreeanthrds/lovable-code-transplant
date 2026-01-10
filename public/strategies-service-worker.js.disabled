// Service Worker to intercept API calls and serve local strategies
self.addEventListener('install', (event) => {
  console.log('🔧 Strategies Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ Strategies Service Worker activated');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Intercept strategy list requests
  if (url.pathname.includes('/backtest/strategies/list') || url.pathname.includes('/strategies/list')) {
    console.log('🎯 Intercepting strategies list request:', event.request.url);
    
    event.respondWith(
      new Promise((resolve) => {
        // Get strategies from localStorage
        const getLocalStrategies = () => {
          try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key?.startsWith('strategy-')) {
                keys.push(key);
              }
            }
            
            const strategies = keys.map(key => {
              try {
                const data = JSON.parse(localStorage.getItem(key) || '{}');
                return {
                  id: data.id,
                  name: data.name || 'Untitled Strategy',
                  description: data.description || '',
                  created: data.created,
                  lastModified: data.lastModified,
                  nodes: data.nodes || [],
                  edges: data.edges || []
                };
              } catch (e) {
                console.warn('Failed to parse strategy:', key, e);
                return null;
              }
            }).filter(Boolean);
            
            return strategies;
          } catch (error) {
            console.error('Error getting local strategies:', error);
            return [];
          }
        };
        
        const strategies = getLocalStrategies();
        console.log('📊 Serving local strategies:', strategies.length);
        
        const response = new Response(JSON.stringify({
          success: true,
          data: strategies
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
        
        resolve(response);
      })
    );
    return;
  }
  
  // Let other requests pass through
  event.respondWith(fetch(event.request));
});