import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import Hero2 from "../components/Hero2";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div>
      <Navbar />
      <Header />
      <Hero />
      <Hero2 />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Home;
