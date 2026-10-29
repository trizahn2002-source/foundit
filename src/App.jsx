
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ReportItem from "./pages/ReportItem";
import ItemDetails from "./pages/ItemDetails";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import LoginOTP from "./pages/LoginOTP";
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";
import "./App.css";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<ReportItem />} />
          <Route path="/items/:id" element={<ItemDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/verify-otp" element={<LoginOTP />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
        <Footer />
      </main>
    </>
  );
}

export default App;
