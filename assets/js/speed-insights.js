/**
 * Vercel Speed Insights Integration
 * Initializes Speed Insights for performance monitoring
 */
import { injectSpeedInsights } from '../../node_modules/@vercel/speed-insights/dist/index.mjs';

// Initialize Speed Insights
injectSpeedInsights({
  debug: false, // Set to true for debugging in development
  sampleRate: 1, // Send 100% of events (adjust to reduce volume if needed)
});

console.log('[Speed Insights] Initialized successfully');
