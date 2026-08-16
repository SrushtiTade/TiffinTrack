import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import Expense from '../models/Expense.js';
import { syncExpiredSubscriptions } from '../services/checkoutService.js';

const getDateRange = (period) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (period === 'daily') {
    start.setHours(0, 0, 0, 0);
  } else if (period === 'weekly') {
    start.setDate(start.getDate() - 7);
  } else if (period === 'monthly') {
    start.setMonth(start.getMonth() - 1);
  } else if (period === 'yearly') {
    start.setFullYear(start.getFullYear() - 1);
  } else {
    start.setFullYear(2000);
  }

  return { start, end };
};

export const getDashboard = async (req, res) => {
  try {
    const messId = req.mess._id;
    const messObjId = new mongoose.Types.ObjectId(messId);
    const { period = 'monthly' } = req.query;
    const { start, end } = getDateRange(period);
    const now = new Date();

    await syncExpiredSubscriptions(messId);

    const [totalCustomers, activeSubscriptions, expiredSubscriptions, payments, expenses, recentPayments, recentExpenses, financialSeries] =
      await Promise.all([
        Customer.countDocuments({ messId }),
        Subscription.countDocuments({ messId, status: 'Active', endDate: { $gte: now } }),
        Subscription.countDocuments({
          messId,
          $or: [{ status: 'Expired' }, { endDate: { $lt: now } }],
        }),
        Payment.aggregate([
          { $match: { messId: messObjId, paymentStatus: 'Paid', paymentDate: { $gte: start, $lte: end } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Expense.aggregate([
          { $match: { messId: messObjId, expenseDate: { $gte: start, $lte: end } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Payment.find({ messId, paymentStatus: 'Paid' })
          .populate('customerId', 'name')
          .populate({ path: 'subscriptionId', populate: { path: 'planId', select: 'planName' } })
          .sort({ paymentDate: -1 })
          .limit(5),
        Expense.find({ messId }).sort({ expenseDate: -1 }).limit(5),
        Payment.aggregate([
          { $match: { messId: messObjId, paymentStatus: 'Paid', paymentDate: { $gte: start, $lte: end } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } },
              revenue: { $sum: '$amount' },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    const revenue = payments[0]?.total || 0;
    const totalExpenses = expenses[0]?.total || 0;
    const profit = revenue - totalExpenses;

    res.json({
      totalCustomers,
      activeSubscriptions,
      expiredSubscriptions,
      revenue,
      expenses: totalExpenses,
      profit,
      recentPayments,
      recentExpenses,
      financialOverview: {
        revenue,
        expenses: totalExpenses,
        profit,
        series: financialSeries,
        period,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
