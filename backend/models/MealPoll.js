import mongoose from 'mongoose';

const pollOptionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    votes: { type: Number, default: 0 },
  },
  { _id: true }
);

const mealPollSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true },
    question: { type: String, required: true, trim: true },
    options: [pollOptionSchema],
    deadline: { type: Date, required: true },
    status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
    winningOptionId: { type: mongoose.Schema.Types.ObjectId },
    publishedMealTitle: { type: String, trim: true },
    scheduledDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('MealPoll', mealPollSchema);
