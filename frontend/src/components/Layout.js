import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Marquee from "./Marquee";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const location = useLocation();

  // Define routes that should have a clean layout (no header/footer)
  const cleanLayoutRoutes = [
    "/login",
    "/signup",
    "/admin-signup",
    "/forgot-password",
    "/reset-password",
  ];

  // Check if the current route is a clean layout route
  // We also check for /reset-password/:token
  const isCleanLayout =
    cleanLayoutRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password/");

  if (isCleanLayout) {
    return <main>{children}</main>;
  }

  // Check for admin layout
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="layout-container">
      <Header />
      {!isAdminPage && <Marquee />}
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
