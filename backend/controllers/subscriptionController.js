import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';
import Customer from '../models/Customer.js';
import { syncExpiredSubscriptions } from '../services/checkoutService.js';

export const getSubscriptions = async (req, res) => {
  try {
    await syncExpiredSubscriptions(req.mess._id);
    const subscriptions = await Subscription.find({ messId: req.mess._id })
      .populate('customerId', 'name phone email')
      .populate('planId', 'planName duration mealType price')
      .sort({ createdAt: -1 });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSubscription = async (req, res) => {
  try {
    const { customerId, planId, startDate } = req.body;

    const plan = await Plan.findOne({ _id: planId, messId: req.mess._id, status: 'Active' });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const customer = await Customer.findOne({ _id: customerId, messId: req.mess._id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const start = new Date(startDate || Date.now());
    const end = new Date(start);
    end.setDate(end.getDate() + plan.duration);

    const subscription = await Subscription.create({
      ownerId: req.user._id,
      messId: req.mess._id,
      customerId: customer._id,
      userId: req.user._id,
      planId: plan._id,
      startDate: start,
      endDate: end,
      price: plan.price,
      status: 'Active',
    });

    customer.status = 'Active';
    customer.mealType = plan.mealType;
    await customer.save();

    const populated = await Subscription.findById(subscription._id)
      .populate('customerId', 'name phone email')
      .populate('planId', 'planName duration mealType price');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const pauseSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, messId: req.mess._id },
      { status: 'Paused' },
      { new: true }
    )
      .populate('customerId', 'name phone')
      .populate('planId', 'planName duration mealType');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resumeSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, messId: req.mess._id },
      { status: 'Active' },
      { new: true }
    )
      .populate('customerId', 'name phone')
      .populate('planId', 'planName duration mealType');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const renewSubscription = async (req, res) => {
  try {
    const existing = await Subscription.findOne({
      _id: req.params.id,
      messId: req.mess._id,
    }).populate('planId');

    if (!existing) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const plan = existing.planId;
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + plan.duration);

    const subscription = await Subscription.findByIdAndUpdate(
      existing._id,
      { startDate: start, endDate: end, status: 'Active', price: plan.price },
      { new: true }
    )
      .populate('customerId', 'name phone')
      .populate('planId', 'planName duration mealType');

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, messId: req.mess._id },
      { status: 'Cancelled' },
      { new: true }
    );
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
