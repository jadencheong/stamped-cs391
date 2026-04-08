// will have to explain where we got mongoose from (Anna)
import mongoose from 'mongoose';


const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// i'm using "global" here because it allows for a cached connection across hot reloads
// (everytime i run the script in a normal Node.js app, the const db = mongoose.connect() command also runs.
// this means that i can end up with x different connections. global survivies in background memory and "checks" for an existing conenction)
// https://stackoverflow.com/questions/75206870/nextjs-mongoose-mongo-atlas-multiple-connections-even-with-caching
let cached = (global as any).mongoose;

// initialize if cached is "empty"
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn; // if there's already a connection, use it

  // if not already "trying", begin 
  if (!cached.promise) {
    const opts = { bufferCommands: false,};

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  // try to connect, wait for it to finish
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // didn't work, throw error
    cached.promise = null;
    throw e;
  }

  // give us the connection
  return cached.conn;
}

export default dbConnect;