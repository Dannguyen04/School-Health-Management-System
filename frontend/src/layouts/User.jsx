import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import About from "../components/parent/About";
import Blogs from "../components/parent/Blogs";
import Doctors from "../components/parent/Doctors";
import Footer from "../components/parent/Footer";
import Home from "../components/parent/Home";
import Navbar from "../components/parent/Navbar";
import Services from "../components/parent/Services";

const User = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/user";

  useEffect(() => {
    if (isLandingPage && location.state?.scrollTo) {
      setTimeout(() => {
        document
          .getElementById(location.state.scrollTo)
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isLandingPage, location]);

  return (
    <div>
      <Navbar />
      <main>
        {isLandingPage ? (
          <>
            <div id="home">
              <Home />
            </div>
            <div id="about">
              <About />
            </div>
            <div id="services">
              <Services />
            </div>
            <div id="doctors">
              <Doctors />
            </div>
            <div id="blog">
              <Blogs />
            </div>
          </>
        ) : (
          <Outlet />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default User;
