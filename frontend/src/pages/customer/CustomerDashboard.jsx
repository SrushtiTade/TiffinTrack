import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { CustomerLayout } from '../../components/CustomerLayout';
import { useAuth } from '../../context/AuthContext';

const CustomerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/customer-portal/dashboard');
        setData(response.data);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <CustomerLayout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout title="Dashboard">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg shadow-sm">
          {error}
        </div>
      </CustomerLayout>
    );
  }

  const { subscription, remainingDays, recentPayment, todayMeal, nextMeal, currentMess } = data || {};

  return (
    <CustomerLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Welcome back, {user?.fullName}!</h2>
          <p className="text-gray-500 mt-1">Here's an overview of your tiffin service.</p>
        </div>

        {!subscription ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active subscription</h3>
            <p className="text-gray-500 mb-6">You don't have any active tiffin subscription right now.</p>
            <Link
              to="/customer/explore"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Explore Messes
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-gray-500">Current Mess</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">{subscription.messId?.name || currentMess?.name || 'N/A'}</p>
                <p className="mt-1 text-sm text-yellow-600">⭐ {Number(subscription.messId?.rating || currentMess?.rating || 0).toFixed(1)}</p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-gray-500">Plan</p>
                <p className="mt-2 text-lg font-semibold text-gray-900">{subscription.planId?.planName || 'N/A'}</p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-gray-500">Remaining Days</p>
                <p className="mt-2 text-3xl font-bold text-primary-600">{remainingDays || 0}</p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    subscription.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' : 
                    subscription.status?.toLowerCase() === 'paused' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {subscription.status ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) : 'Unknown'}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">🍽️ Today's Meal</h3>
                {todayMeal ? <><p className="font-medium">{todayMeal.title}</p><p className="text-sm text-gray-500 mt-1">{todayMeal.items?.join(', ')}</p></> : <p className="text-gray-500 italic">No meal information available.</p>}
              </div>
              {/* Next Meal */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🕒</span> Next Meal
                </h3>
                {nextMeal ? (
                  <div>
                    <p className="font-medium text-gray-800 text-lg">{nextMeal.type}</p>
                    <p className="text-gray-500 mt-1">{nextMeal.time}</p>
                    {nextMeal.menu && <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded">{nextMeal.menu}</p>}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No meal information available.</p>
                )}
              </div>

              {/* Recent Payment */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">💳</span> Recent Payment
                </h3>
                {recentPayment ? (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold text-gray-900">₹{recentPayment.amount}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-gray-800">{new Date(recentPayment.paymentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <span className={`text-sm font-medium ${
                        recentPayment.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {recentPayment.paymentStatus?.toUpperCase() || 'PAID'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No recent payments found.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerDashboard;
