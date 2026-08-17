import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import CustomerLayout from '../../components/CustomerLayout';

const MySubscription = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renewing, setRenewing] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await axios.get('/customer-portal/subscription');
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load subscription details');
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  const handleRenew = async () => {
    try {
      setRenewing(true);
      await axios.post('/customer-portal/subscription/renew', { paymentMethod: 'UPI' });
      // Refresh subscription data
      const response = await axios.get('/customer-portal/subscription');
      setData(response.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to renew subscription');
    } finally {
      setRenewing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
      case 'expired':
        return <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-red-100 text-red-800">Expired</span>;
      case 'paused':
        return <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">Paused</span>;
      default:
        return <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (loading) {
    return (
      <CustomerLayout title="My Subscription">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout title="My Subscription">
      <div className="max-w-3xl mx-auto">
        {error && (
          <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-md border border-red-200">
            {error}
          </div>
        )}
        
        {!data || !data.subscription ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <h2 className="text-xl font-medium text-gray-900 mb-2">No active subscription</h2>
            <p className="text-gray-500 mb-6">You don't have any active mess subscriptions right now.</p>
            <Link to="/customer/explore" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700">
              Explore Messes
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{data.subscription.messId?.name}</h2>
                  <p className="text-gray-500">{data.subscription.messId?.location}</p>
                </div>
                <div>
                  {getStatusBadge(data.subscription.status)}
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Plan Details: {data.subscription.planId?.planName}</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase">Meal Type</p>
                  <p className="font-semibold text-gray-900 capitalize">{data.subscription.planId?.mealType}</p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase">Price</p>
                  <p className="font-semibold text-gray-900">₹{data.subscription.planId?.price?.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase">Start Date</p>
                  <p className="font-semibold text-gray-900">{new Date(data.subscription.startDate).toLocaleDateString()}</p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase">End Date</p>
                  <p className="font-semibold text-gray-900">{new Date(data.subscription.endDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">Progress</span>
                  <span className="font-medium text-orange-600">{data.remainingDays} days remaining</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-orange-500 h-2.5 rounded-full" 
                    style={{ width: `${Math.max(0, Math.min(100, 100 - (data.remainingDays / data.subscription.planId?.duration) * 100))}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">Out of {data.subscription.planId?.duration} days</p>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-100 flex justify-end gap-3 border-t border-gray-200">
              {data.subscription.status?.toLowerCase() === 'active' && (
                <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Pause Subscription
                </button>
              )}
              {data.subscription.status?.toLowerCase() === 'expired' && (
                <button 
                  onClick={handleRenew}
                  disabled={renewing}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400"
                >
                  {renewing ? 'Renewing...' : 'Renew Subscription'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default MySubscription;
