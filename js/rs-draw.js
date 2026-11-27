/* ============================================================
   rs-draw.js — one drawing vocabulary for the whole Membrane Lab (memory: "do not confuse students with different
   animations"). Every picture of a molecule, a membrane or a cell in this lab comes from here, on a canvas, so a water
   molecule, a lipid or a plant cell looks the same in every station.

   TRUE SIZES (memory true-relative-sizes). The molecular pictures are drawn in nanometres, `u` model units to the
   nanometre, so all their parts keep their true sizes beside each other:
     water 0.28 nm · oxygen 0.35 · carbon dioxide 0.5 · urea 0.5 · nitrate ion 0.45 · magnesium ion 0.17 (with its water
     shell about 0.8) · glucose 0.9 · sucrose 1.2 × 0.7 · the cell membrane 5 nm thick · a protein carrier 6 nm long.
   The atoms keep the colours of the Y7 cell game (oxygen coral, hydrogen white, carbon slate, nitrogen blue).
   These pictures are a dark "screen" in the bright and the dark version alike, so their colours are the same in both.
   ============================================================ */
(function (global) {
  'use strict';
  var TAU = Math.PI * 2;
  function lerp(a, b, k) { return a + (b - a) * k; }
  function clamp(k) { return k < 0 ? 0 : k > 1 ? 1 : k; }
  function ease(k) { k = clamp(k); return k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  function seg(t, a, b) { return t <= a ? 0 : t >= b ? 1 : (t - a) / (b - a); }
  function mixHex(a, b, k) {
    var p = function (h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; };
    var A = p(a), B = p(b);
    return 'rgb(' + Math.round(lerp(A[0], B[0], k)) + ',' + Math.round(lerp(A[1], B[1], k)) + ',' + Math.round(lerp(A[2], B[2], k)) + ')';
  }

  var C = {
    /* the screens */
    air0: '#0E1D2E', air1: '#142A40', water0: '#134463', water1: '#0D3350', edge: 'rgba(176,212,240,.28)',
    /* one colour for each liquid, in every picture: a dilute solution is blue, a concentrated solution is brown, the cytoplasm of a close-up is dark cream */
    dilute: ['#1B5476', '#123E5A'], conc: ['#6A4E28', '#4B3519'], cytoDark: ['#3C3524', '#2A2519'],
    /* atoms */
    o: ['#FFD9D2', '#FF7468', '#B83A34'], h: ['#FFFFFF', '#E6EEF5', '#94A6B6'], c: ['#C7D0DF', '#76839C', '#3E4A61'],
    n: ['#D7E7FF', '#6FA5FF', '#2D5FB8'], mg: ['#E9FFE2', '#7EDB6B', '#2F8C3A'], scent: ['#FFE3F1', '#FF7FBF', '#B3307E'],
    air: ['#DCE6F0', '#8FA4B8', '#51667A'],
    sugar: '#FFC95C', sugarLo: '#B9831C', sugarHi: '#FFE9B3',
    /* the membrane */
    head: ['#FFE9C4', '#E9B66D', '#A87533'], tail: 'rgba(247,231,196,.62)', core: 'rgba(120,92,54,.28)',
    /* the protein carrier */
    car: ['#BDF7E9', '#37D3B0', '#0D7A65'],
    energy: '#FFE680',
    /* the cell */
    wall0: '#B9D88F', wall1: '#7FA858', wallLo: '#54773A', fibre: 'rgba(240,250,214,.5)',
    cyto0: '#F4EBD3', cyto1: '#E4D5B0', cytoLo: '#A8956D', memb: '#3A5A72',
    sap0: '#F2A6C8', sap1: '#D65E97', sapHi: '#FFD7E8', sapLo: '#963E6B',
    nuc0: '#D6C4EE', nuc1: '#9A7CC7', nucLo: '#5F4689', mito0: '#FFC18A', mito1: '#E08A4A', mitoLo: '#9A5222',
    gap: '#E3F0F7', soil: ['#8A6A4C', '#6E5239', '#4C3827'], glass: 'rgba(214,236,250,.55)'
  };

  /* ---------- a shaded ball: the atoms ---------- */
  function ball(g, x, y, r, c3) {
    var rg = g.createRadialGradient(x - r * .35, y - r * .4, r * .08, x, y, r);
    rg.addColorStop(0, c3[0]); rg.addColorStop(.48, c3[1]); rg.addColorStop(1, c3[2]);
    g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }

  /* each molecule, in nanometres: [colour, x, y, radius], drawn from the back */
  var MOL = {
    water: [['h', .083, .058, .082], ['h', -.083, .058, .082], ['o', 0, -.012, .138]],
    oxygen: [['o', -.062, 0, .138], ['o', .062, 0, .138]],
    co2: [['o', -.118, 0, .132], ['o', .118, 0, .132], ['c', 0, 0, .128]],
    urea: [['h', -.205, .108, .07], ['h', -.13, .205, .07], ['h', .205, .108, .07], ['h', .13, .205, .07], ['n', -.122, .07, .118], ['n', .122, .07, .118], ['o', 0, -.142, .13], ['c', 0, 0, .115]],
    nitrate: [['o', 0, -.135, .132], ['o', .117, .068, .132], ['o', -.117, .068, .132], ['n', 0, 0, .105]],
    mg: [['mg', 0, 0, .092]],
    scent: [['scent', 0, 0, .19]],
    air: [['air', -.058, 0, .125], ['air', .058, 0, .125]],
    /* lactic acid C3H6O3 and ethanol C2H5OH, each with its own coloured halo, so a pupil tells them apart at a glance */
    lactic: [['h', -.27, .1, .062], ['h', -.12, -.115, .062], ['h', .03, -.09, .062], ['h', -.255, -.105, .062], ['h', .29, .135, .062], ['h', .03, .225, .062], ['c', -.17, .02, .112], ['c', 0, .05, .112], ['c', .17, -.02, .112], ['o', .19, -.165, .118], ['o', .285, .055, .118], ['o', -.03, .18, .118]],
    ethanol: [['h', -.12, -.115, .062], ['h', .03, .1, .062], ['h', -.285, -.07, .062], ['h', -.24, .125, .062], ['h', .05, -.17, .062], ['h', .275, .13, .062], ['c', -.17, .02, .116], ['c', .01, -.04, .116], ['o', .185, .04, .124]]
  };
  var CACHE = {};
  /* a molecule as a small picture, made once for each size on the screen, so hundreds can move at 60 frames a second */
  function sprite(name, px) {
    var key = name + '@' + Math.round(px);
    if (CACHE[key]) return CACHE[key];
    var R = name === 'sucrose' ? .66 : name === 'glucose' ? .5 : name === 'lactic' || name === 'ethanol' ? .46 : .33, size = Math.ceil(2 * R * px) + 4;
    var cv = document.createElement('canvas'); cv.width = cv.height = size;
    var g = cv.getContext('2d'); g.translate(size / 2, size / 2); g.scale(px, px);
    if (name === 'sucrose' || name === 'glucose') sugarRing(g, name === 'sucrose');
    else {
      if (name === 'lactic' || name === 'ethanol') {
        var halo = name === 'lactic' ? '255,92,150' : '120,226,140', hg = g.createRadialGradient(0, 0, .1, 0, 0, .44);
        hg.addColorStop(0, 'rgba(' + halo + ',.46)'); hg.addColorStop(.72, 'rgba(' + halo + ',.3)'); hg.addColorStop(1, 'rgba(' + halo + ',0)');
        g.fillStyle = hg; g.beginPath(); g.arc(0, 0, .44, 0, TAU); g.fill();
      }
      /* the three small gases and water are told apart by more than their red atoms: carbon dioxide blue, water pale blue, oxygen a white ring */
      var SOFT = { co2: '64,108,255', water: '168,244,255' }[name];
      if (SOFT) { var sg = g.createRadialGradient(0, 0, .06, 0, 0, .32); sg.addColorStop(0, 'rgba(' + SOFT + ',.55)'); sg.addColorStop(.74, 'rgba(' + SOFT + ',.34)'); sg.addColorStop(1, 'rgba(' + SOFT + ',0)'); g.fillStyle = sg; g.beginPath(); g.arc(0, 0, .32, 0, TAU); g.fill(); }
      MOL[name].forEach(function (a) { ball(g, a[1], a[2], a[3], C[a[0]]); });
      if (name === 'oxygen') { g.strokeStyle = 'rgba(255,255,255,.78)'; g.lineWidth = .018; g.beginPath(); g.ellipse(0, 0, .232, .17, 0, 0, TAU); g.stroke(); }
    }
    return (CACHE[key] = { cv: cv, half: (size / 2) / px });
  }
  /* a sugar as its ring(s): six carbon-oxygen corners, in the amber the Y7 cell game gives sugars */
  function ring(g, cx, cy, r, n, rot) {
    g.beginPath();
    for (var i = 0; i < n; i++) { var a = rot + i * TAU / n; g[i ? 'lineTo' : 'moveTo'](cx + r * Math.cos(a), cy + r * Math.sin(a)); }
    g.closePath();
  }
  function sugarRing(g, two) {
    function one(cx, cy, r, n, rot) {
      ring(g, cx, cy, r, n, rot);
      var rg = g.createRadialGradient(cx - r * .3, cy - r * .3, r * .1, cx, cy, r * 1.15);
      rg.addColorStop(0, 'rgba(255,233,179,.46)'); rg.addColorStop(1, 'rgba(255,201,92,.14)');
      g.fillStyle = rg; g.fill();
      g.lineJoin = 'round'; g.strokeStyle = C.sugarLo; g.lineWidth = .15; g.stroke();
      g.strokeStyle = C.sugar; g.lineWidth = .095; g.stroke();
      /* the ring's oxygen */
      var a = rot + TAU / n * 1; ball(g, cx + r * Math.cos(a), cy + r * Math.sin(a), .072, C.o);
    }
    if (two) {
      g.strokeStyle = C.sugar; g.lineWidth = .085; g.beginPath(); g.moveTo(-.1, .03); g.lineTo(.13, -.03); g.stroke();
      one(-.33, .05, .27, 6, .3); one(.36, -.05, .23, 5, -.4);
    } else one(0, 0, .35, 6, .2);
  }
  /* draw molecule `name` at (x, y), turned by a, at u model units to the nanometre */
  function mol(c, name, x, y, a, u, alpha) {
    var T = c.getTransform(), k = T.a, sp = sprite(name, k * u), H = sp.half * u;
    if (alpha != null) c.globalAlpha = alpha;
    var cs = Math.cos(a), sn = Math.sin(a);
    c.transform(cs, sn, -sn, cs, x, y);
    c.drawImage(sp.cv, -H, -H, 2 * H, 2 * H);
    c.setTransform(T);
    if (alpha != null) c.globalAlpha = 1;
  }

  /* ---------- a window: its rounded edge, its ground ---------- */
  function rr(c, x, y, w, h, r) {
    c.beginPath();
    if (c.roundRect) c.roundRect(x, y, w, h, r);
    else { c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  }
  function ground(c, x, y, w, h, top, bottom) {
    var lg = c.createLinearGradient(0, y, 0, y + h);
    lg.addColorStop(0, top); lg.addColorStop(1, bottom);
    c.fillStyle = lg; c.fillRect(x, y, w, h);
  }
  function frame(c, x, y, w, h, r, paint) {
    c.save(); rr(c, x, y, w, h, r); c.clip(); paint(); c.restore();
    c.save(); rr(c, x, y, w, h, r); c.strokeStyle = C.edge; c.lineWidth = 1.2; c.stroke(); c.restore();
  }

  /* ---------- a movement arrow: one filled shape, a fixed head, the shaft as wide as the rate
     (memory concentration-pictures-equal-volumes: "never line arrows, whose heads scale with the line width") ---------- */
  function arrow(c, x0, y0, x1, y1, w, fill, o) {
    o = o || {};
    var dx = x1 - x0, dy = y1 - y0, L = Math.sqrt(dx * dx + dy * dy); if (L < 1) return;
    var ux = dx / L, uy = dy / L, nx = -uy, ny = ux, hL = o.head || Math.max(13, w * 1.5), hW = o.headW || Math.max(10, w * 1.25);
    if (hL > L * .7) { var q = L * .7 / hL; hL *= q; hW *= q; }
    var bx = x1 - ux * hL, by = y1 - uy * hL, s = w / 2;
    c.beginPath();
    c.moveTo(x0 + nx * s, y0 + ny * s); c.lineTo(bx + nx * s, by + ny * s); c.lineTo(bx + nx * hW, by + ny * hW);
    c.lineTo(x1, y1); c.lineTo(bx - nx * hW, by - ny * hW); c.lineTo(bx - nx * s, by - ny * s); c.lineTo(x0 - nx * s, y0 - ny * s);
    c.closePath();
    if (o.halo !== false) { c.strokeStyle = o.halo || 'rgba(9,18,28,.75)'; c.lineWidth = 3; c.lineJoin = 'round'; c.stroke(); }
    c.fillStyle = fill; c.fill();
  }

  /* ---------- the cell membrane: a phospholipid bilayer, 5 nm thick, on its side or upright ----------
     Every lipid is a head and two tails; the heads face the water on each side, the tails meet in the middle. It is drawn
     once for each size and kept, because it does not change. */
  var LAYER = {};
  function lipidLayer(len, u, px) {
    var key = Math.round(len) + '|' + u + '|' + Math.round(px);
    if (LAYER[key]) return LAYER[key];
    var T = 5 * u, pad = 2, cv = document.createElement('canvas');
    cv.width = Math.ceil((T + 2 * pad) * px); cv.height = Math.ceil(len * px);
    var g = cv.getContext('2d'); g.scale(px, px); g.translate(pad + T / 2, 0);
    var r = MemR(11), sp = .76 * u, hR = .36 * u;
    /* the fatty middle: a soft band */
    var lg = g.createLinearGradient(-T / 2, 0, T / 2, 0);
    lg.addColorStop(0, 'rgba(90,68,40,.0)'); lg.addColorStop(.2, 'rgba(120,92,54,.34)'); lg.addColorStop(.5, 'rgba(120,92,54,.5)'); lg.addColorStop(.8, 'rgba(120,92,54,.34)'); lg.addColorStop(1, 'rgba(90,68,40,0)');
    g.fillStyle = lg; g.fillRect(-T / 2, 0, T, len);
    [-1, 1].forEach(function (side) {
      g.lineCap = 'round'; g.lineWidth = .13 * u; g.strokeStyle = C.tail;
      for (var y = -sp + r() * sp * .4; y < len + sp; y += sp) {
        var hx = side * (T / 2 - hR), yy = y + (r() - .5) * .14 * u;
        [-.15, .15].forEach(function (o) {
          var y0 = yy + o * u, w = (r() - .5) * .22 * u;
          g.beginPath(); g.moveTo(hx, y0);
          g.bezierCurveTo(hx - side * .7 * u, y0 + w, hx - side * 1.15 * u, y0 - w, hx - side * (1.9 + r() * .22) * u, y0 + w * .6);
          g.stroke();
        });
        ball(g, hx, yy, hR, C.head);
      }
    });
    return (LAYER[key] = { cv: cv, w: T + 2 * pad });
  }
  function MemR(seed) { return global.RsSim ? global.RsSim.rng(seed) : Math.random; }
  /* an upright membrane centred on x, from y0 to y1 */
  function bilayer(c, x, y0, y1, u) {
    var k = c.getTransform().a, L = lipidLayer(y1 - y0, u, k);
    c.drawImage(L.cv, x - L.w / 2, y0, L.w, y1 - y0);
  }

  /* ---------- a protein carrier, seen cut through, across a membrane ----------
     Two halves round a pocket. `open` 0: the pocket faces the left; 1: it faces the right; the halves swing, the protein
     does not move. `glow` is the energy from respiration, shown as light at the moment the shape changes. */
  function carrier(c, x, y, u, open, glow) {
    var hw = 3.05 * u, hh = 2.5 * u, gap = .62 * u, gL = lerp(gap, .1 * u, ease(open)), gR = lerp(.1 * u, gap, ease(open));
    function half(sgn) {
      c.beginPath();
      c.moveTo(x - hw, y + sgn * gL);
      c.bezierCurveTo(x - hw * .55, y + sgn * (gL * .9 + .15 * u), x - hw * .18, y + sgn * (.52 * u), x, y + sgn * (.56 * u));
      c.bezierCurveTo(x + hw * .18, y + sgn * (.52 * u), x + hw * .55, y + sgn * (gR * .9 + .15 * u), x + hw, y + sgn * gR);
      c.bezierCurveTo(x + hw * 1.08, y + sgn * (hh * .6), x + hw * .78, y + sgn * hh, x + hw * .38, y + sgn * hh);
      c.bezierCurveTo(x + hw * .12, y + sgn * (hh * 1.09), x - hw * .12, y + sgn * (hh * 1.09), x - hw * .38, y + sgn * hh);
      c.bezierCurveTo(x - hw * .78, y + sgn * hh, x - hw * 1.08, y + sgn * (hh * .6), x - hw, y + sgn * gL);
      c.closePath();
    }
    [-1, 1].forEach(function (s) {
      half(s);
      var lg = c.createLinearGradient(x, y + s * hh, x, y + s * .3 * u);
      lg.addColorStop(0, C.car[1]); lg.addColorStop(.55, C.car[1]); lg.addColorStop(1, C.car[2]);
      c.fillStyle = lg; c.fill();
      c.strokeStyle = C.car[0]; c.lineWidth = .1 * u; c.stroke();
      /* the protein's folds, a few soft curves on its surface */
      c.save(); half(s); c.clip(); c.strokeStyle = 'rgba(214,255,245,.3)'; c.lineWidth = .13 * u; c.lineCap = 'round';
      for (var i = -2; i <= 2; i++) {
        c.beginPath(); var bx = x + i * .92 * u;
        c.moveTo(bx - .6 * u, y + s * 2.2 * u); c.bezierCurveTo(bx + .5 * u, y + s * 1.9 * u, bx - .5 * u, y + s * 1.3 * u, bx + .5 * u, y + s * .9 * u); c.stroke();
      }
      c.restore();
      /* the energy from respiration: light in the protein itself, never over the lipids beside it */
      if (glow > .01) {
        c.save(); half(s); c.clip(); c.globalCompositeOperation = 'lighter';
        var rg = c.createRadialGradient(x, y, u * .4, x, y, u * 3.6);
        rg.addColorStop(0, 'rgba(255,226,120,' + (.55 * glow).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(255,226,120,' + (.08 * glow).toFixed(3) + ')');
        c.fillStyle = rg; c.fillRect(x - hw * 1.2, y - hh * 1.2, hw * 2.4, hh * 2.4); c.restore();
      }
    });
  }

  /* ---------- the cell wall in a close-up: a band with a hard edge, its cellulose fibres along it. It lets particles through. ---------- */
  function wallBand(c, x0, x1, y0, y1) {
    var lg = c.createLinearGradient(x0, 0, x1, 0);
    lg.addColorStop(0, '#5C8444'); lg.addColorStop(.5, '#79A154'); lg.addColorStop(1, '#5C8444');
    c.fillStyle = lg; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    c.strokeStyle = C.fibre; c.lineWidth = 1.1; c.lineCap = 'round';
    for (var x = x0 + 5, n = 0; x < x1 - 2; x += 6.4, n++) {
      c.beginPath();
      for (var y = y0; y <= y1; y += 12) { var xx = x + 1.5 * Math.sin(y * .05 + n * 1.7); if (y === y0) c.moveTo(xx, y); else c.lineTo(xx, y); }
      c.stroke();
    }
    c.strokeStyle = C.wallLo; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0, y1); c.moveTo(x1, y0); c.lineTo(x1, y1); c.stroke();
  }

  /* ---------- the side of a mitochondrion, in a picture of molecules ----------
     A mitochondrion is about 1000 nm long, so at the scale of a membrane only a part of its side fits in the picture.
     E = { x, y, r }: the circle of that side, with its centre outside the picture; its folded inner membrane is the cristae. */
  function mitoEdge(c, E, glow) {
    var x = E.x, y = E.y, R = E.r;
    function at(r, th) { return [x + r * Math.cos(th), y + r * Math.sin(th)]; }
    c.save();
    c.beginPath(); c.arc(x, y, R, 0, TAU);
    var lg = c.createRadialGradient(x, y, R * .55, x, y, R);
    lg.addColorStop(0, C.mito1); lg.addColorStop(1, C.mito0);
    c.fillStyle = lg; c.fill(); c.strokeStyle = C.mitoLo; c.lineWidth = 3; c.stroke();
    c.beginPath(); c.arc(x, y, R - 3, 0, TAU); c.clip();
    c.beginPath(); c.arc(x, y, R - 13, 0, TAU); c.fillStyle = 'rgba(255,226,190,.8)'; c.fill(); c.strokeStyle = C.mitoLo; c.lineWidth = 2.2; c.stroke();
    /* the cristae: folds of the inner membrane */
    c.lineWidth = 2; c.lineJoin = 'round'; c.lineCap = 'round';
    for (var th = Math.PI * .86, i = 0; th < Math.PI * 1.66; th += .118, i++) {
      var deep = i % 2 ? 46 : 32, a = at(R - 13, th - .026), b = at(R - 13 - deep, th - .018), d = at(R - 13 - deep, th + .018), e = at(R - 13, th + .026);
      c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.quadraticCurveTo.apply(c, at(R - 13 - deep - 5, th).concat(d)); c.lineTo(e[0], e[1]); c.stroke();
    }
    if (glow > .01) {
      c.globalCompositeOperation = 'lighter';
      var gl = c.createRadialGradient(x, y, R * .7, x, y, R);
      gl.addColorStop(0, 'rgba(255,214,110,' + (.08 * glow).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(255,226,130,' + (.36 * glow).toFixed(3) + ')');
      c.fillStyle = gl; c.fillRect(x - R, y - R, 2 * R, 2 * R);
    }
    c.restore();
  }

  /* ---------- a mitochondrion: two membranes, the inner one folded into cristae ---------- */
  function mito(c, x, y, L, W, rot, glow) {
    L = Math.max(L, W * 1.6);                                  /* a mitochondrion is never drawn as a coin */
    c.save(); c.translate(x, y); c.rotate(rot || 0);
    var R = W / 2;
    function shell(l, r) { rr(c, -l / 2, -r, l, 2 * r, r); }
    if (glow > .01) {
      c.save(); c.globalCompositeOperation = 'lighter';
      var gl = c.createRadialGradient(0, 0, R * .4, 0, 0, L * .9);
      gl.addColorStop(0, 'rgba(255,230,128,' + (.55 * glow).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(255,230,128,0)');
      c.fillStyle = gl; c.beginPath(); c.arc(0, 0, L * .9, 0, TAU); c.fill(); c.restore();
    }
    /* the outer membrane, and the narrow space inside it */
    shell(L, R);
    var lg = c.createLinearGradient(0, -R, 0, R); lg.addColorStop(0, '#D9966F'); lg.addColorStop(1, '#B46B49');
    c.fillStyle = lg; c.fill(); c.strokeStyle = '#6E3A26'; c.lineWidth = Math.max(.6, W * .024); c.stroke();
    /* the inside, within the folded inner membrane */
    var li = L - W * .15, ri = R * .84;
    c.save(); shell(li, ri);
    var mg = c.createLinearGradient(0, -ri, 0, ri); mg.addColorStop(0, '#FBE6CF'); mg.addColorStop(.55, '#F4D2AE'); mg.addColorStop(1, '#E8BC94');
    c.fillStyle = mg; c.fill(); c.clip();
    /* the cristae: many narrow folds from each side in turn, of slightly different depths */
    var pitch = Math.max(3.6, W * .21), span = li - W * .42, n = Math.max(3, Math.floor(span / pitch) + 1), fw = pitch * .42;
    c.lineWidth = Math.max(.5, W * .018); c.strokeStyle = 'rgba(128,70,44,.9)'; c.fillStyle = 'rgba(205,140,102,.62)'; c.lineJoin = 'round';
    for (var i = 0; i < n; i++) {
      var xx = -span / 2 + i * span / (n - 1), up = i % 2 ? 1 : -1, base = up * ri * 1.06, tip = base - up * ri * (1.22 + .3 * Math.sin(i * 2.4)), lean = fw * .35 * Math.sin(i * 1.7);
      c.beginPath(); c.moveTo(xx - fw / 2, base); c.lineTo(xx - fw / 2 + lean, tip);
      c.quadraticCurveTo(xx + lean, tip - up * fw * .9, xx + fw / 2 + lean, tip); c.lineTo(xx + fw / 2, base);
      c.fill(); c.stroke();
    }
    c.restore();
    shell(li, ri); c.strokeStyle = 'rgba(128,70,44,.95)'; c.lineWidth = Math.max(.5, W * .02); c.stroke();
    c.restore();
  }

  /* ---------- the outline of a plant cell ----------
     A rounded box, as a list of points, so the wall and the shrinking contents can be worked out point by point. */
  function boxPts(cx, cy, a, b, e, n) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var th = i / n * TAU, cs = Math.cos(th), sn = Math.sin(th);
      pts.push([cx + a * Math.sign(cs) * Math.pow(Math.abs(cs), 2 / e), cy + b * Math.sign(sn) * Math.pow(Math.abs(sn), 2 / e), th]);
    }
    return pts;
  }
  function polyPath(c, pts) {
    c.beginPath();
    /* a smooth line through the points */
    var n = pts.length;
    c.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
    for (var i = 0; i < n; i++) { var p = pts[i], q = pts[(i + 1) % n]; c.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
    c.closePath();
  }

  /* a point inside the cell membrane, at least `gap` from it: moved towards the middle of the cell until it is, so that
     nothing inside the cell ever lies across its membrane, however far the cell has plasmolysed */
  function inMem(mem, cx, cy, x, y, gap) {
    for (var k = 1; k > .2; k -= .03) {
      var px = cx + (x - cx) * k, py = cy + (y - cy) * k, ok = true;
      for (var i = 0; i < mem.length; i++) { var dx = mem[i][0] - px, dy = mem[i][1] - py; if (dx * dx + dy * dy < gap * gap) { ok = false; break; } }
      if (ok) return [px, py];
    }
    return [cx, cy];
  }

  /* A plant cell, whatever its water content.
     o = { x, y, a, b (half width, half height of the outside of the wall), wall (its thickness),
           water: 1 turgid … 0 plasmolysed, see below; sap (how dark the cell sap is, 0–1), seed, nucleus (true), mitos (n) }
     water from 1 to .55: the vacuole shrinks a little and the pressure on the wall falls, and the contents still touch the
     wall (flaccid at .55). Below .55 the cell membrane separates from the wall, the corners first, and the vacuole shrinks
     much more (plasmolysis). The space between the wall and the membrane holds the outside solution, because the cell
     wall lets it through. The nucleus lies in the cytoplasm: the vacuole's edge goes round it. */
  function plantGeom(o) {
    var water = o.water == null ? 1 : o.water, a = o.a, b = o.b, W = o.wall || 7, S = o.seed || 1;
    var pl = water >= .55 ? 0 : (.55 - water) / .55;               /* how far the cell has plasmolysed */
    /* the wall: rounder and a little bowed out while the pressure is on it */
    var bow = clamp((water - .55) / .45), e = lerp(5.4, 3.9, bow), ao = a * lerp(.985, 1.015, bow), bo = b * lerp(.985, 1.018, bow);
    var outer = boxPts(o.x, o.y, ao, bo, e, 72), inner = boxPts(o.x, o.y, ao - W, bo - W, e, 72);
    var wob = function (th) { return Math.sin(th * 2 + S) * .5 + Math.sin(th * 5 + S * 2.3) * .32 + Math.sin(th * 3 - S) * .28; };
    var shrink = ease(pl);
    var mem = inner.map(function (p) {
      var th = p[2], dx = p[0] - o.x, dy = p[1] - o.y;
      /* plasmolysis: the corners leave the wall first, then the sides */
      var cn = Math.pow(Math.abs(Math.cos(th) * Math.sin(th)) * 2, 1.2);
      var fx = 1 - shrink * (.34 + .18 * cn + .05 * wob(th)), fy = 1 - shrink * (.3 + .2 * cn + .05 * wob(th + 1));
      return [o.x + dx * fx, o.y + dy * fy, th];
    });
    var vk = water >= .55 ? lerp(.78, .885, bow) : lerp(.52, .78, water / .55);
    var vac = mem.map(function (p) { return [o.x + (p[0] - o.x) * vk * (1 - .02 * Math.sin(p[2] * 3 + S)), o.y + (p[1] - o.y) * vk * (1 + .02 * Math.sin(p[2] * 2 + S)), p[2]]; });
    /* the nucleus, in the cytoplasm at a corner of the cell; the vacuole's edge bends round it */
    var nP = mem[Math.round(mem.length * .535)], nk = lerp(.8, .74, pl), nr = Math.min(a - W, b - W) * lerp(.2, .17, pl);
    var nIn = inMem(mem, o.x, o.y, o.x + (nP[0] - o.x) * nk, o.y + (nP[1] - o.y) * nk, nr + 3), nuc = { x: nIn[0], y: nIn[1], r: nr };
    if (o.nucleus !== false) vac = vac.map(function (p) {
      var dx = p[0] - nuc.x, dy = p[1] - nuc.y, d = Math.sqrt(dx * dx + dy * dy), g = nr * 1.2;
      return d < g && d > 0 ? [nuc.x + dx * g / d, nuc.y + dy * g / d, p[2]] : p;
    });
    return { water: water, pl: pl, e: e, ao: ao, bo: bo, outer: outer, inner: inner, mem: mem, vac: vac, nuc: nuc };
  }
  function plantCell(c, o) {
    var G = plantGeom(o), water = G.water, a = o.a, b = o.b, W = o.wall || 7, S = o.seed || 1, pl = G.pl, e = G.e, ao = G.ao, bo = G.bo;
    var outer = G.outer, inner = G.inner;
    /* the wall, a layered ring: fibres of cellulose along it */
    polyPath(c, outer);
    var lg = c.createLinearGradient(o.x - a, o.y - b, o.x + a, o.y + b);
    lg.addColorStop(0, C.wall0); lg.addColorStop(1, C.wall1);
    c.fillStyle = lg; c.fill(); c.strokeStyle = C.wallLo; c.lineWidth = 1; c.stroke();
    polyPath(c, boxPts(o.x, o.y, ao - W * .5, bo - W * .5, e, 72)); c.strokeStyle = C.fibre; c.lineWidth = Math.max(.7, W * .14); c.stroke();
    /* inside the wall: the solution that has entered, once the membrane has separated */
    polyPath(c, inner); c.fillStyle = C.gap; c.fill();
    /* the contents: the cell membrane is the edge of the cytoplasm */
    var pa = a - W, pb = b - W, mem = G.mem;
    polyPath(c, mem);
    var cy = c.createRadialGradient(o.x - a * .2, o.y - b * .3, 2, o.x, o.y, Math.max(a, b) * 1.1);
    cy.addColorStop(0, C.cyto0); cy.addColorStop(1, C.cyto1);
    c.fillStyle = cy; c.fill();
    /* the vacuole, with its own membrane: it holds the cell sap; the less water, the smaller and the darker */
    var vac = G.vac;
    var dark = o.sap == null ? clamp(1 - water) : o.sap;
    polyPath(c, vac);
    var vg = c.createRadialGradient(o.x - pa * .25, o.y - pb * .3, 2, o.x, o.y, Math.max(pa, pb));
    vg.addColorStop(0, mixHex(C.sapHi, C.sap0, dark)); vg.addColorStop(.7, mixHex(C.sap0, C.sap1, dark)); vg.addColorStop(1, mixHex(C.sap1, C.sapLo, dark));
    c.fillStyle = vg; c.fill();
    c.strokeStyle = 'rgba(120,48,92,.75)'; c.lineWidth = 1; c.stroke();
    /* the nucleus and the mitochondria, in the cytoplasm */
    if (o.nucleus !== false) {
      var nx = G.nuc.x, ny = G.nuc.y, nr = G.nuc.r;
      var ng = c.createRadialGradient(nx - nr * .3, ny - nr * .35, nr * .1, nx, ny, nr);
      ng.addColorStop(0, C.nuc0); ng.addColorStop(1, C.nuc1);
      c.fillStyle = ng; c.beginPath(); c.arc(nx, ny, nr, 0, TAU); c.fill(); c.strokeStyle = C.nucLo; c.lineWidth = 1; c.stroke();
      c.fillStyle = C.nucLo; c.beginPath(); c.arc(nx + nr * .22, ny - nr * .1, nr * .3, 0, TAU); c.fill();
    }
    for (var m = 0; m < (o.mitos || 0); m++) {
      /* round the cell, and clear of the nucleus */
      var mi = (m * .27 + .1 + (S % 3) * .03) % 1; if (Math.abs(mi - .535) < .15) mi = (mi + .17) % 1;
      var mP = mem[Math.min(mem.length - 1, Math.round(mem.length * mi))], mk = lerp(.895, .9, pl);
      var mAt = inMem(mem, o.x, o.y, o.x + (mP[0] - o.x) * mk, o.y + (mP[1] - o.y) * mk, Math.min(pa, pb) * .15);
      mito(c, mAt[0], mAt[1], Math.min(pa, pb) * .24, Math.min(pa, pb) * .1, mP[2] + Math.PI / 2, 0);
    }
    /* the cell membrane: a clear line, on top of everything inside */
    polyPath(c, mem); c.strokeStyle = C.memb; c.lineWidth = 1.5; c.stroke();
    return { mem: mem, vac: vac, inner: inner, outer: outer, pl: pl, nuc: G.nuc };
  }

  /* An animal cell: a cell membrane, cytoplasm and nucleus, and no wall.
     o = { x, y, r, swell (1 = at rest; larger as water enters, smaller as it leaves), burst (0–1: the membrane has broken) } */
  function animalCell(c, o) {
    var S = o.seed || 2, R = o.r * (o.swell || 1), br = o.burst || 0, shr = clamp(1 - (o.swell || 1)), pts = [];
    for (var i = 0; i < 72; i++) {
      var th = i / 72 * TAU, wob = 1 + .045 * Math.sin(th * 3 + S) + .03 * Math.sin(th * 5 - S) + shr * .14 * Math.sin(th * 7 + S * 2) + shr * .1 * Math.sin(th * 11);
      pts.push([o.x + R * wob * Math.cos(th), o.y + R * wob * .93 * Math.sin(th), th]);
    }
    if (br < 1) {
      c.save(); c.globalAlpha = 1 - br;
      polyPath(c, pts);
      var cg = c.createRadialGradient(o.x - R * .3, o.y - R * .35, 2, o.x, o.y, R * 1.05);
      cg.addColorStop(0, C.cyto0); cg.addColorStop(1, C.cyto1);
      c.fillStyle = cg; c.fill();
      c.strokeStyle = C.memb; c.lineWidth = 1.6; c.stroke();
      var nr = o.r * .34, nx = o.x + R * .1, ny = o.y - R * .06;
      var ng = c.createRadialGradient(nx - nr * .3, ny - nr * .35, nr * .1, nx, ny, nr);
      ng.addColorStop(0, C.nuc0); ng.addColorStop(1, C.nuc1);
      c.fillStyle = ng; c.beginPath(); c.arc(nx, ny, nr, 0, TAU); c.fill(); c.strokeStyle = C.nucLo; c.lineWidth = 1; c.stroke();
      c.fillStyle = C.nucLo; c.beginPath(); c.arc(nx + nr * .22, ny - nr * .1, nr * .3, 0, TAU); c.fill();
      for (var m = 0; m < 4; m++) { var mth = m * 1.7 + S; mito(c, o.x + R * .62 * Math.cos(mth), o.y + R * .6 * Math.sin(mth), o.r * .26, o.r * .11, mth + 1, 0); }
      c.restore();
    }
    if (br > 0) {
      /* the burst cell: broken pieces of membrane drift apart, and its contents spread into the water */
      var rnd = MemR(S * 7 + 3);
      for (var f = 0; f < 22; f++) {
        var fa = f / 22 * TAU + rnd() * .2, len = .16 + rnd() * .2, drift = R * (1 + br * (.32 + rnd() * .5));
        c.strokeStyle = 'rgba(58,90,114,' + (.95 - br * .25).toFixed(3) + ')'; c.lineWidth = 1.5; c.lineCap = 'round';
        c.beginPath(); c.arc(o.x, o.y, drift, fa, fa + len); c.stroke();
      }
      for (var d = 0; d < 34; d++) {
        var da = rnd() * TAU, dr = R * rnd() * (.5 + br * 1.1), ds = 1 + rnd() * 2.6;
        c.fillStyle = 'rgba(228,213,176,' + (.85 - br * .35).toFixed(3) + ')'; c.beginPath(); c.arc(o.x + dr * Math.cos(da), o.y + dr * Math.sin(da), ds, 0, TAU); c.fill();
      }
    }
    return { pts: pts };
  }

  /* ---------- a glass beaker: thickness, a lip, the light on it ---------- */
  function beaker(c, o) {
    var x = o.x, y = o.y, w = o.w, h = o.h, lvl = o.level == null ? .72 : o.level, th = 4.5;
    /* the liquid */
    var ly = y + h * (1 - lvl);
    c.save();
    c.beginPath(); c.moveTo(x + th, ly); c.lineTo(x + w - th, ly); c.lineTo(x + w - th, y + h - 14); c.quadraticCurveTo(x + w - th, y + h - th, x + w - 16, y + h - th);
    c.lineTo(x + 16, y + h - th); c.quadraticCurveTo(x + th, y + h - th, x + th, y + h - 14); c.closePath();
    var lg = c.createLinearGradient(0, ly, 0, y + h);
    lg.addColorStop(0, o.liquid0 || 'rgba(120,200,240,.42)'); lg.addColorStop(1, o.liquid1 || 'rgba(60,150,210,.62)');
    c.fillStyle = lg; c.fill();
    c.restore();
    /* the surface */
    c.beginPath(); c.ellipse(x + w / 2, ly, w / 2 - th, 5, 0, 0, TAU);
    c.fillStyle = o.surface || 'rgba(190,232,250,.55)'; c.fill(); c.strokeStyle = 'rgba(225,245,255,.7)'; c.lineWidth = 1; c.stroke();
    return ly;
  }
  /* the beaker's glass goes over what stands in it */
  function beakerGlass(c, o) {
    var x = o.x, y = o.y, w = o.w, h = o.h;
    c.lineCap = 'round'; c.lineJoin = 'round';
    /* the wall of the glass: a band with a bright inner edge */
    c.strokeStyle = 'rgba(205,232,250,.42)'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + h - 16); c.quadraticCurveTo(x, y + h, x + 16, y + h); c.lineTo(x + w - 16, y + h); c.quadraticCurveTo(x + w, y + h, x + w, y + h - 16); c.lineTo(x + w, y); c.stroke();
    c.strokeStyle = 'rgba(240,250,255,.9)'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(x - 2.3, y); c.lineTo(x - 2.3, y + h - 15); c.quadraticCurveTo(x - 2.3, y + h + 2.3, x + 16, y + h + 2.3); c.lineTo(x + w - 16, y + h + 2.3); c.quadraticCurveTo(x + w + 2.3, y + h + 2.3, x + w + 2.3, y + h - 15); c.lineTo(x + w + 2.3, y); c.stroke();
    /* the lip */
    c.strokeStyle = 'rgba(240,250,255,.95)'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(x - 7, y - 1); c.lineTo(x + 3, y + 1); c.moveTo(x + w + 7, y - 1); c.lineTo(x + w - 3, y + 1); c.stroke();
    /* a window's reflection, down the left side */
    var lg = c.createLinearGradient(x + 8, 0, x + 26, 0);
    lg.addColorStop(0, 'rgba(255,255,255,.24)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = lg; c.fillRect(x + 8, y + 8, 18, h - 30);
    c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x + w - 16, y + 12, 5, h - 42);
  }

  /* ---------- a tied bag of dialysis tubing ----------
     o = { x, y, L (its length), r (the half width when full), full: 1 firm and swollen … 0 limp, seed }.
     A firm bag is a smooth, round-ended tube; a limp one is thin, creased and bent. */
  function bagPath(o) {
    var f = o.full, n = 44, top = [], bot = [], L = o.L, r = o.r;
    function cx(k) { return lerp(-L / 2, L / 2, k); }
    function sag(k) { return (1 - f) * r * 1.1 * Math.sin(Math.PI * k); }                   /* a limp bag sags in the middle */
    function half(k) {                                                                    /* the bag's half width along it */
      var end = Math.pow(Math.sin(Math.PI * clamp(k)), lerp(.62, .36, f));
      var crease = (1 - f) * (.13 * Math.sin(k * 21 + 1) + .08 * Math.sin(k * 37));
      return r * lerp(.42, 1, f) * end * (1 + crease);
    }
    for (var i = 0; i <= n; i++) { var k = i / n, hw = half(k); top.push([cx(k), sag(k) - hw]); bot.push([cx(k), sag(k) + hw]); }
    return { top: top, bot: bot, cx: cx, sag: sag, half: half };
  }
  function bag(c, o) {
    var P = bagPath(o), L = o.L;
    c.save(); c.translate(o.x, o.y); c.rotate(o.rot || 0);
    c.beginPath();
    P.top.forEach(function (p, i) { c[i ? 'lineTo' : 'moveTo'](p[0], p[1]); });
    P.bot.slice().reverse().forEach(function (p) { c.lineTo(p[0], p[1]); });
    c.closePath();
    var lg = c.createLinearGradient(0, -o.r * 1.1, 0, o.r * 1.5);
    lg.addColorStop(0, o.fill0 || 'rgba(255,214,128,.72)'); lg.addColorStop(.55, o.fill1 || 'rgba(245,178,84,.72)'); lg.addColorStop(1, o.fill2 || 'rgba(198,132,54,.82)');
    c.fillStyle = lg; c.fill();
    c.strokeStyle = 'rgba(244,232,206,.95)'; c.lineWidth = 2; c.lineJoin = 'round'; c.stroke();
    /* the shine of a tight, smooth tube, or the creases of a limp one */
    if (o.full > .5) {
      c.strokeStyle = 'rgba(255,255,255,' + (.72 * (o.full - .5) * 2).toFixed(3) + ')'; c.lineWidth = 3.4; c.lineCap = 'round';
      c.beginPath();
      for (var i = 7; i <= 37; i++) { var q = P.top[i]; c[i === 7 ? 'moveTo' : 'lineTo'](q[0], q[1] + o.r * .34 * o.full + 2); }
      c.stroke();
    }
    if (o.full < .92) {
      c.strokeStyle = 'rgba(120,76,28,' + (.62 * (1 - o.full)).toFixed(3) + ')'; c.lineWidth = 1.3;
      for (var j = 5; j < 42; j += 4) {
        var pt = P.top[j], pb = P.bot[j]; c.beginPath(); c.moveTo(pt[0] + 1, pt[1] + 2); c.quadraticCurveTo((pt[0] + pb[0]) / 2 + 5, (pt[1] + pb[1]) / 2, pb[0] - 1, pb[1] - 2); c.stroke();
      }
    }
    /* the knots: the tubing is tied at both ends */
    [[-L / 2, P.sag(0)], [L / 2, P.sag(1)]].forEach(function (e, n) {
      var d = n ? 1 : -1;
      c.fillStyle = 'rgba(232,222,198,.98)'; c.strokeStyle = 'rgba(120,102,72,.9)'; c.lineWidth = 1;
      c.beginPath(); c.ellipse(e[0] + d * 3, e[1], 5, 4.4, 0, 0, TAU); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(232,222,198,.95)'; c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(e[0] + d * 7, e[1] - 1); c.quadraticCurveTo(e[0] + d * 13, e[1] - 4, e[0] + d * 17, e[1] - 2); c.moveTo(e[0] + d * 7, e[1] + 1); c.quadraticCurveTo(e[0] + d * 13, e[1] + 4, e[0] + d * 16, e[1] + 5); c.stroke();
    });
    c.restore();
    return P;
  }

  /* ---------- a young plant in a pot: firm while its cells are turgid, drooping while they are flaccid ----------
     droop 0 upright … 1 wilted. The stem bends from its base, more towards the top; each leaf hangs further. */
  function seedling(c, x, y, s, droop) {
    var d = clamp(droop), H = 150 * s;
    /* the pot */
    var pw = 62 * s, ph = 46 * s;
    var pg = c.createLinearGradient(x - pw, 0, x + pw, 0);
    pg.addColorStop(0, '#8F4E2F'); pg.addColorStop(.42, '#C87A4B'); pg.addColorStop(1, '#7A3F25');
    c.fillStyle = pg; c.beginPath(); c.moveTo(x - pw, y); c.lineTo(x + pw, y); c.lineTo(x + pw * .78, y + ph); c.quadraticCurveTo(x, y + ph + 5 * s, x - pw * .78, y + ph); c.closePath(); c.fill();
    c.fillStyle = '#D18A5C'; D_rr(c, x - pw - 5 * s, y - 8 * s, 2 * pw + 10 * s, 11 * s, 3 * s); c.fill();
    c.fillStyle = '#3A2A1E'; c.beginPath(); c.ellipse(x, y - 7 * s, pw * .96, 5 * s, 0, 0, TAU); c.fill();
    /* the stem, as a curve whose top moves with the droop */
    var tipX = x + d * 98 * s, tipY = y - H + d * 112 * s, c1x = x + d * 6 * s, c1y = y - H * .62, c2x = x + d * 62 * s, c2y = y - H * .98 + d * 8 * s;
    function st(k) {
      var m = 1 - k;
      return [m * m * m * x + 3 * m * m * k * c1x + 3 * m * k * k * c2x + k * k * k * tipX, m * m * m * (y - 7 * s) + 3 * m * m * k * c1y + 3 * m * k * k * c2y + k * k * k * tipY];
    }
    function leaf(k, side, len) {
      var p = st(k), q = st(Math.min(1, k + .03)), base = Math.atan2(q[1] - p[1], q[0] - p[0]);
      var a = base + side * lerp(1.05, 1.35, d) + (side > 0 ? 1 : -1) * 0 + d * (Math.PI / 2 - base) * .86;
      var L = len * s, W2 = L * .34;
      c.save(); c.translate(p[0], p[1]); c.rotate(a);
      var lg = c.createLinearGradient(0, -W2, 0, W2);
      lg.addColorStop(0, lerp(0, 1, d) > .6 ? '#7FA74E' : '#5FB85A'); lg.addColorStop(1, lerp(0, 1, d) > .6 ? '#54793A' : '#2F8540');
      c.fillStyle = lg; c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(L * .28, -W2 * 1.15, L * .72, -W2 * .9, L, 0); c.bezierCurveTo(L * .72, W2 * .9, L * .28, W2 * 1.15, 0, 0); c.fill();
      c.strokeStyle = 'rgba(232,248,206,.72)'; c.lineWidth = Math.max(.8, s); c.beginPath(); c.moveTo(0, 0); c.lineTo(L * .94, 0); c.stroke();
      c.restore();
    }
    leaf(.46, -1, 62); leaf(.6, 1, 58); leaf(.76, -1, 50); leaf(.88, 1, 44);
    c.strokeStyle = '#5B9A47'; c.lineWidth = 5 * s; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y - 7 * s); c.bezierCurveTo(c1x, c1y, c2x, c2y, tipX, tipY); c.stroke();
    c.strokeStyle = 'rgba(214,240,180,.55)'; c.lineWidth = 1.6 * s;
    c.beginPath(); c.moveTo(x - 1.2 * s, y - 7 * s); c.bezierCurveTo(c1x - 1.2 * s, c1y, c2x - 1.2 * s, c2y, tipX - 1 * s, tipY); c.stroke();
    leaf(1, 1, 36);
  }
  function D_rr(c, x, y, w, h, r) { rr(c, x, y, w, h, r); }

  global.RsDraw = { C: C, mol: mol, ball: ball, rr: rr, ground: ground, frame: frame, arrow: arrow, bilayer: bilayer, carrier: carrier, mito: mito, mitoEdge: mitoEdge, wallBand: wallBand,
                     plantCell: plantCell, plantGeom: plantGeom, animalCell: animalCell, beaker: beaker, beakerGlass: beakerGlass, bag: bag, seedling: seedling, bagPath: bagPath, polyPath: polyPath, boxPts: boxPts,
                     lerp: lerp, clamp: clamp, ease: ease, seg: seg, mixHex: mixHex, TAU: TAU };
})(window);
