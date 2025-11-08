import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    // Add database name if not present in URI
    const uriWithDB = mongoURI.includes('/?') 
      ? mongoURI.replace('/?', '/project-manager?')
      : mongoURI.endsWith('/') 
        ? mongoURI + 'project-manager'
        : mongoURI + '/project-manager';
    
    const conn = await mongoose.connect(uriWithDB);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

