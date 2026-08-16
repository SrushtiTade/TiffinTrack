import crypto from 'crypto';
import Plan from '../models/Plan.js';
import Mess from '../models/Mess.js';
import Customer from '../models/Customer.js';
import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';

export const getCheckoutPreview = async (req, res) => {
  try {
    const { messId, planId, startDate } = req.query;
    const mess = await Mess.findOne({ _id: messId, isActive: true });
    const plan = await Plan.findOne({ _id: planId, messId, status: 'Active' });
    if (!mess || !plan) return res.status(404).json({ message: 'Mess or active plan not found' });
    const start = new Date(startDate || Date.now());
    const end = new Date(start);
    end.setDate(end.getDate() + plan.duration);
    res.json({ mess: { _id: mess._id, name: mess.name, location: mess.location }, plan, startDate: start, endDate: end, price: plan.price });
  } catch (error) { res.status(400).json({ message: error.message }); }
};

export const processCheckout = async (req, res) => {
  try {
    const { messId, planId, paymentMethod, startDate } = req.body;
    const user = req.user;

    const mess = await Mess.findOne({ _id: messId, isActive: true });
    const plan = await Plan.findOne({ _id: planId, messId, status: 'Active' });
    if (!mess || !plan) return res.status(404).json({ message: 'Mess or active plan not found' });

    // Create or update customer record
    let customer = await Customer.findOne({ messId: mess._id, userId: user._id });
    if (!customer) {
      customer = await Customer.create({
        ownerId: mess.ownerId,
        messId: mess._id,
        userId: user._id,
        name: user.fullName || user.ownerName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        mealType: plan.mealType,
        status: 'Active',
        source: 'platform',
      });
    } else {
      customer.status = 'Active';
      customer.mealType = plan.mealType;
      await customer.save();
    }

    // Create subscription
    const start = new Date(startDate || Date.now());
    const end = new Date(start);
    end.setDate(end.getDate() + plan.duration);

    const subscription = await Subscription.create({
      ownerId: mess.ownerId,
      messId: mess._id,
      customerId: customer._id,
      userId: user._id,
      planId: plan._id,
      startDate: start,
      endDate: end,
      price: plan.price,
      status: 'Active',
    });

    // Create payment
    const transactionId = 'MH-' + crypto.randomBytes(6).toString('hex').toUpperCase();

    const payment = await Payment.create({
      ownerId: mess.ownerId,
      messId: mess._id,
      customerId: customer._id,
      userId: user._id,
      subscriptionId: subscription._id,
      amount: plan.price,
      paymentMethod: paymentMethod || 'UPI',
      paymentStatus: 'Paid',
      transactionId,
      paymentDate: new Date(),
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate('customerId', 'name email phone')
      .populate({ path: 'subscriptionId', populate: { path: 'planId', select: 'planName duration mealType price' } });

    const populatedSubscription = await Subscription.findById(subscription._id)
      .populate('messId', 'name location')
      .populate('planId', 'planName duration price mealType');

    res.status(201).json({
      message: 'Payment successful',
      customer,
      subscription: populatedSubscription,
      payment: populatedPayment,
      mess,
      plan,
      transactionId,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
