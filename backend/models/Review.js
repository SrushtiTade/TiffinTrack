import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

reviewSchema.index({ messId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
