import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb+srv://mohittopiya2564_db_user:2564%40Mohit@apexit.2qbg0ge.mongodb.net/MATHEAT?retryWrites=true&w=majority&appName=apexit";

async function check() {
  const conn = await mongoose.connect(uri);
  console.log('Connected to DB:', conn.connection.name);
  const collections = await conn.connection.db.listCollections().toArray();
  console.log('Collections count:', collections.length);
  for (const c of collections) {
    const count = await conn.connection.db.collection(c.name).countDocuments();
    console.log(`- ${c.name}: ${count} docs`);
  }
  await mongoose.disconnect();
}
check();
