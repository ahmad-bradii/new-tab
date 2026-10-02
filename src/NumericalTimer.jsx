import { useState, useEffect } from "react";

const pad = (n) => String(n).padStart(2, "0");

const NumericalTimer = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <time className="digital-time" dateTime={now.toISOString()}>
      {pad(now.getHours())}:{pad(now.getMinutes())}
    </time>
  );
};

export { NumericalTimer };
