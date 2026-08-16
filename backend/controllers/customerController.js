import Customer from '../models/Customer.js';
import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import { syncExpiredSubscriptions } from '../services/checkoutService.js';

export const getCustomers = async (req, res) => {
  try {
    const { search, status, planId, filter } = req.query;
    await syncExpiredSubscriptions(req.mess._id);

    const query = { messId: req.mess._id };
    if (status && status !== 'All') query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    let customers = await Customer.find(query).sort({ createdAt: -1 });
    const subs = await Subscription.find({ messId: req.mess._id })
      .populate('planId', 'planName duration price')
      .sort({ createdAt: -1 });

    // Platform customers are created by verified checkout; enrich every row so
    // the owner can immediately see the plan and dates without manual entry.
    customers = customers.map((customer) => {
      const sub = subs.find((s) => s.customerId.toString() === customer._id.toString());
      return { ...customer.toObject(), currentSubscription: sub || null };
    });

    if (planId || filter) {

      if (planId) {
        customers = customers.filter((c) => c.currentSubscription?.planId?._id?.toString() === planId);
      }

      if (filter === 'expiring-soon') {
        const soon = new Date();
        soon.setDate(soon.getDate() + 7);
        customers = customers.filter(
          (c) => c.currentSubscription && new Date(c.currentSubscription.endDate) <= soon
        );
      } else if (filter === 'recently-joined') {
        const recent = new Date();
        recent.setDate(recent.getDate() - 30);
        customers = customers.filter((c) => new Date(c.createdAt) >= recent);
      } else if (filter === 'expired') {
        customers = customers.filter((c) => c.status === 'Expired');
      }
    }

    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, messId: req.mess._id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const [subscriptions, payments] = await Promise.all([
      Subscription.find({ customerId: customer._id, messId: req.mess._id })
        .populate('planId', 'planName duration price')
        .sort({ createdAt: -1 }),
      Payment.find({ customerId: customer._id, messId: req.mess._id }).sort({ paymentDate: -1 }),
    ]);

    res.json({ customer, subscriptions, payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, mealType, status } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }

    const customer = await Customer.create({
      ownerId: req.user._id,
      messId: req.mess._id,
      name,
      email,
      phone,
      address,
      mealType: mealType || 'Lunch',
      status: status || 'Active',
      source: 'manual',
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, messId: req.mess._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, messId: req.mess._id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
