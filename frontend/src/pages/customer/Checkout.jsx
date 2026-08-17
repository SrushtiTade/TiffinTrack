import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import CustomerLayout from '../../components/CustomerLayout';

const formatCurrency = (amount) => {
  return '₹' + amount.toLocaleString('en-IN');
};

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const messId = searchParams.get('messId');
  const planId = searchParams.get('planId');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  useEffect(() => {
    if (!messId || !planId) {
      setError('Invalid request. Mess ID and Plan ID are required.');
      setLoading(false);
      return;
    }

    const fetchPreview = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/checkout/preview?messId=${messId}&planId=${planId}&startDate=${startDate}`);
        setPreviewData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load checkout preview');
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [messId, planId, startDate]);

  const handlePayment = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      const { data } = await axios.post('/checkout/pay', {
        messId,
        planId,
        paymentMethod,
        startDate
      });

      setSuccess(`Payment successful. Transaction ID: ${data.transactionId}`);
      setTimeout(() => navigate('/customer'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <CustomerLayout title="Checkout">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout title="Checkout">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
            {error}
          </div>
        )}
        
        {success ? (
          <div className="bg-green-50 text-green-700 p-6 rounded-md border border-green-200 text-center">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
            <p>{success}</p>
            <p className="text-sm mt-4 text-green-600">Redirecting to dashboard...</p>
          </div>
        ) : (
          previewData && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Order Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Mess Details</h3>
                  <p className="font-semibold text-lg">{previewData.mess?.name}</p>
                  <p className="text-gray-600">{previewData.mess?.location}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Plan Details</h3>
                  <p className="font-semibold text-lg">{previewData.plan?.planName}</p>
                  <p className="text-gray-600 capitalize">{previewData.plan?.mealType} • {previewData.plan?.duration} days</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium">{new Date(previewData.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">End Date:</span>
                  <span className="font-medium">{new Date(previewData.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-2">
                  <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                  <span className="text-2xl font-bold text-orange-600">{formatCurrency(previewData.price)}</span>
                </div>
              </div>

              <div className="pt-6 border-t">
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">Select Payment Method</label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 p-2 border"
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className={`w-full py-3 px-4 rounded-md text-white font-semibold text-lg mt-6 ${
                  processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {processing ? 'Processing...' : `Pay ${formatCurrency(previewData.price)} Now`}
              </button>
            </div>
          )
        )}
      </div>
    </CustomerLayout>
  );
};

export default Checkout;
