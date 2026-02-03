import 'dotenv/config';

import { connectDB } from './db.mjs';

import bot from './bot.js';

await connectDB();

bot.launch();