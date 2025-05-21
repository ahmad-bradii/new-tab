import {
  r as x,
  j as y,
  a as l,
  R as T,
  g as Nr,
  c as Ir,
  F as _r,
} from "./main-qckgKZYB.js";
const Dr = () => {
    const e = x.useRef(null);
    return (
      x.useEffect(() => {
        const t = new Date(),
          r = t.getSeconds(),
          n = t.getMinutes(),
          o = t.getHours(),
          s = r * 6,
          a = n * 6,
          p = o * 30 + n / 2,
          i = document.createElement("style");
        (e.current = i),
          (i.textContent = `
      @keyframes rotateSecond {
        from { transform: rotate(${s}deg); }
        to { transform: rotate(${s + 360}deg); }
      }
      @keyframes rotateMinute {
        from { transform: rotate(${a}deg); }
        to { transform: rotate(${a + 360}deg); }
      }
      @keyframes rotateHour {
        from { transform: rotate(${p}deg); }
        to { transform: rotate(${p + 360}deg); }
      }
    `),
          document.head.appendChild(i);
        const h = document.getElementById("second-hand"),
          u = document.getElementById("minute-hand"),
          c = document.getElementById("hour-hand");
        return (
          h &&
            ((h.style.transform = `rotate(${s}deg)`),
            (h.style.animation = "rotateSecond 60s linear infinite")),
          u &&
            ((u.style.transform = `rotate(${a}deg)`),
            (u.style.animation = "rotateMinute 3600s linear infinite")),
          c &&
            ((c.style.transform = `rotate(${p}deg)`),
            (c.style.animation = "rotateHour 43200s linear infinite")),
          () => {
            e.current &&
              document.head.contains(e.current) &&
              document.head.removeChild(e.current);
          }
        );
      }, []),
      y("div", {
        className: "clock-dial ",
        children: [
          l("div", {
            className: "second-hand",
            id: "second-hand",
            children: l("div", { className: "hand-pointer", id: "second" }),
          }),
          l("div", {
            className: "hour-hand",
            id: "hour-hand",
            children: l("div", { className: "hand-pointer", id: "hour" }),
          }),
          l("div", {
            className: "minute-hand",
            id: "minute-hand",
            children: l("div", { className: "hand-pointer", id: "minute" }),
          }),
        ],
      })
    );
  },
  Er = () => {
    const [e, t] = x.useState(new Date()),
      [r, n] = x.useState(e.getDate()),
      [o, s] = x.useState(
        e.toLocaleString("en-us", { month: "long" }).substring(0, 3)
      ),
      [a, p] = x.useState(
        e.toLocaleString("en-us", { weekday: "long" }).substring(0, 3)
      );
    return (
      x.useEffect(() => {
        const i = setInterval(() => {
          t(new Date()),
            n(e.getDate()),
            s(e.toLocaleString("en-us", { month: "long" }).substring(0, 3)),
            p(e.toLocaleString("en-us", { weekday: "long" }).substring(0, 3));
        }, [864e5 - (e.getTime() % 864e5)]);
        return () => clearInterval(i);
      }, []),
      y("div", {
        className: "card date-card",
        children: [
          y("div", {
            className: "day",
            children: [
              y("span", { children: [a, " "] }),
              l("span", { children: o }),
            ],
          }),
          l("div", { className: "date", children: r }),
        ],
      })
    );
  };
async function Pr() {
  try {
    const e = new Date(),
      t = await fetch(
        `https://api.aladhan.com/v1/timingsByAddress/${e.getDay}-${e.getMonth}-${e.getFullYear}?address=Sfax`
      );
    if (!t.ok) throw new Error("Network response was not ok");
    return await t.json();
  } catch (e) {
    console.log("failling fetching data", e);
  }
}
function Rr() {
  const [e, t] = x.useState(null),
    [r, n] = x.useState(!0),
    [o, s] = x.useState(null),
    [a, p] = x.useState(new Date()),
    [i, h] = x.useState(null),
    u = x.useMemo(
      () =>
        !e || !e.timings
          ? null
          : {
              Fajr: d(e.timings.Fajr),
              Sunrise: d(e.timings.Sunrise),
              Isha: d(e.timings.Isha),
              Maghrib: d(e.timings.Maghrib),
              Dhuhr: d(e.timings.Dhuhr),
              Asr: d(e.timings.Asr),
            },
      [e]
    ),
    c = (f) => {
      const { hours: v, minutes: I } = f;
      return v * 60 + I;
    };
  function d(f) {
    const [v, I] = f.split(":").map(Number);
    return { hours: v, minutes: I };
  }
  const m = x.useMemo(() => {
    if (!u) return null;
    const f = a.getHours() * 60 + a.getMinutes();
    return f > c(u.Fajr) && f <= c(u.Dhuhr)
      ? {
          name: "Dhuhr",
          timeRemaining: {
            hour: Math.floor((c(u.Dhuhr) - f) / 60),
            minute: (c(u.Dhuhr) - f) % 60,
          },
        }
      : f > c(u.Dhuhr) && f <= c(u.Asr)
        ? {
            name: "Asr",
            timeRemaining: {
              hour: Math.floor((c(u.Asr) - f) / 60),
              minute: (c(u.Asr) - f) % 60,
            },
          }
        : f > c(u.Asr) && f <= c(u.Maghrib)
          ? {
              name: "Maghrib",
              timeRemaining: {
                hour: Math.floor((c(u.Maghrib) - f) / 60),
                minute: (c(u.Maghrib) - f) % 60,
              },
            }
          : f > c(u.Maghrib) && f <= c(u.Isha)
            ? {
                name: "Isha",
                timeRemaining: {
                  hour: Math.floor((c(u.Isha) - f) / 60),
                  minute: (c(u.Isha) - f) % 60,
                },
              }
            : {
                name: "Fajr",
                timeRemaining: {
                  hour: Math.floor((c(u.Fajr) - f + 1440) / 60),
                  minute: (c(u.Fajr) - f + 1440) % 60,
                },
              };
  }, [a, u]);
  return (
    x.useEffect(() => {
      let f;
      return (
        (async () => {
          try {
            n(!0);
            const I = await Pr();
            t(I.data), s(null);
          } catch (I) {
            s(I.message);
          } finally {
            n(!1);
          }
        })(),
        (f = setInterval(() => {
          p(new Date());
        }, 6e4)),
        () => clearInterval(f)
      );
    }, []),
    y("div", {
      className: "card weather-card",
      children: [
        y("div", {
          className: "weather-location-container",
          children: [
            l("div", {
              className: "location",
              children: e ? e.meta.timezone : "--",
            }),
            l("div", { className: "temperature", children: "26°" }),
            y("div", {
              className: "count-down",
              children: [
                l("span", { children: e ? m.name : "" }),
                l("span", {
                  children: e
                    ? m.timeRemaining.hour > 0
                      ? `${m.timeRemaining.hour}:${m.timeRemaining.minute}`
                      : `${m.timeRemaining.minute} min`
                    : "--:--",
                }),
              ],
            }),
          ],
        }),
        y("div", {
          className: "weather-info",
          children: [
            y("div", {
              className: "condition",
              children: [
                l("i", { className: "fas fa-sun" }),
                l("span", { children: "Clear" }),
              ],
            }),
            l("div", { className: "temp-range", children: "37° - 24°" }),
          ],
        }),
        y("div", {
          className: "hourly-forecast",
          children: [
            y("div", {
              className: "hour-item",
              children: [
                l("i", { className: "fas fa-sun", children: "Fajr" }),
                l("span", { children: e ? e.timings.Fajr : "--:--" }),
              ],
            }),
            y("div", {
              className: "hour-item",
              children: [
                l("i", { className: "fas fa-moon", children: "Sunrise" }),
                y("span", { children: [e ? e.timings.Sunrise : "--:--", " "] }),
              ],
            }),
            y("div", {
              className: "hour-item",
              children: [
                l("i", { className: "fas fa-moon", children: "Dhuhr" }),
                l("span", { children: e ? e.timings.Dhuhr : "--:--" }),
              ],
            }),
            y("div", {
              className: "hour-item",
              children: [
                l("i", { className: "fas fa-moon", children: "Asr" }),
                l("span", { children: e ? e.timings.Asr : "--:--" }),
              ],
            }),
            y("div", {
              className: "hour-item",
              children: [
                l("i", { className: "fas fa-moon", children: "Maghrib" }),
                l("span", { children: e ? e.timings.Maghrib : "--:--" }),
              ],
            }),
            y("div", {
              className: "hour-item",
              children: [
                l("i", { className: "fas fa-moon", children: "Isha" }),
                l("span", { children: e ? e.timings.Isha : "--:--" }),
              ],
            }),
          ],
        }),
      ],
    })
  );
}
var A = function () {
  return (
    (A =
      Object.assign ||
      function (t) {
        for (var r, n = 1, o = arguments.length; n < o; n++) {
          r = arguments[n];
          for (var s in r)
            Object.prototype.hasOwnProperty.call(r, s) && (t[s] = r[s]);
        }
        return t;
      }),
    A.apply(this, arguments)
  );
};
function Ce(e, t, r) {
  if (r || arguments.length === 2)
    for (var n = 0, o = t.length, s; n < o; n++)
      (s || !(n in t)) &&
        (s || (s = Array.prototype.slice.call(t, 0, n)), (s[n] = t[n]));
  return e.concat(s || Array.prototype.slice.call(t));
}
var C = "-ms-",
  ce = "-moz-",
  w = "-webkit-",
  Ft = "comm",
  Pe = "rule",
  it = "decl",
  kr = "@import",
  Wt = "@keyframes",
  Ar = "@layer",
  Gt = Math.abs,
  ct = String.fromCharCode,
  Ke = Object.assign;
function Or(e, t) {
  return k(e, 0) ^ 45
    ? (((((((t << 2) ^ k(e, 0)) << 2) ^ k(e, 1)) << 2) ^ k(e, 2)) << 2) ^
        k(e, 3)
    : 0;
}
function qt(e) {
  return e.trim();
}
function L(e, t) {
  return (e = t.exec(e)) ? e[0] : e;
}
function g(e, t, r) {
  return e.replace(t, r);
}
function ye(e, t, r) {
  return e.indexOf(t, r);
}
function k(e, t) {
  return e.charCodeAt(t) | 0;
}
function Q(e, t, r) {
  return e.slice(t, r);
}
function $(e) {
  return e.length;
}
function Ut(e) {
  return e.length;
}
function ie(e, t) {
  return t.push(e), e;
}
function Tr(e, t) {
  return e.map(t).join("");
}
function mt(e, t) {
  return e.filter(function (r) {
    return !L(r, t);
  });
}
var Re = 1,
  X = 1,
  Ht = 0,
  M = 0,
  P = 0,
  re = "";
