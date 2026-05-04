const VIEWS = {
   after: {
      metrics: [
         { v: "3.8m", d: "↓ 91%", dc: "delta-good" },
         { v: "−38%", d: "↓ vs prior", dc: "delta-good" },
         { v: "20+", d: "0 downtime", dc: "delta-good" },
      ],
      bars: [18, 28, 22, 35, 30, 12, 18, 8, 14, 6],
      barColor: "#1D9E75",
      line: [58, 52, 48, 44, 50, 42, 38, 34, 40, 30, 36, 28, 32, 24, 28, 20, 24, 18, 22, 16],
      lineColor: "#1D9E75",
      progs: [
         { w: 100, l: "20 / 20" },
         { w: 90, l: "18 / 20" },
         { w: 38, l: "38%" },
      ],
   },
   before: {
      metrics: [
         { v: "45m", d: "avg refresh", dc: "delta-bad" },
         { v: "+$0", d: "baseline cost", dc: "delta-bad" },
         { v: "20+", d: "SQL Server", dc: "delta-bad" },
      ],
      bars: [82, 90, 78, 95, 88, 72, 85, 92, 80, 88],
      barColor: "#E24B4A",
      line: [8, 12, 10, 16, 14, 20, 18, 24, 22, 28, 26, 30, 28, 34, 32, 38, 36, 42, 40, 46],
      lineColor: "#E24B4A",
      progs: [
         { w: 100, l: "20 / 20" },
         { w: 100, l: "20 / 20" },
         { w: 100, l: "100% cost" },
      ],
   },
};

let currentView = "after";
let animFrame;

function switchView(view, btn) {
   document.querySelectorAll(".db-tab").forEach((t) => t.classList.remove("active"));
   btn.classList.add("active");
   currentView = view;
   runAnimation(view);
}

function buildBars(data) {
   const area = document.getElementById("bars-area");
   area.innerHTML = "";
   data.bars.forEach((h, i) => {
      const b = document.createElement("div");
      b.className = "bar-col";
      b.style.height = h + "%";
      b.style.background = data.barColor;
      area.appendChild(b);
      setTimeout(
         () => {
            b.style.transform = "scaleY(1)";
         },
         80 + i * 60,
      );
   });
}

function buildLine(data) {
   const pts = data.line;
   const W = 120,
      H = 64,
      pad = 4;
   const minY = Math.min(...pts),
      maxY = Math.max(...pts);
   const scaleX = (i) => (i / (pts.length - 1)) * (W - pad * 2) + pad;
   const scaleY = (v) => H - pad - ((v - minY) / (maxY - minY || 1)) * (H - pad * 2);
   let d = pts.map((v, i) => (i === 0 ? "M" : "L") + scaleX(i).toFixed(1) + "," + scaleY(v).toFixed(1)).join(" ");
   const areaD = d + ` L${scaleX(pts.length - 1)},${H} L${scaleX(0)},${H} Z`;

   const lp = document.getElementById("line-path");
   const la = document.getElementById("line-area");

   lp.setAttribute("d", d);
   lp.setAttribute("stroke", data.lineColor);
   lp.style.strokeDashoffset = "400";
   lp.style.transition = "none";

   la.setAttribute("d", areaD);
   la.style.opacity = "0";
   la.style.transition = "none";

   requestAnimationFrame(() => {
      requestAnimationFrame(() => {
         lp.style.transition = "stroke-dashoffset 1.4s ease-out";
         lp.style.strokeDashoffset = "0";
         setTimeout(() => {
            la.style.transition = "opacity 0.6s ease-out";
            la.style.opacity = "1";
         }, 1000);
      });
   });
}

function animateMetrics(data) {
   const ids = ["m-refresh", "m-cost", "m-models"];
   const dids = ["m-refresh-d", "m-cost-d", "m-models-d"];
   ids.forEach((id, i) => {
      const el = document.getElementById(id);
      const del = document.getElementById(dids[i]);
      el.style.opacity = "0";
      setTimeout(
         () => {
            el.textContent = data.metrics[i].v;
            del.textContent = data.metrics[i].d;
            del.className = "metric-delta " + data.metrics[i].dc;
            el.style.transition = "opacity 0.35s ease-out,transform 0.35s ease-out";
            el.style.opacity = "1";
         },
         i * 80 + 100,
      );
   });
}

function animateProgress(data) {
   const fills = ["p1-fill", "p2-fill", "p3-fill"];
   const labels = ["p1-val", "p2-val", "p3-val"];
   fills.forEach((id, i) => {
      const el = document.getElementById(id);
      const lel = document.getElementById(labels[i]);
      el.style.width = "0";
      lel.textContent = data.progs[i].l;
      setTimeout(
         () => {
            el.style.width = data.progs[i].w + "%";
         },
         200 + i * 120,
      );
   });
}

function runAnimation(view) {
   const data = VIEWS[view];
   buildBars(data);
   buildLine(data);
   animateMetrics(data);
   animateProgress(data);
}

runAnimation("after");
setInterval(() => {
   runAnimation(currentView);
}, 5000);
