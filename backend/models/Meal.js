import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true },
    title: { type: String, required: true, trim: true },
    mealType: { type: String, enum: ['Lunch', 'Dinner', 'Both'], default: 'Lunch' },
    items: [{ type: String, trim: true }],
    scheduledDate: { type: Date, required: true },
    isPublished: { type: Boolean, default: true },
    source: { type: String, enum: ['manual', 'poll'], default: 'manual' },
    pollId: { type: mongoose.Schema.Types.ObjectId, ref: 'MealPoll', unique: true, sparse: true },
  },
  { timestamps: true }
);

export default mongoose.model('Meal', mealSchema);
