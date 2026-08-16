import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true },
    // A Razorpay order is recorded before checkout finishes, so a failed payment
    // can be retained without activating/creating a customer for the mess.
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Razorpay'],
      default: 'UPI',
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Failed'],
      default: 'Paid',
    },
    transactionId: { type: String, trim: true },
    gateway: { type: String, enum: ['Razorpay'], default: 'Razorpay' },
    razorpayOrderId: { type: String, trim: true, unique: true, sparse: true },
    razorpayPaymentId: { type: String, trim: true, unique: true, sparse: true },
    razorpaySignature: { type: String, trim: true },
    checkoutStartDate: { type: Date },
    paymentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
