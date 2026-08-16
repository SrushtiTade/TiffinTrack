import Review from '../models/Review.js';

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ messId: req.mess._id })
      .populate('userId', 'fullName')
      .sort({ createdAt: -1 });

    const distribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
    }));

    res.json({
      averageRating: req.mess.rating,
      totalReviews: reviews.length,
      reviews,
      distribution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
