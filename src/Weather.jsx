const Weather = () => {
  return (
    <div className="card weather-card">
      <div className="location">Cairo</div>
      <div className="temperature">26°</div>
      <div className="weather-info">
        <div className="condition">
          <i className="fas fa-sun"></i>
          <span>Clear</span>
        </div>
        <div className="temp-range">37° - 24°</div>
      </div>
      <div className="hourly-forecast">
        <div className="hour-item">
          <i className="fas fa-sun"></i>
          <span>26°</span>
        </div>
        <div className="hour-item">
          <i className="fas fa-moon"></i>
          <span>25°</span>
        </div>
        <div className="hour-item">
          <i className="fas fa-moon"></i>
          <span>25°</span>
        </div>
        <div className="hour-item">
          <i className="fas fa-moon"></i>
          <span>24°</span>
        </div>
        <div className="hour-item">
          <i className="fas fa-moon"></i>
          <span>24°</span>
        </div>
        <div className="hour-item">
          <i className="fas fa-moon"></i>
          <span>25°</span>
        </div>
      </div>
    </div>
  );
};

export default Weather;
