/* ============================================================
   rs-art.js — what the Respiration Lab's pictures share (memory: one drawing vocabulary in a lab).

   RsArt.body     one real body (the Human Body Hub's BodyParts3D model, rendered part by part with one camera by
                  tools/body_layers.mjs), with a part that can glow and routes that follow its vessels
   RsArt.fibre    a piece of a muscle cell: myofibrils with their bands, rows of mitochondria between them, a nucleus at the edge
   RsArt.spark    the energy released by respiration: one gold star, the same in every picture
   RsArt.enzyme   an enzyme, a teal shape with an active site
   RsArt.flask, RsArt.tube   the two benches' glass
   Molecules come from js/rs-draw.js (the Membrane Lab's), with lactic acid and ethanol added.
   ============================================================ */
(function (global) {
  'use strict';
  var D = global.RsDraw;
  if (!D) return;
  var TAU = D.TAU, lerp = D.lerp, clamp = D.clamp, ease = D.ease, seg = D.seg;

  /* ======================================================================= the body */
  var IMG = {}, listeners = [];
  function layer(n) {
    if (IMG[n]) return IMG[n];
    var i = new Image();
    i.onload = function () { i.ok = true; listeners.slice().forEach(function (f) { f(); }); };
    i.src = 'assets/photos/body-' + n + '.webp';
    return (IMG[n] = i);
  }
  /* the same part in one flat colour, for its glow */
  var TINT = {};
  function tinted(n, rgb) {
    var key = n + '|' + rgb; if (TINT[key]) return TINT[key];
    var i = layer(n); if (!i.ok) return null;
    var cv = document.createElement('canvas'); cv.width = i.naturalWidth; cv.height = i.naturalHeight;
    var g = cv.getContext('2d'); g.drawImage(i, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = 'rgb(' + rgb + ')'; g.fillRect(0, 0, cv.width, cv.height);
    return (TINT[key] = cv);
  }
  /* win: the window of the body shown, in its own pixels; W, H: the picture */
  function Body(win, W, H) {
    var k = Math.min(W / win.w, H / win.h), ox = (W - win.w * k) / 2 - win.x0 * k, oy = (H - win.h * k) / 2 - win.y0 * k;
    ['base', 'muscle', 'lungs', 'gut', 'liver', 'kidneys', 'blood', 'heart'].forEach(layer);
    function put(c, im, a) {
      if (!im) return;
      if (a != null) c.globalAlpha = a;
      c.drawImage(im, ox, oy, im.width * k, im.height * k);
      c.globalAlpha = 1;
    }
    return {
      k: k,
      to: function (p) { return [ox + p[0] * k, oy + p[1] * k]; },
      /* parts: [name, alpha], in drawing order */
      draw: function (c, parts) {
        parts.forEach(function (p) { var i = layer(p[0]); if (i.ok) put(c, i, p[1]); });
      },
      /* one part scaled about a point of the body: the heart that beats, the lungs that fill */
      scaled: function (c, n, sx, sy, px, py, al) {
        var i = layer(n); if (!i.ok) return;
        var q = [ox + px * k, oy + py * k];
        c.save(); c.translate(q[0], q[1]); c.scale(sx, sy); c.translate(-q[0], -q[1]); put(c, i, al); c.restore();
      },
      glow: function (c, n, rgb, a) {
        var t = tinted(n, rgb); if (!t || a <= .01) return;
        c.save(); c.globalCompositeOperation = 'lighter'; put(c, t, a); c.restore();
      }
    };
  }
  function onBody(f) { listeners.push(f); }

  /* a route through the body: a list of points; at(u) is the point a fraction u along it */
  function route(P) {
    var L = [0];
    for (var i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    var T = L[L.length - 1];
    return { P: P, len: T, at: function (u) {
      var w = clamp(u) * T;
      for (var j = 1; j < P.length; j++) if (w <= L[j]) { var q = (w - L[j - 1]) / (L[j] - L[j - 1] || 1); return [lerp(P[j - 1][0], P[j][0], q), lerp(P[j - 1][1], P[j][1], q)]; }
      return P[P.length - 1];
    } };
  }
  /* the routes, in the body's own pixels, measured on the layers: the small intestine, the liver and the vena cava; the heart; the
     lungs; the aorta and an artery of the arm (Topic 9). Only the vessels that are drawn are followed exactly. */
  var AIR = [[522, 178], [490, 178], [456, 176], [426, 172]];          /* the air beside the face and into a nostril */
  var ARM_R = [[636, 560], [642, 470], [600, 400], [540, 372], [470, 376]], ARM_L = [[208, 560], [204, 470], [240, 400], [300, 372], [372, 376]];
  /* from the vena cava: the right side of the heart, a lung, the left side of the heart, the aorta and the artery of the liver */
  var HEART_LUNG = [[404, 410], [412, 486], [360, 480], [332, 468], [392, 462], [446, 462]], TO_LIVER = [[440, 520], [432, 590], [414, 622], [382, 640]];
  var R = {
    glucose: route([[438, 860], [432, 780], [418, 712], [402, 640], [402, 560], [414, 512], [356, 474], [336, 462], [410, 468], [446, 452], [440, 404], [372, 366], [300, 372], [246, 430], [222, 520], [208, 610]]),
    oxygen: route(AIR.concat([[424, 240], [426, 330], [392, 400], [342, 462], [410, 470], [446, 452], [440, 404], [372, 366], [300, 372], [246, 430], [222, 520], [208, 610]])),
    co2: route([[202, 610], [214, 520], [238, 436], [300, 390], [372, 384], [402, 430], [414, 490], [360, 482], [336, 470], [392, 410], [426, 330], [424, 240], [426, 172], [456, 176], [490, 178], [522, 178]]),
    lacticR: route(ARM_R.concat(HEART_LUNG, TO_LIVER)),
    lacticL: route(ARM_L.concat(HEART_LUNG, TO_LIVER)),
    lungToLiver: route([[342, 466], [392, 462], [446, 462]].concat(TO_LIVER)),
    sweat: route([[202, 600], [176, 590], [136, 584], [96, 590]]),
    breath: route(AIR.concat([[424, 240], [426, 330], [392, 400], [346, 462]])),
    breathOut: route([[346, 462], [392, 400], [426, 330], [424, 240], [426, 172], [456, 176], [490, 178], [522, 178]]),
    urine: route([[208, 610], [240, 440], [350, 410], [414, 490], [432, 610], [462, 668], [486, 692]])
  };

  /* ======================================================================= small things */
  function spark(c, x, y, s, a) {
    if (a <= .01) return;
    c.save(); c.translate(x, y); c.globalAlpha = a;
    var rg = c.createRadialGradient(0, 0, 0, 0, 0, s * 1.5); rg.addColorStop(0, 'rgba(255,240,170,.75)'); rg.addColorStop(1, 'rgba(255,220,110,0)');
    c.fillStyle = rg; c.beginPath(); c.arc(0, 0, s * 1.5, 0, TAU); c.fill();
    c.fillStyle = '#FFE680'; c.beginPath();
    for (var i = 0; i < 8; i++) { var r = i % 2 ? s * .3 : s, th = i * TAU / 8 - Math.PI / 2; c[i ? 'lineTo' : 'moveTo'](r * Math.cos(th), r * Math.sin(th)); }
    c.closePath(); c.fill();
    c.restore();
  }
  /* an enzyme: a soft protein with a notch, its active site, facing `rot` */
  function enzyme(c, x, y, s, rot, a) {
    c.save(); c.translate(x, y); c.rotate(rot || 0); if (a != null) c.globalAlpha = a;
    c.beginPath();
    c.moveTo(s * .95, -s * .24);
    c.bezierCurveTo(s * .7, -s * .86, -s * .55, -s * 1.04, -s * .98, -s * .24);
    c.bezierCurveTo(-s * 1.2, s * .46, -s * .44, s * .98, s * .28, s * .86);
    c.bezierCurveTo(s * .74, s * .78, s * 1.02, s * .5, s * .95, s * .22);
    c.lineTo(s * .34, s * .12); c.quadraticCurveTo(s * .12, 0, s * .34, -s * .12);
    c.closePath();
    var lg = c.createLinearGradient(0, -s, 0, s); lg.addColorStop(0, '#E4F7A8'); lg.addColorStop(.55, '#A3D93F'); lg.addColorStop(1, '#5E8F16');
    c.fillStyle = lg; c.fill(); c.strokeStyle = 'rgba(244,255,214,.9)'; c.lineWidth = Math.max(.8, s * .07); c.stroke();
    c.restore();
  }
  /* the smaller molecule that glucose is split into: half of the glucose ring, in the ring's own stroke (pyruvate at IB).
     r is the radius of the ring it came from; rot 0 is the top half. `withO` carries the ring's oxygen */
  function half(c, x, y, rot, r, a, withO) {
    if (a <= .01) return;
    c.save(); c.translate(x, y); c.rotate(rot || 0); c.globalAlpha = a;
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(-r, 0); c.lineTo(-r / 2, -r * .866); c.lineTo(r / 2, -r * .866); c.lineTo(r, 0);
    c.lineWidth = r * .43; c.strokeStyle = D.C.sugarLo; c.stroke();
    c.lineWidth = r * .27; c.strokeStyle = D.C.sugar; c.stroke();
    if (withO) D.ball(c, -r / 2, -r * .866, r * .21, D.C.o);
    c.restore();
  }
  /* a soft ring round a thing in the picture: where the eye should go */
  function ringAt(c, x, y, r, a, col) {
    if (a <= .01) return;
    c.save(); c.globalAlpha = a; c.strokeStyle = col || 'rgba(255,244,196,.95)'; c.lineWidth = 2;
    c.setLineDash([5, 4]); c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); c.restore();
  }

  /* ======================================================================= a piece of a muscle cell
     x, y, w, h: the piece. k: 0 relaxed … 1 contracted (the bands move closer together; the piece does not change its place).
     o: { glow (the mitochondria), seed }. Myofibrils run along it, with dark and light bands; rows of mitochondria lie between them;
     the nucleus lies at the edge, as it does in a muscle fibre. */
  function fibre(c, x, y, w, h, k, o) {
    o = o || {};
    c.save();
    D.rr(c, x, y, w, h, 14); c.clip();
    var bg = c.createLinearGradient(0, y, 0, y + h); bg.addColorStop(0, '#E9D7BE'); bg.addColorStop(1, '#D8BE9E'); c.fillStyle = bg; c.fillRect(x, y, w, h);
    var rows = o.rows || 3, gap = h / (rows * 2 + 1), sp = lerp(38, 28, clamp(k || 0));
    for (var r = 0; r < rows; r++) {
      var fy = y + gap * (r * 2 + 1), fh = gap;
      var lg = c.createLinearGradient(0, fy, 0, fy + fh); lg.addColorStop(0, '#C25A4C'); lg.addColorStop(.5, '#D97566'); lg.addColorStop(1, '#A94A40');
      c.fillStyle = lg; c.fillRect(x, fy, w, fh);
      /* the bands of a sarcomere, drawn from the middle of the piece, so contraction moves them towards the middle */
      var mid = x + w / 2;
      c.fillStyle = 'rgba(92,28,26,.55)';
      for (var n = -14; n <= 14; n++) { var bx = mid + n * sp; c.fillRect(bx - sp * .26, fy, sp * .52, fh); }
      c.fillStyle = 'rgba(255,236,214,.65)';
      for (var m = -14; m <= 14; m++) { var zx = mid + (m + .5) * sp; c.fillRect(zx - .8, fy, 1.6, fh); }
    }
    /* the mitochondria, in rows between the myofibrils */
    var gl = o.glow == null ? 0 : o.glow, L = Math.min(46, w / 7), W = Math.max(10, gap * .74);
    for (var a = 0; a <= rows; a++) {
      var my = y + gap * (a * 2 + .5);
      for (var b = 0; b < 7; b++) {
        var mx = x + w * (b + .5 + (a % 2 ? .28 : -.1)) / 7;
        if (o.nuc && Math.abs(mx - (x + w * .78)) < 40 && a === 0) continue;
        D.mito(c, mx, my, L, W, 0, gl);
      }
    }
    if (o.nuc) {
      var nx = x + w * .78, ny = y + gap * .55, ng = c.createRadialGradient(nx - 8, ny - 5, 1, nx, ny, 30);
      ng.addColorStop(0, D.C.nuc0); ng.addColorStop(1, D.C.nuc1);
      c.fillStyle = ng; c.beginPath(); c.ellipse(nx, ny, 32, gap * .42, 0, 0, TAU); c.fill(); c.strokeStyle = D.C.nucLo; c.lineWidth = 1; c.stroke();
    }
    c.restore();
    D.rr(c, x, y, w, h, 14); c.strokeStyle = D.C.memb; c.lineWidth = 1.6; c.stroke();
    return { gap: gap, my: function (a) { return y + gap * (a * 2 + .5); } };
  }

  /* ======================================================================= the benches' glass */
  /* a vacuum flask, cut away to show the seeds: x, y top centre of the flask */
  function flask(c, x, y, w, h, seeds, living) {
    var th = 9;
    /* the outer case */
    c.save();
    D.rr(c, x - w / 2, y + 22, w, h - 22, 22);
    var cg = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    cg.addColorStop(0, '#2E4557'); cg.addColorStop(.3, '#5B7A90'); cg.addColorStop(.55, '#3C566A'); cg.addColorStop(1, '#22333F');
    c.fillStyle = cg; c.fill(); c.strokeStyle = 'rgba(190,220,240,.5)'; c.lineWidth = 1.2; c.stroke();
    /* the double wall, silvered, with a vacuum between */
    D.rr(c, x - w / 2 + th, y + 30, w - 2 * th, h - 38, 16);
    c.fillStyle = '#C9D7E2'; c.fill();
    D.rr(c, x - w / 2 + th + 5, y + 35, w - 2 * th - 10, h - 48, 13);
    c.fillStyle = '#0E1B26'; c.fill();
    /* the seeds fill the lower part */
    c.save();
    D.rr(c, x - w / 2 + th + 5, y + 35, w - 2 * th - 10, h - 48, 13); c.clip();
    (seeds || []).forEach(function (q) {
      c.save(); c.translate(q.x, q.y); c.rotate(q.a);
      c.beginPath(); c.ellipse(0, 0, q.r * 1.3, q.r, 0, 0, TAU);
      var sg = c.createRadialGradient(-q.r * .3, -q.r * .4, .5, 0, 0, q.r * 1.4);
      if (living) { sg.addColorStop(0, '#F3E7B8'); sg.addColorStop(1, '#BBA05A'); } else { sg.addColorStop(0, '#CFC6AE'); sg.addColorStop(1, '#7C7461'); }
      c.fillStyle = sg; c.fill(); c.strokeStyle = 'rgba(40,30,16,.6)'; c.lineWidth = .8; c.stroke();
      if (living && q.root) {
        c.strokeStyle = '#F7F3DF'; c.lineWidth = 1.8; c.lineCap = 'round';
        c.beginPath(); c.moveTo(q.r * 1.1, 0); c.quadraticCurveTo(q.r * 1.8, q.r * .6, q.r * 2.1, q.r * 1.2); c.stroke();
      }
      c.restore();
    });
    c.restore();
    /* the stopper */
    D.rr(c, x - w * .23, y, w * .46, 40, 7);
    var sp = c.createLinearGradient(0, y, 0, y + 40); sp.addColorStop(0, '#E5C698'); sp.addColorStop(1, '#AC8655');
    c.fillStyle = sp; c.fill(); c.strokeStyle = 'rgba(70,46,20,.8)'; c.lineWidth = 1; c.stroke();
    c.restore();
  }
  /* a thermometer, without numbers: k 0 … 1 is how high its liquid stands; it stands in the flask, through the stopper */
  function thermometer(c, x, yT, yB, k) {
    var r = 7.5, tw = 3.4;
    c.save();
    D.rr(c, x - 6, yT, 12, yB - yT, 6); c.fillStyle = 'rgba(232,244,252,.92)'; c.fill(); c.strokeStyle = 'rgba(120,150,170,.9)'; c.lineWidth = 1; c.stroke();
    /* the marks of its scale, with no numbers */
    c.strokeStyle = 'rgba(40,70,92,.65)'; c.lineWidth = 1;
    for (var m = 0; m <= 14; m++) { var my = lerp(yB - 22, yT + 12, m / 14), l = m % 2 ? 2.8 : 5; c.beginPath(); c.moveTo(x + 5.6 - l, my); c.lineTo(x + 5.6, my); c.stroke(); }
    var top = lerp(yB - 22, yT + 12, clamp(k));
    c.fillStyle = '#D92B3A'; c.fillRect(x - tw / 2 - 1, top, tw, yB - top - 2);
    c.beginPath(); c.arc(x - 1, yB, r, 0, TAU);
    var bg = c.createRadialGradient(x - 3, yB - 3, 1, x - 1, yB, r); bg.addColorStop(0, '#FF8C8C'); bg.addColorStop(1, '#C01F2E');
    c.fillStyle = bg; c.fill(); c.strokeStyle = 'rgba(120,20,30,.8)'; c.stroke();
    c.restore();
  }
  /* a test-tube: the liquid's colour is given; a thin blue layer stays at its surface, where air reaches the dye (0610 practical) */
  function tube(c, x, y, w, h, colTop, colBody) {
    var r = w / 2, lvl = y + h * .22;
    c.save();
    c.beginPath(); c.moveTo(x - r, y); c.lineTo(x - r, y + h - r); c.arc(x, y + h - r, r, Math.PI, 0, true); c.lineTo(x + r, y); c.closePath();
    c.fillStyle = 'rgba(214,236,250,.1)'; c.fill();
    c.save(); c.clip();
    var lg = c.createLinearGradient(0, lvl, 0, y + h); lg.addColorStop(0, colBody[0]); lg.addColorStop(1, colBody[1]);
    c.fillStyle = lg; c.fillRect(x - r, lvl, w, y + h - lvl);
    if (colTop) { c.fillStyle = colTop; c.fillRect(x - r, lvl, w, 5); }
    c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(x - r + 3, y + 4, 3.4, h - r - 6);
    c.restore();
    c.beginPath(); c.moveTo(x - r, y); c.lineTo(x - r, y + h - r); c.arc(x, y + h - r, r, Math.PI, 0, true); c.lineTo(x + r, y);
    c.strokeStyle = 'rgba(226,242,252,.9)'; c.lineWidth = 1.5; c.stroke();
    c.beginPath(); c.moveTo(x - r - 3, y); c.lineTo(x + r + 3, y); c.lineWidth = 2.4; c.stroke();
    c.restore();
    return lvl;
  }

  global.RsArt = { Body: Body, onBody: onBody, layer: layer, R: R, route: route, spark: spark, enzyme: enzyme, half: half, ringAt: ringAt, fibre: fibre, flask: flask, thermometer: thermometer, tube: tube };
})(window);
