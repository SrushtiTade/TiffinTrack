import mongoose from 'mongoose';

const messSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true, unique: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    location: { type: String, trim: true },
    address: { type: String, trim: true },
    contact: { type: String, trim: true },
    description: { type: String, trim: true },
    mealTypes: [{ type: String, enum: ['Lunch', 'Dinner', 'Both'] }],
    operatingHours: { type: String, trim: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Mess', messSchema);
