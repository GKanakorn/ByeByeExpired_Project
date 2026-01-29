import dotenv from 'dotenv'
dotenv.config()
import app from './app';


console.log('ENV CHECK:', {
  PORT: process.env.PORT,
  SUPABASE_URL: process.env.SUPABASE_URL,
  KEY: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10)
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});