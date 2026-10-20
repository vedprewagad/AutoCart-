import "./Hero.css";
import { FaArrowRight } from "react-icons/fa";
import heroCar from "../../assets/hero-car.png";

function Hero() {
  const handleExploreCars = () => {
    const section = document.getElementById("vehicles-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 500, behavior: "smooth" });
    }
  };

  return (
    <section className="hero">
      <div className="hero-left">
        <h1>
          Find Your
          <br />
          <span>Perfect</span> Car
        </h1>

        <p>Explore top brands and choose your dream car.</p>

        <button className="primary-btn" onClick={handleExploreCars}>
          Explore Cars
          <FaArrowRight />
        </button>
      </div>

      <div className="hero-right">
        <img src={heroCar} alt="Hero Car" />
      </div>
    </section>
  );
}

export default Hero;
