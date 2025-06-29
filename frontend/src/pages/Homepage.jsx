import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HomepageNavbar from "../components/homepage/HomepageNavbar";
import About from "../components/parent/About";
import Blogs from "../components/parent/Blogs";
import Footer from "../components/parent/Footer";
import Home from "../components/parent/Home";
import Services from "../components/parent/Services";
import { useAuth } from "../context/authContext";

const Homepage = () => {
  const navigate = useNavigate();
  const { shouldScrollToServices, setScrollToServices } = useAuth();

  // Hàm xử lý khi click vào dịch vụ (nếu chưa login)
  const handleServiceClick = (e) => {
    e.preventDefault();
    navigate("/auth");
  };

  // Effect để scroll xuống services section khi cần
  useEffect(() => {
    if (shouldScrollToServices) {
      const servicesSection = document.getElementById("services");
      if (servicesSection) {
        servicesSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
      // Reset flag sau khi scroll
      setScrollToServices(false);
    }
  }, [shouldScrollToServices, setScrollToServices]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HomepageNavbar />
      <main className="flex-1">
        <div id="home">
          <Home />
    <div className="min-h-screen flex flex-col bg-white">
      <HomepageNavbar />
      <main className="flex-1">
        <div id="home">
          <Home />
        </div>
        <div id="about">
          <About />
        </div>
        {/* Truyền prop để Services biết là ở homepage */}
        <div id="services">
          <Services onServiceClick={handleServiceClick} isHomepage />
        </div>
        <div id="blog">
          <Blogs />
        <div id="about">
          <About />
        </div>
        {/* Truyền prop để Services biết là ở homepage */}
        <div id="services">
          <Services onServiceClick={handleServiceClick} isHomepage />
        </div>
        <div id="blog">
          <Blogs />
        </div>
      </main>
      <Footer />
      </main>
      <Footer />
    </div>
  );
};

export default Homepage;
