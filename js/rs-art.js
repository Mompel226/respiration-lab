/* ============================================================
   rs-art.js — what the Respiration Lab's pictures share (memory: one drawing vocabulary in a lab).

   RsArt.body     one real body (the Human Body Hub's BodyParts3D model, rendered part by part with one camera by
                  tools/body_layers.mjs), with a part that can glow and routes that follow its vessels
   RsArt.fibre    one muscle cell: its membrane, the parts that contract with their bands, mitochondria along them, nuclei at the edge
   RsArt.spark    the energy released by respiration: one gold star, the same in every picture
   RsArt.enzyme   an enzyme: a lumpy folded protein with an active site
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
    ['base', 'muscle', 'lungs', 'airways', 'pulmA', 'pulmV', 'gut', 'liver', 'kidneys', 'blood', 'heart'].forEach(layer);
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
      /* the vessels the model does not have (the arms, and those of the liver), as tubes in the model's colours: red arteries, blue veins */
      tubes: function (c, a) {
        var al = a == null ? 1 : a;
        Object.keys(EXTRA).forEach(function (n) {
          var P = EXTRA[n], vein = /^vein|hepV|portal/.test(n), w = 4.3 * k;
          function line() {
            c.beginPath(); var q = [ox + P[0][0] * k, oy + P[0][1] * k]; c.moveTo(q[0], q[1]);
            for (var i = 1; i < P.length - 1; i++) { var u = [ox + P[i][0] * k, oy + P[i][1] * k], v = [ox + P[i + 1][0] * k, oy + P[i + 1][1] * k]; c.quadraticCurveTo(u[0], u[1], (u[0] + v[0]) / 2, (u[1] + v[1]) / 2); }
            var e = P[P.length - 1]; c.lineTo(ox + e[0] * k, oy + e[1] * k);
          }
          c.save(); c.globalAlpha = al; c.lineCap = 'round'; c.lineJoin = 'round';
          line(); c.strokeStyle = 'rgba(10,18,28,.55)'; c.lineWidth = w + 1.6; c.stroke();
          line(); c.strokeStyle = vein ? '#4F74C8' : '#D8473E'; c.lineWidth = w; c.stroke();
          line(); c.strokeStyle = 'rgba(255,255,255,.26)'; c.lineWidth = Math.max(.8, w * .24); c.stroke();
          c.restore();
        });
      },
      glow: function (c, n, rgb, a) {
        var t = tinted(n, rgb); if (!t || a <= .01) return;
        c.save(); c.globalCompositeOperation = 'lighter'; put(c, t, a); c.restore();
      }
    };
  }
  function onBody(f) { listeners.push(f); }

  /* a route through the body: a list of points; at(u) is the point a fraction u along it */
  function route(P, marks) {
    var L = [0];
    for (var i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    var T = L[L.length - 1];
    return { P: P, len: T, marks: marks || {},
      /* the fraction of the route nearest to a point (to enter a vessel where the molecule is) */
      near: function (q, upTo) {
        var best = 0, bd = 1e12, n = Math.ceil(T / 4), top = upTo == null ? 1 : upTo;
        for (var k = 0; k <= n * top; k++) { var p = this.at(k / n), d = (p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1]); if (d < bd) { bd = d; best = k / n; } }
        return best;
      },
      at: function (u) {
      var w = clamp(u) * T;
      for (var j = 1; j < P.length; j++) if (w <= L[j]) { var q = (w - L[j - 1]) / (L[j] - L[j - 1] || 1); return [lerp(P[j - 1][0], P[j][0], q), lerp(P[j - 1][1], P[j][1], q)]; }
      return P[P.length - 1];
    } };
  }
  /* ROUTES: written by tools/trace-routes.py, along the middle of the model's vessels and airways. Do not edit by hand. */
  var EXTRA = {"brachio":[[428,384],[418,378],[406,370]],"artL":[[327,362],[304,368],[280,382],[258,406],[240,438],[229,474],[224,512],[218,552],[210,592],[200,628]],"veinL":[[192,626],[203,590],[212,550],[217,510],[222,470],[232,434],[250,400],[274,378],[300,372],[330,376],[362,384],[388,392],[402,400]],"artR":[[519,365],[540,370],[564,384],[586,408],[603,440],[613,476],[618,514],[624,554],[632,594],[642,630]],"veinR":[[650,628],[640,592],[631,552],[625,512],[620,472],[610,436],[593,402],[570,380],[544,372],[510,376],[470,382],[432,388],[402,400]],"hepA":[[431,652],[414,648],[396,642],[378,634]],"hepV":[[372,606],[384,590],[396,574],[402,562]],"portal":[[452,846],[446,806],[436,766],[422,726],[404,690],[386,660],[372,632]]};
  var R = {
    glucose: route([[452,846],[446,806],[436,766],[422,726],[404,690],[386,660],[372,632],[372,612],[372,606],[384,590],[396,574],[402,562],[402,540],[402,450],[398,492],[438,528],[436,486],[430,440],[425,438],[404,438],[379,450],[366,463],[360,477],[358,490],[351,496],[346,495],[332,480],[321,472],[317,471],[310,473],[310,477],[319,490],[324,500],[350,504],[363,501],[387,486],[412,487],[440,478],[476,522],[446,476],[440,452],[433,446],[432,441],[432,417],[438,392],[428,384],[418,378],[406,370],[397,355],[377,348],[363,350],[327,362],[304,368],[280,382],[258,406],[240,438],[229,474],[224,512],[218,552],[210,592],[200,628]]),
    oxygen: route([[426,172],[423,204],[421,248],[421,292],[419,300],[419,406],[397,433],[392,449],[383,465],[368,484],[366,496],[358,504],[353,505],[340,492],[333,490],[320,475],[308,475],[310,477],[319,490],[324,500],[350,504],[363,501],[387,486],[412,487],[440,478],[476,522],[446,476],[440,452],[433,446],[432,441],[432,417],[438,392],[428,384],[418,378],[406,370],[397,355],[377,348],[363,350],[327,362],[304,368],[280,382],[258,406],[240,438],[229,474],[224,512],[218,552],[210,592],[200,628]], {"lung":0.3443}),
    co2: route([[192,626],[203,590],[212,550],[217,510],[222,470],[232,434],[250,400],[274,378],[300,372],[330,376],[362,384],[388,392],[402,400],[402,436],[402,450],[398,492],[438,528],[436,486],[430,440],[425,438],[404,438],[379,450],[366,463],[360,477],[358,490],[351,496],[346,495],[332,480],[321,472],[317,471],[310,473],[308,475],[320,475],[333,490],[340,492],[353,505],[358,504],[366,496],[368,484],[383,465],[392,449],[397,433],[419,406],[419,300],[421,292],[421,248],[423,204],[426,172]], {"lung":0.6583}),
    lacticR: route([[650,628],[640,592],[631,552],[625,512],[620,472],[610,436],[593,402],[570,380],[544,372],[510,376],[470,382],[432,388],[402,400],[402,436],[402,450],[398,492],[438,528],[436,486],[430,440],[425,438],[404,438],[379,450],[366,463],[360,477],[358,490],[351,496],[346,495],[332,480],[321,472],[317,471],[310,473],[310,477],[319,490],[324,500],[350,504],[363,501],[387,486],[412,487],[440,478],[476,522],[446,476],[440,452],[433,446],[432,441],[432,417],[438,392],[432,420],[432,447],[437,469],[437,485],[433,537],[431,652],[414,648],[396,642],[378,634]]),
    lacticL: route([[192,626],[203,590],[212,550],[217,510],[222,470],[232,434],[250,400],[274,378],[300,372],[330,376],[362,384],[388,392],[402,400],[402,436],[402,450],[398,492],[438,528],[436,486],[430,440],[425,438],[404,438],[379,450],[366,463],[360,477],[358,490],[351,496],[346,495],[332,480],[321,472],[317,471],[310,473],[310,477],[319,490],[324,500],[350,504],[363,501],[387,486],[412,487],[440,478],[476,522],[446,476],[440,452],[433,446],[432,441],[432,417],[438,392],[432,420],[432,447],[437,469],[437,485],[433,537],[431,652],[414,648],[396,642],[378,634]]),
    lungToLiver: route([[310,477],[319,490],[324,500],[350,504],[363,501],[387,486],[412,487],[440,478],[476,522],[446,476],[440,452],[433,446],[432,441],[432,417],[438,392],[432,420],[432,447],[437,469],[437,485],[433,537],[431,652],[414,648],[396,642],[378,634]]),
    sweat: route([[156,598],[136,592],[116,588],[96,590]]),
    lungToLiverR: route([[528,451],[511,449],[504,452],[504,455],[509,463],[508,471],[502,481],[487,491],[480,492],[458,488],[440,478],[476,522],[446,476],[440,452],[433,446],[432,441],[432,417],[438,392],[432,420],[432,447],[437,469],[437,485],[433,537],[431,652],[414,648],[396,642],[378,634]]),
    breath: route([[426,172],[423,204],[421,248],[421,292],[419,300],[419,406],[397,433],[392,449],[383,465],[368,484],[366,496],[358,504],[353,505],[340,492],[333,490],[320,475],[308,475]]),
    breathR: route([[426,172],[423,204],[421,248],[421,292],[419,302],[419,402],[420,408],[450,441],[469,455],[475,455],[484,451],[489,445],[496,433],[499,431],[512,431],[526,442]]),
    breathOut: route([[308,475],[320,475],[333,490],[340,492],[353,505],[358,504],[366,496],[368,484],[383,465],[392,449],[397,433],[419,406],[419,300],[421,292],[421,248],[423,204],[426,172]]),
    urine: route([[192,626],[203,590],[212,550],[217,510],[222,470],[232,434],[250,400],[274,378],[300,372],[330,376],[362,384],[388,392],[402,400],[402,436],[402,450],[398,492],[438,528],[436,486],[430,440],[425,438],[404,438],[379,450],[366,463],[360,477],[358,490],[351,496],[346,495],[332,480],[321,472],[317,471],[310,473],[310,477],[319,490],[324,500],[350,504],[363,501],[387,486],[412,487],[440,478],[476,522],[446,476],[440,452],[433,446],[432,441],[432,417],[438,392],[432,420],[432,447],[437,469],[437,486],[433,538],[430,700],[472,700],[478,702]])
  };
  /* END ROUTES */

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
  /* an enzyme: a folded protein, lumpy like a real one, with an active site cut into it, facing `rot` */
  function enzyme(c, x, y, s, rot, a) {
    c.save(); c.translate(x, y); c.rotate(rot || 0); if (a != null) c.globalAlpha = a;
    var gap = .36, n = 44;
    c.beginPath();
    for (var i = 0; i <= n; i++) {
      var th = gap + (TAU - 2 * gap) * i / n, r = s * (1 + .075 * Math.sin(3 * th + .6) + .025 * Math.sin(5 * th + 1.2));
      c[i ? 'lineTo' : 'moveTo'](r * Math.cos(th), r * Math.sin(th));
    }
    c.lineTo(s * .36, -s * .15); c.quadraticCurveTo(s * .12, 0, s * .36, s * .15); c.closePath();
    var lg = c.createRadialGradient(-s * .3, -s * .4, s * .1, 0, 0, s * 1.15); lg.addColorStop(0, '#CFE2A4'); lg.addColorStop(.6, '#8DB45A'); lg.addColorStop(1, '#55762F');
    c.fillStyle = lg; c.fill(); c.strokeStyle = 'rgba(40,62,22,.9)'; c.lineWidth = Math.max(.7, s * .045); c.stroke();
    /* the coils of its chain */
    c.strokeStyle = 'rgba(244,252,222,.42)'; c.lineWidth = Math.max(.7, s * .06); c.lineCap = 'round';
    [[-.55, -.36], [-.62, .22], [-.08, .56], [-.14, -.62]].forEach(function (q, j) {
      c.beginPath();
      for (var k = 0; k <= 8; k++) { var px = s * (q[0] + k * .05), py = s * (q[1] + Math.sin(k * 1.5 + j) * .055); c[k ? 'lineTo' : 'moveTo'](px, py); }
      c.stroke();
    });
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
  /* a red blood cell. With `o2` (the size of the molecule) it carries oxygen, combined with its haemoglobin */
  function rbc(c, x, y, r, rot, a, o2) {
    if (a != null && a <= .01) return;
    c.save(); c.translate(x, y); c.rotate(rot || 0); if (a != null) c.globalAlpha = a;
    var g = c.createRadialGradient(0, 0, r * .12, 0, 0, r); g.addColorStop(0, '#A8293A'); g.addColorStop(.62, '#E0505B'); g.addColorStop(1, '#8C1F2E');
    c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, r, r * .76, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,214,214,.5)'; c.lineWidth = Math.max(.7, r * .07); c.stroke(); c.restore();
    if (o2) D.mol(c, 'oxygen', x, y, rot || 0, o2, a == null ? 1 : a);
  }
  /* a soft ring round a thing in the picture: where the eye should go */
  function ringAt(c, x, y, r, a, col) {
    if (a <= .01) return;
    c.save(); c.globalAlpha = a; c.strokeStyle = col || 'rgba(255,244,196,.95)'; c.lineWidth = 2;
    c.setLineDash([5, 4]); c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); c.restore();
  }

  /* ======================================================================= one muscle cell (a skeletal muscle fibre)
     Checked against the sources (Daniel, 27 Nov 2026: "Why are there 2 nuclei? ... Is that inside a muscle cell, or are actually muscle cells
     joined together?"):
     - a muscle cell is very long (up to 30 cm, OpenStax A&P 2e 10.2), so a picture shows PART of one cell: its membrane runs along both
       sides and it continues past both ends, which fade;
     - it has many nuclei, because it forms from many cells that join (myoblasts fuse); they lie flat, just under the membrane;
     - its stripes are bands inside its myofibrils (the parts that contract), lined up across the cell: they are not cells joined together;
     - between the myofibrils, slender mitochondria lie in pairs, one on each side of each Z line (Ogata and Yamasaki; PMC2740713);
       rounder ones cluster under the membrane, beside the nuclei.

     myofibril: one of the parts that contract. k 0 relaxed … 1 contracted: the dark bands keep their width and come closer together,
     as they really do. `mid` keeps the bands of every myofibril of a cell in line. */
  function myofibril(c, x, y, w, h, k, mid) {
    var q = clamp(k || 0), sp0 = Math.max(18, h * 2.1), sp = sp0 * (1 - .2 * q), dark = sp0 * .56, m = mid == null ? x + w / 2 : mid, N = Math.ceil(w / sp / 2) + 2, zs = [];
    c.save(); D.rr(c, x, y, w, h, h * .3); c.clip();
    var bg = c.createLinearGradient(0, y, 0, y + h); bg.addColorStop(0, '#F0CDBE'); bg.addColorStop(.5, '#E7B7A6'); bg.addColorStop(1, '#D79D8C');
    c.fillStyle = bg; c.fillRect(x, y, w, h);
    var dg = c.createLinearGradient(0, y, 0, y + h); dg.addColorStop(0, '#A84A44'); dg.addColorStop(.5, '#8E3635'); dg.addColorStop(1, '#6F2729');
    for (var n = -N; n <= N; n++) {
      var bx = m + n * sp;
      c.fillStyle = dg; c.fillRect(bx - dark / 2, y, dark, h);
      c.fillStyle = 'rgba(255,220,204,.3)'; c.fillRect(bx - .5, y, 1, h);
      c.fillStyle = 'rgba(64,20,22,.95)'; c.fillRect(bx + sp / 2 - .6, y, 1.2, h);
      zs.push(bx + sp / 2);
    }
    c.restore();
    D.rr(c, x, y, w, h, h * .3); c.strokeStyle = 'rgba(70,26,24,.5)'; c.lineWidth = .7; c.stroke();
    return { sp: sp, zs: zs };
  }
  /* x, y, w, h: the part of the cell in the picture. o: { rows (myofibrils), nuc (false: none), glow, dim (the mitochondria take no part),
     shorten (the cell shortens with k), bg (the colour behind it, for the ends that fade) }. Returns where everything is. */
  function fibre(c, x, y, w, h, k, o) {
    o = o || {};
    var q = clamp(k || 0), sh = o.shorten ? 1 - .17 * q : 1, w1 = w * sh, x1 = x + (w - w1) / 2, mid = x1 + w1 / 2;
    var rows = o.rows || 4, E = Math.max(9, h * .14), inner = h - 2 * E, g = inner / (rows * 3.6 + rows - 1), m = g * 3.6, fade = Math.min(28, w1 * .1);
    var out = { left: x1, right: x1 + w1, top: y, bottom: y + h, midY: y + h / 2, mitos: [], bands: [], gaps: [], nuclei: [], zs: [], ends: 'open' };
    c.save(); c.beginPath(); c.rect(x1, y, w1, h); c.clip();
    var cg = c.createLinearGradient(0, y, 0, y + h); cg.addColorStop(0, '#EFE2CC'); cg.addColorStop(.5, '#E6D5BA'); cg.addColorStop(1, '#D8C3A4');
    c.fillStyle = cg; c.fillRect(x1, y, w1, h);
    var yy = y + E, Z = [], sp = m * 2.1;
    for (var b = 0; b < rows; b++) {
      var r = myofibril(c, x1 - 6, yy, w1 + 12, m, q, mid); Z = r.zs; sp = r.sp;
      out.bands.push({ y: yy + m / 2, h: m }); yy += m;
      if (b < rows - 1) { out.gaps.push(yy + g / 2); yy += g; }
    }
    out.zs = Z.filter(function (z) { return z > x1 + 4 && z < x1 + w1 - 4; });
    var dim = o.dim || 0, glow = o.glow || 0;
    function M(cx, cy, L, W, kind, rot) {
      if (dim) c.globalAlpha = 1 - dim;
      D.mito(c, cx, cy, L, W, rot || 0, glow);
      if (dim) c.globalAlpha = 1;
      out.mitos.push({ x: cx, y: cy, L: L, W: W, kind: kind });
    }
    /* between the myofibrils: slender mitochondria in pairs, one on each side of each Z line */
    var Wi = g * .95, Li = Math.max(Wi * 1.9, sp * .27);
    out.gaps.forEach(function (gy, j) {
      out.zs.forEach(function (z, n) {
        [-1, 1].forEach(function (sd) {
          var cx = z + sd * sp * .18, L = Li * (1 + .08 * Math.sin(n * 2.3 + j * 1.7 + sd));
          if (cx - L / 2 > x1 + 2 && cx + L / 2 < x1 + w1 - 2) M(cx, gy, L, Wi, 'pair');
        });
      });
    });
    /* just under the membrane: the nuclei, flat, with rounder mitochondria in clusters beside them */
    var nW = Math.min(E * 2.3, w1 * .12), nH = E * .34, nuc = o.nuc === false ? [] : [[.22, 0], [.76, 0], [.5, 1]];
    nuc.forEach(function (p) {
      var nx = x1 + w1 * p[0], ny = p[1] ? y + h - E * .5 : y + E * .5, L = E * 1.05, W = E * .62;
      [-1, 1].forEach(function (sd) { M(nx + sd * (nW + L * .66), ny, L, W, 'edge', sd * .06); });
      var ng = c.createRadialGradient(nx - nW * .3, ny - nH * .4, 1, nx, ny, nW); ng.addColorStop(0, '#B9A6DE'); ng.addColorStop(1, '#7259A8');
      c.fillStyle = ng; c.beginPath(); c.ellipse(nx, ny, nW, nH, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(48,32,92,.9)'; c.lineWidth = .8; c.stroke();
      out.nuclei.push({ x: nx, y: ny, w: nW, h: nH });
    });
    c.restore();
    /* the cell membrane along each side */
    c.save(); c.strokeStyle = '#4F3D2C'; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(x1, y + .8); c.lineTo(x1 + w1, y + .8); c.moveTo(x1, y + h - .8); c.lineTo(x1 + w1, y + h - .8); c.stroke();
    c.strokeStyle = 'rgba(255,248,232,.55)'; c.lineWidth = .8;
    c.beginPath(); c.moveTo(x1, y + 2.4); c.lineTo(x1 + w1, y + 2.4); c.moveTo(x1, y + h - 2.4); c.lineTo(x1 + w1, y + h - 2.4); c.stroke();
    /* the cell runs on past both ends: they fade */
    var bgc = o.bg || '#0C1A28';
    [[x1 - 1, x1 + fade], [x1 + w1 + 1, x1 + w1 - fade]].forEach(function (e) {
      var fg = c.createLinearGradient(e[0], 0, e[1], 0); fg.addColorStop(0, bgc); fg.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = fg; c.fillRect(Math.min(e[0], e[1]), y - 3, Math.abs(e[1] - e[0]) + 1, h + 6);
    });
    c.restore();
    return out;
  }
  /* a magnified view in the corner of a picture, joined by a dashed line to the place it shows */
  function panel(c, P, paint) {
    c.save(); D.rr(c, P.x, P.y, P.w, P.h, 12); c.fillStyle = '#0C1A28'; c.fill();
    c.save(); D.rr(c, P.x, P.y, P.w, P.h, 12); c.clip(); paint(); c.restore();
    D.rr(c, P.x, P.y, P.w, P.h, 12); c.strokeStyle = 'rgba(255,244,196,.88)'; c.lineWidth = 1.6; c.stroke(); c.restore();
  }
  function callout(c, a, P) {
    var bx = clamp((a[0] - P.x) / P.w) * P.w + P.x, by = clamp((a[1] - P.y) / P.h) * P.h + P.y;
    c.save(); c.strokeStyle = 'rgba(255,244,196,.82)'; c.lineWidth = 1.4; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(bx, by); c.stroke(); c.setLineDash([]);
    c.fillStyle = 'rgba(255,244,196,.98)'; c.beginPath(); c.arc(a[0], a[1], 3.4, 0, TAU); c.fill(); c.restore();
  }
  /* cells and molecules are drawn far larger than they are, and not to one scale: said on the picture */
  function scaleTag(c, W, y) {
    c.save(); c.font = '500 11px Inter, sans-serif'; c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(232,240,248,.72)'; c.fillText('not to scale', W - 10, y == null ? 13 : y); c.restore();
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
    /* a plug of cotton wool: it holds the thermometer and lets gases pass, so the seeds keep their oxygen */
    var plugW = w / 2 - th - 13;                                       /* it fills the mouth of the flask, from wall to wall */
    for (var t = 0; t < 38; t++) {
      var tx = x - plugW + ((t * 37) % 100) / 100 * 2 * plugW, ty = y + 26 + ((t * 53) % 100) / 100 * 30, tr = 7 + (t * 7) % 5;
      var tg = c.createRadialGradient(tx - tr * .3, ty - tr * .35, 1, tx, ty, tr); tg.addColorStop(0, '#FFFFFF'); tg.addColorStop(.7, '#E9EDF1'); tg.addColorStop(1, '#BFC8D1');
      c.fillStyle = tg; c.beginPath(); c.arc(tx, ty, tr, 0, TAU); c.fill();
    }
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

  global.RsArt = { Body: Body, onBody: onBody, layer: layer, R: R, EXTRA: EXTRA, route: route, rbc: rbc, spark: spark, enzyme: enzyme, half: half, ringAt: ringAt, fibre: fibre, myofibril: myofibril, panel: panel, callout: callout, scaleTag: scaleTag, flask: flask, thermometer: thermometer, tube: tube };
})(window);
