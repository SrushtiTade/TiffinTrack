import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    mealType: { type: String, enum: ['Lunch', 'Dinner', 'Both'], default: 'Lunch' },
    status: { type: String, enum: ['Active', 'Inactive', 'Expired', 'Paused', 'Cancelled'], default: 'Active' },
    source: { type: String, enum: ['platform', 'manual'], default: 'platform' },
  },
  { timestamps: true }
);

customerSchema.index({ messId: 1, userId: 1 }, { unique: true, sparse: true });

export default mongoose.model('Customer', customerSchema);
