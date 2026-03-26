import { MongoClient } from 'mongodb';

let mongoClient;
let db;

async function connectToMongo() {
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.MONGODB_URI);
    await mongoClient.connect();
    db = mongoClient.db('medyra'); // Your DB name
  }
  return db;
}

export async function GET() {
  try {
    const db = await connectToMongo();
    const users = await db.collection('users').find().limit(5).toArray(); // sample query
    return new Response(JSON.stringify({ success: true, users }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}