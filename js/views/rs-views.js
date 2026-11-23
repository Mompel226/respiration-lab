/* ============================================================
   views/rs-views.js — each station's own left picture (Daniel, 7 Oct 2026: "a thing the pupil learns FROM").

   bodycell    What respiration is: a real body, and one of its muscle cells; breathing is shown apart from respiration
   uses        The seven uses of energy, each a moving picture inside one cell, fed by its mitochondrion
   equation    The word equation, the balanced equation, the atoms counted on each side, and where it happens
   routes      How glucose and oxygen reach a muscle cell, and where carbon dioxide and water go, on the real body
   flasks      Germinating seeds and boiled seeds in two vacuum flasks: no numbers (the fence, stations.master.js)
   yeastbench  Yeast with methylene blue at four temperatures: no time in seconds (the fence)
   anaerobic   The two word equations, the energy from one glucose molecule, and where it happens
   debtbody    At rest, during vigorous exercise, after exercise: no numbers (the fence)
   venn        His Venn diagram, to complete

   Every picture runs while it is on the screen, keeps its state when a card opens or shuts, and with Reduce motion shows the
   same state as a still (memory animations-wait-for-the-reader).
   ============================================================ */
(function (global) {
  'use strict';
  var Views = global.Views, D = global.RsDraw, A = global.RsArt, RV = global.RsView;
  if (!Views || !D || !A || !RV) return;
  var C = D.C, seg = D.seg, lerp = D.lerp, clamp = D.clamp, ease = D.ease, TAU = D.TAU;

  function sc(c, W, H, top, bottom, f) { D.frame(c, 0, 0, W, H, 16, function () { D.ground(c, 0, 0, W, H, top || '#142A40', bottom || '#0E1D2E'); f(); }); }
  function wob(t, i, a) { return a * Math.sin(t * 1.4 + i * 2.1); }
  function pressAll(V, ids, on) { ids.forEach(function (k) { var b = V.button(k); if (b) b.setAttribute('aria-pressed', k === on ? 'true' : 'false'); }); }
  function plus(c, x, y) { c.strokeStyle = '#EAF2FA'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 8, y); c.lineTo(x + 8, y); c.moveTo(x, y - 8); c.lineTo(x, y + 8); c.stroke(); }
  var BODY_CREDIT = 'Body: BodyParts3D, The Database Center for Life Science, CC BY-SA 2.1 JP, rendered for this lab.';

  /* ======================================================================= 1. What respiration is */
  Views.add('bodycell', function (spec, ctx) {
    var W = 600, H = 620, t = 0, mode = 'resp', foc = null;
    var WIN = { x0: 70, y0: 8, w: 700, h: 900 }, ROOM = { x0: 70, y0: -36, w: 700, h: 944 }, B = A.Body(WIN, 420, H), IN = { x: 470, y: 158, r: 118 };
    var SP = [[214, 540], [190, 470], [236, 610], [634, 520], [660, 600], [330, 860], [520, 880], [360, 820], [500, 800], [400, 640], [360, 620], [430, 820], [460, 760], [440, 490], [420, 96], [395, 120], [450, 110]].map(function (q, i) { return { x: q[0], y: q[1], p: i * .37 }; });
    function inset(c, g) {
      var a = B.to([628, 470]);
      c.save(); c.strokeStyle = 'rgba(255,244,196,.75)'; c.lineWidth = 1.4; c.setLineDash([5, 4]);
      c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(IN.x - IN.r * .5, IN.y + IN.r * .87); c.stroke(); c.setLineDash([]);
      c.fillStyle = 'rgba(255,244,196,.95)'; c.beginPath(); c.arc(a[0], a[1], 3.4, 0, TAU); c.fill(); c.restore();
      c.save();
      c.beginPath(); c.arc(IN.x, IN.y, IN.r, 0, TAU); c.clip();
      c.fillStyle = '#2A1F16'; c.fillRect(IN.x - IN.r, IN.y - IN.r, 2 * IN.r, 2 * IN.r);
      var k = .5 - .5 * Math.cos(t * 1.8);
      A.fibre(c, IN.x - IN.r - 8, IN.y - IN.r - 6, 2 * IN.r + 16, 2 * IN.r + 12, foc === 'enzymes' ? 0 : k * .8, { glow: g, rows: 2, nuc: false });
      if (foc === 'enzymes') {
        c.fillStyle = 'rgba(14,29,46,.62)'; c.fillRect(IN.x - IN.r, IN.y - IN.r, 2 * IN.r, 2 * IN.r);
        /* one small reaction after another, each with its own enzyme */
        for (var i = 0; i < 4; i++) A.enzyme(c, IN.x - 72 + i * 48, IN.y + (i % 2 ? 16 : -16), 19, i % 2 ? -Math.PI / 2 : Math.PI / 2);
        var u = (t * .3) % 1, x = IN.x - 104 + u * 208;
        D.mol(c, 'glucose', x, IN.y, u * 4, 62, 1);
      }
      if (foc === 'reactions') {
        for (var s = 0; s < 8; s++) {
          var ph = (t * .55 + s / 8) % 1, th = s * 2.4;
          A.spark(c, IN.x + Math.cos(th) * (28 + ph * 76), IN.y + Math.sin(th) * (20 + ph * 70), 7, Math.sin(ph * Math.PI));
        }
      }
      c.restore();
      c.beginPath(); c.arc(IN.x, IN.y, IN.r, 0, TAU); c.strokeStyle = 'rgba(255,244,196,.9)'; c.lineWidth = 2; c.stroke();
    }
    var scene = {
      W: W, H: H,
      /* the picture takes the shape of its column: the body on the left, the close-up on the right */
      fit: function (a) { W = a ? Math.max(560, Math.round(H * a)) : 600; scene.W = W; B = A.Body(a ? ROOM : WIN, a ? Math.min(W - 150, 470) : 420, H); IN.x = a ? W - 134 : 470; IN.y = a ? 190 : 158; },
      tick: function (dt) { t += dt; },
      draw: function (c) {
        sc(c, W, H, '#11283C', '#0A1826', function () {
          var phase = t * 1.2, br = .5 - .5 * Math.cos(phase);
          B.draw(c, [['base', 1], ['muscle', mode === 'breath' ? .45 : 1]]);
          if (mode === 'breath') { B.scaled(c, 'lungs', 1 + .02 * br, 1 + .06 * br, 420, 340, .72); B.draw(c, [['airways', 1]]); }
          else B.draw(c, [['lungs', 1]]);
          B.draw(c, [['gut', mode === 'breath' ? .25 : .7], ['liver', mode === 'breath' ? .3 : 1], ['blood', mode === 'breath' ? .4 : 1]]);
          if (mode === 'breath') {
            B.glow(c, 'lungs', '255,255,255', .05 + .16 * br);
            /* the air: in through a nostril and down to the lungs, then out again */
            for (var a = 0; a < 7; a++) {
              var u = clamp(br * 1.15 - a * .05), p = B.to((a % 2 ? A.R.breathR : A.R.breath).at(u));   /* into both lungs */
              D.mol(c, 'air', p[0] + Math.sin(a * 2.1) * 3, p[1], a, 46, Math.min(1, u * 8));
            }
          } else {
            /* every living cell respires: small lights all over the body */
            SP.forEach(function (q) {
              var ph = (t * .5 + q.p) % 1, p = B.to([q.x, q.y]);
              A.spark(c, p[0], p[1], foc === 'every' ? 7 : 5, Math.sin(ph * Math.PI) * (foc === 'every' ? 1 : .75));
            });
            inset(c, foc === 'reactions' ? .6 : .32);
          }
        });
      },
      labels: function () {
        var it = [];
        if (mode === 'breath') {
          var l = B.to([548, 470]), nn = B.to([426, 172]);
          it.push({ id: 'lu', text: 'lungs', x: l[0], y: l[1], side: 'T' }, { id: 'air', text: 'air', x: nn[0], y: nn[1], side: 'T' });
        } else {
          it.push({ id: 'cell', text: 'one muscle cell', x: IN.x - 40, y: IN.y - IN.r + 14, side: 'T' });
          it.push({ id: 'mit', text: foc === 'enzymes' ? 'enzymes' : 'mitochondria', x: foc === 'enzymes' ? IN.x + 72 : IN.x + 46, y: foc === 'enzymes' ? IN.y - 16 : IN.y, side: 'T' });
        }
        return it;
      }
    };
    var V = RV({ scene: scene, fill: true, aria: 'A body with lights in its cells, and a close-up of one muscle cell. A button shows breathing instead: air moves into and out of the lungs.', barLabel: 'What to show',
      buttons: [['resp', 'Respiration'], ['breath', 'Breathing']], key: { all: [['spark', 'energy released in a cell']], sets: [['energy released in a cell'], []], now: function () { return mode === 'resp' ? ['energy released in a cell'] : []; } },
      onButton: function (id) { mode = id; foc = null; if (id === 'breath') ctx.pick('breathing', { stay: true }); sync(); } });
    function sync() { pressAll(V, ['resp', 'breath'], mode); V.names(); V.paint(); }
    return { el: V.el, tight: V.fig, start: function () { V.start(); sync(); }, stop: V.stop,
      say: 'Breathing moves air. Respiration releases energy inside every cell.',
      credit: BODY_CREDIT,
      focus: function (part) { foc = part || null; mode = part === 'breathing' ? 'breath' : 'resp'; sync(); } };
  });

  /* ======================================================================= 2. The uses of energy */
  var USES = [['muscle', 'Muscle contraction'], ['protein', 'Protein synthesis'], ['division', 'Cell division'], ['transport', 'Active transport'], ['growth', 'Growth'], ['impulse', 'Nerve impulses'], ['heat', 'Body temperature']];
  Views.add('uses', function (spec, ctx) {
    var W = 600, H = 400, t = 0, cur = 'muscle', X0 = 170, MX = 86, MY = 200, TX = { muscle: 214, protein: 330, division: 244, transport: 322, growth: 224, impulse: 212, heat: 300 };
    var BH = A.Body({ x0: 100, y0: 10, w: 640, h: 1200 }, 200, 372);
    /* the moments of cell division: one loop, which holds at the end and then fades */
    function divAt(tt) {
      var u = (tt * .13) % 1;
      return { u: u, k: ease(seg(u, .52, .78)), gone: seg(u, .12, .22), show: seg(u, .14, .22) * (1 - seg(u, .76, .84)), line: ease(seg(u, .22, .36)), apart: ease(seg(u, .4, .58)), form: seg(u, .74, .84), a: 1 - seg(u, .96, 1) };
    }
    function feed(c) {
      /* one cell: its cytoplasm fills the picture, its mitochondrion releases energy, which reaches the process */
      var bg = c.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#3C3524'); bg.addColorStop(1, '#2C2619');
      c.fillStyle = bg; c.fillRect(0, 0, W, H);
      D.mito(c, MX, MY, 128, 66, -.2, .3);
      for (var s = 0; s < 5; s++) {
        var u = (t * .42 + s / 5) % 1, x = lerp(MX + 40, TX[cur], u), y = MY - 8 + Math.sin(u * 5 + s) * 12;
        A.spark(c, x, y, 7, Math.min(1, Math.sin(u * Math.PI) * 1.6));
      }
    }
    var U = {
      muscle: function (c) { A.fibre(c, X0 + 34, 78, 374, 240, .5 - .5 * Math.cos(t * 2.1), { glow: .25, rows: 3, nuc: true }); },
      protein: function (c) {
        var cx = 400, cy = 214, n = 9, v0 = (t * .24) % 1, u = Math.min(.999, v0 / .9), m = Math.floor(u * n), fd = 1 - seg(v0, .95, 1);
        c.save(); c.globalAlpha = fd;
        var g = c.createLinearGradient(0, cy - 60, 0, cy + 60); g.addColorStop(0, '#9CB4E2'); g.addColorStop(1, '#4C659C'); c.fillStyle = g;
        c.beginPath(); c.ellipse(cx, cy - 22, 66, 44, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(224,234,250,.75)'; c.lineWidth = 1.2; c.stroke();
        c.beginPath(); c.ellipse(cx, cy + 34, 48, 28, 0, 0, TAU); c.fill(); c.stroke();
        var COL = ['#FF8A7F', '#FFD166', '#7EDB6B', '#6FA5FF', '#F48FB4', '#6FE0C6', '#FFB870', '#A5B4FC', '#FFE680'];
        for (var i = 0; i <= m; i++) {
          var x = cx - 6 - (m - i) * 26 - (u * n - m) * 26, y = cy - 4 + Math.sin((m - i) * .9 + t) * 4;
          c.fillStyle = COL[i % 9]; c.beginPath(); c.arc(x, y, 11, 0, TAU); c.fill(); c.strokeStyle = 'rgba(14,29,46,.6)'; c.lineWidth = 1; c.stroke();
          if (i < m) { c.strokeStyle = '#EDF2F7'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x + 11, y); c.lineTo(x + 15, y); c.stroke(); }
        }
        var f = ease((u * n) % 1), fx = lerp(560, cx + 4, f), fy = lerp(96, cy - 4, f);
        if (v0 < .9) { c.fillStyle = COL[(m + 1) % 9]; c.beginPath(); c.arc(fx, fy, 11, 0, TAU); c.fill(); c.strokeStyle = 'rgba(14,29,46,.6)'; c.lineWidth = 1; c.stroke(); }
        c.restore();
      },
      division: function (c) {
        /* one cell: the nucleus goes, the chromosomes line up and separate, the cell narrows, and two nuclei form (the Inheritance Lab teaches mitosis) */
        var D1 = divAt(t), cx = 392, cy = 200, k = D1.k, R = lerp(104, 84, k), sep = k * 86, neck = lerp(R, 3, Math.pow(k, 1.5)), top = [];
        c.save(); c.globalAlpha = D1.a;
        for (var i = 0; i <= 80; i++) {
          var x = -sep - R + (2 * sep + 2 * R) * i / 80, dl = Math.abs(x + sep), dr = Math.abs(x - sep);
          var hl = dl < R ? Math.sqrt(R * R - dl * dl) : 0, hr = dr < R ? Math.sqrt(R * R - dr * dr) : 0, hh = Math.max(hl, hr);
          if (Math.abs(x) < sep) hh = Math.max(hh, lerp(neck, hh, Math.pow(Math.abs(x) / Math.max(1, sep), 2)));
          top.push([cx + x, cy - hh]);
        }
        c.beginPath();
        top.forEach(function (p, n) { c[n ? 'lineTo' : 'moveTo'](p[0], p[1]); });
        for (var j = top.length - 1; j >= 0; j--) c.lineTo(top[j][0], 2 * cy - top[j][1]);
        c.closePath();
        var g = c.createRadialGradient(cx - 30, cy - 40, 10, cx, cy, 190); g.addColorStop(0, '#F4EBD3'); g.addColorStop(1, '#D8C49A');
        c.fillStyle = g; c.fill(); c.strokeStyle = C.memb; c.lineWidth = 2; c.stroke();
        function nucleus(nx, a) { if (a <= 0) return; c.save(); c.globalAlpha = a * D1.a; var ng = c.createRadialGradient(nx - 6, cy - 7, 1, nx, cy, 26); ng.addColorStop(0, C.nuc0); ng.addColorStop(1, C.nuc1); c.fillStyle = ng; c.beginPath(); c.arc(nx, cy, 26, 0, TAU); c.fill(); c.strokeStyle = C.nucLo; c.lineWidth = 1; c.stroke(); c.restore(); }
        nucleus(cx, 1 - D1.gone);
        nucleus(cx - sep * .94, D1.form); nucleus(cx + sep * .94, D1.form);
        /* four chromosomes */
        if (D1.show > 0) {
          c.save(); c.globalAlpha = D1.show * D1.a; c.strokeStyle = '#5B3FA0'; c.lineCap = 'round'; c.lineWidth = 6;
          [-27, -9, 9, 27].forEach(function (y0, n) {
            var sx = (n % 2 ? 1 : -1) * 12 * (1 - D1.line), sy = y0 * lerp(.72, 1, D1.line), lean = (n % 2 ? .5 : -.5) * (1 - D1.line);
            [-1, 1].forEach(function (sd) {
              var off = D1.apart > 0 ? sd * D1.apart * sep * .94 : sd * 3;
              var x0 = cx + sx + off;
              c.beginPath(); c.moveTo(x0 - 9 * Math.cos(lean), cy + sy - 9 * Math.sin(lean)); c.lineTo(x0 + 9 * Math.cos(lean), cy + sy + 9 * Math.sin(lean)); c.stroke();
            });
          });
          c.restore();
        }
        c.restore();
      },
      transport: function (c) {
        var mx = 392, y0 = 40, y1 = 360, cy = 200, k = (t * .34) % 1;
        c.fillStyle = 'rgba(70,118,158,.22)'; c.fillRect(X0 + 40, y0, mx - X0 - 40, y1 - y0);
        c.fillStyle = 'rgba(70,118,158,.5)'; c.fillRect(mx, y0, 552 - mx, y1 - y0);
        D.bilayer(c, mx, y0, cy - 66, 16); D.bilayer(c, mx, cy + 66, y1, 16);
        /* the carrier opens to the left, holds an ion, changes shape using energy, opens to the right */
        var op = ease(seg(k, .34, .54)) * (1 - ease(seg(k, .9, 1)));
        c.save(); c.translate(mx, cy); c.rotate(Math.PI / 2); D.carrier(c, 0, 0, 24, 1 - op, k > .3 && k < .56 ? 1 : 0); c.restore();
        [[244, 110], [288, 270]].forEach(function (q, i) { D.mol(c, 'mg', q[0] + wob(t, i, 3), q[1] + wob(t, i + 2, 3), 0, 92); });
        [[450, 92], [498, 140], [440, 300], [504, 232], [456, 262], [512, 322]].forEach(function (q, i) { D.mol(c, 'mg', q[0] + wob(t, i + 4, 3), q[1] + wob(t, i, 3), 0, 92); });
        var px = k < .26 ? lerp(292, mx - 16, ease(k / .26)) : k < .5 ? lerp(mx - 16, mx + 16, ease((k - .3) / .2)) : lerp(mx + 16, 482, ease(seg(k, .56, .86)));
        D.mol(c, 'mg', px, cy, 0, 92, k > .94 ? clamp((1 - k) / .06) : Math.min(1, k * 14));
        A.spark(c, mx, cy, 11, k > .28 && k < .54 ? Math.sin((k - .28) / .26 * Math.PI) : 0);
      },
      growth: function (c) {
        var v0 = (t * .12) % 1, u = Math.min(.999, v0 / .84), n = 2 + Math.floor(u * 6), cw = 58, ch = 54, x0 = 396 - 3 * cw - cw / 2, y = 200 - ch / 2, fd = 1 - seg(v0, .95, 1);
        c.save(); c.globalAlpha = fd;
        for (var i = 0; i < 7; i++) {
          if (i >= n) break;
          var g = i === n - 1 ? ease((u * 6) % 1) : 1, x = x0 + i * cw;
          var cgr = c.createLinearGradient(0, y, 0, y + ch); cgr.addColorStop(0, '#F4EBD3'); cgr.addColorStop(1, '#D8C49A');
          c.fillStyle = cgr; D.rr(c, x + 2 + cw * (1 - g) * .5, y + ch * (1 - g) * .5, (cw - 4) * g, ch * g, 8); c.fill();
          c.strokeStyle = C.memb; c.lineWidth = 1.4; c.stroke();
          c.fillStyle = C.nuc1; c.beginPath(); c.arc(x + cw / 2, y + ch / 2, 9 * g, 0, TAU); c.fill();
        }
        c.restore();
      },
      impulse: function (c) {
        var y = 200, a = 230, b = 566, u = (t * .42) % 1;
        var g0 = c.createRadialGradient(a - 8, y - 8, 3, a, y, 42); g0.addColorStop(0, '#FFE1A8'); g0.addColorStop(1, '#D08A3C');
        c.strokeStyle = '#D08A3C'; c.lineWidth = 5; c.lineCap = 'round';
        [[-1.1, 64], [-.5, 72], [2.5, 62], [3.4, 70], [.9, 60], [1.7, 66]].forEach(function (q) { c.beginPath(); c.moveTo(a, y); c.lineTo(a + Math.cos(q[0]) * q[1], y + Math.sin(q[0]) * q[1]); c.stroke(); });
        c.lineWidth = 9; c.beginPath(); c.moveTo(a, y); c.lineTo(b, y); c.stroke();
        c.fillStyle = g0; c.beginPath(); c.arc(a, y, 36, 0, TAU); c.fill(); c.fillStyle = C.nuc1; c.beginPath(); c.arc(a, y, 13, 0, TAU); c.fill();
        for (var i = 0; i < 6; i++) { var xx = a + 52 + i * 50; c.fillStyle = '#F2E8D0'; D.rr(c, xx, y - 11, 38, 22, 8); c.fill(); }
        var px = lerp(a + 34, b, u), pg = c.createRadialGradient(px, y, 2, px, y, 40); pg.addColorStop(0, 'rgba(255,240,150,.98)'); pg.addColorStop(.3, 'rgba(255,214,90,.6)'); pg.addColorStop(1, 'rgba(255,214,90,0)');
        c.fillStyle = pg; c.fillRect(px - 44, y - 44, 88, 88);
      },
      heat: function (c) {
        c.fillStyle = '#0E1D2E'; D.rr(c, X0 + 40, 8, 384, H - 16, 14); c.fill();
        c.save(); c.translate(396 - 100, 14);
        var a = .46 + .1 * Math.sin(t * 1.6);
        BH.draw(c, [['base', .9], ['muscle', .75], ['lungs', .65], ['liver', .9], ['blood', .55]]);
        BH.glow(c, 'muscle', '255,140,40', a); BH.glow(c, 'liver', '255,120,40', a); BH.glow(c, 'lungs', '255,160,60', a * .55);
        c.restore();
        for (var i = 0; i < 9; i++) {
          var u = (t * .26 + i / 9) % 1, sx = i % 2 ? 396 - 112 - u * 52 : 396 + 112 + u * 52, y0 = 60 + i * 30;
          c.strokeStyle = 'rgba(255,170,90,' + (Math.sin(u * Math.PI) * .9).toFixed(3) + ')'; c.lineWidth = 2.6; c.lineCap = 'round';
          c.beginPath();
          for (var k = 0; k <= 14; k++) { var x = sx + Math.sin(k * .9 + t * 3) * 3.2, y = y0 + k * 2.6 - u * 18; c[k ? 'lineTo' : 'moveTo'](x, y); }
          c.stroke();
        }
      }
    };
    var scene = { W: W, H: H, tick: function (dt) { t += dt; },
      draw: function (c) { sc(c, W, H, '#142A40', '#0E1D2E', function () { feed(c); U[cur](c); }); },
      labels: function () {
        var it = [{ id: 'mito', text: 'mitochondrion', x: MX + 22, y: MY - 30, side: 'T' }];
        var nm = { muscle: [['muscle cell', 300, 118, 'T']], protein: [['ribosome', 400, 186, 'T'], ['amino acids', Math.max(300, 394 - 234 * Math.min(.999, ((t * .24) % 1) / .9)), 212, 'B']], division: null, transport: [['protein carrier', 392, 172, 'T'], ['lower concentration', 244, 108, 'T'], ['higher concentration', 498, 138, 'T']], growth: [['new cells', 222 + (1 + Math.floor(Math.min(.999, ((t * .12) % 1) / .84) * 6)) * 58, 186, 'T']], impulse: [['neurone', 330, 200, 'T']], heat: [['heat released', 520, 110, 'T']] }[cur];
        if (cur === 'division') {
          var d = divAt(t), sep2 = d.k * 86;
          nm = d.show > .5 ? [['chromosomes', 392 + (d.apart > 0 ? d.apart * sep2 * .94 : 0), 200, 'B']] : d.form > .5 ? [['nucleus', 392 + sep2 * .94, 200, 'B']] : [['nucleus', 392, 200, 'B']];
        }
        nm.forEach(function (q, i) { it.push({ id: 'u' + i, text: q[0], x: q[1], y: q[2], side: q[3] }); });
        return it;
      } };
    var V = RV({ scene: scene, liveNames: true, aria: 'A mitochondrion in a cell releases energy, and a moving picture shows one use of that energy.', barLabel: 'The seven uses of energy', cls: 'memv--many',
      buttons: USES.map(function (u) { return [u[0], u[1]]; }),
      key: { all: [['spark', 'energy from respiration']], sets: [['energy from respiration']], now: function () { return ['energy from respiration']; } },
      onButton: function (id) { cur = id; ctx.pick(id, { stay: true }); sync(); } });
    function sync() { pressAll(V, USES.map(function (u) { return u[0]; }), cur); V.names(); V.paint(); }
    return { el: V.el, start: function () { V.start(); sync(); }, stop: V.stop,
      say: 'Press a use of energy to see it',
      credit: 'Drawn for this lab. The body: BodyParts3D, The Database Center for Life Science, CC BY-SA 2.1 JP.',
      focus: function (part) { if (part && U[part]) cur = part; sync(); } };
  });

  /* ======================================================================= 3. The equations */
  Views.add('equation', function (spec, ctx) {
    var W = 600, H = 390, t = 0, mode = 'word', runAt = 0;
    /* the atoms, for "Count the atoms": each starts in a reactant and ends in a product */
    var AT = (function () {
      var a = [], bonds = [], rnd = (function () { var s = 7; return function () { s = (s * 16807) % 2147483647; return (s % 1000) / 1000; }; })();
      /* glucose, atom by atom: a ring of five carbon atoms and one oxygen atom, with the sixth carbon as a side group.
         Every carbon has four bonds, every oxygen two, every hydrogen one: C6H12O6 */
      var start = [], gx = 118, gy = 196, i;
      function add(k, x, y) { start.push([k, x, y]); return start.length - 1; }
      function bond(p, q) { bonds.push(['s', p, q]); }
      function out(th, r) { return [gx + r * Math.cos(th), gy + r * Math.sin(th)]; }
      var ring = [];
      for (i = 0; i < 6; i++) { var pR = out(i / 6 * TAU - Math.PI / 2, 38); ring.push(add(i === 0 ? 'o' : 'c', pR[0], pR[1])); }
      for (i = 0; i < 6; i++) bond(ring[i], ring[(i + 1) % 6]);
      for (i = 1; i < 6; i++) {
        var th0 = i / 6 * TAU - Math.PI / 2, pH = out(th0 - .42, 62), iH = add('h', pH[0], pH[1]);
        bond(ring[i], iH);
        if (i < 5) {                                          /* a hydroxyl group: O and H */
          var pO = out(th0 + .3, 66), iO = add('o', pO[0], pO[1]), pH2 = out(th0 + .42, 90), iH2 = add('h', pH2[0], pH2[1]);
          bond(ring[i], iO); bond(iO, iH2);
        } else {                                              /* the side group: C with two H, O and H */
          var pC = out(th0 + .3, 68), iC2 = add('c', pC[0], pC[1]), h1 = add('h', pC[0] - 20, pC[1] - 12), h2 = add('h', pC[0] - 12, pC[1] + 20), oS = add('o', pC[0] + 6, pC[1] - 25), hS = add('h', pC[0] + 22, pC[1] - 38);
          bond(ring[i], iC2); bond(iC2, h1); bond(iC2, h2); bond(iC2, oS); bond(oS, hS);
        }
      }
      for (var j = 0; j < 6; j++) { var y = 70 + j * 51, x = 258, m = start.length; start.push(['o', x - 11, y], ['o', x + 11, y]); bonds.push(['s', m, m + 1]); }
      var endC = [], endO = [], endH = [], eb = [];
      for (var k = 0; k < 6; k++) { var yy = 70 + k * 51; endC.push([416, yy]); endO.push([394, yy], [438, yy], [526, yy - 5]); endH.push([508, yy + 10], [544, yy + 10]); }
      var iC = 0, iO = 0, iH = 0;
      start.forEach(function (q) {
        var e = q[0] === 'c' ? endC[iC++] : q[0] === 'o' ? endO[iO++] : endH[iH++];
        a.push({ k: q[0], sx: q[1], sy: q[2], ex: e[0], ey: e[1], px: 230 + rnd() * 140, py: 80 + rnd() * 230, d: rnd() * .3 });
      });
      /* the bonds of the products, by where the atoms end */
      function at(x, y) { for (var n = 0; n < a.length; n++) if (a[n].ex === x && a[n].ey === y) return n; return -1; }
      for (var q2 = 0; q2 < 6; q2++) { var Y = 70 + q2 * 51; eb.push([at(416, Y), at(394, Y)], [at(416, Y), at(438, Y)], [at(526, Y - 5), at(508, Y + 10)], [at(526, Y - 5), at(544, Y + 10)]); }
      return { a: a, bonds: bonds, eb: eb };
    })();
    var R = { c: 10, o: 10.4, h: 5.6 };
    function pos(q, u) {
      var A1 = ease(seg(u, .14, .4)), B1 = ease(seg(u, .56, .84));
      var x1 = lerp(q.sx, q.px, clamp(A1 * 1.2 - q.d * .2)), y1 = lerp(q.sy, q.py, clamp(A1 * 1.2 - q.d * .2));
      return [lerp(x1, q.ex, clamp(B1 * 1.2 - q.d * .2)), lerp(y1, q.ey, clamp(B1 * 1.2 - q.d * .2))];
    }
    function arrowAt(c, x, y) { D.arrow(c, x - 26, y, x + 26, y, 8, '#FFF3C4', { head: 15, headW: 12 }); }
    function board(c) {
      /* the equation's own numbers of molecules: 1 glucose, 6 oxygen, 6 carbon dioxide, 6 water */
      var y = H / 2 - 8, bob = function (i) { return Math.sin(t * 1.2 + i) * 2.5; };
      D.mol(c, 'glucose', 78, y + bob(1), .2, 112);
      plus(c, 150, y);
      for (var n = 0; n < 6; n++) D.mol(c, 'oxygen', 188 + (n % 2) * 46, y - 62 + (n >> 1) * 62 + bob(n), n, 84);
      arrowAt(c, 300, y);
      for (var m = 0; m < 6; m++) D.mol(c, 'co2', 372 + (m % 2) * 54, y - 62 + (m >> 1) * 62 + bob(m), 0, 84);
      plus(c, 462, y);
      for (var w = 0; w < 6; w++) D.mol(c, 'water', 504 + (w % 2) * 48, y - 62 + (w >> 1) * 62 + bob(w + 1), 0, 92);
    }
    var scene = {
      W: W, H: H,
      tick: function (dt) { t += dt; if (mode === 'atoms') runAt += dt; },
      draw: function (c) {
        sc(c, W, H, '#142A40', '#0E1D2E', function () {
          if (mode === 'where') {
            c.fillStyle = '#3C3524'; c.beginPath(); c.ellipse(W / 2, H / 2, 266, 172, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(232,214,170,.9)'; c.lineWidth = 2.6; c.stroke();
            var ng = c.createRadialGradient(W / 2 - 18, H / 2 - 20, 3, W / 2, H / 2, 58); ng.addColorStop(0, C.nuc0); ng.addColorStop(1, C.nuc1);
            c.fillStyle = ng; c.beginPath(); c.arc(W / 2, H / 2, 54, 0, TAU); c.fill(); c.strokeStyle = C.nucLo; c.lineWidth = 1.2; c.stroke();
            var MS = [[150, 138, .4], [214, 80, -.3], [404, 88, .3], [470, 150, -.4], [158, 256, -.3], [226, 316, .3], [392, 310, -.3], [468, 244, .4]];
            MS.forEach(function (q, i) { D.mito(c, q[0], q[1], 86, 40, q[2], .22 + .16 * Math.sin(t * 2 + i)); });
            for (var s = 0; s < 8; s++) { var ph = (t * .5 + s / 8) % 1; A.spark(c, MS[s][0], MS[s][1] - ph * 30, 6, Math.sin(ph * Math.PI)); }
            return;
          }
          if (mode === 'word' || mode === 'balanced') { board(c); return; }
          /* the atoms: together in the reactants, apart, then together in the products; each stage holds */
          var u = (runAt % 12) / 12, fade = seg(u, 0, .03) * (1 - seg(u, .97, 1));
          c.save(); c.globalAlpha = fade;
          arrowAt(c, 300, 28);
          /* a bracket over each whole side, for its name */
          [[seg(u, 0, .03) * (1 - seg(u, .12, .16)), 22, 284], [seg(u, .84, .88), 376, 566]].forEach(function (q) {
            if (q[0] <= 0) return;
            c.save(); c.globalAlpha = q[0] * fade; c.strokeStyle = 'rgba(255,244,196,.85)'; c.lineWidth = 1.6; c.beginPath();
            c.moveTo(q[1], 46); c.lineTo(q[1], 36); c.lineTo(q[2], 36); c.lineTo(q[2], 46); c.stroke(); c.restore();
          });
          var pts = AT.a.map(function (q) { return pos(q, u); });
          var bA = 1 - seg(u, .12, .2), bB = seg(u, .84, .92);
          c.lineCap = 'round'; c.lineWidth = 3;
          if (bA > 0) { c.strokeStyle = 'rgba(220,232,245,' + (.7 * bA * fade).toFixed(3) + ')'; AT.bonds.forEach(function (b) { c.beginPath(); c.moveTo(pts[b[1]][0], pts[b[1]][1]); c.lineTo(pts[b[2]][0], pts[b[2]][1]); c.stroke(); }); }
          if (bB > 0) { c.strokeStyle = 'rgba(220,232,245,' + (.7 * bB * fade).toFixed(3) + ')'; AT.eb.forEach(function (b) { c.beginPath(); c.moveTo(pts[b[0]][0], pts[b[0]][1]); c.lineTo(pts[b[1]][0], pts[b[1]][1]); c.stroke(); }); }
          AT.a.forEach(function (q, i) { var w2 = u > .4 && u < .56 ? 1.4 : 0; D.ball(c, pts[i][0] + wob(t, i, w2), pts[i][1] + wob(t, i + 4, w2), R[q.k], C[q.k]); });
          c.restore();
        });
      },
      labels: function () {
        if (mode === 'where') return [{ id: 'm', text: 'mitochondria', x: 214, y: 66, side: 'T' }, { id: 'c', text: 'cytoplasm', x: 86, y: 196, side: 'B' }, { id: 'n', text: 'nucleus', x: 300, y: 170, side: 'T' }];
        if (mode === 'atoms') {
          var uu = (runAt % 12) / 12, its = [];
          if (uu < .14) its.push({ id: 'r', text: 'reactants', x: 153, y: 36, side: 'T' });
          if (uu > .84) its.push({ id: 'p', text: 'products', x: 471, y: 36, side: 'T' });
          return its;
        }
        var y = H / 2 + 54;
        return [{ id: 'gl', text: 'glucose', x: 78, y: H / 2 + 26, side: 'B' }, { id: 'ox', text: 'oxygen', x: 234, y: y, side: 'B' }, { id: 'co', text: 'carbon dioxide', x: 426, y: y, side: 'B' }, { id: 'wa', text: 'water', x: 552, y: y, side: 'B' }];
      },
      read: function (pill) {
        if (mode === 'where') { pill('e', 'in the mitochondria', 'ok', 'Where:'); pill('n', 'have many mitochondria, for more aerobic respiration', '', 'Muscle cells:'); return; }
        if (mode === 'word') pill('e', 'glucose + oxygen → carbon dioxide + water', 'ok', 'Word equation:');
        else pill('e', 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O', 'ok', 'Balanced equation:');
        if (mode === 'word') pill('n', 'Energy is released, but it is not a substance', '', 'Note:');
        else pill('n', '6 carbon, 12 hydrogen, 18 oxygen atoms', 'ok', 'Each side:');
      }
    };
    var V = RV({ scene: scene, liveNames: true, aria: 'The equation for aerobic respiration, drawn with its molecules. One button counts the atoms on each side.', barLabel: 'What to show',
      buttons: [['word', 'Word equation'], ['balanced', 'Balanced equation'], ['atoms', 'Count the atoms'], ['where', 'Where it happens']],
      read: [['e', 'Word equation:'], ['n', 'Note:']],
      key: { all: [['glucose', 'glucose'], ['oxygen', 'oxygen'], ['co2', 'carbon dioxide'], ['water', 'water'], ['spark', 'energy released']], sets: [['glucose', 'oxygen', 'carbon dioxide', 'water'], ['energy released'], []], now: function () { return mode === 'where' ? ['energy released'] : mode === 'atoms' ? [] : ['glucose', 'oxygen', 'carbon dioxide', 'water']; } },
      onButton: function (id) { mode = id; runAt = 0; if (id === 'word' || id === 'balanced' || id === 'where') ctx.pick(id, { stay: true }); sync(); } });
    var atomKey = document.createElement('p'); atomKey.className = 'rsv-note'; atomKey.innerHTML = '<span style="color:#76839C">●</span> carbon &nbsp; <span style="color:#E6EEF5;-webkit-text-stroke:.6px #51667A">●</span> hydrogen (small) &nbsp; <span style="color:#FF7468">●</span> oxygen'; atomKey.hidden = true;
    /* the key of the atoms lies on the picture: under it, it would need a row the column does not have */
    atomKey.classList.add('rsv-note--on'); V.fig.style.position = 'relative'; V.fig.appendChild(atomKey);
    function sync() { pressAll(V, ['word', 'balanced', 'atoms', 'where'], mode); atomKey.hidden = mode !== 'atoms'; if (V.isStill() && mode === 'atoms') runAt = 11; V.names(); V.paint(); }
    return { el: V.el, start: function () { V.start(); sync(); }, stop: V.stop,
      say: 'Glucose and oxygen react: carbon dioxide and water are formed',
      credit: 'Molecules drawn for this lab.',
      focus: function (part) { if (part === 'word' || part === 'def') mode = 'word'; else if (part === 'balanced') mode = 'balanced'; else if (part === 'where') mode = 'where'; runAt = 0; sync(); } };
  });

  /* ======================================================================= 4. From food and air to the cell */
  Views.add('routes', function (spec, ctx) {
    var W = 560, H = 640, t = 0, cur = 'glucose', WIN = { x0: 70, y0: 8, w: 700, h: 880 }, ROOM = { x0: 70, y0: -36, w: 700, h: 924 }, B = A.Body(WIN, W, H);
    /* oxygen rides on red blood cells from the lungs on: the part of its route before the lungs is air */
    var LUNG_AT = A.R.oxygen.marks.lung;
    var INFO = {
      glucose: { rt: [A.R.glucose], mol: 'glucose', u: 34, glow: ['gut', '255,206,120'], names: [['small intestine', 452, 846, 'B'], ['plasma', 404, 690, 'B'], ['muscle cells', 180, 500, 'T']] },
      oxygen: { rt: [A.R.oxygen], mol: 'oxygen', u: 34, glow: ['lungs', '180,220,255'], names: [['alveoli in the lungs', 282, 576, 'B'], ['muscle cells', 180, 560, 'B']] },
      co2: { rt: [A.R.co2], mol: 'co2', u: 36, glow: ['lungs', '190,200,220'], names: [['muscle cells', 180, 560, 'B'], ['plasma', 330, 376, 'T'], ['breathed out', 426, 172, 'T']] },
      water: { rt: [A.R.sweat, A.R.breathOut, A.R.urine], mol: 'water', u: 44, glow: ['kidneys', '150,200,255'], names: [['sweat', 118, 586, 'T'], ['expired air', 426, 172, 'T'], ['kidney (forms urine)', 486, 692, 'B']] }
    };
    function rbcAt(i, n) { return ((t * .08 + i / n) % 1); }
    var scene = {
      W: W, H: H, tick: function (dt) { t += dt; },
      fit: function (a) { W = a ? Math.max(460, Math.round(H * a)) : 560; scene.W = W; B = A.Body(a ? ROOM : WIN, W, H); },
      draw: function (c) {
        var I = INFO[cur];
        sc(c, W, H, '#11283C', '#0A1826', function () {
          B.draw(c, [['base', 1], ['muscle', .8], ['lungs', .62]]);
          B.glow(c, I.glow[0], I.glow[1], .1 + .08 * Math.sin(t * 2));
          B.draw(c, [['pulmA', 1], ['pulmV', 1], ['airways', .9], ['gut', cur === 'glucose' ? 1 : .55], ['kidneys', cur === 'water' ? 1 : .35], ['liver', .85], ['blood', 1]]);
          B.tubes(c, 1);
          I.rt.forEach(function (r, ri) {
            c.save(); c.strokeStyle = 'rgba(255,244,196,.5)'; c.lineWidth = 2; c.setLineDash([5, 6]); c.beginPath();
            r.P.forEach(function (p, i) { var s = B.to(p); c[i ? 'lineTo' : 'moveTo'](s[0], s[1]); }); c.stroke(); c.restore();
            var n = Math.max(4, Math.round(r.len / 90));
            for (var i = 0; i < n; i++) {
              var u = (t * (cur === 'water' ? .16 : .08) + i / n + ri * .13) % 1, p = B.to(r.at(u)), al = Math.min(1, Math.min(u, 1 - u) * 12);
              if (cur === 'oxygen' && u > LUNG_AT) {
                A.rbc(c, p[0], p[1], 13, i, al);
              }
              D.mol(c, I.mol, p[0], p[1], i, I.u, al);
            }
          });
        });
      },
      labels: function () {
        var it = INFO[cur].names.map(function (q, i) { var p = B.to([q[1], q[2]]); return { id: 'n' + i, text: q[0], x: p[0], y: p[1], side: q[3] }; });
        if (cur === 'oxygen') {
          /* the name stays on one red blood cell, and moves with it */
          var r = A.R.oxygen, n = Math.max(4, Math.round(r.len / 90)), pick = null;
          for (var i = 0; i < n; i++) { var u = rbcAt(i, n); if (u > .74 && u < .94) { pick = u; break; } }
          if (pick != null) { var p = B.to(r.at(pick)); it.push({ id: 'hb', text: 'haemoglobin', x: p[0], y: p[1], side: 'T' }); }
        }
        return it;
      },
      read: function (pill) {
        pill('r', { glucose: 'small intestine → plasma → every cell', oxygen: 'alveoli → haemoglobin → every cell', co2: 'cells → plasma → lungs → breathed out', water: 'stays in the body, or leaves in urine, sweat and expired air' }[cur], 'ok');
      }
    };
    var V = RV({ scene: scene, fill: true, aria: 'The body, with one substance moving along its route.', barLabel: 'Choose a substance', liveNames: true,
      buttons: [['glucose', 'Glucose'], ['oxygen', 'Oxygen'], ['co2', 'Carbon dioxide'], ['water', 'Water']], read: [['r', 'Route:']],
      onButton: function (id) { cur = id; ctx.pick(id, { stay: true }); sync(); } });
    function sync() { pressAll(V, ['glucose', 'oxygen', 'co2', 'water'], cur); V.names(); V.paint(); }
    return { el: V.el, tight: V.fig, start: function () { V.start(); sync(); }, stop: V.stop,
      say: 'Press a substance and follow it through the body',
      credit: BODY_CREDIT + ' The vessels of the arms and of the liver are drawn for this lab.',
      focus: function (part) { if (part && INFO[part]) cur = part; sync(); } };
  });

  /* ======================================================================= 5. Seeds that respire */
  Views.add('flasks', function (spec, ctx) {
    var W = 600, H = 460, run = 0, on = false, END = 16;
    var FL = [{ x: 170, living: true, name: 'germinating seeds' }, { x: 430, living: false, name: 'boiled seeds' }];
    FL.forEach(function (f, n) {
      var r = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s % 1000) / 1000; }; })(n + 11), S = [];
      for (var i = 0; i < 46; i++) S.push({ x: f.x - 52 + r() * 104, y: 386 - r() * 104, r: 7 + r() * 3, a: r() * 3, root: r() > .5 });
      f.seeds = S;
    });
    function rise() { return clamp(run / (END - 2)); }
    function drawRoots(c, f) {
      /* the roots of the germinating seeds lengthen over the two days */
      var g = rise();
      c.save(); c.strokeStyle = '#F7F3DF'; c.lineWidth = 1.8; c.lineCap = 'round';
      f.seeds.forEach(function (q, i) { if (!q.root) return; var L = 6 + 15 * g * (.6 + (i % 3) * .2), a = q.a + 1; c.beginPath(); c.moveTo(q.x, q.y); c.quadraticCurveTo(q.x + Math.cos(a) * L * .6, q.y + Math.sin(a) * L * .6 + 3, q.x + Math.cos(a) * L, q.y + Math.abs(Math.sin(a)) * L); c.stroke(); });
      c.restore();
    }
    var scene = {
      W: W, H: H,
      tick: function (dt) { if (on) run = Math.min(run + dt, END); },
      draw: function (c) {
        sc(c, W, H, '#142A40', '#0E1D2E', function () {
          /* two days pass: the room darkens and brightens twice */
          c.fillStyle = '#2C4152'; c.fillRect(0, H - 34, W, 34); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(0, H - 34, W, 2);
          FL.forEach(function (f) {
            A.flask(c, f.x, 74, 164, H - 74 - 34, f.seeds, f.living);
            if (f.living) { c.save(); D.rr(c, f.x - 82 + 14, 109, 164 - 28, H - 74 - 34 - 48, 13); c.clip(); drawRoots(c, f); c.restore(); }
            A.thermometer(c, f.x + 16, 18, 310, f.living ? .14 + .68 * ease(rise()) : .14);
            if (f.living && on) for (var s = 0; s < 14; s++) {
              var ph = (run * .5 + s / 14) % 1, q = f.seeds[s * 3];
              A.spark(c, q.x, q.y - ph * 26, 4 + (s % 3), Math.sin(ph * Math.PI) * clamp(run / 1.2) * (run >= END ? .6 : 1));
            }
            if (f.living && run > .6) {
              var a = clamp((run - .6) / 2) * .28;
              c.save(); c.globalCompositeOperation = 'lighter';
              var rg = c.createRadialGradient(f.x, 340, 8, f.x, 340, 90); rg.addColorStop(0, 'rgba(255,150,60,' + a.toFixed(3) + ')'); rg.addColorStop(1, 'rgba(255,150,60,0)');
              c.fillStyle = rg; c.fillRect(f.x - 74, 240, 148, 186); c.restore();
            }
          });
          if (on && run < END) { var d = Math.sin(run / END * TAU * 2 - Math.PI / 2) * .5 + .5; c.fillStyle = 'rgba(2,6,14,' + (d * .3).toFixed(3) + ')'; c.fillRect(0, 0, W, H); }
        });
      },
      labels: function () {
        var it = FL.map(function (f, i) { return { id: 'f' + i, text: f.name, x: f.x - 34, y: 360, side: 'B' }; });
        it.push({ id: 'th', text: 'thermometer', x: FL[0].x + 16, y: 28, side: 'T' }, { id: 'vf', text: 'vacuum flask', x: FL[1].x + 68, y: 180, side: 'T' });
        return it;
      },
      read: function (pill) {
        pill('a', !on ? 'Press Leave the flasks for two days' : rise() < 1 ? 'temperature increases' : 'temperature has increased', on ? 'warn' : '');
        pill('b', on ? 'temperature does not change' : 'Press Leave the flasks for two days', on ? 'ok' : '');
      }
    };
    var V = RV({ scene: scene, aria: 'Two vacuum flasks with thermometers, one holding germinating seeds and one holding boiled seeds. The temperature rises only in the flask of germinating seeds.', barLabel: 'The investigation',
      buttons: [['go', 'Leave the flasks for two days'], ['reset', 'Start again']],
      read: [['a', 'Germinating seeds:'], ['b', 'Boiled seeds:']],
      key: { all: [['spark', 'energy released as heat']], sets: [['energy released as heat'], []], now: function () { return on ? ['energy released as heat'] : []; } },
      onButton: function (id) { if (id === 'go') { on = true; if (V.isStill()) run = END; ctx.pick('heat', { stay: true }); } else { on = false; run = 0; } sync(); } });
    function sync() { V.button('go').disabled = on; V.names(); V.paint(); }
    return { el: V.el, start: function () { V.start(); sync(); }, stop: V.stop,
      say: 'Compare the height of the red liquid in the two thermometers',
      credit: 'Drawn for this lab.',
      focus: function (part) { if (part === 'heat' || part === 'boiled') { if (!on) on = true; if (V.isStill()) run = END; } sync(); } };
  });

  /* ======================================================================= 6. Temperature and yeast
     True outcome (0610 practicals; memory bench-sims-show-the-truth): fastest near the optimum, slow when cold, no change when the
     enzymes are denatured. The clock has no numbers, and the four temperatures are not those of his sheet. */
  Views.add('yeastbench', function (spec, ctx) {
    var W = 600, H = 410, run = 0, on = false, foc = null;
    var T = [{ t: 5, tau: 44 }, { t: 20, tau: 19 }, { t: 35, tau: 7.4 }, { t: 65, tau: 1e9 }];
    function k(q) { return clamp((run - 1) / q.tau); }
    var scene = {
      W: W, H: H,
      tick: function (dt) { if (on) run = Math.min(run + dt * 1.6, 50); },
      draw: function (c) {
        sc(c, W, H, '#142A40', '#0E1D2E', function () {
          c.fillStyle = '#2C4152'; c.fillRect(0, H - 32, W, 32);
          T.forEach(function (q, i) {
            var x = 86 + i * 142, by = 110, bw = 106, bh = H - 32 - by;
            /* a water bath: the water looks the same at every temperature */
            var bk = { x: x - bw / 2, y: by, w: bw, h: bh, level: .9, liquid0: 'rgba(196,216,228,.34)', liquid1: 'rgba(150,180,198,.5)', surface: 'rgba(224,240,248,.5)' };
            D.beaker(c, bk);
            var f = on ? k(q) : 0, sinkT = clamp(run / .35), sinkB = clamp((run - .25) / .8);
            var CT = '#EAD9A8', CB = '#CDB57E', BL = '#2B72C8', BD = '#1E4F9A';
            var body = on ? [blend(CT, BL, f, sinkT), blend(CB, BD, f, sinkB)] : [CT, CB];
            /* a thin blue layer stays at the surface, where air reaches the dye */
            A.tube(c, x, 92, 40, 216, on && f > .4 && q.t < 60 ? '#3F8CD6' : null, body);
            D.beakerGlass(c, bk);
            if ((q.t === 35 && foc === 'optimum') || (q.t === 65 && foc === 'above')) A.ringAt(c, x, 188, 66, 1);
            if (foc === 'rise' && q.t < 35) A.ringAt(c, x, 188, 62, .8);
          });
        });
      },
      labels: function () {
        return T.map(function (q, i) { return { id: 'q' + i, text: q.t + ' °C', x: 86 + i * 142, y: 92, side: 'T' }; })
          .concat([{ id: 'tube', text: on ? 'yeast with methylene blue' : 'yeast suspension', x: 86, y: 262, side: 'B' }, { id: 'bath', text: 'water bath', x: 228 + 46, y: 340, side: 'B' }]);
      },
      read: function (pill) {
        var st = !on ? 'Press Add the dye' : k(T[2]) < 1 ? 'Watch the four tubes' : k(T[1]) < 1 ? 'The tube at 35 °C is now colourless' : k(T[0]) < 1 ? 'The tube at 20 °C has changed too' : 'At 65 °C the blue colour stays';
        pill('s', st, on ? 'ok' : '');
      }
    };
    /* the pale yeast, with the blue dye in it as far as the dye has sunk (s) and not yet changed by the yeast (f) */
    function blend(pale, blue, f, s) {
      var P = function (h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }, a = P(pale), b = P(blue), m = s * (1 - f);
      return 'rgb(' + Math.round(lerp(a[0], b[0], m)) + ',' + Math.round(lerp(a[1], b[1], m)) + ',' + Math.round(lerp(a[2], b[2], m)) + ')';
    }
    var V = RV({ scene: scene, aria: 'Four test-tubes of yeast with methylene blue, in water baths at 5, 20, 35 and 65 degrees Celsius. The blue colour disappears first at 35 degrees, more slowly at 20 and 5 degrees, and it stays at 65 degrees.', barLabel: 'The bench',
      buttons: [['go', 'Add the dye'], ['reset', 'Start again']], read: [['s', 'What you see:']],
      onButton: function (id) { if (id === 'go') { on = true; if (V.isStill()) run = 50; ctx.pick('dye', { stay: true }); } else { on = false; run = 0; } sync(); } });
    function sync() { V.button('go').disabled = on; V.names(); V.paint(); }
    return { el: V.el, start: function () { V.start(); sync(); }, stop: V.stop,
      say: 'Compare how soon the blue colour disappears at each temperature',
      credit: 'Drawn for this lab.',
      focus: function (part) { foc = part || null; if (part === 'dye' || part === 'rise' || part === 'optimum' || part === 'above') { if (!on) on = true; if (V.isStill()) run = 50; } sync(); } };
  });

  /* ======================================================================= 7. Anaerobic respiration */
  Views.add('anaerobic', function (spec, ctx) {
    var W = 600, H = 380, t = 0, mode = 'muscle', since = 0, V = null;
    function bob(i) { return Math.sin(t * 1.3 + i) * 2.5; }
    var scene = {
      W: W, H: H, tick: function (dt) { t += dt; since += dt; },
      draw: function (c) {
        sc(c, W, H, '#142A40', '#0E1D2E', function () {
          var y = H / 2 - 18;
          if (mode === 'energy') {
            var x = 138, w = 416, k = V && V.isStill() ? 1 : ease(clamp(since / 2.4));
            c.font = '600 17px Inter, sans-serif'; c.fillStyle = '#E8EEF4'; c.textBaseline = 'middle';
            c.fillText('aerobic', 26, 132); c.fillText('anaerobic', 26, 234);
            c.fillStyle = 'rgba(255,255,255,.1)'; D.rr(c, x, 110, w, 44, 8); c.fill(); D.rr(c, x, 212, w, 44, 8); c.fill();
            c.fillStyle = '#FFE680'; D.rr(c, x, 110, Math.max(4, w * k), 44, 8); c.fill(); D.rr(c, x, 212, Math.max(4, w * k * 2 / 30), 44, 4); c.fill();
            for (var s = 0; s < 12; s++) { var ph = (t * .5 + s / 12) % 1; A.spark(c, x + 12 + (w - 24) * (s / 11) * k, 102 - ph * 30, 6, Math.sin(ph * Math.PI)); }
            for (var a = 0; a < 2; a++) { var p2 = (t * .5 + a / 2) % 1; A.spark(c, x + 8 + a * 10, 204 - p2 * 30, 6, Math.sin(p2 * Math.PI)); }
            return;
          }
          if (mode === 'where') {
            A.fibre(c, 34, 44, W - 68, H - 88, 0, { rows: 3, nuc: true, glow: 0 });
            c.fillStyle = 'rgba(14,29,46,.46)'; c.fillRect(34, 44, W - 68, H - 88);
            D.rr(c, W / 2 - 150, H / 2 - 54, 300, 108, 16); c.fillStyle = 'rgba(38,26,18,.95)'; c.fill(); c.strokeStyle = 'rgba(255,214,150,.85)'; c.lineWidth = 1.6; c.stroke();
            D.mol(c, 'glucose', W / 2 - 84, H / 2 + bob(1), .2, 74);
            D.arrow(c, W / 2 - 34, H / 2, W / 2 + 18, H / 2, 7, '#FFF3C4', { head: 13, headW: 10 });
            D.mol(c, 'lactic', W / 2 + 52, H / 2 - 8 + bob(2), 0, 80); D.mol(c, 'lactic', W / 2 + 104, H / 2 + 8 + bob(3), .6, 80);
            return;
          }
          var yeast = mode === 'yeast' || mode === 'balanced';
          D.mol(c, 'glucose', 84, y + bob(1), .2, 110);
          D.arrow(c, 170, y, 246, y, 9, '#FFF3C4', { head: 17, headW: 13 });
          if (yeast) {
            D.mol(c, 'ethanol', 318, y - 44 + bob(2), .2, 96); D.mol(c, 'ethanol', 318, y + 44 + bob(3), -.3, 96);
            plus(c, 396, y);
            D.mol(c, 'co2', 470, y - 44 + bob(4), .2, 82); D.mol(c, 'co2', 470, y + 44 + bob(5), -.3, 82);
          } else {
            D.mol(c, 'lactic', 340, y - 44 + bob(2), .2, 104); D.mol(c, 'lactic', 340, y + 44 + bob(3), -.3, 104);
          }
        });
      },
      labels: function () {
        var y = H / 2 + 36;
        if (mode === 'energy') return [];
        if (mode === 'where') return [{ id: 'c', text: 'cytoplasm', x: W / 2 - 130, y: H / 2 + 40, side: 'B' }, { id: 'm', text: 'mitochondrion', x: 66, y: 66, side: 'T' }];
        if (mode === 'muscle') return [{ id: 'g', text: 'glucose', x: 84, y: y - 34, side: 'B' }, { id: 'l', text: 'lactic acid', x: 340, y: y, side: 'B' }];
        return [{ id: 'g', text: 'glucose', x: 84, y: y - 34, side: 'B' }, { id: 'e', text: 'alcohol (ethanol)', x: 318, y: y, side: 'B' }, { id: 'c', text: 'carbon dioxide', x: 470, y: y, side: 'B' }];
      },
      read: function (pill) {
        var e = { muscle: 'glucose → lactic acid', yeast: 'glucose → alcohol + carbon dioxide', balanced: 'C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂', energy: 'much less energy per glucose molecule', where: 'in the cytoplasm, not in the mitochondria' }[mode];
        pill('e', e, 'ok', { muscle: 'In muscles:', yeast: 'In yeast:', balanced: 'In yeast:', energy: 'Anaerobic:', where: 'Where:' }[mode]);
      }
    };
    V = RV({ scene: scene, aria: 'The word equations for anaerobic respiration in muscles and in yeast, and a bar that compares the energy from one glucose molecule.', barLabel: 'What to show',
      buttons: [['muscle', 'In muscles'], ['yeast', 'In yeast'], ['balanced', 'Balanced equation'], ['energy', 'Energy released'], ['where', 'Where it happens']], read: [['e', 'In muscles:']],
      key: { all: [['glucose', 'glucose'], ['lactic', 'lactic acid'], ['ethanol', 'alcohol'], ['co2', 'carbon dioxide'], ['spark', 'energy released']],
             sets: [['glucose', 'lactic acid'], ['glucose', 'alcohol', 'carbon dioxide'], ['energy released']],
             now: function () { return mode === 'muscle' || mode === 'where' ? ['glucose', 'lactic acid'] : mode === 'energy' ? ['energy released'] : ['glucose', 'alcohol', 'carbon dioxide']; } },
      onButton: function (id) { mode = id; since = 0; var map = { muscle: 'muscle', yeast: 'yeast', balanced: 'balanced', energy: 'less', where: 'where' }; ctx.pick(map[id], { stay: true }); sync(); } });
    function sync() { pressAll(V, ['muscle', 'yeast', 'balanced', 'energy', 'where'], mode); V.names(); V.paint(); }
    return { el: V.el, start: function () { V.start(); sync(); }, stop: V.stop,
      say: 'Muscles form lactic acid. Yeast forms alcohol and carbon dioxide.',
      credit: 'Molecules drawn for this lab.',
      focus: function (part) { var map = { def: 'muscle', less: 'energy', yeast: 'yeast', muscle: 'muscle', balanced: 'balanced', where: 'where' }; if (part && map[part] && map[part] !== mode) { mode = map[part]; since = 0; } sync(); } };
  });

  /* ======================================================================= 8. The oxygen debt: rest, exercise, after
     Nothing here is a measurement (his breathing-rate practical is assessed). */
  Views.add('debtbody', function (spec, ctx) {
    var W = 560, H = 560, WIN = { x0: 70, y0: 8, w: 700, h: 720 }, ROOM = { x0: 70, y0: -36, w: 700, h: 764 }, B = A.Body(WIN, W, H), state = 'rest', t = 0, g = 0, ph = 0, bph = 0, N = 16, V = null, nextAt = 0;
    var DOTS = (function () {
      var o = [], s = 9;
      function r() { s = (s * 16807) % 2147483647; return (s % 1000) / 1000; }
      for (var i = 0; i < N; i++) { var right = i % 2 === 0; var arm = [(right ? 660 : 182) + (r() - .5) * 26, 440 + r() * 150]; o.push({ right: right, arm: arm, u0: (right ? A.R.lacticR : A.R.lacticL).near(arm, .28), liver: [304 + r() * 62, 596 + r() * 70], u: 0, on: false, gone: false, sp: .8 + r() * .5 }); }
      return o;
    })();
    function left() { return DOTS.filter(function (q) { return q.on && !q.gone; }).length; }
    function reset() { DOTS.forEach(function (q) { q.u = 0; q.on = false; q.gone = false; }); }
    function step(dt) {
      t += dt;
      /* the heart and the breathing stay fast while lactic acid remains (12.3.7) */
      var target = state === 'exercise' || left() ? 1 : 0;
      g += (target - g) * clamp(dt * 1.4);
      ph += (1 + 1.5 * g) * dt; bph += (.24 + .4 * g) * dt;
      if (state === 'exercise') {
        if (t >= nextAt) { var nx = DOTS.filter(function (q) { return !q.on; })[0]; if (nx) nx.on = true; nextAt = t + .55; }
        DOTS.forEach(function (q) { if (q.on && q.u < .18) q.u = Math.min(.18, q.u + dt * .05); });
      } else {
        DOTS.forEach(function (q, i) {
          if (!q.on || q.gone) return;
          q.u += dt * .13 * q.sp;
          if (q.u >= 1.4 + i * .05) q.gone = true;
        });
      }
    }
    function posOf(q) {
      if (q.u <= .02) return q.arm;
      var rt = q.right ? A.R.lacticR : A.R.lacticL;
      if (q.u < 1) { var near = seg(q.u, .97, 1), p = rt.at(lerp(q.u0, 1, q.u)); return [lerp(p[0], q.liver[0], near), lerp(p[1], q.liver[1], near)]; }
      return q.liver;
    }
    function settle(id) {
      /* with Reduce motion a press shows at once the state the moving picture reaches */
      if (!V || !V.isStill()) return;
      if (id === 'exercise') { DOTS.forEach(function (q) { q.on = true; q.u = .1; q.gone = false; }); g = 1; }
      else if (id === 'after') { DOTS.forEach(function (q) { if (q.on) q.u = 1; }); g = 1; }
      else { reset(); g = 0; }
    }
    var scene = {
      W: W, H: H, tick: step,
      fit: function (a) { W = a ? Math.max(460, Math.round(H * a)) : 560; scene.W = W; B = A.Body(a ? ROOM : WIN, W, H); },
      draw: function (c) {
        var pulse = Math.pow(Math.max(0, Math.sin(ph * TAU)), 2), br = .5 - .5 * Math.cos(bph * TAU), depth = lerp(.18, 1, g) * br, frac = left() / N;
        sc(c, W, H, '#10263A', '#0A1826', function () {
          B.draw(c, [['base', 1], ['muscle', 1]]);
          if (state === 'exercise') B.glow(c, 'muscle', '255,170,80', .08 + .16 * (.5 + .5 * Math.sin(t * 7)));
          B.glow(c, 'muscle', '255,92,150', .22 * frac * (state === 'exercise' ? 1 : .55));
          B.scaled(c, 'lungs', 1 + .02 * depth, 1 + .06 * depth, 420, 340, .72); B.glow(c, 'lungs', '255,255,255', .03 + .1 * depth);
          B.draw(c, [['pulmA', .95], ['pulmV', .95], ['airways', .88], ['gut', .55], ['liver', 1], ['blood', 1]]);
          B.tubes(c, 1);
          if (DOTS.some(function (q) { return q.on && !q.gone && q.u >= 1; })) B.glow(c, 'liver', '255,214,120', .14 + .16 * (.5 + .5 * Math.sin(t * 3)));
          var s = 1 + .05 * pulse * lerp(.6, 1, g); B.scaled(c, 'heart', s, s, 445, 493, 1);
          DOTS.forEach(function (q, i) {
            if (!q.on || q.gone) return;
            var p = B.to(posOf(q)), fd = q.u >= 1.25 + i * .05 ? clamp((1.4 + i * .05 - q.u) / .15) : 1;
            D.mol(c, 'lactic', p[0], p[1], i * .7, 27, fd);
            if (q.u >= 1.25 + i * .05) A.spark(c, p[0], p[1] - 10, 8, Math.sin((1 - fd) * Math.PI));
          });
          if (state !== 'exercise' && frac > 0) for (var o = 0; o < 6; o++) {
            /* oxygen: air as far as the alveoli, then on a red blood cell to the liver */
            var pu = (t * .16 + o / 6) % 1, inAir = pu < .42, ps = B.to(inAir ? (o % 2 ? A.R.breathR : A.R.breath).at(pu / .42) : (o % 2 ? A.R.lungToLiverR : A.R.lungToLiver).at((pu - .42) / .58)), oal = Math.min(1, Math.min(pu, 1 - pu) * 10);
            if (!inAir) A.rbc(c, ps[0], ps[1], 11, o, oal);
            D.mol(c, 'oxygen', ps[0], ps[1], o, 26, oal);
          }
        });
      },
      labels: function () {
        var mp = B.to([218, 430]), lp = B.to([304, 628]), hp = B.to([498, 505]);
        return [{ id: 'mus', text: 'muscles', x: mp[0], y: mp[1], side: 'T' }, { id: 'h', text: 'heart', x: hp[0], y: hp[1], side: 'T' }, { id: 'liv', text: 'liver', x: lp[0], y: lp[1], side: 'B' }];
      },
      read: function (pill) {
        var l = left() > 0, fast = state === 'exercise' || l;
        pill('h', fast ? (state === 'exercise' ? 'fast' : 'still fast') : g > .08 ? 'decreasing' : 'resting', fast ? 'warn' : 'ok');
        pill('b', fast ? (state === 'exercise' ? 'deeper and faster' : 'still deeper and faster') : g > .08 ? 'decreasing' : 'resting', fast ? 'warn' : 'ok');
        pill('s', state === 'exercise' ? 'lactic acid builds up' : l ? 'the blood carries lactic acid to the liver' : DOTS.some(function (q) { return q.gone; }) ? 'the oxygen debt has been removed' : 'enough oxygen for aerobic respiration', state === 'exercise' ? 'warn' : 'ok');
      }
    };
    V = RV({ scene: scene, fill: true, cls: 'memv--tworows', aria: 'A body at rest, during vigorous exercise, and after exercise, when the heart and breathing stay fast and the liver breaks down the lactic acid.', barLabel: 'What the body is doing',
      buttons: [['rest', 'At rest'], ['exercise', 'Vigorous exercise'], ['after', 'After exercise']], read: [['h', 'Heart rate:'], ['b', 'Breathing:'], ['s', 'Now:']],
      key: { all: [['lactic', 'lactic acid'], ['oxygen', 'oxygen'], ['rbc', 'red blood cell'], ['spark', 'energy released']], sets: [['lactic acid', 'oxygen', 'red blood cell', 'energy released']], now: function () { var l = left() > 0, st = DOTS.some(function (q, i) { return q.on && !q.gone && q.u >= 1.25 + i * .05; }); return l && state !== 'exercise' ? (st ? ['lactic acid', 'oxygen', 'red blood cell', 'energy released'] : ['lactic acid', 'oxygen', 'red blood cell']) : l ? ['lactic acid'] : []; } },
      onButton: function (id) { setState(id); ctx.pick(id === 'exercise' ? 'build' : id === 'after' ? 'heart' : 'rest', { stay: true }); } });
    function setState(id) {
      if (id === 'after' && !left()) { DOTS.forEach(function (q) { q.on = true; q.gone = false; q.u = .1; }); g = 1; }
      /* "At rest" straight after exercise: the debt is still there, so the heart and the breathing stay fast until it has been removed */
      if (id === 'exercise') { DOTS.forEach(function (q) { if (q.gone) { q.on = false; q.gone = false; q.u = 0; } }); nextAt = t; }
      state = id; settle(id);
      sync();
    }
    function sync() { pressAll(V, ['rest', 'exercise', 'after'], state); V.names(); V.paint(); }
    return { el: V.el, tight: V.fig, start: function () { V.start(); sync(); }, stop: V.stop,
      say: 'Press Vigorous exercise, then After exercise. Watch the heart rate and breathing.',
      credit: BODY_CREDIT + ' The vessels of the arms and of the liver are drawn for this lab. Nothing here is measured.',
      focus: function (part) { var m = { build: 'exercise', heart: 'after', breathing: 'after', liver: 'after', rest: 'rest' }; if (part && m[part] && m[part] !== state) setState(m[part]); } };
  });

  /* ======================================================================= 9. His Venn diagram */
  Views.add('venn', function (spec, ctx) {
    var ITEMS = [['uses oxygen', 'a'], ['releases energy', 'b'], ['uses glucose', 'b'], ['takes place in the mitochondria', 'a'], ['takes place only in the cytoplasm', 'n'], ['controlled by enzymes', 'b'], ['produces water', 'a'], ['produces lactic acid in muscles', 'n'], ['produces alcohol in yeast', 'n'], ['more energy per glucose molecule', 'a'], ['less energy per glucose molecule', 'n']];
    var root = document.createElement('div'); root.className = 'vennv';
    root.innerHTML = '<div class="vennv__board" role="group" aria-label="Venn diagram of aerobic and anaerobic respiration">' +
      '<button type="button" class="vennv__zone vennv__zone--a" data-z="a"><span>Aerobic</span></button>' +
      '<button type="button" class="vennv__zone vennv__zone--n" data-z="n"><span>Anaerobic</span></button>' +
      '<button type="button" class="vennv__zone vennv__zone--b" data-z="b"><span>Both</span></button>' +
      '<div class="vennv__in vennv__in--a" data-in="a"></div><div class="vennv__in vennv__in--b" data-in="b"></div><div class="vennv__in vennv__in--n" data-in="n"></div></div>' +
      '<p class="vennv__say" aria-live="polite">Press a statement, then press where it belongs.</p><div class="vennv__chips"></div><button type="button" class="memv__btn vennv__again" hidden>Start again</button>';
    var chips = root.querySelector('.vennv__chips'), say = root.querySelector('.vennv__say'), again = root.querySelector('.vennv__again'), pick = null, done = 0;
    function draw() {
      chips.innerHTML = ''; Array.prototype.forEach.call(root.querySelectorAll('.vennv__in'), function (e) { e.innerHTML = ''; }); done = 0; pick = null; again.hidden = true;
      ITEMS.forEach(function (it, i) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'vennv__chip'; b.textContent = it[0]; b.setAttribute('data-i', i);
        b.addEventListener('click', function () { if (b.classList.contains('is-placed')) return; Array.prototype.forEach.call(root.querySelectorAll('.vennv__chip.is-on'), function (x) { x.classList.remove('is-on'); }); b.classList.add('is-on'); pick = i; say.textContent = 'Now press Aerobic, Both or Anaerobic.'; });
        chips.appendChild(b);
      });
      say.textContent = 'Press a statement, then press where it belongs.';
    }
    Array.prototype.forEach.call(root.querySelectorAll('.vennv__zone'), function (z) {
      z.addEventListener('click', function () {
        var w = z.getAttribute('data-z');
        if (pick == null) { say.textContent = 'First press a statement.'; ctx.pick(w === 'a' ? 'aerobic' : w === 'b' ? 'both' : 'anaerobic', { stay: true }); return; }
        var it = ITEMS[pick], b = chips.querySelector('[data-i="' + pick + '"]');
        if (it[1] === w) {
          b.classList.remove('is-on'); b.classList.add('is-placed'); b.disabled = true; root.querySelector('[data-in="' + w + '"]').appendChild(b); pick = null; done++;
          say.textContent = done === ITEMS.length ? 'Your Venn diagram is complete.' : 'Right. Press the next statement.';
          if (done === ITEMS.length) again.hidden = false;
        } else {
          b.classList.add('is-no'); setTimeout(function () { b.classList.remove('is-no'); }, 500);
          say.textContent = 'Not there. Read the statement again and try another part.';
        }
      });
    });
    again.addEventListener('click', draw);
    draw();
    return { el: root, say: 'Your Venn diagram of the two types of respiration', credit: '', focus: function () {} };
  });
})(window);
