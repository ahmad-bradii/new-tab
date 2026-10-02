import { useState, useEffect } from "react";

const DateComponent = () => {
  const [date, setDate] = useState(() => new Date());

  useEffect(() => {
    // Once a minute is plenty to roll over at midnight
    const interval = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="widget widget--date glass">
      <span className="date-weekday">
        {date.toLocaleString("en-US", { weekday: "long" })}
      </span>
      <span className="date-day">{date.getDate()}</span>
      <span className="date-month">
        {date.toLocaleString("en-US", { month: "long" })}
      </span>
    </div>
  );
};

export default DateComponent;
