// src/lib/config/environment.ts

// N8n webhook configuration
export const N8N_CONFIG = {
  WEBHOOK_URL: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
};

// Validate environment configuration
export const validateEnvironment = () => {
  if (!N8N_CONFIG.WEBHOOK_URL) {
    console.warn('Warning: N8n webhook URL is not configured. Check your environment variables.');
  }
};