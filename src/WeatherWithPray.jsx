import { useState, useEffect, useMemo } from "react";

async function getPrayerTimes() {
  try {
    const date = new Date();
    const response = await fetch(
      `https://api.aladhan.com/v1/timingsByAddress/${date.getDay}-${date.getMonth}-${date.getFullYear}?address=Sfax`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (e) {
    console.log("failling fetching data", e);
  }
}

function WeatherWithPray() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPray, setcurrentPray] = useState(null);

  const prayerTimes = useMemo(() => {
    if (!data || !data.timings) {
      return null;
    }
    return {
      Fajr: parseTimeString(data.timings.Fajr),
      Sunrise: parseTimeString(data.timings.Sunrise),
      Isha: parseTimeString(data.timings.Isha),
      Maghrib: parseTimeString(data.timings.Maghrib),
      Dhuhr: parseTimeString(data.timings.Dhuhr),
      Asr: parseTimeString(data.timings.Asr), // Ensure Asr is included
    };
  }, [data]);

  const toMinutes = (timeStr) => {
    const { hours, minutes } = timeStr;
    return hours * 60 + minutes;
  };
  function parseTimeString(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return { hours, minutes };
  }

  const currentPrayer = useMemo(() => {
    if (!prayerTimes) {
      return null;
    }

    const nowTime = currentTime.getHours() * 60 + currentTime.getMinutes();

    if (
      nowTime > toMinutes(prayerTimes.Fajr) &&
      nowTime <= toMinutes(prayerTimes.Dhuhr)
    ) {
      return {
        name: "Dhuhr",
        timeRemaining: {
          hour: Math.floor((toMinutes(prayerTimes.Dhuhr) - nowTime) / 60),
          minute: (toMinutes(prayerTimes.Dhuhr) - nowTime) % 60,
        },
      };
    } else if (
      nowTime > toMinutes(prayerTimes.Dhuhr) &&
      nowTime <= toMinutes(prayerTimes.Asr)
    ) {
      return {
        name: "Asr",
        timeRemaining: {
          hour: Math.floor((toMinutes(prayerTimes.Asr) - nowTime) / 60),
          minute: (toMinutes(prayerTimes.Asr) - nowTime) % 60,
        },
      };
    } else if (
      nowTime > toMinutes(prayerTimes.Asr) &&
      nowTime <= toMinutes(prayerTimes.Maghrib)
    ) {
      return {
        name: "Maghrib",
        timeRemaining: {
          hour: Math.floor((toMinutes(prayerTimes.Maghrib) - nowTime) / 60),
          minute: (toMinutes(prayerTimes.Maghrib) - nowTime) % 60,
        },
      };
    } else if (
      nowTime > toMinutes(prayerTimes.Maghrib) &&
      nowTime <= toMinutes(prayerTimes.Isha)
    ) {
      return {
        name: "Isha",
        timeRemaining: {
          hour: Math.floor((toMinutes(prayerTimes.Isha) - nowTime) / 60),
          minute: (toMinutes(prayerTimes.Isha) - nowTime) % 60,
        },
      };
    } else {
      return {
        name: "Fajr",
        timeRemaining: {
          hour: Math.floor((toMinutes(prayerTimes.Fajr) - nowTime + 1440) / 60), // Adding 1440 minutes for next day's Fajr
          minute: (toMinutes(prayerTimes.Fajr) - nowTime + 1440) % 60,
        },
      };
    }
  }, [currentTime, prayerTimes]);

  useEffect(() => {
    let intervalId;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getPrayerTimes();
        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Update time every minute instead of every second
    intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 60,000ms = 1 minute

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="card weather-card">
      <div className="weather-location-container">
        <div className="location">{data ? data.meta.timezone : "--"}</div>
        <div className="temperature">26°</div>
        <div className="count-down">
          {/* {console.log("err :", prayerTimes.Fajr)} */}
          <span>{data ? currentPrayer.name : ""}</span>
          <span>
            {data
              ? currentPrayer.timeRemaining.hour > 0
                ? `${currentPrayer.timeRemaining.hour}:${currentPrayer.timeRemaining.minute}`
                : `${currentPrayer.timeRemaining.minute} min`
              : "--:--"}
          </span>
        </div>
      </div>
      <div className="weather-info">
        <div className="condition">
          <i className="fas fa-sun"></i>
          <span>Clear</span>
        </div>
        <div className="temp-range">37° - 24°</div>
      </div>
      <div className="hourly-forecast">
        <div className="hour-item">
          <i className="fas fa-sun">Fajr</i>
          <span>{data ? data.timings.Fajr : "--:--"}</span>
        </div>
        <div className="hour-item">
          <i className="fas fa-moon">Sunrise</i>
          <span>{data ? data.timings.Sunrise : "--:--"} </span>
        </div>
        <div className="hour-item">
          <i className="fas fa-moon">Dhuhr</i>
          <span>{data ? data.timings.Dhuhr : "--:--"}</span>
        </div>
        <div className="hour-item">
          <i className="fas fa-moon">Asr</i>
          <span>{data ? data.timings.Asr : "--:--"}</span>
        </div>
        <div className="hour-item">
          <i className="fas fa-moon">Maghrib</i>
          <span>{data ? data.timings.Maghrib : "--:--"}</span>
        </div>
        <div className="hour-item">
          <i className="fas fa-moon">Isha</i>
          <span>{data ? data.timings.Isha : "--:--"}</span>
        </div>
      </div>
    </div>
  );
}

export default WeatherWithPray;
