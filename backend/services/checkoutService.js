import crypto from 'crypto';
import Razorpay from 'razorpay';
import Customer from '../models/Customer.js';
import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import Plan from '../models/Plan.js';
import Mess from '../models/Mess.js';

const getRazorpay = () => {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }
  return new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
};

export const createCheckoutOrder = async ({ user, messId, planId, startDate }) => {
  const mess = await Mess.findOne({ _id: messId, isActive: true });
  const plan = await Plan.findOne({ _id: planId, messId, status: 'Active' });
  if (!mess || !plan) throw new Error('Mess or active plan not found');

  const order = await getRazorpay().orders.create({
    amount: Math.round(plan.price * 100),
    currency: 'INR',
    receipt: `tt_${Date.now()}_${plan._id.toString().slice(-6)}`,
    notes: { messId: mess._id.toString(), planId: plan._id.toString(), customerUserId: user._id.toString() },
  });

  await Payment.create({
    ownerId: mess.ownerId,
    messId: mess._id,
    userId: user._id,
    planId: plan._id,
    amount: plan.price,
    paymentMethod: 'Razorpay',
    paymentStatus: 'Pending',
    gateway: 'Razorpay',
    razorpayOrderId: order.id,
    checkoutStartDate: startDate ? new Date(startDate) : new Date(),
  });

  return { order, mess, plan };
};

export const verifyAndCompleteCheckout = async ({ user, razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const payment = await Payment.findOne({ razorpayOrderId, userId: user._id });
  if (!payment) throw new Error('Checkout order not found');
  if (payment.paymentStatus === 'Paid') return payment;

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  const suppliedSignature = Buffer.from(razorpaySignature || '');
  const expectedSignature = Buffer.from(expected);
  const isValid = suppliedSignature.length === expectedSignature.length
    && crypto.timingSafeEqual(expectedSignature, suppliedSignature);
  if (!isValid) {
    payment.paymentStatus = 'Failed';
    payment.razorpayPaymentId = razorpayPaymentId;
    await payment.save();
    throw new Error('Payment verification failed');
  }

  const [mess, plan] = await Promise.all([
    Mess.findById(payment.messId),
    Plan.findOne({ _id: payment.planId, messId: payment.messId }),
  ]);
  if (!mess || !plan) throw new Error('The mess or plan for this order is no longer available');

  let customer = await Customer.findOne({ messId: mess._id, userId: user._id });
  if (!customer) {
    customer = await Customer.create({
      ownerId: mess.ownerId, messId: mess._id, userId: user._id,
      name: user.fullName, email: user.email, phone: user.phone, address: user.address,
      mealType: plan.mealType, status: 'Active', source: 'platform',
    });
  } else {
    customer.status = 'Active';
    customer.mealType = plan.mealType;
    await customer.save();
  }

  const startDate = payment.checkoutStartDate || new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + plan.duration);
  const subscription = await Subscription.create({
    ownerId: mess.ownerId, messId: mess._id, customerId: customer._id, userId: user._id,
    planId: plan._id, startDate, endDate, price: payment.amount,
    paymentReference: razorpayPaymentId, status: 'Active',
  });

  payment.customerId = customer._id;
  payment.subscriptionId = subscription._id;
  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.transactionId = razorpayPaymentId;
  payment.paymentMethod = 'Razorpay';
  payment.paymentStatus = 'Paid';
  payment.paymentDate = new Date();
  await payment.save();

  return Payment.findById(payment._id)
    .populate('customerId', 'name email phone')
    .populate({ path: 'subscriptionId', populate: { path: 'planId', select: 'planName duration mealType price' } });
};

export const markCheckoutFailed = async ({ user, razorpayOrderId }) =>
  Payment.findOneAndUpdate(
    { razorpayOrderId, userId: user._id, paymentStatus: 'Pending' },
    { paymentStatus: 'Failed' },
    { new: true }
  );

export const syncExpiredSubscriptions = async (messId) => {
  const now = new Date();
  await Subscription.updateMany({ messId, status: 'Active', endDate: { $lt: now } }, { status: 'Expired' });
  const customersWithActiveSubs = await Subscription.distinct('customerId', { messId, status: 'Active', endDate: { $gte: now } });
  await Customer.updateMany({ messId, status: 'Active', _id: { $nin: customersWithActiveSubs } }, { status: 'Expired' });
};
