import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('🚨 404 Error Details:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      fullUrl: window.location.href,
      timestamp: new Date().toISOString()
    });
  }, [location.pathname, location.search, location.hash]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Attempted to access:</p>
          <code className="text-xs bg-white px-2 py-1 rounded border">{location.pathname}</code>
        </div>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
