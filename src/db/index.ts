import mongoose, { type ConnectOptions } from "mongoose";
import logger from "../utils/logger";

export const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI || "mongodb://localhost:27017/jb-scraper";
    const options: ConnectOptions = {
      autoIndex: true,
    };
    const connection = await mongoose.connect(mongoURI, options);
    logger.info(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
