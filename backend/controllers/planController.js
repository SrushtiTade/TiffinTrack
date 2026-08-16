import Plan from '../models/Plan.js';

export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ messId: req.mess._id }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPlan = async (req, res) => {
  try {
    const plan = await Plan.findOne({ _id: req.params.id, messId: req.mess._id });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    const plan = await Plan.create({
      ...req.body,
      ownerId: req.user._id,
      messId: req.mess._id,
    });
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findOneAndUpdate(
      { _id: req.params.id, messId: req.mess._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findOneAndDelete({ _id: req.params.id, messId: req.mess._id });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json({ message: 'Plan removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
