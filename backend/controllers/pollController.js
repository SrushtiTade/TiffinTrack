import MealPoll from '../models/MealPoll.js';
import MealPollVote from '../models/MealPollVote.js';
import Meal from '../models/Meal.js';

export const getPolls = async (req, res) => {
  try {
    const polls = await MealPoll.find({ messId: req.mess._id }).sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPoll = async (req, res) => {
  try {
    const { question, options, deadline, scheduledDate } = req.body;
    const poll = await MealPoll.create({
      ownerId: req.user._id,
      messId: req.mess._id,
      question,
      options: options.map((text) => ({ text, votes: 0 })),
      deadline,
      scheduledDate,
      status: 'Open',
    });
    res.status(201).json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const closePoll = async (req, res) => {
  try {
    const poll = await MealPoll.findOne({ _id: req.params.id, messId: req.mess._id });
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    poll.status = 'Closed';
    const winner = [...poll.options].sort((a, b) => b.votes - a.votes)[0];
    if (winner) poll.winningOptionId = winner._id;
    await poll.save();
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const publishPollMeal = async (req, res) => {
  try {
    const poll = await MealPoll.findOne({ _id: req.params.id, messId: req.mess._id });
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    const winner = poll.options.id(poll.winningOptionId) || [...poll.options].sort((a, b) => b.votes - a.votes)[0];
    if (!winner) return res.status(400).json({ message: 'No winning option found' });

    poll.publishedMealTitle = winner.text;
    await poll.save();

    const meal = await Meal.create({
      ownerId: req.user._id,
      messId: req.mess._id,
      title: winner.text,
      items: [winner.text],
      scheduledDate: poll.scheduledDate || new Date(),
      source: 'poll',
      isPublished: true,
    });

    res.json({ poll, meal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
