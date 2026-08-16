import mongoose from 'mongoose';

const mealPollVoteSchema = new mongoose.Schema(
  {
    pollId: { type: mongoose.Schema.Types.ObjectId, ref: 'MealPoll', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    optionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

mealPollVoteSchema.index({ pollId: 1, userId: 1 }, { unique: true });

export default mongoose.model('MealPollVote', mealPollVoteSchema);
