import { useMemo } from "react";

// Each hand spins with a CSS animation whose negative delay starts it at the
// current time, so the browser keeps it in sync without timers.
const Horloge = () => {
  const offsets = useMemo(() => {
    const now = new Date();
    const s = now.getSeconds() + now.getMilliseconds() / 1000;
    const m = now.getMinutes() * 60 + s;
    const h = (now.getHours() % 12) * 3600 + m;
    return { s, m, h };
  }, []);

  const hand = (period, offset) => ({
    "--period": `${period}s`,
    animationDelay: `-${offset}s`,
  });

  return (
    <div className="clock-face" role="img" aria-label="Analog clock">
      <span className="clock-ticks" />
      <span className="clock-hand clock-hand--hour" style={hand(43200, offsets.h)} />
      <span className="clock-hand clock-hand--minute" style={hand(3600, offsets.m)} />
      <span className="clock-hand clock-hand--second" style={hand(60, offsets.s)} />
      <span className="clock-cap" />
    </div>
  );
};

export default Horloge;
