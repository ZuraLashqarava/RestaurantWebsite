import "./Home.scss";
import cuisineBg from "./cuisine1.jpg";
import rtveliBg from "./rtveli.webp";
import diverseBg from "./diverse.jpg";
import ingredientBg from "./ingredient.jpg";
import staffBg from "./staff.jpg";
import logo from "../Navbar/GeorgianFlag.png";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const dishes = [
  {
    id: 1,
    label: "History & Legacy",
    sub: "Tradition That Spans 8,000 years",
    img: rtveliBg,
  },
  {
    id: 2,
    label: "Range & Diversity",
    sub: "Suitable For Every Customer",
    img: diverseBg,
  },
  {
    id: 3,
    label: "Quality & Authenticity",
    sub: "Highest Quality Ingredients",
    img: ingredientBg,
  },
  {
    id: 4,
    label: "Professionalism & Passion",
    sub: "Experienced Team Dedicated To Excellence",
    img: staffBg,
  },
];

const partySizes = Array.from({ length: 6 }, (_, i) => i + 1);

const timeSlots = [
  "12:00 AM",
  "1:00 AM",
  "2:00 AM",
  "3:00 AM",
  "4:00 AM",
  "5:00 AM",
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
  "11:00 PM",
];

const todayISO = (): string => new Date().toISOString().split("T")[0];

const Home = () => {
  const navigate = useNavigate();

  const [partySize, setPartySize] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [findError, setFindError] = useState<boolean>(false);

  const handleFind = () => {
    if (!partySize || !date) {
      setFindError(true);
      return;
    }
    setFindError(false);
    navigate("/booking", { state: { partySize: Number(partySize), date } });
  };

  return (
    <main className="home">
      <section
        className="home__hero"
        style={{ backgroundImage: `url(${cuisineBg})` }}
      >
        <h1 className="home__title">Experience Authentic Georgian Cuisine</h1>
        <Link to="/menu" className="home__btn">
          Explore
        </Link>
      </section>

      <section className="home__dishes">
        {dishes.map((dish) => (
          <div
            key={dish.id}
            className="home__dish"
            style={{ backgroundImage: `url(${dish.img})` }}
          >
            <div className="home__dish-overlay">
              <span className="home__dish-label">{dish.label}</span>
              <span className="home__dish-sub">{dish.sub}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="home__reservation">
        <img src={logo} alt="Georgian Flag Logo" className="home__res-logo" />
        <h2 className="home__res-title">Make Reservation</h2>

        <div className="home__res-card">
          <div className="home__res-field">
            <label className="home__res-label">Party Size</label>
            <div className="home__res-select-wrap">
              <select
                className="home__res-select"
                value={partySize}
                onChange={(e) => { setPartySize(e.target.value); setFindError(false); }}
              >
                <option value="" disabled>Select guests</option>
                {partySizes.map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
              <span className="home__res-arrow">▾</span>
            </div>
          </div>

          <div className="home__res-field">
            <label className="home__res-label">Date</label>
            <div className="home__res-select-wrap">
              <input
                type="date"
                className="home__res-select home__res-date"
                min={todayISO()}
                value={date}
                onChange={(e) => { setDate(e.target.value); setFindError(false); }}
              />
            </div>
          </div>

          <div className="home__res-field">
            <label className="home__res-label">Time</label>
            <div className="home__res-select-wrap">
              <select
                className="home__res-select"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                <option value="" disabled>Select time</option>
                {timeSlots.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <span className="home__res-arrow">▾</span>
            </div>
          </div>

          {findError && (
            <p className="home__res-error">Please select party size and date.</p>
          )}

          <button className="home__res-btn" onClick={handleFind}>
            Find a Table
          </button>
        </div>
      </section>

      <section className="home__contact">
        <div className="home__contact-columns">
          <div className="home__contact-col">
            <h2 className="home__contact-heading">Contact Us</h2>
            <p className="home__contact-sub">GeorgianCuisine@gmail.com</p>
          </div>

          <div className="home__contact-divider" />

          <div className="home__contact-col">
            <h2 className="home__contact-heading">Connect Us</h2>
            <p className="home__contact-sub">Follow us on social media</p>
          </div>

          <div className="home__contact-divider" />

          <div className="home__contact-col">
            <h2 className="home__contact-heading">Jobs</h2>
            <p className="home__contact-sub">Email Us Your Resume</p>
          </div>
        </div>

        <div className="home__contact-socials">
          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="home__contact-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="home__contact-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="home__contact-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4l16 16M20 4 4 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M2 4h7l13 16H15z" />
            </svg>
          </a>
        </div>
      </section>

      <section className="home__contact" id="info"></section>
    </main>
  );
};

export default Home;