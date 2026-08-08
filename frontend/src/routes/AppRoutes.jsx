import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Customers from '../pages/Customers';
import ProductList from '../pages/product/ProductList';
import AddProduct from '../pages/product/AddProduct';
import ProductDetails from '../pages/product/ProductDetails';
import EditProduct from '../pages/product/EditProduct';
import Challans from '../pages/Challans';
import CreateChallan from '../pages/challan/CreateChallan';
import ChallanDetails from '../pages/challan/ChallanDetails';
import CustomerList from '../pages/customer/CustomerList';
import AddCustomer from '../pages/customer/AddCustomer';
import CustomerDetails from '../pages/customer/CustomerDetails';
import EditCustomer from '../pages/customer/EditCustomer';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="p-6 bg-white rounded-xl shadow-md text-center">
          <p className="text-lg font-medium">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />
      <Route
        element={
          isAuthenticated ? (
            <AppLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />
        <Route
          path="/customers"
          element={<ProtectedRoute element={<CustomerList />} />}
        />
        <Route
          path="/customers/new"
          element={<ProtectedRoute element={<AddCustomer />} />}
        />
        <Route
          path="/customers/:id"
          element={<ProtectedRoute element={<CustomerDetails />} />}
        />
        <Route
          path="/customers/:id/edit"
          element={<ProtectedRoute element={<EditCustomer />} />}
        />
        <Route
          path="/products"
          element={<ProtectedRoute element={<ProductList />} />}
        />
        <Route
          path="/products/new"
          element={<ProtectedRoute element={<AddProduct />} />}
        />
        <Route
          path="/products/:id"
          element={<ProtectedRoute element={<ProductDetails />} />}
        />
        <Route
          path="/products/:id/edit"
          element={<ProtectedRoute element={<EditProduct />} />}
        />
        <Route
          path="/challans"
          element={<ProtectedRoute element={<Challans />} />}
        />
        <Route
          path="/challans/new"
          element={<ProtectedRoute element={<CreateChallan />} />}
        />
        <Route
          path="/challans/:id"
          element={<ProtectedRoute element={<ChallanDetails />} />}
        />
      </Route>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes;
