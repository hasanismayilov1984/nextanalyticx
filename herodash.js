const TARGET_DONUT = 128;
const CIRCUM = 188.5;
const TARGET_PCT = 68;

function animateBars(){
  const bars = document.querySelectorAll('.bar');
  bars.forEach((b,i)=>{
    setTimeout(()=>{ b.style.transform='scaleY(1)'; },100+i*80);
  });
}

function animateDonut(fromVal, toVal, fromPct, toPct, dur){
  const arc = document.getElementById('donutArc');
  const pctEl = document.getElementById('donutPct');
  const start = performance.now();
  function step(now){
    const p = Math.min((now-start)/dur,1);
    const e = 1-Math.pow(1-p,3);
    const v = fromVal + (toVal-fromVal)*e;
    const pv = Math.round(fromPct + (toPct-fromPct)*e);
    arc.setAttribute('stroke-dasharray', v+' '+(CIRCUM-v));
    pctEl.textContent = pv+'%';
    if(p<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function animateLine(){
  const path = document.getElementById('linePath');
  const area = document.getElementById('lineArea');
  path.style.transition = 'stroke-dashoffset 1.8s ease-out 0.3s';
  path.style.strokeDashoffset = '0';
  setTimeout(()=>{
    area.style.transition = 'opacity 0.8s ease-out';
    area.style.opacity = '1';
  }, 1800);
}

function runCycle(){
  const bars = document.querySelectorAll('.bar');

  bars.forEach(b=>{ b.style.transition='none'; b.style.transform='scaleY(0)'; });

  const arc = document.getElementById('donutArc');
  const path = document.getElementById('linePath');
  const area = document.getElementById('lineArea');

  arc.setAttribute('stroke-dasharray','0 '+CIRCUM);
  document.getElementById('donutPct').textContent='0%';
  path.style.transition='none'; path.style.strokeDashoffset='1000';
  area.style.transition='none'; area.style.opacity='0';

  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      animateBars();
      setTimeout(()=>animateDonut(0,TARGET_DONUT,0,TARGET_PCT,1400),300);
      animateLine();
    });
  });
}

runCycle();
setInterval(runCycle, 3500);

// KPI counter loop
const kpiData = [
  {el:'kv1', values:['$1.9M','$2.1M','$2.4M','$2.6M'], delta:['↑ 12.1%','↑ 14.3%','↑ 18.2%','↑ 21.0%'], deltaEl:'kd1'},
  {el:'kv2', values:['4.2m','3.8m','3.5m','3.1m'],    delta:['↓ 88%','↓ 91%','↓ 93%','↓ 96%'],       deltaEl:'kd2'},
  {el:'kv3', values:['712','791','847','903'],          delta:['↑ 8.1%','↑ 10.5%','↑ 12.4%','↑ 15.2%'], deltaEl:'kd3'},
];
let kpiIdx = 0;
setInterval(()=>{
  kpiIdx = (kpiIdx+1) % 4;
  kpiData.forEach(k=>{
    const el = document.getElementById(k.el);
    const de = document.getElementById(k.deltaEl);
    el.style.animation='none';
    void el.offsetWidth;
    el.style.animation='kpiCount 0.4s ease-out';
    el.textContent = k.values[kpiIdx];
    de.textContent = k.delta[kpiIdx];
  });
}, 5000);