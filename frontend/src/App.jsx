import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/customers/CustomerList';
import AddCustomer from './pages/customers/AddCustomer';
import EditCustomer from './pages/customers/EditCustomer';
import PlanList from './pages/plans/PlanList';
import AddPlan from './pages/plans/AddPlan';
import EditPlan from './pages/plans/EditPlan';
import SubscriptionList from './pages/subscriptions/SubscriptionList';
import AddSubscription from './pages/subscriptions/AddSubscription';
import PaymentList from './pages/payments/PaymentList';
import AddPayment from './pages/payments/AddPayment';
import ExpenseList from './pages/expenses/ExpenseList';
import AddExpense from './pages/expenses/AddExpense';
import Reports from './pages/Reports';
import MealsAndPolls from './pages/MealsAndPolls';

import CustomerRegister from './pages/customer/CustomerRegister';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import ExploreMesses from './pages/customer/ExploreMesses';
import MessDetail from './pages/customer/MessDetail';
import Checkout from './pages/customer/Checkout';
import MySubscription from './pages/customer/MySubscription';
import MyPayments from './pages/customer/MyPayments';
import MyMeals from './pages/customer/MyMeals';
import MealVoting from './pages/customer/MealVoting';
import Profile from './pages/customer/Profile';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/customer/register" element={<CustomerRegister />} />

      {/* Owner Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute role="OWNER">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute role="OWNER">
            <CustomerList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers/add"
        element={
          <ProtectedRoute role="OWNER">
            <AddCustomer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers/:id/edit"
        element={
          <ProtectedRoute role="OWNER">
            <EditCustomer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/plans"
        element={
          <ProtectedRoute role="OWNER">
            <PlanList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/plans/add"
        element={
          <ProtectedRoute role="OWNER">
            <AddPlan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/plans/:id/edit"
        element={
          <ProtectedRoute role="OWNER">
            <EditPlan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscriptions"
        element={
          <ProtectedRoute role="OWNER">
            <SubscriptionList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscriptions/add"
        element={
          <ProtectedRoute role="OWNER">
            <AddSubscription />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute role="OWNER">
            <PaymentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments/add"
        element={
          <ProtectedRoute role="OWNER">
            <AddPayment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute role="OWNER">
            <ExpenseList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses/add"
        element={
          <ProtectedRoute role="OWNER">
            <AddExpense />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute role="OWNER">
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route path="/meals-polls" element={<ProtectedRoute role="OWNER"><MealsAndPolls /></ProtectedRoute>} />

      {/* Customer Routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute role="CUSTOMER">
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/explore"
        element={
          <ProtectedRoute role="CUSTOMER">
            <ExploreMesses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/mess/:id"
        element={
          <ProtectedRoute role="CUSTOMER">
            <MessDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/checkout"
        element={
          <ProtectedRoute role="CUSTOMER">
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/subscription"
        element={
          <ProtectedRoute role="CUSTOMER">
            <MySubscription />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/payments"
        element={
          <ProtectedRoute role="CUSTOMER">
            <MyPayments />
          </ProtectedRoute>
        }
      />
      <Route path="/customer/meals" element={<ProtectedRoute role="CUSTOMER"><MyMeals /></ProtectedRoute>} />
      <Route path="/customer/voting" element={<ProtectedRoute role="CUSTOMER"><MealVoting /></ProtectedRoute>} />
      <Route path="/customer/profile" element={<ProtectedRoute role="CUSTOMER"><Profile /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
