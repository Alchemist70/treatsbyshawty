import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AdminSignup from "./pages/AdminSignup";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import Profile from "./pages/Profile";
import PaymentOptions from "./pages/PaymentOptions";
import PaymentMethodSelection from "./pages/PaymentMethodSelection";
import BankTransfer from "./pages/BankTransfer";
import Payment from "./pages/Payment";
import ThankYou from "./pages/ThankYou";
import MyOrders from "./pages/MyOrders";
import AdminPreOrders from "./pages/AdminPreOrders";
import PreOrder from "./pages/PreOrder";
import PreOrderPayment from "./pages/PreOrderPayment";
import PreOrderPaymentCard from "./pages/PreOrderPaymentCard";
import PreOrderPaymentBank from "./pages/PreOrderPaymentBank";
import PreOrderDepositPayment from "./pages/PreOrderDepositPayment";
import CustomOrderSummary from "./pages/CustomOrderSummary";
import Search from "./pages/Search";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Layout from "./components/Layout";
import AdminFeedback from "./pages/AdminFeedback";
import AdminUserManagement from "./pages/AdminUserManagement";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/preorder" element={<PreOrder />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-signup" element={<AdminSignup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/payment-options" element={<PaymentOptions />} />
          <Route
            path="/payment-method-selection"
            element={<PaymentMethodSelection />}
          />
          <Route path="/bank-transfer" element={<BankTransfer />} />
          <Route path="/preorder-payment" element={<PreOrderPayment />} />
          <Route
            path="/preorder-payment-options"
            element={<PreOrderDepositPayment />}
          />
          <Route
            path="/preorder-deposit-payment"
            element={<PreOrderDepositPayment />}
          />
          <Route
            path="/preorder-payment-card"
            element={<PreOrderPaymentCard />}
          />
          <Route
            path="/preorder-payment-bank"
            element={<PreOrderPaymentBank />}
          />
          <Route path="/about" element={<About />} />
          <Route
            path="/custom-order-summary"
            element={<CustomOrderSummary />}
          />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/preorders" element={<AdminPreOrders />} />
          <Route path="/admin/feedback" element={<AdminFeedback />} />
          <Route path="/admin/users" element={<AdminUserManagement />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
