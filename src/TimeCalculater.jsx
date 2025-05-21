import { useEffect, useState } from "react";

export const useTimeCalculator = () => {
  const [date, setDate] = useState(new Date());
  const [minute, setMinute] = useState(date.getMinutes());
  // const [hour, setHour] = useState(date.getHours());

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
      setMinute(date.getMinutes());
      // setHour(date.getHours());
    }, [59999 - minute * 1000 <= 0]);

    return () => clearInterval(interval);
    // return { minute, hour, date };
  }, []);
};
