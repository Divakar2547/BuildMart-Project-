import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AdminPage from './pages/AdminPage';

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function AdminLayout({ children }) {
  return <div className="min-h-screen">{children}</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#ffffff',
                color: '#1f2937',
                borderRadius: '10px',
                fontSize: '14px',
                padding: '12px 16px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
              success: {
                iconTheme: { primary: '#f59e0b', secondary: '#000' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
          <Routes>
            {/* Auth pages - no layout footer/header except navbar handled inside */}
            <Route path="/login" element={
              <Layout>
                <AuthPage />
              </Layout>
            } />
            <Route path="/register" element={
              <Layout>
                <AuthPage />
              </Layout>
            } />

            {/* Admin - with layout so navbar is visible */}
            <Route path="/admin" element={
              <Layout>
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              </Layout>
            } />

            {/* Main store routes */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
            <Route path="/products/:id" element={<Layout><ProductDetailPage /></Layout>} />
            <Route path="/cart" element={<Layout><CartPage /></Layout>} />
            <Route path="/checkout" element={
              <Layout>
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="/orders" element={
              <Layout>
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              </Layout>
            } />
            <Route path="/orders/:id" element={
              <Layout>
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              </Layout>
            } />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
