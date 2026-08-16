import Meal from '../models/Meal.js';

export const getMeals = async (req, res) => {
  try {
    const meals = await Meal.find({ messId: req.mess._id }).sort({ scheduledDate: 1 });
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMeal = async (req, res) => {
  try {
    const meal = await Meal.create({
      ...req.body,
      ownerId: req.user._id,
      messId: req.mess._id,
    });
    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMeal = async (req, res) => {
  try {
    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, messId: req.mess._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, messId: req.mess._id });
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json({ message: 'Meal removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
