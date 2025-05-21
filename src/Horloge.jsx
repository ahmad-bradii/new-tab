import { useEffect, useRef } from "react";

const Horloge = () => {
  // Use refs instead of state to avoid unnecessary re-renders
  const styleRef = useRef(null);

  useEffect(() => {
    // Get initial time
    const now = new Date();
    const second = now.getSeconds();
    const minute = now.getMinutes();
    const hour = now.getHours();

    // Calculate initial angles
    const secondDeg = second * 6;
    const minuteDeg = minute * 6;
    const hourDeg = hour * 30 + minute / 2;

    // Create style element once
    const styleEl = document.createElement("style");
    styleRef.current = styleEl;

    // Define all animations in one batch
    styleEl.textContent = `
      @keyframes rotateSecond {
        from { transform: rotate(${secondDeg}deg); }
        to { transform: rotate(${secondDeg + 360}deg); }
      }
      @keyframes rotateMinute {
        from { transform: rotate(${minuteDeg}deg); }
        to { transform: rotate(${minuteDeg + 360}deg); }
      }
      @keyframes rotateHour {
        from { transform: rotate(${hourDeg}deg); }
        to { transform: rotate(${hourDeg + 360}deg); }
      }
    `;

    // Add to document
    document.head.appendChild(styleEl);

    // Set initial positions and animations directly using CSS classes
    // to avoid multiple DOM operations
    const secondHand = document.getElementById("second-hand");
    const minuteHand = document.getElementById("minute-hand");
    const hourHand = document.getElementById("hour-hand");

    if (secondHand) {
      secondHand.style.transform = `rotate(${secondDeg}deg)`;
      secondHand.style.animation = "rotateSecond 60s linear infinite";
    }

    if (minuteHand) {
      minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
      minuteHand.style.animation = "rotateMinute 3600s linear infinite";
    }

    if (hourHand) {
      hourHand.style.transform = `rotate(${hourDeg}deg)`;
      hourHand.style.animation = "rotateHour 43200s linear infinite";
    }

    // Clean up on unmount
    return () => {
      if (styleRef.current && document.head.contains(styleRef.current)) {
        document.head.removeChild(styleRef.current);
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div className="clock-dial ">
      <div className="second-hand" id="second-hand">
        <div className="hand-pointer" id="second"></div>
      </div>
      <div className="hour-hand" id="hour-hand">
        <div className="hand-pointer" id="hour"></div>
      </div>
      <div className="minute-hand" id="minute-hand">
        <div className="hand-pointer" id="minute"></div>
      </div>
    </div>
  );
};

export default Horloge;
