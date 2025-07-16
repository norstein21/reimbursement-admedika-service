export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USERNAME || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'reimbursement_db',
  },
  admedika: {
    baseUrl: process.env.ADMEDIKA_BASE_URL || 'https://api.admedika.com',
    apiKey: process.env.ADMEDIKA_API_KEY || 'your_api_key',
    projectId: process.env.ADMEDIKA_PROJECT_ID || 'your_project_id',
  },
});
