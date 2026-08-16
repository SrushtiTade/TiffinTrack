import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    paymentReference: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Paused', 'Cancelled'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Subscription', subscriptionSchema);
