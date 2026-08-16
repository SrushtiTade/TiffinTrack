import mongoose from 'mongoose';
import Mess from '../models/Mess.js';
import Plan from '../models/Plan.js';
import Customer from '../models/Customer.js';
import Subscription from '../models/Subscription.js';
import Review from '../models/Review.js';
import { syncExpiredSubscriptions } from '../services/checkoutService.js';

export const exploreMesses = async (req, res) => {
  try {
    const { search, location, mealType, minPrice, maxPrice, minRating } = req.query;
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (mealType) filter.mealTypes = mealType;
    if (minRating) filter.rating = { $gte: Number(minRating) };

    const messes = await Mess.find(filter).populate('ownerId', 'ownerName phone email').sort({ rating: -1 });

    const enriched = await Promise.all(
      messes.map(async (mess) => {
        const plans = await Plan.find({ messId: mess._id, status: 'Active' }).select('planName price duration mealType');
        const totalCustomers = await Customer.countDocuments({ messId: mess._id });
        const activeSubscriptions = await Subscription.countDocuments({
          messId: mess._id,
          status: 'Active',
          endDate: { $gte: new Date() },
        });

        let filteredPlans = plans;
        if (minPrice || maxPrice) {
          filteredPlans = plans.filter((p) => {
            if (minPrice && p.price < Number(minPrice)) return false;
            if (maxPrice && p.price > Number(maxPrice)) return false;
            return true;
          });
        }

        if ((minPrice || maxPrice) && filteredPlans.length === 0) return null;

        return {
          ...mess.toObject(),
          plans: filteredPlans,
          totalCustomers,
          activeSubscriptions,
        };
      })
    );

    res.json(enriched.filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessDetails = async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id).populate('ownerId', 'ownerName phone email');
    if (!mess || !mess.isActive) {
      return res.status(404).json({ message: 'Mess not found' });
    }

    await syncExpiredSubscriptions(mess._id);

    const [plans, totalCustomers, activeSubscriptions, expiredSubscriptions, reviews] = await Promise.all([
      Plan.find({ messId: mess._id, status: 'Active' }),
      Customer.countDocuments({ messId: mess._id }),
      Subscription.countDocuments({ messId: mess._id, status: 'Active', endDate: { $gte: new Date() } }),
      Subscription.countDocuments({
        messId: mess._id,
        $or: [{ status: 'Expired' }, { endDate: { $lt: new Date() } }],
      }),
      Review.find({ messId: mess._id }).populate('userId', 'fullName').sort({ createdAt: -1 }).limit(10),
    ]);

    res.json({
      ...mess.toObject(),
      plans,
      totalCustomers,
      activeSubscriptions,
      expiredSubscriptions,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMessSettings = async (req, res) => {
  try {
    const mess = await Mess.findOneAndUpdate({ ownerId: req.user._id }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!mess) {
      return res.status(404).json({ message: 'Mess not found' });
    }
    res.json(mess);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOwnerMess = async (req, res) => {
  try {
    const mess = await Mess.findOne({ ownerId: req.user._id });
    if (!mess) {
      return res.status(404).json({ message: 'Mess not found' });
    }
    res.json(mess);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
