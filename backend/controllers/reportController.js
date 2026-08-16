import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import Payment from '../models/Payment.js';
import Expense from '../models/Expense.js';
import Subscription from '../models/Subscription.js';

export const getRevenueReport = async (req, res) => {
  try {
    const ownerId = req.owner._id;
    const payments = await Payment.find({ ownerId, paymentStatus: 'Paid' })
      .populate('customerId', 'name')
      .sort({ paymentDate: -1 });

    const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({ totalIncome, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExpenseReport = async (req, res) => {
  try {
    const ownerId = req.owner._id;
    const expenses = await Expense.find({ ownerId }).sort({ expenseDate: -1 });

    const categoryBreakdown = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({ totalSpending, categoryBreakdown, expenses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfitReport = async (req, res) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.owner._id);

    const [payments, expenses] = await Promise.all([
      Payment.aggregate([
        { $match: { ownerId, paymentStatus: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { ownerId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const revenue = payments[0]?.total || 0;
    const totalExpenses = expenses[0]?.total || 0;
    const profit = revenue - totalExpenses;

    res.json({ revenue, totalExpenses, profit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomerReport = async (req, res) => {
  try {
    const ownerId = req.owner._id;
    const customers = await Customer.find({ ownerId });

    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c) => c.status === 'Active').length;
    const inactiveCustomers = totalCustomers - activeCustomers;

    res.json({ totalCustomers, activeCustomers, inactiveCustomers, customers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPlanReport = async (req, res) => {
  try {
    const plans = await Subscription.aggregate([
      { $match: { messId: new mongoose.Types.ObjectId(req.mess._id) } },
      { $group: { _id: '$planId', subscribers: { $sum: 1 }, revenue: { $sum: '$price' } } },
      { $lookup: { from: 'plans', localField: '_id', foreignField: '_id', as: 'plan' } },
      { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, planId: '$_id', planName: '$plan.planName', subscribers: 1, revenue: 1 } },
      { $sort: { subscribers: -1 } },
    ]);
    res.json({ plans });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
