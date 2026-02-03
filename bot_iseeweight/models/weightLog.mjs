import mongoose from 'mongoose';

const weightLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now },
    weight: Number,
    comment: String
});

export const WeightLog = mongoose.model('WeightLog', weightLogSchema);
