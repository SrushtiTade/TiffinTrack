import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true },
    category: {
      type: String,
      enum: ['Vegetables', 'Groceries', 'Gas', 'Electricity', 'Salary', 'Packaging', 'Rent', 'Transportation', 'Other'],
      default: 'Other',
    },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Bank Transfer', 'Card'],
      default: 'Cash',
    },
    expenseDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Expense', expenseSchema);
