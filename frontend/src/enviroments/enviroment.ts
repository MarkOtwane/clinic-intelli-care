export const environment = {
  production: false,
  apiUrl: '/api',
  wsUrl: 'ws://localhost:3000',
  cloudinary: {
    cloudName: 'your-cloudinary-cloud-name',
    uploadPreset: 'your-upload-preset',
    apiKey: 'your-api-key',
  },
  features: {
    enableAI: true,
    enableNotifications: true,
    enableFileUploads: true,
    enableRealTimeChat: false,
    enableAnalytics: true,
  },
  limits: {
    maxFileSize: 10485760, // 10MB
    maxFilesPerUpload: 5,
    appointmentAdvanceBookingDays: 30,
  },
  ai: {
    analysisTimeout: 30000, // 30 seconds
    confidenceThreshold: 60,
    enableFollowUpQuestions: true,
  },
  notifications: {
    enablePush: true,
    enableEmail: true,
    enableSMS: false,
  },
};
