import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

function AppLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // move focus to the page content, without changing the URL like a plain #anchor would
  const skipToContent = (event) => {
    event.preventDefault();
    document.getElementById("main-content")?.focus();
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content" onClick={skipToContent}>
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="page-container" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;
