import { useState, useEffect } from "react";

const NumericalTimer = () => {
  const date = new Date();
  const [minute, setMinute] = useState(date.getMinutes());
  const [hour, setHour] = useState(date.getHours());

  useEffect(() => {
    const interval = setInterval(() => {
      const newDate = new Date();
      setMinute(newDate.getMinutes());
      setHour(newDate.getHours());
      console.log("newDate");
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="time">
      <span>
        {hour < 10 ? `0${hour}` : hour}:{minute < 10 ? `0${minute}` : minute}
      </span>
      {/* <Horloge /> */}
    </div>
  );
};

export { NumericalTimer };
