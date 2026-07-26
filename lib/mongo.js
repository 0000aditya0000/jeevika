import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URL;
const dbName = process.env.DB_NAME || 'jeevikaa_couture';

let clientPromise;
if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, { maxPoolSize: 10 });
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

export const COLLECTIONS = {
  products: 'products',
  categories: 'categories',
  orders: 'orders',
  users: 'users',
  admins: 'admins',
  wishlist: 'wishlist',
  reviews: 'reviews',
  coupons: 'coupons',
  testimonials: 'testimonials',
  settings: 'settings',
  newsletter: 'newsletter',
};
