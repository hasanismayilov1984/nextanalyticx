const VIEWS = {
  after: {
    metrics: [
      { v: "3.8m", vNum: 3.8, vSuffix: "m", d: "↓ 91%", dc: "delta-good" },
      { v: "−38%", vNum: -38, vSuffix: "%", d: "↓ vs prior", dc: "delta-good" },
      { v: "20+", vNum: 20, vSuffix: "+", d: "0 downtime", dc: "delta-good" },
    ],
    bars: [18, 28, 22, 35, 30, 12, 18, 8, 14, 6],
    barColor: "#1D9E75",
    line: [58, 52, 48, 44, 50, 42, 38, 34, 40, 30, 36, 28, 32, 24, 28, 20, 24, 18, 22, 16],
    lineColor: "#1D9E75",
    progs: [
      { w: 100, l: "20 / 20", lNum: 20, lTotal: 20, lMode: "fraction" },
      { w: 90,  l: "18 / 20", lNum: 18, lTotal: 20, lMode: "fraction" },
      { w: 38,  l: "38%",     lNum: 38, lTotal: null, lMode: "percent" },
    ],
  },
  before: {
    metrics: [
      { v: "45m",  vNum: 45,  vSuffix: "m",  d: "avg refresh",   dc: "delta-bad" },
      { v: "+$0",  vNum: 0,   vSuffix: "",   d: "baseline cost",  dc: "delta-bad" },
      { v: "20+",  vNum: 20,  vSuffix: "+",  d: "SQL Server",     dc: "delta-bad" },
    ],
    bars: [82, 90, 78, 95, 88, 72, 85, 92, 80, 88],
    barColor: "#E24B4A",
    line: [8, 12, 10, 16, 14, 20, 18, 24, 22, 28, 26, 30, 28, 34, 32, 38, 36, 42, 40, 46],
    lineColor: "#E24B4A",
    progs: [
      { w: 100, l: "20 / 20", lNum: 20, lTotal: 20,   lMode: "fraction" },
      { w: 100, l: "20 / 20", lNum: 20, lTotal: 20,   lMode: "fraction" },
      { w: 100, l: "100%",    lNum: 100, lTotal: null, lMode: "percent"  },
    ],
  },
};

const DURATION2 = 3000;
let currentView = "after";
let isAnimating = false;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function switchView(view, btn) {
  document.querySelectorAll(".db-tab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
  currentView = view;
  runAnimation(view);
}

function runAnimation(view) {
  if (isAnimating) return;
  isAnimating = true;

  const data = VIEWS[view];

  // ---- RESET bars ----
  const barsArea = document.getElementById("bars-area");
  barsArea.innerHTML = "";
  const barEls = data.bars.map((h, i) => {
    const b = document.createElement("div");
    b.className = "bar-col";
    b.style.height = h + "%";
    b.style.background = data.barColor;
    b.style.transform = "scaleY(0)";
    b.style.transition = "none";
    barsArea.appendChild(b);
    return b;
  });

  // ---- RESET line ----
  const lp = document.getElementById("line-path");
  const la = document.getElementById("line-area");

  const pts = data.line;
  const W = 120, H = 64, pad = 4;
  const minY = Math.min(...pts), maxY = Math.max(...pts);
  const scaleX = i => (i / (pts.length - 1)) * (W - pad * 2) + pad;
  const scaleY = v => H - pad - ((v - minY) / (maxY - minY || 1)) * (H - pad * 2);
  const d = pts.map((v, i) => (i === 0 ? "M" : "L") + scaleX(i).toFixed(1) + "," + scaleY(v).toFixed(1)).join(" ");
  const areaD = d + ` L${scaleX(pts.length - 1)},${H} L${scaleX(0)},${H} Z`;

  lp.setAttribute("d", d);
  lp.setAttribute("stroke", data.lineColor);
  la.setAttribute("d", areaD);
  la.style.transition = "none";
  la.style.opacity = "0";

  const pathLength = lp.getTotalLength();
  lp.style.strokeDasharray = pathLength;
  lp.style.strokeDashoffset = pathLength;
  lp.style.transition = "none";

  // ---- RESET metrics ----
  const metricIds = ["m-refresh", "m-cost", "m-models"];
  const deltaIds  = ["m-refresh-d", "m-cost-d", "m-models-d"];
  metricIds.forEach((id, i) => {
    document.getElementById(deltaIds[i]).textContent = data.metrics[i].d;
    document.getElementById(deltaIds[i]).className = "metric-delta " + data.metrics[i].dc;
  });

  // ---- RESET progress ----
  const fillIds = ["p1-fill", "p2-fill", "p3-fill"];
  const labelIds = ["p1-val", "p2-val", "p3-val"];
  fillIds.forEach(id => {
    const el = document.getElementById(id);
    el.style.transition = "none";
    el.style.width = "0";
  });

  // ---- RUN rAF loop ----
  const start = performance.now();

  function frame(now) {
    const t = Math.min((now - start) / DURATION2, 1);
    const e = easeOutCubic(t);

    // Bars
    barEls.forEach(b => {
      b.style.transform = `scaleY(${e})`;
    });

    // Line
    lp.style.strokeDashoffset = pathLength * (1 - e);
    la.style.opacity = e;

    // Metrics (animated numbers)
    metricIds.forEach((id, i) => {
      const m = data.metrics[i];
      const raw = m.vNum * e;
      let display;
      if (m.vSuffix === "m") {
        display = raw.toFixed(1) + "m";
      } else if (m.vSuffix === "%") {
        display = (raw < 0 ? "−" : "+") + Math.abs(raw).toFixed(0) + "%";
      } else if (m.vSuffix === "+") {
        display = Math.floor(raw) + "+";
      } else if (m.vSuffix === "") {
        display = "+$" + Math.floor(raw);
      } else {
        display = raw.toFixed(1) + m.vSuffix;
      }
      document.getElementById(id).textContent = display;
    });

    // Progress bars + labels
    fillIds.forEach((id, i) => {
      const p = data.progs[i];
      const el = document.getElementById(id);
      el.style.width = (p.w * e) + "%";

      const lel = document.getElementById(labelIds[i]);
      if (p.lMode === "fraction") {
        lel.textContent = Math.floor(p.lNum * e) + " / " + p.lTotal;
      } else {
        lel.textContent = Math.floor(p.lNum * e) + "%";
      }
    });

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      // Snap to final values
      metricIds.forEach((id, i) => {
        document.getElementById(id).textContent = data.metrics[i].v;
      });
      fillIds.forEach((id, i) => {
        document.getElementById(fillIds[i]).style.width = data.progs[i].w + "%";
        document.getElementById(labelIds[i]).textContent = data.progs[i].l;
      });
      isAnimating = false;
    }
  }

  requestAnimationFrame(frame);
}

// ---- Intersection Observer (once per entry) ----
const dash2 = document.getElementById("case-dashboard-mount");
let hasEntered = false;

const observer2 = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !hasEntered) {
      hasEntered = true;
      runAnimation(currentView);
    } else if (!entry.isIntersecting) {
      hasEntered = false; // reset so next scroll-in triggers again
    }
  });
}, { threshold: 0.5 });

observer2.observe(dash2);