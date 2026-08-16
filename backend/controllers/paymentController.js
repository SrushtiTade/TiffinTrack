import Payment from '../models/Payment.js';
import Customer from '../models/Customer.js';

export const getPayments = async (req, res) => {
  try {
    const { search, status, paymentMethod, startDate, endDate } = req.query;
    const filter = { messId: req.mess._id };

    if (status) filter.paymentStatus = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    let payments = await Payment.find(filter)
      .populate('customerId', 'name phone email')
      .populate({ path: 'subscriptionId', populate: { path: 'planId', select: 'planName' } })
      .sort({ paymentDate: -1 });

    if (search) {
      payments = payments.filter(
        (p) =>
          p.customerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.transactionId?.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPayment = async (req, res) => {
  try {
    const { customerId, amount, paymentMethod, paymentStatus, paymentDate, subscriptionId } = req.body;

    const customer = await Customer.findOne({ _id: customerId, messId: req.mess._id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const payment = await Payment.create({
      ownerId: req.user._id,
      messId: req.mess._id,
      customerId: customer._id,
      userId: req.user._id,
      subscriptionId: subscriptionId || undefined,
      amount,
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: paymentStatus || 'Paid',
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
    });

    const populated = await Payment.findById(payment._id)
      .populate('customerId', 'name phone email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { _id: req.params.id, messId: req.mess._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('customerId', 'name phone');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePayment = async (req, res) => {
  return res.status(403).json({ message: 'Automatic payment records cannot be deleted' });
};
