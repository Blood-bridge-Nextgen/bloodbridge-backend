import mongoose from "mongoose";

export async function initializeMongooseConnection() {
  const uri = process.env.MONGO_DB_URI;

  if (!uri) {
    throw new Error("Cannot connect to MongoDB");
  }

  await mongoose.connect(uri);

  console.log(`Connected to MongoDB database`);
}