function ke(e, t, r, n, o, s, a, p) {
  return {
    value: e,
    root: t,
    parent: r,
    type: n,
    props: o,
    children: s,
    line: Re,
    column: X,
    length: a,
    return: "",
    siblings: p,
  };
}
function W(e, t) {
  return Ke(
    ke("", null, null, "", null, null, 0, e.siblings),
    e,
    { length: -e.length },
    t
  );
}
function K(e) {
  for (; e.root; ) e = W(e.root, { children: [e] });
  ie(e, e.siblings);
}
function Mr() {
  return P;
}
function jr() {
  return (P = M > 0 ? k(re, --M) : 0), X--, P === 10 && ((X = 1), Re--), P;
}
function j() {
  return (P = M < Ht ? k(re, M++) : 0), X++, P === 10 && ((X = 1), Re++), P;
}
function U() {
  return k(re, M);
}
function we() {
  return M;
}
function Ae(e, t) {
  return Q(re, e, t);
}
function Ze(e) {
  switch (e) {
    case 0:
    case 9:
    case 10:
    case 13:
    case 32:
      return 5;
    case 33:
    case 43:
    case 44:
    case 47:
    case 62:
    case 64:
    case 126:
    case 59:
    case 123:
    case 125:
      return 4;
    case 58:
      return 3;
    case 34:
    case 39:
    case 40:
    case 91:
      return 2;
    case 41:
    case 93:
      return 1;
  }
  return 0;
}
function $r(e) {
  return (Re = X = 1), (Ht = $((re = e))), (M = 0), [];
}
function zr(e) {
  return (re = ""), e;
}
function Be(e) {
  return qt(Ae(M - 1, Qe(e === 91 ? e + 2 : e === 40 ? e + 1 : e)));
}
function Lr(e) {
  for (; (P = U()) && P < 33; ) j();
  return Ze(e) > 2 || Ze(P) > 3 ? "" : " ";
}
function Br(e, t) {
  for (
    ;
    --t &&
    j() &&
    !(P < 48 || P > 102 || (P > 57 && P < 65) || (P > 70 && P < 97));

  );
  return Ae(e, we() + (t < 6 && U() == 32 && j() == 32));
}
function Qe(e) {
  for (; j(); )
    switch (P) {
      case e:
        return M;
      case 34:
      case 39:
        e !== 34 && e !== 39 && Qe(P);
        break;
      case 40:
        e === 41 && Qe(e);
        break;
      case 92:
        j();
        break;
    }
  return M;
}
function Fr(e, t) {
  for (; j() && e + P !== 57; ) if (e + P === 84 && U() === 47) break;
  return "/*" + Ae(t, M - 1) + "*" + ct(e === 47 ? e : j());
}
function Wr(e) {
  for (; !Ze(U()); ) j();
  return Ae(e, M);
}
function Gr(e) {
  return zr(ve("", null, null, null, [""], (e = $r(e)), 0, [0], e));
}
function ve(e, t, r, n, o, s, a, p, i) {
  for (
    var h = 0,
      u = 0,
      c = a,
      d = 0,
      m = 0,
      f = 0,
      v = 1,
      I = 1,
      E = 1,
      _ = 0,
      N = "",
      D = o,
      R = s,
      S = n,
      b = N;
    I;

  )
    switch (((f = _), (_ = j()))) {
      case 40:
        if (f != 108 && k(b, c - 1) == 58) {
          ye((b += g(Be(_), "&", "&\f")), "&\f", Gt(h ? p[h - 1] : 0)) != -1 &&
            (E = -1);
          break;
        }
      case 34:
      case 39:
      case 91:
        b += Be(_);
        break;
      case 9:
      case 10:
      case 13:
      case 32:
        b += Lr(f);
        break;
      case 92:
        b += Br(we() - 1, 7);
        continue;
      case 47:
        switch (U()) {
          case 42:
          case 47:
            ie(qr(Fr(j(), we()), t, r, i), i);
            break;
          default:
            b += "/";
        }
        break;
      case 123 * v:
        p[h++] = $(b) * E;
      case 125 * v:
      case 59:
      case 0:
        switch (_) {
          case 0:
          case 125:
            I = 0;
          case 59 + u:
            E == -1 && (b = g(b, /\f/g, "")),
              m > 0 &&
                $(b) - c &&
                ie(
                  m > 32
                    ? bt(b + ";", n, r, c - 1, i)
                    : bt(g(b, " ", "") + ";", n, r, c - 2, i),
                  i
                );
            break;
          case 59:
            b += ";";
          default:
            if (
              (ie(
                (S = gt(b, t, r, h, u, o, p, N, (D = []), (R = []), c, s)),
                s
              ),
              _ === 123)
            )
              if (u === 0) ve(b, t, S, S, D, s, c, p, R);
              else
                switch (d === 99 && k(b, 3) === 110 ? 100 : d) {
                  case 100:
                  case 108:
                  case 109:
                  case 115:
                    ve(
                      e,
                      S,
                      S,
                      n && ie(gt(e, S, S, 0, 0, o, p, N, o, (D = []), c, R), R),
                      o,
                      R,
                      c,
                      p,
                      n ? D : R
                    );
                    break;
                  default:
                    ve(b, S, S, S, [""], R, 0, p, R);
                }
        }
        (h = u = m = 0), (v = E = 1), (N = b = ""), (c = a);
        break;
      case 58:
        (c = 1 + $(b)), (m = f);
      default:
        if (v < 1) {
          if (_ == 123) --v;
          else if (_ == 125 && v++ == 0 && jr() == 125) continue;
        }
        switch (((b += ct(_)), _ * v)) {
          case 38:
            E = u > 0 ? 1 : ((b += "\f"), -1);
            break;
          case 44:
            (p[h++] = ($(b) - 1) * E), (E = 1);
            break;
          case 64:
            U() === 45 && (b += Be(j())),
              (d = U()),
              (u = c = $((N = b += Wr(we())))),
              _++;
            break;
          case 45:
            f === 45 && $(b) == 2 && (v = 0);
        }
    }
  return s;
}
function gt(e, t, r, n, o, s, a, p, i, h, u, c) {
  for (
    var d = o - 1, m = o === 0 ? s : [""], f = Ut(m), v = 0, I = 0, E = 0;
    v < n;
    ++v
  )
    for (var _ = 0, N = Q(e, d + 1, (d = Gt((I = a[v])))), D = e; _ < f; ++_)
      (D = qt(I > 0 ? m[_] + " " + N : g(N, /&\f/g, m[_]))) && (i[E++] = D);
  return ke(e, t, r, o === 0 ? Pe : p, i, h, u, c);
}
function qr(e, t, r, n) {
  return ke(e, t, r, Ft, ct(Mr()), Q(e, 2, -2), 0, n);
}
function bt(e, t, r, n, o) {
  return ke(e, t, r, it, Q(e, 0, n), Q(e, n + 1, -1), n, o);
}
function Yt(e, t, r) {
  switch (Or(e, t)) {
    case 5103:
      return w + "print-" + e + e;
    case 5737:
    case 4201:
    case 3177:
    case 3433:
    case 1641:
    case 4457:
    case 2921:
    case 5572:
    case 6356:
    case 5844:
    case 3191:
    case 6645:
    case 3005:
    case 6391:
    case 5879:
    case 5623:
    case 6135:
    case 4599:
    case 4855:
    case 4215:
    case 6389:
    case 5109:
    case 5365:
    case 5621:
    case 3829:
      return w + e + e;
    case 4789:
      return ce + e + e;
    case 5349:
    case 4246:
    case 4810:
    case 6968:
    case 2756:
      return w + e + ce + e + C + e + e;
    case 5936:
      switch (k(e, t + 11)) {
        case 114:
          return w + e + C + g(e, /[svh]\w+-[tblr]{2}/, "tb") + e;
        case 108:
          return w + e + C + g(e, /[svh]\w+-[tblr]{2}/, "tb-rl") + e;
        case 45:
          return w + e + C + g(e, /[svh]\w+-[tblr]{2}/, "lr") + e;
      }
    case 6828:
    case 4268:
    case 2903:
      return w + e + C + e + e;
    case 6165:
      return w + e + C + "flex-" + e + e;
    case 5187:
      return (
        w + e + g(e, /(\w+).+(:[^]+)/, w + "box-$1$2" + C + "flex-$1$2") + e
      );
    case 5443:
      return (
        w +
        e +
        C +
        "flex-item-" +
        g(e, /flex-|-self/g, "") +
        (L(e, /flex-|baseline/)
          ? ""
          : C + "grid-row-" + g(e, /flex-|-self/g, "")) +
        e
      );
    case 4675:
      return (
        w +
        e +
        C +
        "flex-line-pack" +
        g(e, /align-content|flex-|-self/g, "") +
        e
      );
    case 5548:
      return w + e + C + g(e, "shrink", "negative") + e;
    case 5292:
      return w + e + C + g(e, "basis", "preferred-size") + e;
    case 6060:
      return (
        w +
        "box-" +
        g(e, "-grow", "") +
        w +
        e +
        C +
        g(e, "grow", "positive") +
        e
      );
    case 4554:
      return w + g(e, /([^-])(transform)/g, "$1" + w + "$2") + e;
    case 6187:
      return (
        g(g(g(e, /(zoom-|grab)/, w + "$1"), /(image-set)/, w + "$1"), e, "") + e
      );
    case 5495:
    case 3959:
      return g(e, /(image-set\([^]*)/, w + "$1$`$1");
    case 4968:
      return (
        g(
          g(e, /(.+:)(flex-)?(.*)/, w + "box-pack:$3" + C + "flex-pack:$3"),
          /s.+-b[^;]+/,
          "justify"
        ) +
        w +
        e +
        e
      );
    case 4200:
      if (!L(e, /flex-|baseline/)) return C + "grid-column-align" + Q(e, t) + e;
      break;
    case 2592:
    case 3360:
      return C + g(e, "template-", "") + e;
    case 4384:
    case 3616:
      return r &&
        r.some(function (n, o) {
          return (t = o), L(n.props, /grid-\w+-end/);
        })
        ? ~ye(e + (r = r[t].value), "span", 0)
          ? e
          : C +
            g(e, "-start", "") +
            e +
            C +
            "grid-row-span:" +
            (~ye(r, "span", 0) ? L(r, /\d+/) : +L(r, /\d+/) - +L(e, /\d+/)) +
            ";"
        : C + g(e, "-start", "") + e;
    case 4896:
    case 4128:
      return r &&
        r.some(function (n) {
          return L(n.props, /grid-\w+-start/);
        })
        ? e
        : C + g(g(e, "-end", "-span"), "span ", "") + e;
    case 4095:
    case 3583:
    case 4068:
    case 2532:
      return g(e, /(.+)-inline(.+)/, w + "$1$2") + e;
    case 8116:
    case 7059:
    case 5753:
    case 5535:
    case 5445:
    case 5701:
    case 4933:
    case 4677:
    case 5533:
    case 5789:
    case 5021:
    case 4765:
      if ($(e) - 1 - t > 6)
        switch (k(e, t + 1)) {
          case 109:
            if (k(e, t + 4) !== 45) break;
          case 102:
            return (
              g(
                e,
                /(.+:)(.+)-([^]+)/,
                "$1" +
                  w +
                  "$2-$3$1" +
                  ce +
                  (k(e, t + 3) == 108 ? "$3" : "$2-$3")
              ) + e
            );
          case 115:
            return ~ye(e, "stretch", 0)
              ? Yt(g(e, "stretch", "fill-available"), t, r) + e
              : e;
        }
      break;
    case 5152:
    case 5920:
      return g(
        e,
        /(.+?):(\d+)(\s*\/\s*(span)?\s*(\d+))?(.*)/,
        function (n, o, s, a, p, i, h) {
          return (
            C +
            o +
            ":" +
            s +
            h +
            (a ? C + o + "-span:" + (p ? i : +i - +s) + h : "") +
            e
          );
        }
      );
    case 4949:
      if (k(e, t + 6) === 121) return g(e, ":", ":" + w) + e;
      break;
    case 6444:
      switch (k(e, k(e, 14) === 45 ? 18 : 11)) {
        case 120:
          return (
            g(
              e,
              /(.+:)([^;\s!]+)(;|(\s+)?!.+)?/,
              "$1" +
                w +
                (k(e, 14) === 45 ? "inline-" : "") +
                "box$3$1" +
                w +
                "$2$3$1" +
                C +
                "$2box$3"
            ) + e
          );
        case 100:
          return g(e, ":", ":" + C) + e;
      }
      break;
    case 5719:
    case 2647:
    case 2135:
    case 3927:
    case 2391:
      return g(e, "scroll-", "scroll-snap-") + e;
  }
  return e;
}
function Ne(e, t) {
  for (var r = "", n = 0; n < e.length; n++) r += t(e[n], n, e, t) || "";
  return r;
}
function Ur(e, t, r, n) {
  switch (e.type) {
    case Ar:
      if (e.children.length) break;
    case kr:
    case it:
      return (e.return = e.return || e.value);
    case Ft:
      return "";
    case Wt:
      return (e.return = e.value + "{" + Ne(e.children, n) + "}");
    case Pe:
      if (!$((e.value = e.props.join(",")))) return "";
  }
  return $((r = Ne(e.children, n))) ? (e.return = e.value + "{" + r + "}") : "";
}
function Hr(e) {
  var t = Ut(e);
  return function (r, n, o, s) {
    for (var a = "", p = 0; p < t; p++) a += e[p](r, n, o, s) || "";
    return a;
  };
}
function Yr(e) {
  return function (t) {
    t.root || ((t = t.return) && e(t));
  };
}
function Vr(e, t, r, n) {
  if (e.length > -1 && !e.return)
    switch (e.type) {
      case it:
        e.return = Yt(e.value, e.length, r);
        return;
      case Wt:
        return Ne([W(e, { value: g(e.value, "@", "@" + w) })], n);
      case Pe:
        if (e.length)
          return Tr((r = e.props), function (o) {
            switch (L(o, (n = /(::plac\w+|:read-\w+)/))) {
              case ":read-only":
              case ":read-write":
                K(W(e, { props: [g(o, /:(read-\w+)/, ":" + ce + "$1")] })),
                  K(W(e, { props: [o] })),
                  Ke(e, { props: mt(r, n) });
                break;
              case "::placeholder":
                K(W(e, { props: [g(o, /:(plac\w+)/, ":" + w + "input-$1")] })),
                  K(W(e, { props: [g(o, /:(plac\w+)/, ":" + ce + "$1")] })),
                  K(W(e, { props: [g(o, /:(plac\w+)/, C + "input-$1")] })),
                  K(W(e, { props: [o] })),
                  Ke(e, { props: mt(r, n) });
                break;
            }
            return "";
          });
    }
}
var Kr = {
    animationIterationCount: 1,
    aspectRatio: 1,
    borderImageOutset: 1,
    borderImageSlice: 1,
    borderImageWidth: 1,
    boxFlex: 1,
    boxFlexGroup: 1,
    boxOrdinalGroup: 1,
    columnCount: 1,
    columns: 1,
    flex: 1,
    flexGrow: 1,
    flexPositive: 1,
    flexShrink: 1,
    flexNegative: 1,
    flexOrder: 1,
    gridRow: 1,
    gridRowEnd: 1,
    gridRowSpan: 1,
    gridRowStart: 1,
    gridColumn: 1,
    gridColumnEnd: 1,
    gridColumnSpan: 1,
    gridColumnStart: 1,
    msGridRow: 1,
    msGridRowSpan: 1,
    msGridColumn: 1,
    msGridColumnSpan: 1,
    fontWeight: 1,
    lineHeight: 1,
    opacity: 1,
    order: 1,
    orphans: 1,
    tabSize: 1,
    widows: 1,
    zIndex: 1,
    zoom: 1,
    WebkitLineClamp: 1,
    fillOpacity: 1,
    floodOpacity: 1,
    stopOpacity: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1,
    strokeMiterlimit: 1,
    strokeOpacity: 1,
    strokeWidth: 1,
  },
  O = {},
  J =
    (typeof process < "u" &&
      O !== void 0 &&
      (O.REACT_APP_SC_ATTR || O.SC_ATTR)) ||
    "data-styled",
  Vt = "active",
  Kt = "data-styled-version",
  Oe = "6.1.16",
  ut = `/*!sc*/
`,
  Ie = typeof window < "u" && "HTMLElement" in window,
  Zr = !!(typeof SC_DISABLE_SPEEDY == "boolean"
    ? SC_DISABLE_SPEEDY
    : typeof process < "u" &&
        O !== void 0 &&
        O.REACT_APP_SC_DISABLE_SPEEDY !== void 0 &&
        O.REACT_APP_SC_DISABLE_SPEEDY !== ""
      ? O.REACT_APP_SC_DISABLE_SPEEDY !== "false" &&
        O.REACT_APP_SC_DISABLE_SPEEDY
      : typeof process < "u" &&
        O !== void 0 &&
        O.SC_DISABLE_SPEEDY !== void 0 &&
        O.SC_DISABLE_SPEEDY !== "" &&
        O.SC_DISABLE_SPEEDY !== "false" &&
        O.SC_DISABLE_SPEEDY),
  Te = Object.freeze([]),
  ee = Object.freeze({});
function Qr(e, t, r) {
  return (
    r === void 0 && (r = ee), (e.theme !== r.theme && e.theme) || t || r.theme
  );
}
var Zt = new Set([
    "a",
    "abbr",
    "address",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "base",
    "bdi",
    "bdo",
    "big",
    "blockquote",
    "body",
    "br",
    "button",
    "canvas",
    "caption",
    "cite",
    "code",
    "col",
    "colgroup",
    "data",
    "datalist",
    "dd",
    "del",
    "details",
    "dfn",
    "dialog",
    "div",
    "dl",
    "dt",
    "em",
    "embed",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "hgroup",
    "hr",
    "html",
    "i",
    "iframe",
    "img",
    "input",
    "ins",
    "kbd",
    "keygen",
    "label",
    "legend",
    "li",
    "link",
    "main",
    "map",
    "mark",
    "menu",
    "menuitem",
    "meta",
    "meter",
    "nav",
    "noscript",
    "object",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "param",
    "picture",
    "pre",
    "progress",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "script",
    "section",
    "select",
    "small",
    "source",
    "span",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "tr",
    "track",
    "u",
    "ul",
    "use",
    "var",
    "video",
    "wbr",
    "circle",
    "clipPath",
    "defs",
    "ellipse",
    "foreignObject",
    "g",
    "image",
    "line",
    "linearGradient",
    "marker",
    "mask",
    "path",
    "pattern",
    "polygon",
    "polyline",
    "radialGradient",
    "rect",
    "stop",
    "svg",
    "text",
    "tspan",
  ]),
  Xr = /[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~-]+/g,
  Jr = /(^-|-$)/g;
function yt(e) {
  return e.replace(Xr, "-").replace(Jr, "");
}
var en = /(a)(d)/gi,
  ge = 52,
  wt = function (e) {
    return String.fromCharCode(e + (e > 25 ? 39 : 97));
  };
function Xe(e) {
  var t,
    r = "";
  for (t = Math.abs(e); t > ge; t = (t / ge) | 0) r = wt(t % ge) + r;
  return (wt(t % ge) + r).replace(en, "$1-$2");
}
var Fe,
  Qt = 5381,
  Z = function (e, t) {
    for (var r = t.length; r; ) e = (33 * e) ^ t.charCodeAt(--r);
    return e;
  },
  Xt = function (e) {
    return Z(Qt, e);
  };
function tn(e) {
  return Xe(Xt(e) >>> 0);
}
function rn(e) {
  return e.displayName || e.name || "Component";
}
function We(e) {
  return typeof e == "string" && !0;
}
var Jt = typeof Symbol == "function" && Symbol.for,
  er = Jt ? Symbol.for("react.memo") : 60115,
  nn = Jt ? Symbol.for("react.forward_ref") : 60112,
  on = {
    childContextTypes: !0,
    contextType: !0,
    contextTypes: !0,
    defaultProps: !0,
    displayName: !0,
    getDefaultProps: !0,
    getDerivedStateFromError: !0,
    getDerivedStateFromProps: !0,
    mixins: !0,
    propTypes: !0,
    type: !0,
  },
  sn = {
    name: !0,
    length: !0,
    prototype: !0,
    caller: !0,
    callee: !0,
    arguments: !0,
    arity: !0,
  },
  tr = {
    $$typeof: !0,
    compare: !0,
    defaultProps: !0,
    displayName: !0,
    propTypes: !0,
    type: !0,
  },
  an =
    (((Fe = {})[nn] = {
      $$typeof: !0,
      render: !0,
      defaultProps: !0,
      displayName: !0,
      propTypes: !0,
    }),
    (Fe[er] = tr),
    Fe);
function vt(e) {
  return ("type" in (t = e) && t.type.$$typeof) === er
    ? tr
    : "$$typeof" in e
      ? an[e.$$typeof]
      : on;
  var t;
}
var cn = Object.defineProperty,
  un = Object.getOwnPropertyNames,
  xt = Object.getOwnPropertySymbols,
  ln = Object.getOwnPropertyDescriptor,
  dn = Object.getPrototypeOf,
  St = Object.prototype;
function rr(e, t, r) {
  if (typeof t != "string") {
    if (St) {
      var n = dn(t);
      n && n !== St && rr(e, n, r);
    }
    var o = un(t);
    xt && (o = o.concat(xt(t)));
    for (var s = vt(e), a = vt(t), p = 0; p < o.length; ++p) {
      var i = o[p];
      if (!(i in sn || (r && r[i]) || (a && i in a) || (s && i in s))) {
        var h = ln(t, i);
        try {
          cn(e, i, h);
        } catch {}
      }
    }
  }
  return e;
}
function te(e) {
  return typeof e == "function";
}
function lt(e) {
  return typeof e == "object" && "styledComponentId" in e;
}
function q(e, t) {
  return e && t ? "".concat(e, " ").concat(t) : e || t || "";
}
function Ct(e, t) {
  if (e.length === 0) return "";
  for (var r = e[0], n = 1; n < e.length; n++) r += e[n];
  return r;
}
function ue(e) {
  return (
    e !== null &&
    typeof e == "object" &&
    e.constructor.name === Object.name &&
    !("props" in e && e.$$typeof)
  );
}
function Je(e, t, r) {
  if ((r === void 0 && (r = !1), !r && !ue(e) && !Array.isArray(e))) return t;
  if (Array.isArray(t))
    for (var n = 0; n < t.length; n++) e[n] = Je(e[n], t[n]);
  else if (ue(t)) for (var n in t) e[n] = Je(e[n], t[n]);
  return e;
}
function dt(e, t) {
  Object.defineProperty(e, "toString", { value: t });
}
function le(e) {
  for (var t = [], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
  return new Error(
    "An error occurred. See https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/utils/errors.md#"
      .concat(e, " for more information.")
      .concat(t.length > 0 ? " Args: ".concat(t.join(", ")) : "")
  );
}
var pn = (function () {
    function e(t) {
      (this.groupSizes = new Uint32Array(512)),
        (this.length = 512),
        (this.tag = t);
    }
    return (
      (e.prototype.indexOfGroup = function (t) {
        for (var r = 0, n = 0; n < t; n++) r += this.groupSizes[n];
        return r;
      }),
      (e.prototype.insertRules = function (t, r) {
        if (t >= this.groupSizes.length) {
          for (var n = this.groupSizes, o = n.length, s = o; t >= s; )
            if ((s <<= 1) < 0) throw le(16, "".concat(t));
          (this.groupSizes = new Uint32Array(s)),
            this.groupSizes.set(n),
            (this.length = s);
          for (var a = o; a < s; a++) this.groupSizes[a] = 0;
        }
        for (
          var p = this.indexOfGroup(t + 1), i = ((a = 0), r.length);
          a < i;
          a++
        )
          this.tag.insertRule(p, r[a]) && (this.groupSizes[t]++, p++);
      }),
      (e.prototype.clearGroup = function (t) {
        if (t < this.length) {
          var r = this.groupSizes[t],
            n = this.indexOfGroup(t),
            o = n + r;
          this.groupSizes[t] = 0;
          for (var s = n; s < o; s++) this.tag.deleteRule(n);
        }
      }),
      (e.prototype.getGroup = function (t) {
        var r = "";
        if (t >= this.length || this.groupSizes[t] === 0) return r;
        for (
          var n = this.groupSizes[t],
            o = this.indexOfGroup(t),
            s = o + n,
            a = o;
          a < s;
          a++
        )
          r += "".concat(this.tag.getRule(a)).concat(ut);
        return r;
      }),
      e
    );
  })(),
  xe = new Map(),
  _e = new Map(),
  Se = 1,
  be = function (e) {
    if (xe.has(e)) return xe.get(e);
    for (; _e.has(Se); ) Se++;
    var t = Se++;
    return xe.set(e, t), _e.set(t, e), t;
  },
  hn = function (e, t) {
    (Se = t + 1), xe.set(e, t), _e.set(t, e);
  },
  fn = "style[".concat(J, "][").concat(Kt, '="').concat(Oe, '"]'),
  mn = new RegExp(
    "^".concat(J, '\\.g(\\d+)\\[id="([\\w\\d-]+)"\\].*?"([^"]*)')
  ),
  gn = function (e, t, r) {
    for (var n, o = r.split(","), s = 0, a = o.length; s < a; s++)
      (n = o[s]) && e.registerName(t, n);
  },
  bn = function (e, t) {
    for (
      var r,
        n = ((r = t.textContent) !== null && r !== void 0 ? r : "").split(ut),
        o = [],
        s = 0,
        a = n.length;
      s < a;
      s++
    ) {
      var p = n[s].trim();
      if (p) {
        var i = p.match(mn);
        if (i) {
          var h = 0 | parseInt(i[1], 10),
            u = i[2];
          h !== 0 && (hn(u, h), gn(e, u, i[3]), e.getTag().insertRules(h, o)),
            (o.length = 0);
        } else o.push(p);
      }
    }
  },
  Nt = function (e) {
    for (
      var t = document.querySelectorAll(fn), r = 0, n = t.length;
      r < n;
      r++
    ) {
      var o = t[r];
      o &&
        o.getAttribute(J) !== Vt &&
        (bn(e, o), o.parentNode && o.parentNode.removeChild(o));
    }
  };
function yn() {
  return typeof __webpack_nonce__ < "u" ? __webpack_nonce__ : null;
}
var nr = function (e) {
    var t = document.head,
      r = e || t,
      n = document.createElement("style"),
      o = (function (p) {
        var i = Array.from(p.querySelectorAll("style[".concat(J, "]")));
        return i[i.length - 1];
      })(r),
      s = o !== void 0 ? o.nextSibling : null;
    n.setAttribute(J, Vt), n.setAttribute(Kt, Oe);
    var a = yn();
    return a && n.setAttribute("nonce", a), r.insertBefore(n, s), n;
  },
  wn = (function () {
    function e(t) {
      (this.element = nr(t)),
        this.element.appendChild(document.createTextNode("")),
        (this.sheet = (function (r) {
          if (r.sheet) return r.sheet;
          for (var n = document.styleSheets, o = 0, s = n.length; o < s; o++) {
            var a = n[o];
            if (a.ownerNode === r) return a;
          }
          throw le(17);
        })(this.element)),
        (this.length = 0);
    }
    return (
      (e.prototype.insertRule = function (t, r) {
        try {
          return this.sheet.insertRule(r, t), this.length++, !0;
        } catch {
          return !1;
        }
      }),
      (e.prototype.deleteRule = function (t) {
        this.sheet.deleteRule(t), this.length--;
      }),
      (e.prototype.getRule = function (t) {
        var r = this.sheet.cssRules[t];
        return r && r.cssText ? r.cssText : "";
      }),
      e
    );
  })(),
  vn = (function () {
    function e(t) {
      (this.element = nr(t)),
        (this.nodes = this.element.childNodes),
        (this.length = 0);
    }
    return (
      (e.prototype.insertRule = function (t, r) {
        if (t <= this.length && t >= 0) {
          var n = document.createTextNode(r);
          return (
            this.element.insertBefore(n, this.nodes[t] || null),
            this.length++,
            !0
          );
        }
        return !1;
      }),
      (e.prototype.deleteRule = function (t) {
        this.element.removeChild(this.nodes[t]), this.length--;
      }),
      (e.prototype.getRule = function (t) {
        return t < this.length ? this.nodes[t].textContent : "";
      }),
      e
    );
  })(),
  xn = (function () {
    function e(t) {
      (this.rules = []), (this.length = 0);
    }
    return (
      (e.prototype.insertRule = function (t, r) {
        return (
          t <= this.length && (this.rules.splice(t, 0, r), this.length++, !0)
        );
      }),
      (e.prototype.deleteRule = function (t) {
        this.rules.splice(t, 1), this.length--;
      }),
      (e.prototype.getRule = function (t) {
        return t < this.length ? this.rules[t] : "";
      }),
      e
    );
  })(),
  It = Ie,
  Sn = { isServer: !Ie, useCSSOMInjection: !Zr },
  or = (function () {
    function e(t, r, n) {
      t === void 0 && (t = ee), r === void 0 && (r = {});
      var o = this;
      (this.options = A(A({}, Sn), t)),
        (this.gs = r),
        (this.names = new Map(n)),
        (this.server = !!t.isServer),
        !this.server && Ie && It && ((It = !1), Nt(this)),
        dt(this, function () {
          return (function (s) {
            for (
              var a = s.getTag(),
                p = a.length,
                i = "",
                h = function (c) {
                  var d = (function (E) {
                    return _e.get(E);
                  })(c);
                  if (d === void 0) return "continue";
                  var m = s.names.get(d),
                    f = a.getGroup(c);
                  if (m === void 0 || !m.size || f.length === 0)
                    return "continue";
                  var v = "".concat(J, ".g").concat(c, '[id="').concat(d, '"]'),
                    I = "";
                  m !== void 0 &&
                    m.forEach(function (E) {
                      E.length > 0 && (I += "".concat(E, ","));
                    }),
                    (i += ""
                      .concat(f)
                      .concat(v, '{content:"')
                      .concat(I, '"}')
                      .concat(ut));
                },
                u = 0;
              u < p;
              u++
            )
              h(u);
            return i;
          })(o);
        });
    }
    return (
      (e.registerId = function (t) {
        return be(t);
      }),
      (e.prototype.rehydrate = function () {
        !this.server && Ie && Nt(this);
      }),
      (e.prototype.reconstructWithOptions = function (t, r) {
        return (
          r === void 0 && (r = !0),
          new e(A(A({}, this.options), t), this.gs, (r && this.names) || void 0)
        );
      }),
      (e.prototype.allocateGSInstance = function (t) {
        return (this.gs[t] = (this.gs[t] || 0) + 1);
      }),
      (e.prototype.getTag = function () {
        return (
          this.tag ||
          (this.tag =
            ((t = (function (r) {
              var n = r.useCSSOMInjection,
                o = r.target;
              return r.isServer ? new xn(o) : n ? new wn(o) : new vn(o);
            })(this.options)),
            new pn(t)))
        );
        var t;
      }),
      (e.prototype.hasNameForId = function (t, r) {
        return this.names.has(t) && this.names.get(t).has(r);
      }),
      (e.prototype.registerName = function (t, r) {
        if ((be(t), this.names.has(t))) this.names.get(t).add(r);
        else {
          var n = new Set();
          n.add(r), this.names.set(t, n);
        }
      }),
      (e.prototype.insertRules = function (t, r, n) {
        this.registerName(t, r), this.getTag().insertRules(be(t), n);
      }),
      (e.prototype.clearNames = function (t) {
        this.names.has(t) && this.names.get(t).clear();
      }),
      (e.prototype.clearRules = function (t) {
        this.getTag().clearGroup(be(t)), this.clearNames(t);
      }),
      (e.prototype.clearTag = function () {
        this.tag = void 0;
      }),
      e
    );
  })(),
  Cn = /&/g,
  Nn = /^\s*\/\/.*$/gm;
function sr(e, t) {
  return e.map(function (r) {
    return (
      r.type === "rule" &&
        ((r.value = "".concat(t, " ").concat(r.value)),
        (r.value = r.value.replaceAll(",", ",".concat(t, " "))),
        (r.props = r.props.map(function (n) {
          return "".concat(t, " ").concat(n);
        }))),
      Array.isArray(r.children) &&
        r.type !== "@keyframes" &&
        (r.children = sr(r.children, t)),
      r
    );
  });
}
function In(e) {
  var t,
    r,
    n,
    o = ee,
    s = o.options,
    a = s === void 0 ? ee : s,
    p = o.plugins,
    i = p === void 0 ? Te : p,
    h = function (d, m, f) {
      return f.startsWith(r) && f.endsWith(r) && f.replaceAll(r, "").length > 0
        ? ".".concat(t)
        : d;
    },
    u = i.slice();
  u.push(function (d) {
    d.type === Pe &&
      d.value.includes("&") &&
      (d.props[0] = d.props[0].replace(Cn, r).replace(n, h));
  }),
    a.prefix && u.push(Vr),
    u.push(Ur);
  var c = function (d, m, f, v) {
    m === void 0 && (m = ""),
      f === void 0 && (f = ""),
      v === void 0 && (v = "&"),
      (t = v),
      (r = m),
      (n = new RegExp("\\".concat(r, "\\b"), "g"));
    var I = d.replace(Nn, ""),
      E = Gr(f || m ? "".concat(f, " ").concat(m, " { ").concat(I, " }") : I);
    a.namespace && (E = sr(E, a.namespace));
    var _ = [];
    return (
      Ne(
        E,
        Hr(
          u.concat(
            Yr(function (N) {
              return _.push(N);
            })
          )
        )
      ),
      _
    );
  };
  return (
    (c.hash = i.length
      ? i
          .reduce(function (d, m) {
            return m.name || le(15), Z(d, m.name);
          }, Qt)
          .toString()
      : ""),
    c
  );
}
var _n = new or(),
  et = In(),
  ar = T.createContext({
    shouldForwardProp: void 0,
    styleSheet: _n,
    stylis: et,
  });
ar.Consumer;
T.createContext(void 0);
function _t() {
  return x.useContext(ar);
}
var Dn = (function () {
    function e(t, r) {
      var n = this;
      (this.inject = function (o, s) {
        s === void 0 && (s = et);
        var a = n.name + s.hash;
        o.hasNameForId(n.id, a) ||
          o.insertRules(n.id, a, s(n.rules, a, "@keyframes"));
      }),
        (this.name = t),
        (this.id = "sc-keyframes-".concat(t)),
        (this.rules = r),
        dt(this, function () {
          throw le(12, String(n.name));
        });
    }
    return (
      (e.prototype.getName = function (t) {
        return t === void 0 && (t = et), this.name + t.hash;
      }),
      e
    );
  })(),
  En = function (e) {
    return e >= "A" && e <= "Z";
  };
function Dt(e) {
  for (var t = "", r = 0; r < e.length; r++) {
    var n = e[r];
    if (r === 1 && n === "-" && e[0] === "-") return e;
    En(n) ? (t += "-" + n.toLowerCase()) : (t += n);
  }
  return t.startsWith("ms-") ? "-" + t : t;
}
var ir = function (e) {
    return e == null || e === !1 || e === "";
  },
  cr = function (e) {
    var t,
      r,
      n = [];
    for (var o in e) {
      var s = e[o];
      e.hasOwnProperty(o) &&
        !ir(s) &&
        ((Array.isArray(s) && s.isCss) || te(s)
          ? n.push("".concat(Dt(o), ":"), s, ";")
          : ue(s)
            ? n.push.apply(
                n,
                Ce(Ce(["".concat(o, " {")], cr(s), !1), ["}"], !1)
              )
            : n.push(
                ""
                  .concat(Dt(o), ": ")
                  .concat(
                    ((t = o),
                    (r = s) == null || typeof r == "boolean" || r === ""
                      ? ""
                      : typeof r != "number" ||
                          r === 0 ||
                          t in Kr ||
                          t.startsWith("--")
                        ? String(r).trim()
                        : "".concat(r, "px")),
                    ";"
                  )
              ));
    }
    return n;
  };
function H(e, t, r, n) {
  if (ir(e)) return [];
  if (lt(e)) return [".".concat(e.styledComponentId)];
  if (te(e)) {
    if (!te((s = e)) || (s.prototype && s.prototype.isReactComponent) || !t)
      return [e];
    var o = e(t);
    return H(o, t, r, n);
  }
  var s;
  return e instanceof Dn
    ? r
      ? (e.inject(r, n), [e.getName(n)])
      : [e]
    : ue(e)
      ? cr(e)
      : Array.isArray(e)
        ? Array.prototype.concat.apply(
            Te,
            e.map(function (a) {
              return H(a, t, r, n);
            })
          )
        : [e.toString()];
}
function Pn(e) {
  for (var t = 0; t < e.length; t += 1) {
    var r = e[t];
    if (te(r) && !lt(r)) return !1;
  }
  return !0;
}
var Rn = Xt(Oe),
  kn = (function () {
    function e(t, r, n) {
      (this.rules = t),
        (this.staticRulesId = ""),
        (this.isStatic = (n === void 0 || n.isStatic) && Pn(t)),
        (this.componentId = r),
        (this.baseHash = Z(Rn, r)),
        (this.baseStyle = n),
        or.registerId(r);
    }
    return (
      (e.prototype.generateAndInjectStyles = function (t, r, n) {
        var o = this.baseStyle
          ? this.baseStyle.generateAndInjectStyles(t, r, n)
          : "";
        if (this.isStatic && !n.hash)
          if (
            this.staticRulesId &&
            r.hasNameForId(this.componentId, this.staticRulesId)
          )
            o = q(o, this.staticRulesId);
          else {
            var s = Ct(H(this.rules, t, r, n)),
              a = Xe(Z(this.baseHash, s) >>> 0);
            if (!r.hasNameForId(this.componentId, a)) {
              var p = n(s, ".".concat(a), void 0, this.componentId);
              r.insertRules(this.componentId, a, p);
            }
            (o = q(o, a)), (this.staticRulesId = a);
          }
        else {
          for (
            var i = Z(this.baseHash, n.hash), h = "", u = 0;
            u < this.rules.length;
            u++
          ) {
            var c = this.rules[u];
            if (typeof c == "string") h += c;
            else if (c) {
              var d = Ct(H(c, t, r, n));
              (i = Z(i, d + u)), (h += d);
            }
          }
          if (h) {
            var m = Xe(i >>> 0);
            r.hasNameForId(this.componentId, m) ||
              r.insertRules(
                this.componentId,
                m,
                n(h, ".".concat(m), void 0, this.componentId)
              ),
              (o = q(o, m));
          }
        }
        return o;
      }),
      e
    );
  })(),
  ur = T.createContext(void 0);
ur.Consumer;
var Ge = {};
function An(e, t, r) {
  var n = lt(e),
    o = e,
    s = !We(e),
    a = t.attrs,
    p = a === void 0 ? Te : a,
    i = t.componentId,
    h =
      i === void 0
        ? (function (D, R) {
            var S = typeof D != "string" ? "sc" : yt(D);
            Ge[S] = (Ge[S] || 0) + 1;
            var b = "".concat(S, "-").concat(tn(Oe + S + Ge[S]));
            return R ? "".concat(R, "-").concat(b) : b;
          })(t.displayName, t.parentComponentId)
        : i,
    u = t.displayName,
    c =
      u === void 0
        ? (function (D) {
            return We(D) ? "styled.".concat(D) : "Styled(".concat(rn(D), ")");
          })(e)
        : u,
    d =
      t.displayName && t.componentId
        ? "".concat(yt(t.displayName), "-").concat(t.componentId)
        : t.componentId || h,
    m = n && o.attrs ? o.attrs.concat(p).filter(Boolean) : p,
    f = t.shouldForwardProp;
  if (n && o.shouldForwardProp) {
    var v = o.shouldForwardProp;
    if (t.shouldForwardProp) {
      var I = t.shouldForwardProp;
      f = function (D, R) {
        return v(D, R) && I(D, R);
      };
    } else f = v;
  }
  var E = new kn(r, d, n ? o.componentStyle : void 0);
  function _(D, R) {
    return (function (S, b, V) {
      var de = S.attrs,
        br = S.componentStyle,
        yr = S.defaultProps,
        wr = S.foldedComponentIds,
        vr = S.styledComponentId,
        xr = S.target,
        Sr = T.useContext(ur),
        Cr = _t(),
        $e = S.shouldForwardProp || Cr.shouldForwardProp,
        ht = Qr(b, Sr, yr) || ee,
        z = (function (he, oe, fe) {
          for (
            var se, G = A(A({}, oe), { className: void 0, theme: fe }), Le = 0;
            Le < he.length;
            Le += 1
          ) {
            var me = te((se = he[Le])) ? se(G) : se;
            for (var F in me)
              G[F] =
                F === "className"
                  ? q(G[F], me[F])
                  : F === "style"
                    ? A(A({}, G[F]), me[F])
                    : me[F];
          }
          return (
            oe.className && (G.className = q(G.className, oe.className)), G
          );
        })(de, b, ht),
        pe = z.as || xr,
        ne = {};
      for (var B in z)
        z[B] === void 0 ||
          B[0] === "$" ||
          B === "as" ||
          (B === "theme" && z.theme === ht) ||
          (B === "forwardedAs"
            ? (ne.as = z.forwardedAs)
            : ($e && !$e(B, pe)) || (ne[B] = z[B]));
      var ft = (function (he, oe) {
          var fe = _t(),
            se = he.generateAndInjectStyles(oe, fe.styleSheet, fe.stylis);
          return se;
        })(br, z),
        ze = q(wr, vr);
      return (
        ft && (ze += " " + ft),
        z.className && (ze += " " + z.className),
        (ne[We(pe) && !Zt.has(pe) ? "class" : "className"] = ze),
        V && (ne.ref = V),
        x.createElement(pe, ne)
      );
    })(N, D, R);
  }
  _.displayName = c;
  var N = T.forwardRef(_);
  return (
    (N.attrs = m),
    (N.componentStyle = E),
    (N.displayName = c),
    (N.shouldForwardProp = f),
    (N.foldedComponentIds = n
      ? q(o.foldedComponentIds, o.styledComponentId)
      : ""),
    (N.styledComponentId = d),
    (N.target = n ? o.target : e),
    Object.defineProperty(N, "defaultProps", {
      get: function () {
        return this._foldedDefaultProps;
      },
      set: function (D) {
        this._foldedDefaultProps = n
          ? (function (R) {
              for (var S = [], b = 1; b < arguments.length; b++)
                S[b - 1] = arguments[b];
              for (var V = 0, de = S; V < de.length; V++) Je(R, de[V], !0);
              return R;
            })({}, o.defaultProps, D)
          : D;
      },
    }),
    dt(N, function () {
      return ".".concat(N.styledComponentId);
    }),
    s &&
      rr(N, e, {
        attrs: !0,
        componentStyle: !0,
        displayName: !0,
        foldedComponentIds: !0,
        shouldForwardProp: !0,
        styledComponentId: !0,
        target: !0,
      }),
    N
  );
}
function Et(e, t) {
  for (var r = [e[0]], n = 0, o = t.length; n < o; n += 1)
    r.push(t[n], e[n + 1]);
  return r;
}
var Pt = function (e) {
  return Object.assign(e, { isCss: !0 });
};
function On(e) {
  for (var t = [], r = 1; r < arguments.length; r++) t[r - 1] = arguments[r];
  if (te(e) || ue(e)) return Pt(H(Et(Te, Ce([e], t, !0))));
  var n = e;
  return t.length === 0 && n.length === 1 && typeof n[0] == "string"
    ? H(n)
    : Pt(H(Et(n, t)));
}
function tt(e, t, r) {
  if ((r === void 0 && (r = ee), !t)) throw le(1, t);
  var n = function (o) {
    for (var s = [], a = 1; a < arguments.length; a++) s[a - 1] = arguments[a];
    return e(t, r, On.apply(void 0, Ce([o], s, !1)));
  };
  return (
    (n.attrs = function (o) {
      return tt(
        e,
        t,
        A(A({}, r), {
          attrs: Array.prototype.concat(r.attrs, o).filter(Boolean),
        })
      );
    }),
    (n.withConfig = function (o) {
      return tt(e, t, A(A({}, r), o));
    }),
    n
  );
}
var lr = function (e) {
    return tt(An, e);
  },
  pt = lr;
Zt.forEach(function (e) {
  pt[e] = lr(e);
});
var dr = {
    color: void 0,
    size: void 0,
    className: void 0,
    style: void 0,
    attr: void 0,
  },
  Rt = T.createContext && T.createContext(dr),
  Tn = ["attr", "size", "title"];
function Mn(e, t) {
  if (e == null) return {};
  var r = jn(e, t),
    n,
    o;
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    for (o = 0; o < s.length; o++)
      (n = s[o]),
        !(t.indexOf(n) >= 0) &&
          Object.prototype.propertyIsEnumerable.call(e, n) &&
          (r[n] = e[n]);
  }
  return r;
}
function jn(e, t) {
  if (e == null) return {};
  var r = {};
  for (var n in e)
    if (Object.prototype.hasOwnProperty.call(e, n)) {
      if (t.indexOf(n) >= 0) continue;
      r[n] = e[n];
    }
  return r;
}
function De() {
  return (
    (De = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var n in r)
              Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
          }
          return e;
        }),
    De.apply(this, arguments)
  );
}
function kt(e, t) {
  var r = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    t &&
      (n = n.filter(function (o) {
        return Object.getOwnPropertyDescriptor(e, o).enumerable;
      })),
      r.push.apply(r, n);
  }
  return r;
}
function Ee(e) {
  for (var t = 1; t < arguments.length; t++) {
    var r = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? kt(Object(r), !0).forEach(function (n) {
          $n(e, n, r[n]);
        })
      : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
        : kt(Object(r)).forEach(function (n) {
            Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(r, n));
          });
  }
  return e;
}
function $n(e, t, r) {
  return (
    (t = zn(t)),
    t in e
      ? Object.defineProperty(e, t, {
          value: r,
          enumerable: !0,
          configurable: !0,
          writable: !0,
        })
      : (e[t] = r),
    e
  );
}
function zn(e) {
  var t = Ln(e, "string");
  return typeof t == "symbol" ? t : t + "";
}
function Ln(e, t) {
  if (typeof e != "object" || !e) return e;
  var r = e[Symbol.toPrimitive];
  if (r !== void 0) {
    var n = r.call(e, t);
    if (typeof n != "object") return n;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (t === "string" ? String : Number)(e);
}
function pr(e) {
  return (
    e &&
    e.map((t, r) => T.createElement(t.tag, Ee({ key: r }, t.attr), pr(t.child)))
  );
}
function Bn(e) {
  return (t) =>
    T.createElement(Fn, De({ attr: Ee({}, e.attr) }, t), pr(e.child));
}
function Fn(e) {
  var t = (r) => {
    var { attr: n, size: o, title: s } = e,
      a = Mn(e, Tn),
      p = o || r.size || "1em",
      i;
    return (
      r.className && (i = r.className),
      e.className && (i = (i ? i + " " : "") + e.className),
      T.createElement(
        "svg",
        De(
          { stroke: "currentColor", fill: "currentColor", strokeWidth: "0" },
          r.attr,
          n,
          a,
          {
            className: i,
            style: Ee(Ee({ color: e.color || r.color }, r.style), e.style),
            height: p,
            width: p,
            xmlns: "http://www.w3.org/2000/svg",
          }
        ),
        s && T.createElement("title", null, s),
        e.children
      )
    );
  };
  return Rt !== void 0
    ? T.createElement(Rt.Consumer, null, (r) => t(r))
    : t(dr);
}
function Wn(e) {
  return Bn({
    attr: { viewBox: "0 0 512 512" },
    child: [
      {
        tag: "path",
        attr: {
          d: "M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z",
        },
        child: [],
      },
    ],
  })(e);
}
const Gn = () => {
    const [e, t] = x.useState(""),
      [r, n] = x.useState([]),
      [o, s] = x.useState(!1),
      [a, p] = x.useState(-1),
      i = async (c) => {
        let d = [];
        return (
          await fetch(`/api/suggestions?q=${c}`)
            .then((m) => m.json())
            .then((m) => {
              d = m;
            }),
          console.log(d),
          d
        );
      };
    x.useEffect(() => {
      const c = setTimeout(() => {
        i(e).then((d) => {
          n(d), s(d.length > 0);
        });
      }, 0);
      return () => clearTimeout(c);
    }, [e]);
    const h = (c) => {
        if (o) {
          if (c.key === "ArrowDown")
            c.preventDefault(), p((d) => (d < r.length - 1 ? d + 1 : 0));
          else if (c.key === "ArrowUp")
            c.preventDefault(), p((d) => (d > 0 ? d - 1 : r.length - 1));
          else if (c.key === "Enter" && a >= 0 && a < r.length) {
            const d = r[a];
            t(d),
              s(!1),
              (window.location.href = `https://www.google.com/search?q=${encodeURIComponent(d)}`);
          }
        }
      },
      u = () => {
        const d = document.getElementById("targetInput").value;
        t(d),
          (window.location.href = `https://www.google.com/search?q=${encodeURIComponent(d)}`);
      };
    return l(qn, {
      children: y("div", {
        className: "search-container",
        children: [
          y("div", {
            className: "input",
            children: [
              y("svg", {
                className: "svgClass",
                viewBox: "0 0 24 24",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
                children: [
                  l("path", {
                    fillRule: "evenodd",
                    clipRule: "evenodd",
                    d: "M11.5 6C11.3949 6.00006 11.2925 5.96705 11.2073 5.90565C11.1221 5.84425 11.0583 5.75758 11.0251 5.65792L10.7623 4.86908C10.6623 4.57101 10.4288 4.33629 10.13 4.23693L9.34102 3.97354C9.24166 3.94019 9.1553 3.87649 9.09411 3.79142C9.03292 3.70635 9 3.60421 9 3.49943C9 3.39465 9.03292 3.29252 9.09411 3.20745C9.1553 3.12238 9.24166 3.05867 9.34102 3.02532L10.13 2.76193C10.4282 2.66191 10.663 2.42852 10.7623 2.12979L11.0258 1.34094C11.0591 1.24161 11.1229 1.15526 11.2079 1.09409C11.293 1.03291 11.3952 1 11.5 1C11.6048 1 11.707 1.03291 11.7921 1.09409C11.8771 1.15526 11.9409 1.24161 11.9742 1.34094L12.2377 2.12979C12.2868 2.27697 12.3695 2.4107 12.4792 2.52041C12.589 2.63013 12.7227 2.71281 12.87 2.76193L13.659 3.02532C13.7583 3.05867 13.8447 3.12238 13.9059 3.20745C13.9671 3.29252 14 3.39465 14 3.49943C14 3.60421 13.9671 3.70635 13.9059 3.79142C13.8447 3.87649 13.7583 3.94019 13.659 3.97354L12.87 4.23693C12.5718 4.33696 12.337 4.57034 12.2377 4.86908L11.9742 5.65792C11.9411 5.75747 11.8774 5.84406 11.7923 5.90545C11.7072 5.96684 11.6049 5.99992 11.5 6Z",
                    fill: "currentColor",
                  }),
                  l("path", {
                    fillRule: "evenodd",
                    clipRule: "evenodd",
                    d: "M6 13C5.85133 13.0001 5.7069 12.9504 5.58969 12.859C5.47247 12.7675 5.38921 12.6395 5.35313 12.4952L5.12388 11.5745C4.91418 10.7391 4.26198 10.0868 3.42674 9.87703L2.50619 9.64774C2.36169 9.61194 2.23333 9.52878 2.14159 9.41151C2.04985 9.29425 2 9.14964 2 9.00075C2 8.85185 2.04985 8.70724 2.14159 8.58998C2.23333 8.47272 2.36169 8.38955 2.50619 8.35376L3.42674 8.12446C4.26198 7.91473 4.91418 7.2624 5.12388 6.427L5.35313 5.50629C5.38892 5.36176 5.47207 5.23338 5.58931 5.14162C5.70655 5.04986 5.85113 5 6 5C6.14887 5 6.29345 5.04986 6.41069 5.14162C6.52793 5.23338 6.61108 5.36176 6.64687 5.50629L6.87612 6.427C6.97865 6.83721 7.19071 7.21184 7.48965 7.51082C7.78858 7.80981 8.16313 8.02192 8.57326 8.12446L9.49381 8.35376C9.63831 8.38955 9.76667 8.47272 9.85841 8.58998C9.95015 8.70724 10 8.85185 10 9.00075C10 9.14964 9.95015 9.29425 9.85841 9.41151C9.76667 9.52878 9.63831 9.61194 9.49381 9.64774L8.57326 9.87703C8.16313 9.97957 7.78858 10.1917 7.48965 10.4907C7.19071 10.7897 6.97865 11.1643 6.87612 11.5745L6.64687 12.4952C6.61079 12.6395 6.52753 12.7675 6.41031 12.859C6.2931 12.9504 6.14867 13.0001 6 13Z",
                    fill: "currentColor",
                  }),
                  l("path", {
                    fillRule: "evenodd",
                    clipRule: "evenodd",
                    d: "M13.5005 23C13.3376 23 13.1791 22.9469 13.049 22.8487C12.9189 22.7505 12.8243 22.6127 12.7795 22.456L11.9665 19.61C11.7915 18.9971 11.4631 18.4389 11.0124 17.9882C10.5616 17.5374 10.0035 17.209 9.39054 17.034L6.54454 16.221C6.38795 16.1761 6.25021 16.0815 6.15216 15.9514C6.05411 15.8214 6.00108 15.6629 6.00108 15.5C6.00108 15.3371 6.05411 15.1786 6.15216 15.0486C6.25021 14.9185 6.38795 14.8239 6.54454 14.779L9.39054 13.966C10.0035 13.791 10.5616 13.4626 11.0124 13.0118C11.4631 12.5611 11.7915 12.0029 11.9665 11.39L12.7795 8.544C12.8244 8.38741 12.919 8.24967 13.0491 8.15162C13.1792 8.05357 13.3376 8.00054 13.5005 8.00054C13.6634 8.00054 13.8219 8.05357 13.952 8.15162C14.0821 8.24967 14.1767 8.38741 14.2215 8.544L15.0345 11.39C15.2096 12.0029 15.538 12.5611 15.9887 13.0118C16.4394 13.4626 16.9976 13.791 17.6105 13.966L20.4565 14.779C20.6131 14.8239 20.7509 14.9185 20.8489 15.0486C20.947 15.1786 21 15.3371 21 15.5C21 15.6629 20.947 15.8214 20.8489 15.9514C20.7509 16.0815 20.6131 16.1761 20.4565 16.221L17.6105 17.034C16.9976 17.209 16.4394 17.5374 15.9887 17.9882C15.538 18.4389 15.2096 18.9971 15.0345 19.61L14.2215 22.456C14.1768 22.6127 14.0822 22.7505 13.9521 22.8487C13.822 22.9469 13.6635 23 13.5005 23Z",
                    fill: "currentColor",
                  }),
                ],
              }),
              l("input", {
                id: "targetInput",
                className: "search",
                type: "text",
                value: e,
                onChange: (c) => {
                  const d = c.target.value;
                  t(d),
                    i(d).then((m) => {
                      n(m), s(m.length > 0), p(-1);
                    });
                },
                onFocus: () => {
                  i(e).then((c) => {
                    n(c), s(c.length > 0);
                  });
                },
                onBlur: () => setTimeout(() => s(!1), 200),
                onKeyDown: (c) => {
                  c.key === "Enter" ? u() : h(c);
                },
                placeholder: "Search...",
              }),
              l("button", {
                style: {
                  border: "none",
                  background: "transparent",
                  width: "50px",
                  cursor: "pointer",
                },
                onClick: u,
                children: l(Wn, {
                  className: "text-gray-500",
                  color: "grey",
                  size: 16,
                }),
              }),
            ],
          }),
          l("div", {
            className: "suggestionsContainer",
            children:
              o &&
              l("ul", {
                className: "suggestions-dropdown",
                children: r.map((c, d) =>
                  l(
                    "li",
                    {
                      onClick: () => {
                        t(c),
                          s(!1),
                          (window.location.href = `https://www.google.com/search?q=${encodeURIComponent(c.trim())}`);
                      },
                      style: {
                        backgroundColor: d === a ? "#eee" : "white",
                        cursor: "pointer",
                      },
                      children: c,
                    },
                    d
                  )
                ),
              }),
          }),
        ],
      }),
    });
  },
  qn = pt.div`
  .search-container {
    box-shadow:
      0 20px 25px -5px rgb(0 0 0 / 0.15),
      0 8px 10px -6px rgb(0 0 0 / 0.25);

    background:
      linear-gradient(canvas, canvas) padding-box,
      linear-gradient(120deg, hsl(278, 44%, 73%), hsl(35, 81%, 73%)) border-box;
    border: 2px solid transparent;
    border-radius: 18px;
  }
  .input {
    --icon-size: 28px;
    position: relative;
    justify-content: center;
    align-items: center;
  }

  .input .svgClass {
    position: absolute;
    width: var(--icon-size);
    top: 50%;
    left: 1rem;
    translate: 0 -50%;
    overflow: visible;
    color: color-mix(in lch, canvas, canvasText 30%);
  }

  .input .svgClass path {
    transform-box: fill-box;
    transform-origin: center;
  }

  .input:is(:hover, :focus-within) .svgClass path {
    animation: pop 0.5s var(--d);
  }

  .input .svgClass path:nth-of-type(1) {
    --d: 0.24s;
    --r: 20deg;
    --s: 1.5;
  }
  .input .svgClass path:nth-of-type(2) {
    --d: 0.12s;
    --r: 10deg;
    --s: 1.4;
  }
  .input .svgClass path:nth-of-type(3) {
    --d: 0s;
    --r: 0deg;
    --s: 1.25;
  }

  @keyframes pop {
    50% {
      scale: var(--s, 1);
      rotate: var(--r, 0deg);
    }
  }

  .search::placeholder {
    color: color-mix(in lch, canvas, canvasText 30%);
  }

  .search {
    max-width: 800px;
    padding: 1rem 1rem 1rem calc(1rem + var(--icon-size) + 0.5rem);
    font-size: 1.025rem;
    field-sizing: content;
    border: 4px solid transparent;
    border-radius: 18px;
    outline: none;
    /*   background-clip: padding-box, border-box; */
    width: auto;
    min-width: 400px;
  }

  .bear-link {
    color: canvasText;
    position: fixed;
    top: 1rem;
    left: 1rem;
    width: 48px;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    opacity: 0.8;
  }

  :where(.x-link, .bear-link):is(:hover, :focus-visible) {
    opacity: 1;
  }

  .bear-link .svgClass {
    width: 75%;
  }
  .suggestions-dropdown {
    margin-left: 8%;

    min-width: 400px;
    max-width: 800px;
    max-height: 200px;
    overflow-y: auto;

    border: 4px solid transparent;
    border-radius: 8px;

    font-size: 1.025rem;

    list-style: none;
    padding: 0;
    margin-top: -10px;
    z-index: 1000;
    justify-content: center;
    align-items: center;
    max-height: 150px;
  }

  .suggestions-dropdown li {
    padding: 10px;
    cursor: pointer;
  }

  .suggestions-dropdown li:hover,
  .suggestions-dropdown li.active {
    background-color: #f0f0f0;
  }
`;
function Un({ iconSrc: e, label: t, url: r }) {
  return y("a", {
    href: r,
    target: "_blank",
    rel: "noopener noreferrer",
    className: "app-menu-item",
    title: t,
    children: [
      l("img", { src: e, alt: t, className: "app-icon" }),
      l("span", { className: "app-label", children: t }),
    ],
  });
}
const Hn = [
  {
    id: "account",
    label: "Account",
    iconSrc:
      "https://www.google.com/s2/favicons?domain=myaccount.google.com&sz=128",
    url: "#",
  },
  {
    id: "drive",
    label: "Drive",
    iconSrc:
      "https://www.google.com/s2/favicons?domain=drive.google.com&sz=128",
    url: "#",
  },
  {
    id: "gmail",
    label: "Gmail",
    iconSrc:
      "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://mail.google.com/&size=128",
    url: "#",
  },
  {
    id: "youtube",
    label: "YouTube",
    iconSrc: "https://www.google.com/s2/favicons?domain=youtube.com&sz=128",
    url: "#",
  },
  {
    id: "gemini",
    label: "Gemini",
    iconSrc:
      "https://www.google.com/s2/favicons?domain=gemini.google.com&sz=128",
    url: "#",
  },
  {
    id: "maps",
    label: "Maps",
    iconSrc: "https://www.google.com/s2/favicons?domain=maps.google.com&sz=128",
    url: "#",
  },
  {
    id: "search",
    label: "Search",
    iconSrc: "https://www.google.com/s2/favicons?domain=google.com&sz=128",
    url: "#",
  },
  {
    id: "calendar",
    label: "Calendar",
    iconSrc:
      "https://www.google.com/s2/favicons?domain=calendar.google.com&sz=128",
    url: "#",
  },
  {
    id: "news",
    label: "News",
    iconSrc: "https://www.google.com/s2/favicons?domain=news.google.com&sz=128",
    url: "#",
  },
  {
    id: "photos",
    label: "Photos",
    iconSrc:
      "https://www.google.com/s2/favicons?domain=photos.google.com&sz=128",
    url: "#",
  },
  {
    id: "meet",
    label: "Meet",
    iconSrc: "https://www.google.com/s2/favicons?domain=meet.google.com&sz=128",
    url: "#",
  },
  {
    id: "translate",
    label: "Translate",
    iconSrc:
      "https://www.google.com/s2/favicons?domain=translate.google.com&sz=128",
    url: "#",
  },
];
function Yn() {
  return y("div", {
    className: "google-apps-menu-container",
    children: [
      " ",
      l("div", {
        className: "google-apps-menu",
        children: Hn.map((e) =>
          l(Un, { iconSrc: e.iconSrc, label: e.label, url: e.url }, e.id)
        ),
      }),
    ],
  });
}
const Vn = () =>
  l("svg", {
    focusable: "false",
    viewBox: "0 0 24 24",
    width: "24px",
    height: "24px",
    children: l("path", {
      d: "M6,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2z",
    }),
  });
function Kn() {
  const [e, t] = x.useState(!1),
    r = () => {
      t(!1);
    };
  return (
    (window.onclick = (o) => {
      e && o.target.closest(".apps-launcher-wrapper") === null && r();
    }),
    y("div", {
      className: "apps-launcher-wrapper",
      children: [
        y("button", {
          className: "apps-launcher-button",
          onClick: () => {
            t((o) => !o);
          },
          "aria-label": "Google apps",
          "aria-haspopup": "true",
          "aria-expanded": e,
          children: [l(Vn, {}), " "],
        }),
        e
          ? l("div", { className: "apps-menu-popover", children: l(Yn, {}) })
          : l("div", {}),
      ],
    })
  );
}
const Zn = () =>
  l("header", { className: "headerContainer", children: l(Kn, {}) });
var qe = { exports: {} },
  Ue,
  At;
function Qn() {
  if (At) return Ue;
  At = 1;
  var e = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
  return (Ue = e), Ue;
}
var He, Ot;
function Xn() {
  if (Ot) return He;
  Ot = 1;
  var e = Qn();
  function t() {}
  function r() {}
  return (
    (r.resetWarningCache = t),
    (He = function () {
      function n(a, p, i, h, u, c) {
        if (c !== e) {
          var d = new Error(
            "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
          );
          throw ((d.name = "Invariant Violation"), d);
        }
      }
      n.isRequired = n;
      function o() {
        return n;
      }
      var s = {
        array: n,
        bigint: n,
        bool: n,
        func: n,
        number: n,
        object: n,
        string: n,
        symbol: n,
        any: n,
        arrayOf: o,
        element: n,
        elementType: n,
        instanceOf: o,
        node: n,
        objectOf: o,
        oneOf: o,
        oneOfType: o,
        shape: o,
        exact: o,
        checkPropTypes: r,
        resetWarningCache: t,
      };
      return (s.PropTypes = s), s;
    }),
    He
  );
}
var Tt;
function Jn() {
  return Tt || ((Tt = 1), (qe.exports = Xn()())), qe.exports;
}
var eo = Jn();
const ae = Nr(eo),
  rt = (e, t) => t.some((r) => e instanceof r);
let Mt, jt;
function to() {
  return (
    Mt ||
    (Mt = [IDBDatabase, IDBObjectStore, IDBIndex, IDBCursor, IDBTransaction])
  );
}
function ro() {
  return (
    jt ||
    (jt = [
      IDBCursor.prototype.advance,
      IDBCursor.prototype.continue,
      IDBCursor.prototype.continuePrimaryKey,
    ])
  );
}
const nt = new WeakMap(),
  Ye = new WeakMap(),
  Me = new WeakMap();
function no(e) {
  const t = new Promise((r, n) => {
    const o = () => {
        e.removeEventListener("success", s), e.removeEventListener("error", a);
      },
      s = () => {
        r(Y(e.result)), o();
      },
      a = () => {
        n(e.error), o();
      };
    e.addEventListener("success", s), e.addEventListener("error", a);
  });
  return Me.set(t, e), t;
}
function oo(e) {
  if (nt.has(e)) return;
  const t = new Promise((r, n) => {
    const o = () => {
        e.removeEventListener("complete", s),
          e.removeEventListener("error", a),
          e.removeEventListener("abort", a);
      },
      s = () => {
        r(), o();
      },
      a = () => {
        n(e.error || new DOMException("AbortError", "AbortError")), o();
      };
    e.addEventListener("complete", s),
      e.addEventListener("error", a),
      e.addEventListener("abort", a);
  });
  nt.set(e, t);
}
let ot = {
  get(e, t, r) {
    if (e instanceof IDBTransaction) {
      if (t === "done") return nt.get(e);
      if (t === "store")
        return r.objectStoreNames[1]
          ? void 0
          : r.objectStore(r.objectStoreNames[0]);
    }
    return Y(e[t]);
  },
  set(e, t, r) {
    return (e[t] = r), !0;
  },
  has(e, t) {
    return e instanceof IDBTransaction && (t === "done" || t === "store")
      ? !0
      : t in e;
  },
};
function hr(e) {
  ot = e(ot);
}
function so(e) {
  return ro().includes(e)
    ? function (...t) {
        return e.apply(st(this), t), Y(this.request);
      }
    : function (...t) {
        return Y(e.apply(st(this), t));
      };
}
function ao(e) {
  return typeof e == "function"
    ? so(e)
    : (e instanceof IDBTransaction && oo(e),
      rt(e, to()) ? new Proxy(e, ot) : e);
}
function Y(e) {
  if (e instanceof IDBRequest) return no(e);
  if (Ye.has(e)) return Ye.get(e);
  const t = ao(e);
  return t !== e && (Ye.set(e, t), Me.set(t, e)), t;
}
const st = (e) => Me.get(e);
function io(e, t, { blocked: r, upgrade: n, blocking: o, terminated: s } = {}) {
  const a = indexedDB.open(e, t),
    p = Y(a);
  return (
    n &&
      a.addEventListener("upgradeneeded", (i) => {
        n(Y(a.result), i.oldVersion, i.newVersion, Y(a.transaction), i);
      }),
    r && a.addEventListener("blocked", (i) => r(i.oldVersion, i.newVersion, i)),
    p
      .then((i) => {
        s && i.addEventListener("close", () => s()),
          o &&
            i.addEventListener("versionchange", (h) =>
              o(h.oldVersion, h.newVersion, h)
            );
      })
      .catch(() => {}),
    p
  );
}
const co = ["get", "getKey", "getAll", "getAllKeys", "count"],
  uo = ["put", "add", "delete", "clear"],
  Ve = new Map();
function $t(e, t) {
  if (!(e instanceof IDBDatabase && !(t in e) && typeof t == "string")) return;
  if (Ve.get(t)) return Ve.get(t);
  const r = t.replace(/FromIndex$/, ""),
    n = t !== r,
    o = uo.includes(r);
  if (
    !(r in (n ? IDBIndex : IDBObjectStore).prototype) ||
    !(o || co.includes(r))
  )
    return;
  const s = async function (a, ...p) {
    const i = this.transaction(a, o ? "readwrite" : "readonly");
    let h = i.store;
    return (
      n && (h = h.index(p.shift())),
      (await Promise.all([h[r](...p), o && i.done]))[0]
    );
  };
  return Ve.set(t, s), s;
}
hr((e) => ({
  ...e,
  get: (t, r, n) => $t(t, r) || e.get(t, r, n),
  has: (t, r) => !!$t(t, r) || e.has(t, r),
}));
const lo = ["continue", "continuePrimaryKey", "advance"],
  zt = {},
  at = new WeakMap(),
  fr = new WeakMap(),
  po = {
    get(e, t) {
      if (!lo.includes(t)) return e[t];
      let r = zt[t];
      return (
        r ||
          (r = zt[t] =
            function (...n) {
              at.set(this, fr.get(this)[t](...n));
            }),
        r
      );
    },
  };
async function* ho(...e) {
  let t = this;
  if ((t instanceof IDBCursor || (t = await t.openCursor(...e)), !t)) return;
  t = t;
  const r = new Proxy(t, po);
  for (fr.set(r, t), Me.set(r, st(t)); t; )
    yield r, (t = await (at.get(r) || t.continue())), at.delete(r);
}
function Lt(e, t) {
  return (
    (t === Symbol.asyncIterator &&
      rt(e, [IDBIndex, IDBObjectStore, IDBCursor])) ||
    (t === "iterate" && rt(e, [IDBIndex, IDBObjectStore]))
  );
}
hr((e) => ({
  ...e,
  get(t, r, n) {
    return Lt(t, r) ? ho : e.get(t, r, n);
  },
  has(t, r) {
    return Lt(t, r) || e.has(t, r);
  },
}));
const je = io("myDatabase", 1, {
    upgrade(e) {
      e.createObjectStore("shortcuts", { keyPath: "id", autoIncrement: !0 });
    },
  }),
  fo = async (e) => {
    await (await je).put("shortcuts", e);
  },
  Bt = async () => (await je).getAll("shortcuts"),
  mo = async (e, t) => {
    const r = await je;
    if (!(await r.get("shortcuts", e)))
      return console.log("shortcut not found!!"), null;
    const o = { ...t, id: e };
    await r.put("shortcuts", o);
  },
  go = async (e) => {
    await (await je).delete("shortcuts", e);
  },
  mr = ({
    changingStatus: e,
    handleSaveShortcut: t,
    onUpdate: r,
    id: n,
    mode: o,
    onDelete: s,
  }) => {
    const a = (u) => {
      u.preventDefault();
      const c = u.target;
      if (!(c instanceof HTMLFormElement))
        return console.error("Expected form element."), null;
      const d = new FormData(c),
        m = d.get("name"),
        f = d.get("url");
      if (!m || !f) return alert("Please enter both Name and URL."), null;
      let v;
      try {
        v = new URL(f).hostname;
      } catch (I) {
        return alert("Invalid URL"), console.log(I), null;
      }
      return c.reset(), { name: m, url: f, domain: v };
    };
    return l(bo, {
      children: l("div", {
        className: "brutal-subscribe",
        children: y("div", {
          className: "brutal-subscribe__container",
          children: [
            y("div", {
              className: "brutal-subscribe__header",
              children: [
                l("span", {
                  className: "brutal-subscribe__title",
                  children: "Add Shortcut",
                }),
                l("span", {
                  className: "brutal-subscribe__subtitle",
                  children: "testing..",
                }),
              ],
            }),
            y("form", {
              className: "brutal-subscribe__form",
              onSubmit: o
                ? (u) => {
                    const c = a(u);
                    if (!c) return;
                    const d = {
                      id: Date.now(),
                      label: c.name,
                      icon: `https://www.google.com/s2/favicons?domain=${c.domain}&sz=128`,
                      target: c.url,
                    };
                    fo(d), t && t();
                  }
                : (u) => {
                    const c = a(u);
                    if (!c) return;
                    const d = {
                      label: c.name,
                      icon: `https://www.google.com/s2/favicons?domain=${c.domain}&sz=128`,
                      target: c.url,
                    };
                    mo(n, d),
                      r({ ...d, id: n }),
                      console.log("Shortcut updated!");
                  },
              children: [
                l("input", {
                  type: "text",
                  className: "brutal-subscribe__input",
                  placeholder: "Name",
                  name: "name",
                  required: !0,
                }),
                l("input", {
                  type: "text",
                  className: "brutal-subscribe__input",
                  placeholder: "Url",
                  name: "url",
                  required: !0,
                }),
                y("div", {
                  className: "button-container",
                  style: { display: "flex", gap: "10px" },
                  children: [
                    l("button", {
                      type: "submit",
                      className: "brutal-subscribe__button",
                      children: o ? "Add" : "Edit",
                    }),
                    l("button", {
                      type: "button",
                      className: "brutal-subscribe__button",
                      onClick: o
                        ? e
                        : (u) => {
                            u.stopPropagation(), s && s(n);
                          },
                      children: o ? "Done!" : "Delete",
                    }),
                  ],
                }),
              ],
            }),
            l("div", {
              className: "brutal-subscribe__decor",
              children: l("a", {
                href: "https://www.facebook.com/reel/1988186228370734",
                children: "support",
              }),
            }),
          ],
        }),
      }),
    });
  },
  bo = pt.div`
  .brutal-subscribe__container {
    width: 100%;
    max-width: 500px;
    background-color: #fff;
    border: 5px solid #000;
    position: relative;
    overflow: hidden;
    box-shadow: 15px 15px 0 rgba(0, 0, 0, 0.605);
    transition:
      transform 0.3s,
      box-shadow 0.3s;
  }

  .brutal-subscribe__container:hover {
    transform: translate(-5px, -5px);
    box-shadow: 20px 20px 0 rgba(0, 0, 0, 0.2);
  }

  .brutal-subscribe__header {
    background-color: #000;
    color: #fff;
    padding: 20px;
    position: relative;
    overflow: hidden;
  }

  .brutal-subscribe__header::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: repeating-linear-gradient(
      45deg,
      #ff0 0,
      #ff0 10px,
      #000 10px,
      #000 20px
    );
    opacity: 0.1;
    animation: stripe-animation 20s linear infinite;
  }

  @keyframes stripe-animation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .brutal-subscribe__title {
    display: block;
    font-size: 36px;
    font-weight: bold;
    position: relative;
    z-index: 1;
    text-shadow: 3px 3px 0 rgb(140, 140, 19);
  }

  .brutal-subscribe__subtitle {
    display: block;
    font-size: 14px;
    position: relative;
    z-index: 1;
  }

  .brutal-subscribe__form {
    padding: 20px;
  }

  .brutal-subscribe__input {
    width: calc(100% - 26px);
    padding: 10px;
    border: 3px solid #000;
    font-family: inherit;
    font-size: 16px;
    margin-bottom: 10px;
    transition:
      transform 0.3s,
      background-color 0.3s;
  }

  .brutal-subscribe__input:focus {
    outline: none;
    background-color: #ff0;
    transform: scale(1.05);
  }

  .brutal-subscribe__button {
    width: 60%;
    padding: 10px;
    background-color: #000;
    color: #fff;
    border: 3px solid #000;
    font-family: inherit;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
  }

  .brutal-subscribe__button::after {
    content: "→";
    position: absolute;
    top: 50%;
    right: -30px;
    transform: translateY(-50%);
    transition: right 0.3s;
  }

  .brutal-subscribe__button:hover {
    background-color: #ff0;
    color: #000;
  }

  .brutal-subscribe__button:hover::after {
    right: 10px;
  }

  .brutal-subscribe__button:active {
    transform: scale(0.95);
  }

  .brutal-subscribe__decor {
    position: absolute;
    bottom: 80%;
    right: -10px;
    background-color: #ff0;
    color: #000;
    padding: 5px 10px;
    transform: rotate(-5deg);
    font-weight: bold;
    font-size: 24px;
    border: 3px solid #000;
    transition: transform 0.3s;
  }

  .brutal-subscribe__container:hover .brutal-subscribe__decor {
    transform: rotate(3deg) scale(1);
  }

  @media (max-width: 500px) {
    .brutal-subscribe__container {
      width: 90%;
    }
  }

  @keyframes glitch {
    0% {
      transform: translate(0);
    }
    20% {
      transform: translate(-2px, 2px);
    }
    40% {
      transform: translate(-2px, -2px);
    }
    60% {
      transform: translate(2px, 2px);
    }
    80% {
      transform: translate(2px, -2px);
    }
    100% {
      transform: translate(0);
    }
  }

  .brutal-subscribe__container:hover .brutal-subscribe__title {
    animation: glitch 0.3s infinite;
  }
`,
  gr = ({ icon: e, id: t, label: r, target: n, onDelete: o, onUpdate: s }) => {
    const [a, p] = x.useState(!0),
      [i, h] = x.useState(!0),
      u = () => {
        p((c) => !c);
      };
    return y("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        width: "80px",
        height: "80px",
        margin: "10px",
        textAlign: "center",
        borderRadius: "14px",
      },
      onMouseEnter: () => h(!1),
      onMouseLeave: () => h(!0),
      children: [
        l("button", {
          className: "delte-edit-tab",
          style: {
            position: "absolute",
            width: "25px",
            height: "25px",
            borderRadius: "50%",
            marginLeft: "70px",
            alignItems: "center",
            textAlign: "center",
            opacity: "30%",
            border: "0px",
            display: i ? "none" : "block",
          },
          onClick: u,
          children: a ? "✎" : "X",
        }),
        y("a", {
          href: n,
          className: "shortcut-icon",
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
            margin: "10px",
            width: "80px",
            height: "80px",
            textAlign: "center",
            borderRadius: "14px",
          },
          children: [
            l("img", {
              src: e,
              alt: r,
              className: "icon",
              style: {
                fontSize: "1rem",
                marginBottom: "5px",
                width: "40px",
                height: "40px",
              },
            }),
            l("span", { style: { fontSize: "0.8rem" }, children: r }),
          ],
        }),
        a
          ? ""
          : l(mr, {
              mode: !1,
              changingStatus: u,
              onDelete: o,
              id: t,
              onUpdate: s,
            }),
      ],
    });
  };
