import Customer from '../models/Customer.js';
import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import Meal from '../models/Meal.js';
import MealPoll from '../models/MealPoll.js';
import MealPollVote from '../models/MealPollVote.js';
import Review from '../models/Review.js';
import Mess from '../models/Mess.js';
import { syncExpiredSubscriptions } from '../services/checkoutService.js';

const getActiveSubscription = async (userId) => {
  const subscription = await Subscription.findOne({
    userId,
    status: 'Active',
    endDate: { $gte: new Date() },
  })
    .populate('planId', 'planName duration mealType price')
    .populate('messId', 'name location image rating')
    .sort({ createdAt: -1 });

  if (subscription && new Date() > subscription.endDate) {
    subscription.status = 'Expired';
    await subscription.save();
    return null;
  }

  return subscription;
};

export const getCustomerDashboard = async (req, res) => {
  try {
    const subscription = await getActiveSubscription(req.user._id);
    let remainingDays = 0;

    if (subscription) {
      await syncExpiredSubscriptions(subscription.messId);
      remainingDays = Math.max(
        0,
        Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24))
      );
    }

    const recentPayment = subscription
      ? await Payment.findOne({ userId: req.user._id, subscriptionId: subscription._id }).sort({ paymentDate: -1 })
      : null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const [todayMeal, nextMeal] = subscription
      ? await Promise.all([
          Meal.findOne({ messId: subscription.messId, isPublished: true, scheduledDate: { $gte: today, $lte: todayEnd } }),
          Meal.findOne({ messId: subscription.messId, isPublished: true, scheduledDate: { $gte: tomorrow, $lte: tomorrowEnd } }),
        ])
      : [null, null];

    res.json({
      subscription,
      remainingDays,
      recentPayment,
      todayMeal,
      nextMeal,
      currentMess: subscription?.messId || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLatestSubscription = async (userId) =>
  Subscription.findOne({ userId })
    .populate('planId', 'planName duration mealType price')
    .populate('messId', 'name location image rating description')
    .sort({ endDate: -1, createdAt: -1 });

export const getMySubscription = async (req, res) => {
  try {
    const subscription = await getLatestSubscription(req.user._id);
    if (!subscription) {
      return res.json(null);
    }
    const remainingDays = Math.max(
      0,
      Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    );
    res.json({ subscription, remainingDays });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const renewMySubscription = async (req, res) => {
  res.status(410).json({ message: 'Renewals must be completed through Razorpay checkout.' });
};

export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate('messId', 'name')
      .populate({ path: 'subscriptionId', populate: { path: 'planId', select: 'planName' } })
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyMeals = async (req, res) => {
  try {
    const subscription = await getActiveSubscription(req.user._id);
    if (!subscription) {
      return res.json({ today: null, tomorrow: null, upcoming: [] });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const weekLater = new Date(today);
    weekLater.setDate(weekLater.getDate() + 7);

    const [todayMeal, tomorrowMeal, upcoming] = await Promise.all([
      Meal.findOne({ messId: subscription.messId, isPublished: true, scheduledDate: { $gte: today, $lte: todayEnd } }),
      Meal.findOne({ messId: subscription.messId, isPublished: true, scheduledDate: { $gte: tomorrow, $lte: tomorrowEnd } }),
      Meal.find({
        messId: subscription.messId,
        isPublished: true,
        scheduledDate: { $gt: tomorrowEnd, $lte: weekLater },
      }).sort({ scheduledDate: 1 }),
    ]);

    res.json({ today: todayMeal, tomorrow: tomorrowMeal, upcoming });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOpenPolls = async (req, res) => {
  try {
    const subscription = await getActiveSubscription(req.user._id);
    if (!subscription) {
      return res.json([]);
    }

    const polls = await MealPoll.find({
      messId: subscription.messId,
      status: 'Open',
      deadline: { $gte: new Date() },
    }).sort({ createdAt: -1 });

    const votes = await MealPollVote.find({ userId: req.user._id, pollId: { $in: polls.map((p) => p._id) } });
    const voteMap = Object.fromEntries(votes.map((v) => [v.pollId.toString(), v.optionId.toString()]));

    res.json(
      polls.map((poll) => ({
        ...poll.toObject(),
        myVoteOptionId: voteMap[poll._id.toString()] || null,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const castVote = async (req, res) => {
  try {
    const { pollId, optionId } = req.body;
    const subscription = await getActiveSubscription(req.user._id);
    if (!subscription) {
      return res.status(403).json({ message: 'Active subscription required to vote' });
    }

    const poll = await MealPoll.findOne({ _id: pollId, messId: subscription.messId, status: 'Open' });
    if (!poll || new Date() > poll.deadline) {
      return res.status(400).json({ message: 'Poll is not open' });
    }

    const option = poll.options.id(optionId);
    if (!option) {
      return res.status(404).json({ message: 'Option not found' });
    }

    const existingVote = await MealPollVote.findOne({ pollId, userId: req.user._id });
    if (existingVote) {
      const oldOption = poll.options.id(existingVote.optionId);
      if (oldOption) oldOption.votes = Math.max(0, oldOption.votes - 1);
      const previousOptionId = existingVote.optionId.toString();
      existingVote.optionId = optionId;
      await existingVote.save();
      if (previousOptionId !== optionId) option.votes += 1;
    } else {
      await MealPollVote.create({ pollId, userId: req.user._id, optionId });
      option.votes += 1;
    }

    await poll.save();
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitReview = async (req, res) => {
  try {
    const { messId, rating, comment } = req.body;
    const hadSubscription = await Subscription.findOne({ userId: req.user._id, messId });
    if (!hadSubscription) {
      return res.status(403).json({ message: 'You must have a subscription to review this mess' });
    }

    const mess = await Mess.findById(messId);
    if (!mess) {
      return res.status(404).json({ message: 'Mess not found' });
    }

    const review = await Review.findOneAndUpdate(
      { messId, userId: req.user._id },
      { ownerId: mess.ownerId, rating, comment },
      { upsert: true, new: true, runValidators: true }
    );

    const stats = await Review.aggregate([
      { $match: { messId: mess._id } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    mess.rating = Number((stats[0]?.avgRating || 0).toFixed(1));
    mess.totalReviews = stats[0]?.count || 0;
    await mess.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await Customer.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true }
    );

    const updatedUser = await req.user.constructor.findByIdAndUpdate(
      req.user._id,
      {
        fullName: req.body.fullName || req.user.fullName,
        phone: req.body.phone || req.user.phone,
        address: req.body.address || req.user.address,
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ user: updatedUser, customerProfile: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
