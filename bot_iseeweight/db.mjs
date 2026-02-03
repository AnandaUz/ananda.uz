import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env', import.meta.url) });

const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_DB } = process.env;

const MONGO_URI =
    `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}` +
    `@cluster0.vqcukp6.mongodb.net/${MONGODB_DB}?retryWrites=true&w=majority`;


export async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}