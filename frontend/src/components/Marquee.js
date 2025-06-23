import React from "react";
import "../css/Marquee.css";

const Marquee = () => {
  const marqueeContent = (
    <>
      <span>Free delivery on orders over ₦25,000! ✨</span>
      <span>Freshly baked goods daily! 🥐</span>
      <span>Follow us on Instagram @TreatsByShawty! 💖</span>
      <span>Free delivery on orders over ₦25,000! ✨</span>
      <span>Freshly baked goods daily! 🥐</span>
      <span>Follow us on Instagram @TreatsByShawty! 💖</span>
      <span>Free delivery on orders over ₦25,000! ✨</span>
      <span>Freshly baked goods daily! 🥐</span>
      <span>Follow us on Instagram @TreatsByShawty! 💖</span>
      <span>Free delivery on orders over ₦25,000! ✨</span>
      <span>Freshly baked goods daily! 🥐</span>
      <span>Follow us on Instagram @TreatsByShawty! 💖</span>
      <span>Free delivery on orders over ₦25,000! ✨</span>
      <span>Freshly baked goods daily! 🥐</span>
      <span>Follow us on Instagram @TreatsByShawty! 💖</span>
    </>
  );

  return (
    <div className="marquee-container">
      <div className="marquee-content">{marqueeContent}</div>
      <div className="marquee-content" aria-hidden="true">
        {marqueeContent}
      </div>
    </div>
  );
};

export default Marquee;
