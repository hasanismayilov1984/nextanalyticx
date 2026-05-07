const TARGET_DONUT = 128;
const CIRCUM = 188.5;
const TARGET_PCT = 68;
const DURATION = 3000;

// ===== FORMATTERS =====
const formatRevenue = (v) => "$" + (v / 1000000).toFixed(1) + "M";
const formatRefresh = (v) => (v / 1000000).toFixed(1) + "m";
const formatActive = (v) => Math.floor(v);

function formatDelta(v, isUp) {
   const arrow = isUp ? "↑" : "↓";
   return arrow + " " + v.toFixed(1) + "%";
}

// ===== MAIN TIMELINE =====
function runCycle() {
   const bars = document.querySelectorAll(".bar");
   const arc = document.getElementById("donutArc");
   const pctEl = document.getElementById("donutPct");
   const path = document.getElementById("linePath");
   const area = document.getElementById("lineArea");

   const kv1 = document.getElementById("kv1");
   const kv2 = document.getElementById("kv2");
   const kv3 = document.getElementById("kv3");

   const kd1 = document.getElementById("kd1");
   const kd2 = document.getElementById("kd2");
   const kd3 = document.getElementById("kd3");

   // ===== GET REAL PATH LENGTH =====
   const pathLength = path.getTotalLength();

   // ===== RESET =====
   bars.forEach((b) => {
      b.style.transform = "scaleY(0)";
      b.style.transition = "none";
   });

   arc.setAttribute("stroke-dasharray", "0 " + CIRCUM);
   pctEl.textContent = "0%";

   path.style.strokeDasharray = pathLength;
   path.style.strokeDashoffset = pathLength;
   path.style.transition = "none";

   area.style.opacity = "0";
   area.style.transition = "none";

   // ===== TARGET VALUES =====
   const targets = {
      revenue: 2600000,
      refresh: 3100000,
      active: 903,
      pct: TARGET_PCT,
      donut: TARGET_DONUT,
      d1: 21.0,
      d2: 96.0,
      d3: 15.2,
   };

   const start = performance.now();

   function frame(now) {
      const t = Math.min((now - start) / DURATION, 1);

      // easeOutCubic
      const e = t;

      // ===== BARS =====
      bars.forEach((b) => {
         b.style.transform = `scaleY(${e})`;
      });

      // ===== DONUT =====
      const dVal = targets.donut * e;
      arc.setAttribute("stroke-dasharray", dVal + " " + (CIRCUM - dVal));
      pctEl.textContent = Math.round(targets.pct * e) + "%";

      // ===== LINE =====
      path.style.strokeDashoffset = pathLength * (1 - e);
      area.style.opacity = e;

      // ===== KPI VALUES =====
      kv1.textContent = formatRevenue(targets.revenue * e);
      kv2.textContent = formatRefresh(targets.refresh * e);
      kv3.textContent = formatActive(targets.active * e);

      // ===== KPI DELTAS (ANIMATED) =====
      kd1.textContent = formatDelta(targets.d1 * e, true);
      kd2.textContent = formatDelta(targets.d2 * e, false);
      kd3.textContent = formatDelta(targets.d3 * e, true);

      if (t < 1) {
         requestAnimationFrame(frame);
      }
   }

   requestAnimationFrame(frame);
}

// ===== INTERSECTION OBSERVER =====
const dash = document.getElementById("dash");

const observer = new IntersectionObserver(
   (entries) => {
      entries.forEach((entry) => {
         if (entry.isIntersecting) {
            runCycle();
         }
      });
   },
   {
      threshold: 0.5,
   },
);

observer.observe(dash);
