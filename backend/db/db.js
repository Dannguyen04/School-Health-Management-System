import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
  } catch (error) {
    console.log(error);
  }
};

export default connectToDatabase;
