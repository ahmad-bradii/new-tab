import { useState, useEffect } from "react";

const DateComponent = () => {
  const [date, setDate] = useState(new Date());
  const [day, setDay] = useState(date.getDate());
  const [month, setMonth] = useState(
    date.toLocaleString("en-us", { month: "long" }).substring(0, 3)
  );
  const [dayName, setDayName] = useState(
    date.toLocaleString("en-us", { weekday: "long" }).substring(0, 3)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
      setDay(date.getDate());
      setMonth(date.toLocaleString("en-us", { month: "long" }).substring(0, 3));
      setDayName(
        date.toLocaleString("en-us", { weekday: "long" }).substring(0, 3)
      );
    }, [86400000 - (date.getTime() % 86400000)]);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="card date-card">
      <div className="day">
        <span>{dayName} </span>
        <span>{month}</span>
      </div>
      <div className="date">{day}</div>
    </div>
  );
};

export default DateComponent;
