import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { CustomerLayout } from '../../components/CustomerLayout';

const MessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mess, setMess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    const fetchMessDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/messes/${id}`);
        setMess(response.data);
      } catch (err) {
        setError('Failed to load mess details. Please try again.');
        console.error('Error fetching mess details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessDetails();
  }, [id]);

  const handleSubscribe = (planId) => {
    navigate(`/customer/checkout?messId=${id}&planId=${planId}`);
  };

  const submitReview = async (event) => {
    event.preventDefault();
    try {
      await axios.post('/customer-portal/reviews', { messId: id, rating: Number(review.rating), comment: review.comment });
      setReviewMessage('Thank you — your review has been saved.');
    } catch (err) {
      setReviewMessage(err.response?.data?.message || 'Unable to submit review.');
    }
  };

  if (loading) {
    return (
      <CustomerLayout title="Loading...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </CustomerLayout>
    );
  }

  if (error || !mess) {
    return (
      <CustomerLayout title="Error">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg shadow-sm text-center">
          <p>{error || 'Mess not found.'}</p>
          <button 
            onClick={() => navigate('/customer/explore')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Back to Explore
          </button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout title={mess.name}>
      <div className="space-y-8 pb-12">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="h-48 bg-gray-200 relative flex items-center justify-center">
             <span className="text-6xl">🍲</span>
          </div>
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{mess.name}</h1>
                <p className="text-gray-600 flex items-center text-lg mb-2">
                  <span className="mr-2">📍</span> {mess.location}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-1 rounded">
                    <span className="mr-1">⭐</span> 
                    <span className="font-bold text-gray-900 mr-1">{Number(mess.rating || 0).toFixed(1)}</span>
                    <span className="text-gray-500 text-sm">({mess.totalReviews || 0} reviews)</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">{mess.activeSubscriptions || 0}</span> active subs
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">{mess.totalCustomers || 0}</span> customers
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">{mess.expiredSubscriptions || 0}</span> expired subs
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 min-w-[250px]">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">Contact Info</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center"><span className="mr-2">👤</span> {mess.ownerId?.ownerName || mess.ownerId?.name || 'Owner'}</p>
                  <p className="flex items-center"><span className="mr-2">📞</span> {mess.contact || mess.ownerId?.phone || 'Not available'}</p>
                  <p className="flex items-center truncate"><span className="mr-2">✉️</span> {mess.ownerId?.email || 'Not available'}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {mess.description || 'No description provided.'}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {mess.operatingHours && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wider">Operating Hours</h3>
                  <p className="text-gray-700">{mess.operatingHours}</p>
                </div>
              )}
              {mess.mealTypes && mess.mealTypes.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wider">Meal Types Available</h3>
                  <div className="flex flex-wrap gap-2">
                    {mess.mealTypes.map((type, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plans Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Plans</h2>
          {(!mess.plans || mess.plans.length === 0) ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
              <p className="text-gray-500">No active plans available for this mess right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mess.plans.map((plan) => (
                <div key={plan._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:border-primary-300 hover:shadow-md transition-all">
                  <div className="p-6 flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.planName}</h3>
                    <div className="my-4">
                      <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                      <span className="text-gray-500">/{plan.duration || 'month'}</span>
                    </div>
                    
                    <ul className="space-y-3 mt-6 mb-8 text-sm text-gray-600">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        Duration: {plan.duration} days
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        Meal Type: {plan.mealType}
                      </li>
                      {plan.description && (
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          {plan.description}
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                    <button
                      onClick={() => handleSubscribe(plan._id)}
                      className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      Subscribe Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Rate this mess</h2>
          <form onSubmit={submitReview} className="space-y-3">
            {reviewMessage && <p className={reviewMessage.includes('saved') ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>{reviewMessage}</p>}
            <select className="input-field max-w-xs" value={review.rating} onChange={(e) => setReview({ ...review, rating: e.target.value })}>{[5,4,3,2,1].map((rating) => <option key={rating} value={rating}>{rating} star{rating > 1 ? 's' : ''}</option>)}</select>
            <textarea className="input-field" rows="3" placeholder="Share your experience (optional)" value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} />
            <button className="btn-primary">Submit review</button>
          </form>
        </div>

        {mess.reviews && mess.reviews.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
              {mess.reviews.map((review, idx) => (
                <div key={idx} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{review.userId?.fullName || review.userId?.name || 'Customer'}</div>
                    <div className="text-yellow-500 text-sm">
                      {'⭐'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                  {review.createdAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default MessDetail;
