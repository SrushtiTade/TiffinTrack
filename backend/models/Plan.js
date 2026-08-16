import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true },
    planName: { type: String, required: true, trim: true },
    duration: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    mealType: { type: String, enum: ['Lunch', 'Dinner', 'Both'], default: 'Lunch' },
    description: { type: String, trim: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

export default mongoose.model('Plan', planSchema);
