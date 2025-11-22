export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  wsUrl: 'wss://your-api-domain.com',
  cloudinary: {
    cloudName: process.env['NG_APP_CLOUDINARY_CLOUD_NAME'] || '',
    uploadPreset: process.env['NG_APP_CLOUDINARY_UPLOAD_PRESET'] || '',
    apiKey: process.env['NG_APP_CLOUDINARY_API_KEY'] || ''
  },
  features: {
    enableAI: true,
    enableNotifications: true,
    enableFileUploads: true,
    enableRealTimeChat: true,
    enableAnalytics: true
  },
  limits: {
    maxFileSize: 10485760, // 10MB
    maxFilesPerUpload: 5,
    appointmentAdvanceBookingDays: 30
  },
  ai: {
    analysisTimeout: 30000, // 30 seconds
    confidenceThreshold: 60,
    enableFollowUpQuestions: true
  },
  notifications: {
    enablePush: true,
    enableEmail: true,
    enableSMS: true
  }
};