/**
 * Vercel Speed Insights Integration
 * Initializes Speed Insights for performance monitoring on static HTML sites
 * 
 * This uses the inline script approach recommended for HTML/static sites.
 * Documentation: https://vercel.com/docs/speed-insights/quickstart
 */

// Initialize the Speed Insights queue
window.si = window.si || function () { 
  (window.siq = window.siq || []).push(arguments); 
};

// Create and inject the Speed Insights script
(function() {
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/speed-insights/script.js';
  
  // Add SDK metadata
  script.setAttribute('data-sdkn', '@vercel/speed-insights');
  script.setAttribute('data-sdkv', '2.0.0');
  
  // Inject the script into the document head
  if (document.head) {
    document.head.appendChild(script);
  } else {
    // Fallback if head isn't ready yet
    document.addEventListener('DOMContentLoaded', function() {
      document.head.appendChild(script);
    });
  }
  
  console.log('[Speed Insights] Initialized successfully');
})();
