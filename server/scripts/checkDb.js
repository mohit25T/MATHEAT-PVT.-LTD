import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!uri) {
  console.error('Error: MONGO_URI is not set in environment variables.');
  process.exit(1);
}

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
