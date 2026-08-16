import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ownerSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['OWNER', 'CUSTOMER'], default: 'OWNER', required: true },
    businessName: { type: String, trim: true },
    ownerName: { type: String, trim: true },
    fullName: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6 },
    address: { type: String, trim: true },
  },
  { timestamps: true }
);

ownerSchema.pre('validate', function (next) {
  if (this.role === 'OWNER') {
    if (!this.businessName || !this.ownerName) {
      return next(new Error('Business name and owner name are required for owners'));
    }
  }
  if (this.role === 'CUSTOMER') {
    if (!this.fullName) {
      return next(new Error('Full name is required for customers'));
    }
  }
  next();
});

ownerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

ownerSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('Owner', ownerSchema);
