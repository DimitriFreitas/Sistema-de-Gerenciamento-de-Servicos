import mongoose from "mongoose";

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI não foi configurada. Crie backend/.env com a string de conexão do MongoDB.");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB conectado");
}
