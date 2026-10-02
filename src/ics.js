// A small iCalendar (.ics) reader: enough for the private feeds Google,
// Outlook and iCloud publish. Expands common recurrence rules inside a window.

const DAY = 86400000;
const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

const unescapeText = (s) =>
  s
    .replace(/\\n/gi, "\n")
    .replace(/\\([,;\\])/g, "$1")
    .trim();

function parseLine(line) {
  const colon = line.search(/:(?=(?:[^"]*"[^"]*")*[^"]*$)/);
  if (colon < 0) return null;
  const [name, ...rawParams] = line.slice(0, colon).split(";");
  const params = {};
  for (const p of rawParams) {
    const [k, v = ""] = p.split("=");
    params[k.toUpperCase()] = v.replace(/^"|"$/g, "");
  }
  return { name: name.toUpperCase(), params, value: line.slice(colon + 1) };
}

// Offset (ms) of a time zone from UTC at a given instant
function zoneOffset(utcMs, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (t) => Number(parts.find((p) => p.type === t).value);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );
  return asUtc - utcMs;
}

function parseDate(value, params = {}) {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s, z] = m;
  if (!h || params.VALUE === "DATE") {
    return { date: new Date(+y, +mo - 1, +d), allDay: true };
  }
  if (z) {
    return { date: new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s)), allDay: false };
  }
  if (params.TZID) {
    try {
      const guess = Date.UTC(+y, +mo - 1, +d, +h, +mi, +s);
      let utc = guess - zoneOffset(guess, params.TZID);
      utc = guess - zoneOffset(utc, params.TZID); // settle across DST edges
      return { date: new Date(utc), allDay: false };
    } catch {
      // Unknown zone name (Outlook uses Windows names): read as local time
    }
  }
  return { date: new Date(+y, +mo - 1, +d, +h, +mi, +s), allDay: false };
}

function parseRule(value) {
  const rule = {};
  for (const part of value.split(";")) {
    const [k, v] = part.split("=");
    rule[k.toUpperCase()] = v;
  }
  return {
    freq: rule.FREQ,
    interval: Math.max(1, Number(rule.INTERVAL) || 1),
    count: rule.COUNT ? Number(rule.COUNT) : Infinity,
    until: rule.UNTIL ? parseDate(rule.UNTIL)?.date : null,
    byDay: rule.BYDAY
      ? rule.BYDAY.split(",")
          .map((d) => WEEKDAYS.indexOf(d.slice(-2)))
          .filter((d) => d >= 0)
      : null,
  };
}

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const addMonths = (date, n) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
};

// Yields occurrence start dates in order, up to `until` or the window end
function* occurrences(start, rule, windowEnd) {
  const stop = rule.until && rule.until < windowEnd ? rule.until : windowEnd;
  let produced = 0;
  for (let i = 0; i < 5000 && produced < rule.count; i++) {
    let batch;
    if (rule.freq === "DAILY") {
      batch = [addDays(start, i * rule.interval)];
    } else if (rule.freq === "WEEKLY") {
      const weekStart = addDays(start, i * 7 * rule.interval - start.getDay());
      const days = rule.byDay?.length ? rule.byDay : [start.getDay()];
      batch = [...days].sort().map((d) => addDays(weekStart, d)).filter((d) => d >= start);
    } else if (rule.freq === "MONTHLY") {
      batch = [addMonths(start, i * rule.interval)];
    } else if (rule.freq === "YEARLY") {
      batch = [addMonths(start, i * 12 * rule.interval)];
    } else {
      return;
    }
    for (const d of batch) {
      if (d > stop || produced >= rule.count) return;
      produced++;
      yield d;
    }
  }
}

export function parseCalendar(text, { from, to }) {
  const lines = text.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);
  const raw = [];
  let current = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") current = { exdates: [] };
    else if (line === "END:VEVENT") {
      if (current) raw.push(current);
      current = null;
    } else if (current) {
      const prop = parseLine(line);
      if (!prop) continue;
      if (prop.name === "EXDATE") {
        for (const v of prop.value.split(",")) {
          const d = parseDate(v, prop.params);
          if (d) current.exdates.push(d.date.getTime());
        }
      } else {
        current[prop.name] = prop;
      }
    }
  }

  // Edited instances of a recurring event replace the generated ones
  const overridden = new Set();
  for (const e of raw) {
    if (e["RECURRENCE-ID"]) {
      const d = parseDate(e["RECURRENCE-ID"].value, e["RECURRENCE-ID"].params);
      if (d) overridden.add(`${e.UID?.value}|${d.date.getTime()}`);
    }
  }

  const events = [];
  for (const e of raw) {
    if (!e.DTSTART || e.STATUS?.value === "CANCELLED") continue;
    const start = parseDate(e.DTSTART.value, e.DTSTART.params);
    if (!start) continue;
    const end = e.DTEND ? parseDate(e.DTEND.value, e.DTEND.params) : null;
    const duration = end
      ? end.date - start.date
      : start.allDay
        ? DAY
        : 0;
    const base = {
      uid: e.UID?.value ?? `${start.date.getTime()}`,
      title: e.SUMMARY ? unescapeText(e.SUMMARY.value) : "Untitled event",
      location: e.LOCATION ? unescapeText(e.LOCATION.value) : "",
      allDay: start.allDay,
    };

    const push = (date) => {
      const endDate = new Date(date.getTime() + duration);
      if (endDate <= from || date >= to) return;
      events.push({
        ...base,
        id: `${base.uid}|${date.getTime()}`,
        start: date,
        end: endDate,
      });
    };

    if (e.RRULE && !e["RECURRENCE-ID"]) {
      const rule = parseRule(e.RRULE.value);
      for (const date of occurrences(start.date, rule, to)) {
        const t = date.getTime();
        if (e.exdates.includes(t) || overridden.has(`${base.uid}|${t}`)) continue;
        push(date);
      }
    } else {
      push(start.date);
    }
  }

  return events.sort((a, b) => a.start - b.start);
}
