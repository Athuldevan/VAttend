import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.DB_URL;
    if (!mongoURI) {
      throw new Error('DB_URL is not defined in the environment variables');
    }

    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