gr.propTypes = {
  icon: ae.node.isRequired,
  label: ae.string.isRequired,
  target: ae.string.isRequired,
  type: ae.oneOf(["website", "file", "folder", "application"]),
  onClick: ae.func,
};
function yo({ targelShortcut: e }) {
  return y("div", {
    className: "shortcut-icon",
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      cursor: "pointer",
      width: "80px",
      margin: "10px",
      textAlign: "center",
    },
    children: [
      l("button", {
        onClick: e,
        className: "shortcut-item add-shortcut-button",
        "aria-label": "Add shortcut",
        style: {
          fontSize: "1rem",
          marginBottom: "5px",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          cursor: "pointer",
        },
        children: "+",
      }),
      l("span", { style: { fontSize: "0.8rem" }, children: "Add shortcut" }),
    ],
  });
}
const xo = Ir("/")({ component: wo });
function wo() {
  const [e, t] = x.useState([]),
    [r, n] = x.useState(!1),
    o = () => {
      n((i) => !i);
    };
  x.useEffect(() => {
    (async () => {
      const h = await Bt();
      t(h);
    })();
  }, []);
  const s = async () => {
      await new Promise((h) => setTimeout(h, 5));
      const i = await Bt();
      console.log(i), t(i);
    },
    a = (i) => {
      t((h) => h.filter((u) => u.id != i)),
        go(i),
        console.log("Shortcut deleted!");
    },
    p = (i) => {
      t((h) => h.map((u) => (u.id === i.id ? { ...u, ...i } : u))),
        console.log("updated here");
    };
  return l(_r, {
    children: y("div", {
      className: "routeContainer",
      children: [
        l(Zn, {}),
        y("div", {
          className: "iconsContainer",
          style: { display: "flex", flexWrap: "wrap", padding: "20px" },
          children: [
            e.map((i) =>
              l(
                gr,
                {
                  id: i.id,
                  icon: i.icon,
                  label: i.label,
                  target: i.target,
                  onDelete: a,
                  onUpdate: p,
                  changingStatus: o,
                },
                i.id
              )
            ),
            l(yo, { targelShortcut: o }),
            " ",
            r &&
              l("div", {
                className: "AddShortcut_routeContainer",
                style: {
                  padding: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "50px",
                  marginLeft: "10px",
                },
                children: l(mr, {
                  changingStatus: o,
                  handleSaveShortcut: s,
                  mode: !0,
                }),
              }),
          ],
        }),
        y("div", {
          className: "container",
          children: [
            y("div", {
              className: "weather-widget",
              children: [
                l("div", { className: "card time-card", children: l(Dr, {}) }),
                l(Er, {}),
              ],
            }),
            l(Rr, {}),
          ],
        }),
        l("div", { className: "inputContainer", children: l(Gn, {}) }),
      ],
    }),
  });
}
export { xo as Route };
