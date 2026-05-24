import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type CachedConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: CachedConnection | undefined;
}

const cached: CachedConnection = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error(
      "No se encontró MONGODB_URI. Crea un archivo .env.local en la raíz del proyecto y reinicia npm run dev."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}