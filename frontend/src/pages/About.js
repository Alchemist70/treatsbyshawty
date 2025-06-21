import React, { useState, useEffect } from "react";
import "../css/About.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faBirthdayCake,
  faCalendarAlt,
  faTrophy,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

const timeline = [
  {
    year: "2018",
    event: "TreatsByShawty founded",
    icon: faClipboardList,
  },
  {
    year: "2019",
    event: "First wedding cake delivered",
    icon: faBirthdayCake,
  },
  {
    year: "2021",
    event: "Expanded to event catering",
    icon: faCalendarAlt,
  },
  { year: "2023", event: "Celebrated 500th order!", icon: faTrophy },
];

export default function About() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTestimonials() {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get("/api/testimonials");
        setTestimonials(data);
      } catch (err) {
        setError("Could not load testimonials. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTestimonials();
  }, []);

  return (
    <div className="about-page-container">
      {/* About Card */}
      <section className="about-card">
        <h1 className="about-card-title">
          <FontAwesomeIcon icon={faUsers} className="about-title-icon" />
          About TreatsByShawty
        </h1>
        <p className="about-card-text">
          TreatsByShawty is a family-owned bakery and catering business
          dedicated to bringing joy to your celebrations with delicious,
          handcrafted treats. We believe in quality, creativity, and a personal
          touch for every order.
        </p>
      </section>

      {/* Divider */}
      <div className="about-section-divider"></div>

      {/* Timeline Section */}
      <section className="about-timeline-section">
        {timeline.map((item, index) => (
          <div key={index} className="about-timeline-item">
            <div className="about-timeline-card">
              <FontAwesomeIcon
                icon={item.icon}
                className="about-timeline-icon"
              />
              <div className="about-timeline-year">{item.year}</div>
              <div className="about-timeline-event">{item.event}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Testimonials Section */}
      <section className="about-testimonials">
        <h2 className="about-section-title">Testimonials</h2>
        <div className="about-testimonials-grid">
          {loading ? (
            <p>Loading testimonials...</p>
          ) : error ? (
            <p className="about-error">{error}</p>
          ) : (
            testimonials.map((testimonial) => (
              <div key={testimonial._id} className="about-testimonial-card">
                <img
                  src={testimonial.image || "/placeholder-avatar.png"}
                  alt={testimonial.name}
                  className="about-testimonial-avatar"
                />
                <p className="about-testimonial-text">"{testimonial.text}"</p>
                <p className="about-testimonial-author">- {testimonial.name}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
