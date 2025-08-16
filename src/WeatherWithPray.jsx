import { useState, useEffect, useMemo } from "react";

function WeatherWithPray({ i_state, i_error, i_loading, i_data }) {
  const [data, setData] = useState(i_data);
  const [loading, setLoading] = useState(
    i_loading !== undefined ? i_loading : true
  );
  const [error, setError] = useState(i_error || null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const prayerTimes = useMemo(() => {
    if (!data || !data.timings) {
      return null;
    }
    return {
      Fajr: parseTimeString(data.timings.Fajr),
      Sunrise: parseTimeString(data.timings.Sunrise),
      Dhuhr: parseTimeString(data.timings.Dhuhr),
      Asr: parseTimeString(data.timings.Asr),
      Maghrib: parseTimeString(data.timings.Maghrib),
      Isha: parseTimeString(data.timings.Isha),
    };
  }, [data]);

  const toMinutes = (timeObj) => {
    if (!timeObj) return 0;
    const { hours, minutes } = timeObj;
    return hours * 60 + minutes;
  };

  function parseTimeString(timeStr) {
    if (!timeStr) return { hours: 0, minutes: 0 };
    const [hours, minutes] = timeStr.split(":").map(Number);
    return { hours: hours || 0, minutes: minutes || 0 };
  }

  const currentPrayer = useMemo(() => {
    if (!prayerTimes) {
      return {
        name: "Loading...",
        timeRemaining: { hour: 0, minute: 0 },
      };
    }

    const nowTime = currentTime.getHours() * 60 + currentTime.getMinutes();

    // Helper function to calculate time remaining
    const calculateTimeRemaining = (targetTime) => {
      let diff = targetTime - nowTime;
      if (diff < 0) diff += 1440; // Add 24 hours if negative (next day)

      return {
        hour: Math.floor(diff / 60),
        minute: diff % 60,
      };
    };

    // Check which prayer time is next
    if (nowTime < toMinutes(prayerTimes.Fajr)) {
      return {
        name: "Fajr",
        timeRemaining: calculateTimeRemaining(toMinutes(prayerTimes.Fajr)),
      };
    } else if (nowTime < toMinutes(prayerTimes.Dhuhr)) {
      return {
        name: "Dhuhr",
        timeRemaining: calculateTimeRemaining(toMinutes(prayerTimes.Dhuhr)),
      };
    } else if (nowTime < toMinutes(prayerTimes.Asr)) {
      return {
        name: "Asr",
        timeRemaining: calculateTimeRemaining(toMinutes(prayerTimes.Asr)),
      };
    } else if (nowTime < toMinutes(prayerTimes.Maghrib)) {
      return {
        name: "Maghrib",
        timeRemaining: calculateTimeRemaining(toMinutes(prayerTimes.Maghrib)),
      };
    } else if (nowTime < toMinutes(prayerTimes.Isha)) {
      return {
        name: "Isha",
        timeRemaining: calculateTimeRemaining(toMinutes(prayerTimes.Isha)),
      };
    } else {
      // After Isha, next prayer is Fajr of next day
      return {
        name: "Fajr",
        timeRemaining: calculateTimeRemaining(
          toMinutes(prayerTimes.Fajr) + 1440
        ),
      };
    }
  }, [currentTime, prayerTimes]);
  useEffect(() => {
    let intervalId;

    // Update state from props
    setData(i_data);
    setError(i_error);
    setLoading(i_loading);

    // Update time every minute
    intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 60,000ms = 1 minute

    return () => clearInterval(intervalId);
  }, [i_data, i_error, i_loading, i_state]);

  // Helper function to format time display
  const formatTimeRemaining = (timeRemaining) => {
    if (!timeRemaining) return "--:--";

    if (timeRemaining.hour > 0) {
      return `${timeRemaining.hour}h ${timeRemaining.minute}m`;
    }
    return `${timeRemaining.minute}m`;
  };

  // Helper function to get weather info with fallback
  const getWeatherInfo = () => {
    if (loading) {
      return {
        location: "Loading...",
        temperature: "--°",
        condition: "Loading",
        tempRange: "--° - --°",
      };
    }

    if (error || !data) {
      return {
        location: "Error",
        temperature: "--°",
        condition: "No data",
        tempRange: "--° - --°",
      };
    }

    return {
      location: data.meta?.timezone || "Unknown",
      temperature: "26°", // You might want to get this from weather API
      condition: "Clear",
      tempRange: "37° - 24°",
    };
  };

  const weatherInfo = getWeatherInfo();

  return (
    <div className="card weather-card">
      <div className="weather-location-container">
        <div className="location">{i_state}</div>
        <div className="temperature">{weatherInfo.temperature}</div>
        <div className="count-down">
          <span>{currentPrayer?.name || "Loading..."}</span>
          <span>{formatTimeRemaining(currentPrayer?.timeRemaining)}</span>
        </div>
      </div>
      <div className="weather-info">
        <div className="condition">
          <i className="fas fa-sun"></i>
          <span>{weatherInfo.condition}</span>
        </div>
        <div className="temp-range">{weatherInfo.tempRange}</div>
      </div>
      <div className="hourly-forecast">
        <div className="hour-item">
          <i className="fas fa-sun">Fajr</i>
          <span>{data?.timings?.Fajr || "--:--"}</span>
        </div>
        <div className="hour-item">
          <i className="fas fa-moon">Sunrise</i>
          <span>{data?.timings?.Sunrise || "--:--"}</span>
        </div>
        <div className="hour-item">
          <i className="fas fa-moon">Dhuhr</i>
          <span>{data?.timings?.Dhuhr || "--:--"}</span>
        </div>
        <div className="hour-item">
          <i className="fas fa-moon">Asr</i>
          <span>{data?.timings?.Asr || "--:--"}</span>
        </div>
        <div className="hour-item">
          <i className="fas fa-moon">Maghrib</i>
          <span>{data?.timings?.Maghrib || "--:--"}</span>
        </div>
        <div className="hour-item">
          <i className="fas fa-moon">Isha</i>
          <span>{data?.timings?.Isha || "--:--"}</span>
        </div>
      </div>
    </div>
  );
}

export default WeatherWithPray;
