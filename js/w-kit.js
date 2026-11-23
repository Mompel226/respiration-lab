/* ============================================================
   w-kit.js — what this lab's step animations share (the Circulation Lab's w-defence.js helpers, 3 Nov 2026).

   frameOf   fits a model window into the svg with a margin each side for the names, at a readable size
   fitType   the font and the margins, so names stay about 13 px on any screen
   timeline  each step lasts its motion (1.6 times faster than written), then the reading of its new names: the step
             bar's bands are those times; a single step stops at its motion's end, Play all runs straight through
   drawLabels  the names in both margins on ruled level lines (CircLearn.labels), each ending ON its part
   shell / mount  the widget's head, step bar, drawing and step list; on a wide screen the drawing stands in the
             picture's column and the steps stay beside it (memory animations-beside-their-buttons)
   Every frame is a pure function of the time t, and box.__seek(t) draws any moment (memory headless-raf-animations).
   ============================================================ */
(function (global) {
  'use strict';
  var L = global.CircLearn;
  if (!L || !L.stepper || !L.labels) return;
  var h = L.h;
  var NS = 'http://www.w3.org/2000/svg';
  function n1(v) { return Math.round(v * 10) / 10; }
  function seg(t, a, b) { return t <= a ? 0 : t >= b ? 1 : (t - a) / (b - a); }
  function ease(k) { return k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  function clamp01(k) { return k < 0 ? 0 : k > 1 ? 1 : k; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function len(x, y) { return Math.sqrt(x * x + y * y); }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
  function fitType(D, bw, cL, cR, mL0, mR0, px) {
    var f = px * (bw + mL0 + mR0) / D, mL = mL0, mR = mR0;
    for (var i = 0; i < 10; i++) { mL = Math.max(mL0, cL * .55 * f + 20); mR = Math.max(mR0, cR * .55 * f + 20); f = px * (bw + mL + mR) / D; }
    return { f: f, mL: mL, mR: mR };
  }

  /* The time of each step. Each animation is written in its own time (the model's, M); a step's motion runs PACE times
     faster than written (Daniel, 4 Nov 2026: "very slow"; P: one pace, or one for each step). MOTION[title] (written by
     tools/flow-still.mjs --write, which checks it) is how long each step really moves, in the model's seconds; without it
     the whole step moves. R[i] is when step i starts on the reader's clock, and each step lasts exactly what Play all
     gives it: its motion, then the reading of the names new at its end (namesWait). So each band of the step bar is as
     wide as the time spent on its step (Daniel, 8 Nov 2026: "make sure that the size of the band indicates the time that
     it's there"; before, a step's band also held a reading time for its caption that nothing played, and step 9 of the
     protein looked three times longer than it was). A single step (Play, Next step) stops at the end of its motion, its
     band full, and waits there for the reader, as long as they like (memory animations-wait-for-the-reader; 8 Nov 2026:
     "It should be completely to the end … and then I press next step"); Play all goes straight on, through the names'
     reading time (Daniel, 7 Nov 2026: "consider how many labels you're putting … rather than the person having to pause").
     namesAt(m): the names drawn at model time m (none: a short beat of .35 s, so the eye sees the step change). */
  var PACE = 1.6;
  function paceOf(P, i) { return P == null ? PACE : typeof P === 'number' ? P : (P[i] || PACE); }
  function timeline(M, P, MOTION, title, namesAt) {
    var n = M.length - 1, ME = MOTION && title ? MOTION[title] : null, R = [0], mrun = [], run = [], wait = [], was = [], seen = [];
    /* where step i holds, in the model: the end of its motion (just before the next step's start, which is the next
       step's first frame) */
    function stopAt(i) { return M[i] + mrun[i] - (i + 1 < n && mrun[i] >= M[i + 1] - M[i] - 1e-9 ? .001 : 0); }
    for (var i = 0; i < n; i++) {
      var d = M[i + 1] - M[i];
      mrun.push(ME && ME[i] != null ? Math.min(d, ME[i] + .15) : d); run.push(mrun[i] / paceOf(P, i));
      var now = namesAt ? namesAt(stopAt(i)).map(function (x) { return String(x).replace(/\s+/g, ' ').trim(); }).filter(Boolean) : [];
      wait.push(namesAt ? namesWait(now, was) + .1 : .35); seen.push(now); was = now;
      R.push(R[i] + run[i] + wait[i]);
    }
    /* Play all's clock: straight through (the reading of the names is part of each step) */
    function flow(t) { return t; }
    /* tools/flow-still.mjs sets flow.model to draw one moment of the model (its --write measures each step whole) */
    flow.model = null;
    function clock(t) {
      if (flow.model != null) return flow.model;
      /* the step the stepper says it is (it counts a step as started 1e-6 s early, CircLearn.stepper stepAt) */
      for (var i = 0; i < n; i++) if (t < R[i + 1] - 1e-6 || i + 1 === n) {
        var k = run[i] > 0 ? (t - R[i]) / run[i] : 1;
        /* at the stop itself (k is 1 less a rounding error there) the held frame, so the stop and the hold are one frame */
        return k >= 1 - 1e-9 ? stopAt(i) : M[i] + Math.max(0, k) * mrun[i];
      }
      return M[n];
    }
    /* the reading time Play all gives step i's names; where a single step stops (its motion's end) */
    flow.hold = function (i) { return wait[i]; };
    flow.endOf = function (i) { return R[i] + run[i]; };
    flow.stopAt = stopAt;
    /* the names each step ends with, as the wait counted them (tools/flow-names.mjs compares them with the drawn ones) */
    flow.names = seen;
    flow.R = R; flow.M = M; flow.pace = function (i) { return paceOf(P, i); }; flow.title = title || null;
    return { R: R, clock: clock, flow: flow, end: R[n] };
  }
  /* the time to read the names new in a step: 0.5 s to find the first, 0.3 s more for each other, and 1 s for every 4 of
     their words (Daniel, 7 Nov 2026); .35 s with none */
  function namesWait(texts, before) {
    var fresh = texts.filter(function (x) { return (before || []).indexOf(x) < 0; });
    if (!fresh.length) return .35;
    return .5 + .3 * (fresh.length - 1) + fresh.reduce(function (a, x) { return a + x.split(' ').length; }, 0) / 4;
  }
  /* Reduce motion (Daniel, 9 Nov 2026: "Nothing should disappear"): a step may give its still's moment in the model's
     time (`still` on the step), a moment at which its parts are all drawn; the stepper wants it on the reader's clock.
     Steps without one show their still where they stop. */
  function stillsOf(steps, TL) {
    return function (i) {
      var m = steps[i] && steps[i].still; if (m == null) return null;
      var a = TL.R[i], b = TL.R[i + 1] - .02;
      for (var k = 0; k < 40; k++) { var c = (a + b) / 2; if (TL.clock(c) < m) a = c; else b = c; }
      return b;
    };
  }
  /* the names drawn at the reader's time t, ready for the labeller: lay().to puts each on the screen; the first name of
     each id only, unless `all` */
  function itemsOf(lay, labelsAt, all) {
    return function (t) {
      var seen = {};
      return labelsAt(t).filter(function (q) { if (all) return true; if (seen[q.id]) return false; seen[q.id] = 1; return true; }).map(function (q) {
        var p = lay().to(q.x, q.y), o = { id: q.id, text: q.text, x: p[0], y: p[1], side: q.side, pri: q.pri };
        if (q.alts) o.alts = q.alts.map(function (a) { return lay().to(a[0], a[1]); });
        if (q.was) o.was = q.was;
        return o;
      });
    };
  }
  function readerSteps(steps, R) { return steps.map(function (s, i) { var o = {}; for (var k in s) o[k] = s[k]; o.t = R[i]; return o; }); }

  /* px: the size the names are drawn at on screen (13 by default; this lab's animations ask for 14.5) */
  function frameOf(svg, bg, model, clipRect, win, tall, D, cL, cR, mL0, mR0, px) {
    var bw = tall ? win.y1 - win.y0 : win.x1 - win.x0, bh = tall ? win.x1 - win.x0 : win.y1 - win.y0;
    var ft = fitType(D, bw, cL, cR, mL0, mR0, px || 13), padT = 12, padB = 12;
    var vb = { x: -ft.mL, y: -padT, w: bw + ft.mL + ft.mR, h: bh + padT + padB, bw: bw, bh: bh };
    svg.setAttribute('viewBox', n1(vb.x) + ' ' + n1(vb.y) + ' ' + n1(vb.w) + ' ' + n1(vb.h));
    bg.setAttribute('x', n1(vb.x)); bg.setAttribute('y', n1(vb.y)); bg.setAttribute('width', n1(vb.w)); bg.setAttribute('height', n1(vb.h)); bg.setAttribute('rx', 18);
    clipRect.setAttribute('x', win.x0); clipRect.setAttribute('y', win.y0); clipRect.setAttribute('width', win.x1 - win.x0); clipRect.setAttribute('height', win.y1 - win.y0);
    model.setAttribute('transform', tall ? 'matrix(0 1 1 0 ' + (-win.y0) + ' ' + (-win.x0) + ')' : 'translate(' + (-win.x0) + ' ' + (-win.y0) + ')');
    return { tall: tall, win: win, f: ft.f, mL: ft.mL, mR: ft.mR, vb: vb,
             to: function (x, y) { return tall ? [y - win.y0, x - win.x0] : [x - win.x0, y - win.y0]; } };
  }
  function drawLabels(lay, items, tiny, gap) {
    var vb = lay.vb, o = { left: -8, right: vb.bw + 8, font: lay.f, top: vb.y + 6, bottom: vb.y + vb.h - 6, gap: gap == null ? 5 : gap };
    var out = L.labels(Object.assign({}, o, { items: items.filter(function (q) { return q.side === 'L'; }), width: lay.mL - 26 })) +
              L.labels(Object.assign({}, o, { items: items.filter(function (q) { return q.side === 'R'; }), width: lay.mR - 26 }));
    /* a part smaller than the usual dot (a platelet, a molecule) gets a smaller dot, so it still shows round it */
    if (tiny) out = out.split('<g class="lb').map(function (chunk) {
      var m = chunk.match(/data-lab="([^"]*)"/);
      return m && tiny[m[1]] ? chunk.replace(/(<circle class="lb__dot"[^>]*? r=")[\d.]+"/, '$1' + tiny[m[1]] + '"') : chunk;
    }).join('<g class="lb');
    return out;
  }
  /* On a phone (a widget under 440 px wide) a column of words beside the drawing would leave the drawing a few pixels
     wide: each name becomes a numbered pin on the same ruled level line, and the numbered words stand in a key under the
     drawing (the Plants and Circulation Labs' rule for animations on a phone, CircLearn.pinLabels). */
  function pinKey(S) { var ol = h('ol', 'pinkey'); ol.hidden = true; S.fig.appendChild(ol); return ol; }
  function names(lay, items, narrow, key, tiny, gap) {
    if (!narrow) { if (key) key.hidden = true; return drawLabels(lay, items, tiny, gap); }
    var vb = lay.vb, P = L.pinLabels({ items: items, left: -4, right: vb.bw + 4, font: lay.f, top: vb.y + 6, bottom: vb.y + vb.h - 6, gap: 4 });
    if (key) { key.hidden = !P.order.length; key.innerHTML = P.order.map(function (o) { return '<li><b>' + o.n + '</b> ' + L.esc(o.text) + '</li>'; }).join(''); }
    return P.svg;
  }
  /* the margins a frame needs: words beside the drawing, or on a phone only a column of pins. A pin stands 1.44 fonts
     and 12 units out from the drawing's edge (pinLabels), so its margin is counted as 2.7 characters of the font
     (fitType gives 2.7 × .55 × f + 20), never a fixed width that a large font would overrun */
  function margins(narrow, cL, cR, mL0, mR0) { return narrow ? [2.7, 2.7, 24, 24] : [cL, cR, mL0, mR0]; }
  /* the shared shell of a step widget: head, step bar, read-outs, the figure, the step list */
  function shell(spec, cls, title, aria, pills) {
    var box = h('div', 'widget ' + cls);
    box.appendChild(L.head(spec.title || title, spec.ask, 'Press play'));
    var read = h('div', cls + '__read', pills.map(function (p) { return '<span class="' + cls + '__pill" data-k="' + p[0] + '"><b>' + p[1] + '</b> ' + (p[2] ? swatch(p[2]) + ' ' : '') + '<i></i>' + (p[3] ? '<span class="memv__vh"> ' + p[3] + '</span>' : '') + '</span>'; }).join(''));
    var fig = h('figure', cls + '__fig');
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', cls + '__svg'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', aria);
    fig.appendChild(svg);
    return { box: box, read: read, fig: fig, svg: svg, spec: spec, title: spec.title || title,
             pill: function (k, text, tone) { var p = read.querySelector('[data-k="' + k + '"]'), i = p.querySelector('i'); if (i.textContent !== text) i.textContent = text; p.className = cls + '__pill is-' + tone; } };
  }
  /* the key of an animation is DRAWN: a small sample of each part, in its picture's own classes, beside its name (Daniel,
     5 Nov 2026: "Why don't you show them instead of writing about them?"). A note { key: [[kind, name, steps, letters], …] }
     is one: `steps` the steps (from 0) whose picture shows that part, none for every step; kind 'bases' takes its letters */
  var SW = {
    mum: '<path class="ak__rod ak--mum" d="M5 7H23"/>',
    dad: '<path class="ak__rod ak--dad" d="M5 7H23"/>',
    other: '<path class="ak__rod ak--other" d="M5 7H23"/>',
    mix: '<path class="ak__rod ak--mum" d="M5 7H23"/><path class="ak__rod ak__butt ak--dad" d="M14 7H23"/>',
    gene: '<path class="ak__rod ak--other" d="M5 7H23"/><path class="ak__band" d="M12 7H17"/>',
    dnagene: '<path class="ak__dna" d="M1 4C8 4 8 10 14 10S20 4 27 4M1 10C8 10 8 4 14 4S20 10 27 10"/><path class="ak__band ak__glow" d="M8 7H20"/>',
    dna: '<path class="ak__dna" d="M1 4C8 4 8 10 14 10S20 4 27 4M1 10C8 10 8 4 14 4S20 10 27 10"/>',
    hist: '<path class="ak__dna" d="M0 7H28"/><circle class="zm__hist" cx="8" cy="7" r="4.6"/><circle class="zm__hist" cx="20" cy="7" r="4.6"/>',
    strand: '<path class="ak__line ak--new" d="M3 7H25"/>',
    mrna: '<path class="ak__line ak--mrna" d="M2 9C7 3 11 3 14 7S21 11 26 5"/>',
    enz: '<ellipse class="zm__enz" cx="14" cy="7" rx="10" ry="5.6"/>',
    fibre: '<path class="ak__fib" d="M3 7L25 2M3 7L25 7M3 7L25 12"/>',
    vesicle: '<circle class="vesicle" cx="7" cy="7" r="2.6"/><circle class="vesicle" cx="14" cy="5" r="2.6"/><circle class="vesicle" cx="21" cy="8" r="2.6"/>',
    cent: '<g transform="translate(14 7) scale(.72)"><circle class="cent__pcm" r="9"/><rect class="cent" x="-5.6" y="-4.6" width="9" height="3.6" rx="1"/><rect class="cent" x="2.4" y="-1.6" width="3.6" height="8.4" rx="1"/></g>',
    mito: '<ellipse class="mito" cx="14" cy="7" rx="10" ry="5"/>',
    chiasma: '<path class="ak__rod ak__thin ak--mum" d="M6 2L22 12"/><path class="ak__rod ak__thin ak--dad" d="M6 12L22 2"/><circle class="chiasma" cx="14" cy="7" r="5.6"/>',
    cring: '<g class="cring"><circle cx="8" cy="7" r="3.2"/><circle cx="14" cy="7" r="3.2"/><circle cx="20" cy="7" r="3.2"/></g>',
    rib: '<ellipse class="pt__ls" cx="14" cy="5.4" rx="10" ry="4.4"/><ellipse class="pt__ss" cx="14" cy="10.6" rx="7" ry="3"/>',
    trna: '<path class="pt__trna" d="M8 1.5H20V6H16.5V12.5H11.5V6H8Z"/>',
    aa: '<circle class="aa aa1" cx="6" cy="7" r="4"/><circle class="aa aa2" cx="14" cy="7" r="4"/><circle class="aa aa3" cx="22" cy="7" r="4"/>',
    /* one amino acid, in its colour (the code's key: "GCU = alanine") */
    aa1: '<circle class="aa aa1" cx="14" cy="7" r="4.6"/>', aa2: '<circle class="aa aa2" cx="14" cy="7" r="4.6"/>',
    aa3: '<circle class="aa aa3" cx="14" cy="7" r="4.6"/>', aa4: '<circle class="aa aa4" cx="14" cy="7" r="4.6"/>',
    /* the Membrane Lab's particles, in the colours of js/mem-draw.js, on the dark ground of its pictures */
    water: '<circle fill="rgba(168,244,255,.42)" cx="14" cy="7" r="6.8"/><circle fill="#E6EEF5" cx="10.4" cy="9.4" r="2.5"/><circle fill="#E6EEF5" cx="17.6" cy="9.4" r="2.5"/><circle fill="#FF7468" cx="14" cy="6.4" r="4.1"/>',
    sucrose: '<path fill="rgba(255,201,92,.25)" stroke="#FFC95C" stroke-width="1.5" stroke-linejoin="round" d="M6 3.4l4.2 0 2.1 3.6-2.1 3.6-4.2 0-2.1-3.6zM17.6 3.1l3.9 0 1.8 3.6-2.4 3.3-3.6-.3-1.5-3.3z"/><path stroke="#FFC95C" stroke-width="1.3" d="M12.3 7L14 6.7"/>',
    glucose: '<path fill="rgba(255,201,92,.25)" stroke="#FFC95C" stroke-width="1.5" stroke-linejoin="round" d="M11 2.4l6 0 3 4.6-3 4.6-6 0-3-4.6z"/>',
    scent: '<circle fill="#FF7FBF" cx="14" cy="7" r="4.7"/><circle fill="#FFE3F1" cx="12.5" cy="5.4" r="1.3"/>',
    air: '<circle fill="#8FA4B8" cx="11.8" cy="7" r="3.8"/><circle fill="#A9BACB" cx="16.2" cy="7" r="3.8"/>',
    oxygen: '<circle fill="#FF7468" cx="11.4" cy="7" r="3.7"/><circle fill="#FF8A7F" cx="16.6" cy="7" r="3.7"/><ellipse fill="none" stroke="#FFFFFF" stroke-width=".9" cx="14" cy="7" rx="8.6" ry="5.6"/>',
    urea: '<circle fill="#6FA5FF" cx="9.8" cy="9.2" r="2.9"/><circle fill="#6FA5FF" cx="18.2" cy="9.2" r="2.9"/><circle fill="#FF7468" cx="14" cy="3.8" r="3.1"/><circle fill="#76839C" cx="14" cy="7.6" r="2.8"/>',
    co2: '<ellipse fill="rgba(64,108,255,.5)" cx="14" cy="7" rx="11" ry="6.6"/><circle fill="#FF7468" cx="8.6" cy="7" r="3.6"/><circle fill="#FF7468" cx="19.4" cy="7" r="3.6"/><circle fill="#8D99B1" cx="14" cy="7" r="3.5"/>',
    nitrate: '<circle fill="#FF7468" cx="14" cy="3.3" r="2.9"/><circle fill="#FF7468" cx="9.8" cy="9.8" r="2.9"/><circle fill="#FF7468" cx="18.2" cy="9.8" r="2.9"/><circle fill="#6FA5FF" cx="14" cy="7.3" r="2.6"/>',
    mg: '<circle fill="#7EDB6B" cx="14" cy="7" r="3.6"/>',
    ion: '<circle fill="#7EDB6B" cx="14" cy="7" r="3.6"/>',
    lipid: '<circle fill="#E9B66D" cx="6" cy="7" r="4.2"/><path stroke="#F7E7C4" stroke-width="1.4" fill="none" d="M9.5 5.3C14 4 18 6.6 25 5.4M9.5 8.7C14 10.2 18 7.6 25 9.3"/>',
    carrier: '<path fill="#37D3B0" d="M4 7C4 3.2 9 1.5 14 1.5S24 3.2 24 7c-3.5-.9-6.5-1.1-10-1.1S7.5 6.1 4 7z"/><path fill="#22A98D" d="M4 7c0 3.8 5 5.5 10 5.5S24 10.8 24 7c-3.5.9-6.5 1.1-10 1.1S7.5 7.9 4 7z"/>',
    lactic: '<circle fill="rgba(255,92,150,.42)" cx="14" cy="7" r="6.6"/><circle fill="#76839C" cx="10.6" cy="7.4" r="2.5"/><circle fill="#76839C" cx="14.4" cy="6.2" r="2.5"/><circle fill="#FF7468" cx="18" cy="8" r="2.6"/>',
    ethanol: '<circle fill="rgba(120,226,140,.42)" cx="14" cy="7" r="6.6"/><circle fill="#76839C" cx="10.6" cy="7.4" r="2.5"/><circle fill="#76839C" cx="14.4" cy="6.2" r="2.5"/><circle fill="#FF7468" cx="18.2" cy="7.6" r="2.7"/>',
    spark: '<path fill="#FFE680" d="M14 .5l1.9 4.6 4.6 1.9-4.6 1.9L14 13.5l-1.9-4.6-4.6-1.9 4.6-1.9z"/>',
    working: '<rect fill="#FF9A52" stroke="#FFD2AE" stroke-width=".7" x="4" y="2.5" width="20" height="9" rx="4"/>',
    enzymek: '<path fill="#8DB45A" stroke="#4E6F2C" stroke-width=".8" d="M4 7c0-3.4 3.5-5.5 8-5.5 3.2 0 5.6 1 7 2.7l-3.8 2.6 3.8 2.6c-1.4 1.8-3.8 2.8-7 2.8-4.5 0-8-2-8-5.2z"/>',
    halfm: '<path fill="none" stroke="#FFC95C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M7 10L10 5H17L20 10"/><circle fill="#FF7468" cx="21" cy="10.4" r="2.3"/>',
    rbc: '<ellipse fill="#D8434F" cx="14" cy="7" rx="7" ry="5"/><ellipse fill="#A8293A" cx="14" cy="7" rx="3" ry="2"/>',
    energy: '<circle fill="#FFE680" cx="14" cy="7" r="5"/><circle fill="#FFF7CF" cx="14" cy="7" r="2.3"/>',
    hbond: '<path fill="none" stroke="#D6F0FF" stroke-width="1.7" stroke-dasharray="2.6 2.6" d="M3 7H25"/>',
    /* the arrows: the net movement (one wide arrow), and the crossings each way (two thin ones) */
    press: '<path fill="#B7193F" stroke="#FFFFFF" stroke-width=".7" d="M2 5.7h14V2.3L26 7l-10 4.7V8.3H2z"/>',
    net: '<path fill="#FFF3C4" stroke="#0E1D2E" stroke-width=".8" d="M2 5h15V1.6L26 7l-9 5.4V9H2z"/>',
    ways: '<path fill="#FFFFFF" d="M3 3h17V.8L26 4l-6 3.2V5H3z"/><path fill="#FFFFFF" d="M25 10.4H9v1.8L3 9.5l6-2.7v1.8h16z"/>'
  };
  function swatch(kind) { return '<svg class="anikey__sw" viewBox="0 0 28 14" aria-hidden="true">' + SW[kind] + '</svg>'; }
  function keyOf(items) {
    var ul = h('ul', 'figkey anikey');
    ul.innerHTML = items.map(function (q) {
      var sw = q[0] === 'bases' ? '<span class="ak__bases" aria-hidden="true">' + q[3].split('').map(function (b) { return '<i class="ak__b ak__b--' + b + '">' + b + '</i>'; }).join('') + '</span>'
        : '<svg class="anikey__sw" viewBox="0 0 28 14" aria-hidden="true">' + SW[q[0]] + '</svg>';
      return '<li data-k="' + q[0] + '"' + (q[2] ? ' data-at=",' + q[2].join(',') + ',"' : '') + '>' + sw + L.esc(q[1]) + '</li>';
    }).join('');
    return ul;
  }
  function note(n) { return n.key ? keyOf(n.key) : h('p', 'widget__note' + (n[1] ? ' ' + n[1] : ''), n[0]); }
  function mount(S, sp, cls, notes, setLayout) {
    S.box.appendChild(sp.bar);
    var wrap = h('div', cls + '__wrap');
    /* on a wide screen the drawing stands in the plate's column; its read-outs and the steps stay here
       (Daniel, 26 Sep: "any animations move them to the left and then the text and the buttons on the right") */
    var pack = h('div', cls + '__pack');
    var packT = h('p', 'stg__title', L.esc(S.title)); packT.hidden = true;
    pack.appendChild(packT); pack.appendChild(S.fig);
    var left = h('div', cls + '__left'); left.appendChild(S.read); left.appendChild(pack);
    /* under the drawing, inside its figure (so it goes with it into the picture's column): the key, showing only what
       this step's picture shows, and any short line; nothing under the steps (Daniel, 5 Nov 2026: "put the keys on the
       left and show them when they need to be shown … Otherwise, the students are going to be like, well, what do you
       mean from the mother?") */
    var keys = [], keyK = -2;
    notes.forEach(function (n) { var el = note(n); S.fig.appendChild(el); if (n.key) keys.push(el); });
    function showKey(k) {
      if (k === keyK) return; keyK = k;
      keys.forEach(function (ul) {
        Array.prototype.forEach.call(ul.children, function (li) { var at = li.getAttribute('data-at'); li.hidden = !!at && at.indexOf(',' + k + ',') < 0; });
      });
    }
    /* the key keeps the height of its fullest step, so the words under it never jump when a step changes it */
    function sizeKey() {
      if (!keys.length) return;
      var k0 = keyK, mx = keys.map(function () { return 0; });
      keys.forEach(function (ul) { ul.style.minHeight = ''; });
      for (var k = 0; k < (sp.steps || 1); k++) { showKey(k); keys.forEach(function (ul, j) { mx[j] = Math.max(mx[j], ul.offsetHeight); }); }
      keys.forEach(function (ul, j) { ul.style.minHeight = mx[j] + 'px'; });
      showKey(k0 < 0 ? 0 : k0);
    }
    sp.onStep = showKey;
    S.fig.appendChild(sp.now);
    wrap.appendChild(left);
    if (sp.legend) { var side = h('div', cls + '__side'); side.appendChild(sp.legend); side.appendChild(sp.list); wrap.appendChild(side); }
    else wrap.appendChild(sp.list);
    S.box.appendChild(wrap);
    var lastD = 0, lastN = false;
    function fit() {
      var ww = wrap.getBoundingClientRect().width; if (!ww) return;
      wrap.classList.toggle(cls + '--side', ww >= 980);
      var D = S.fig.getBoundingClientRect().width, narrow = ww < 440;
      if (!D || (Math.abs(D - lastD) < 2 && narrow === lastN)) return;
      lastD = D; lastN = narrow; setLayout(D, narrow); sp.paint(sp.time()); sizeKey();
    }
    setLayout(700, false);
    var ro = global.ResizeObserver ? new ResizeObserver(function () { if (!S.box.isConnected) { ro.disconnect(); return; } fit(); }) : null;
    if (ro) { ro.observe(wrap); ro.observe(S.fig); }
    var stg = L.stage ? L.stage({ box: S.box, spec: S.spec, pack: pack, home: left, watch: function () { return S.box; },
      onPlace: function (inColumn) { packT.hidden = !inColumn; S.box.classList.toggle(cls + '--staged', inColumn); sp.compact(inColumn); lastD = 0; fit(); } }) : null;
    S.box.__onMove = function () { if (stg) stg.mount(); };
    S.box.__onReset = function () { sp.stop(); if (ro) ro.disconnect(); if (stg) stg.detach(); };
    S.box.__seek = function (t) { fit(); return sp.seek(t); };
    /* Play all's own clock, for the tools that time it (tools/flow-names.mjs) */
    S.box.__flow = sp.flow; S.box.__playEnd = sp.end;
    /* in a card, the animation plays all its steps as soon as its card opens (Daniel, 4 Nov 2026: "as soon as you open
       that, the full animation should play … if the user wants to go one by one or stop it, it just has to scroll
       down"); it pauses when the card closes or the widget is hidden (the IGCSE / IB switch), and plays again when
       shown in an open card. Reduced motion shows the last frame (the stepper's rule). */
    var waits = 0, card = null, wasOn = false;
    function shownOpen() { return !!card && card.classList.contains('is-open') && !S.box.hidden; }
    function react() {
      var on = shownOpen();
      if (on && !wasOn) sp.playAll();
      else if (!on && wasOn) { sp.stop(); sp.paint(sp.time()); }
      wasOn = on;
    }
    function watchCard() {
      if (!S.box.isConnected) { if (++waits < 240) requestAnimationFrame(watchCard); return; }
      card = S.box.closest ? S.box.closest('.xcard') : null;
      if (!card || !global.MutationObserver) return;
      var mo = new MutationObserver(function () { if (!S.box.isConnected) { mo.disconnect(); return; } react(); });
      mo.observe(card, { attributes: true, attributeFilter: ['class'] });
      mo.observe(S.box, { attributes: true, attributeFilter: ['hidden'] });
      react();
    }
    requestAnimationFrame(watchCard);
    sp.paint(0);
    return S.box;
  }


  global.WKit = { pinKey: pinKey, names: names, margins: margins, n1: n1, seg: seg, ease: ease, clamp01: clamp01, lerp: lerp, len: len, rng: rng, fitType: fitType,
                  sw: SW, keyOf: keyOf, swatch: swatch, timeline: timeline, readerSteps: readerSteps, stillsOf: stillsOf, itemsOf: itemsOf, namesWait: namesWait, frameOf: frameOf, drawLabels: drawLabels, shell: shell,
                  mount: mount, NS: NS };
})(window);
