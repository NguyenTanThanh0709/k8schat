import { connect, set } from 'mongoose';
import * as dotenv from 'dotenv'


dotenv.config()

export const connectToDB = async () => {
  try {
    set('strictQuery', false);
    const db = await connect(process.env.MONGO_DB_URI as string);
    console.log('MongoDB connected to', db.connection.name);
    // Emit an event when the connection is successful
  } catch (error) {
    console.error(error);
    // Emit an event when there's an error
  }
};