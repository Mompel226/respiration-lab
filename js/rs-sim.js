/* ============================================================
   rs-sim.js — the particles of the Membrane Lab (Topic 3).

   One rule runs through the whole lab: a net movement is never drawn as particles marching one way. Every particle
   moves AT RANDOM, in both directions, for ever; a net movement is what is left when the crossings each way are
   counted and one is taken from the other (0610 3.1.1). So this file holds a box of particles on random paths, a wall
   (a divider, a doorway or a membrane) that a particle may or may not cross, and the two counters.

   What is true here, and what is simplified (memory biology-before-pedagogy):
   - each particle keeps its direction for a moment and then changes it at random (the mean time between changes is the
     kind's `tau`); gas particles keep it longer than particles in a liquid;
   - the two sides of the wall are always the SAME volume (memory concentration-pictures-equal-volumes), so the number
     of particles on a side IS its concentration;
   - with `keep` the far edge of each side is open: the rest of the room, the soil or the cytoplasm. A particle that
     meets the far edge of a side holding more than its share leaves there, and one enters at the far edge of the other
     side, so a gradient can last (a tissue keeps its gradients in the same way);
   - the motion is slowed down many millions of times (real gas particles move at about 500 m/s).

   Everything is decided by a seeded random number generator, so the same seed gives the same particles every time, and
   Track can replay any moment (memory headless-raf-animations).
   ============================================================ */
(function (global) {
  'use strict';
  var DT = 1 / 60, TAU = Math.PI * 2;

  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* o = { seed, w, h,
           gate: { x, hw, pass(kindName, y, dir, sim) → chance of crossing at each meeting with the wall,
                   walk?, y0?, y1? } | null,   (walk: a doorway with depth, y0–y1: inside it a particle goes on moving at random,
                                                so it may come back, and a longer way through takes longer) 
           kinds: { name: { n: [left, right], speed, tau, through?, r?, keep? } }, margin? }
     Without a gate there is one region, and n[0] particles of each kind. */
  function Sim(o) {
    this.o = o; this.w = o.w; this.h = o.h;
    this.gate = o.gate ? { x: o.gate.x, hw: o.gate.hw || 2, pass: o.gate.pass || null, walk: !!o.gate.walk, y0: o.gate.y0, y1: o.gate.y1 } : null;
    this.names = Object.keys(o.kinds);
    this.kinds = this.names.map(function (k) { return o.kinds[k]; });
    var n = 0, self = this;
    this.kinds.forEach(function (k) { n += k.n[0] + (self.gate ? k.n[1] : 0); });
    this.N = n;
    this.X = new Float32Array(n); this.Y = new Float32Array(n);
    this.VX = new Float32Array(n); this.VY = new Float32Array(n);
    this.A = new Float32Array(n); this.SP = new Float32Array(n);   /* each particle's turn on itself, and how fast */
    this.K = new Uint8Array(n); this.TR = new Int8Array(n);         /* TR: crossing the wall (+1 to the right, -1 to the left) */
    this.heat = 1;                                                  /* how fast all particles move (temperature) */
    this.onMove = null;                                             /* a hook for a scene's own rules */
    this.reset();
  }
  Sim.DT = DT;

  /* the kind's index by name */
  Sim.prototype.kindIx = function (name) { return this.names.indexOf(name); };

  Sim.prototype.reset = function () {
    var r = this.r = rng(this.o.seed), self = this, g = this.gate, m = this.o.margin == null ? 8 : this.o.margin, i = 0;
    this.t = 0;
    this.ab = this.kinds.map(function () { return 0; });            /* crossed left → right */
    this.ba = this.kinds.map(function () { return 0; });            /* crossed right → left */
    this.side = this.kinds.map(function (k) { return [k.n[0], g ? k.n[1] : 0]; });
    this.trail = [];
    this.kinds.forEach(function (k, ki) {
      [0, 1].forEach(function (s) {
        if (s && !g) return;
        var x0 = g ? (s ? g.x + g.hw + m : m) : m, x1 = g ? (s ? self.w - m : g.x - g.hw - m) : self.w - m, y0 = m, y1 = self.h - m;
        for (var c = 0; c < k.n[s]; c++, i++) {
          /* best-candidate sampling: the point farthest from those already placed, so the first frame is evenly spread */
          var bx = 0, by = 0, bd = -1;
          for (var t = 0; t < 10; t++) {
            var x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), d = 1e9;
            for (var j = 0; j < i; j++) { var dx = self.X[j] - x, dy = self.Y[j] - y, q = dx * dx + dy * dy; if (q < d) d = q; }
            if (d > bd) { bd = d; bx = x; by = y; }
          }
          self.X[i] = bx; self.Y[i] = by;
          var a = r() * TAU;
          self.VX[i] = Math.cos(a); self.VY[i] = Math.sin(a);
          self.A[i] = r() * TAU; self.SP[i] = (r() - .5) * 3;
          self.K[i] = ki; self.TR[i] = 0;
        }
      });
    });
  };

  /* how many of this kind are on each side now: [left, right] (one crossing the wall counts for the side it left) */
  Sim.prototype.count = function (name) { var s = this.side[this.kindIx(name)]; return [s[0], s[1]]; };
  Sim.prototype.crossed = function (name) { var i = this.kindIx(name); return { ab: this.ab[i], ba: this.ba[i], net: this.ab[i] - this.ba[i] }; };

  /* While a step waits for the reader the particles go on moving, but the state the step shows must remain: a crossing
     that would take a side more than 1 from its count when the wait began is turned back (a scene's gate asks this). */
  Sim.prototype.holdAllows = function (kindName, dir) {
    if (!this.holding || !this.held) return true;
    /* the side's count once the particles already inside the wall have arrived */
    var i = this.kindIx(kindName), left = this.side[i][0];
    for (var q = 0; q < this.N; q++) if (this.K[q] === i && this.TR[q]) left -= this.TR[q];
    return Math.abs((dir > 0 ? left - 1 : left + 1) - this.held[i]) <= 1;
  };

  Sim.prototype.step = function () {
    var r = this.r, g = this.gate, w = this.w, h = this.h, heat = this.heat, m = 3;
    for (var i = 0; i < this.N; i++) {
      var ki = this.K[i], k = this.kinds[ki], sp = k.speed * heat;
      this.A[i] += this.SP[i] * DT * Math.max(.6, heat);
      if (this.TR[i]) {
        var dir = this.TR[i];
        if (g.walk) {
          /* in a doorway with depth: still at random. It leaves at either end, and only the far end counts as a crossing */
          if (r() < DT / k.tau) { var b = r() * TAU; this.VX[i] = Math.cos(b); this.VY[i] = Math.sin(b); }
          var ix = this.X[i] + this.VX[i] * sp * DT, iy = this.Y[i] + this.VY[i] * sp * DT;
          if (iy < g.y0) { iy = 2 * g.y0 - iy; this.VY[i] = Math.abs(this.VY[i]); }
          if (iy > g.y1) { iy = 2 * g.y1 - iy; this.VY[i] = -Math.abs(this.VY[i]); }
          var wL = g.x - g.hw, wR = g.x + g.hw;
          if (ix >= wR) {
            this.TR[i] = 0; ix = wR + .5; this.VX[i] = Math.abs(this.VX[i]);
            if (dir > 0) { this.ab[ki]++; this.side[ki][0]--; this.side[ki][1]++; }
          } else if (ix <= wL) {
            this.TR[i] = 0; ix = wL - .5; this.VX[i] = -Math.abs(this.VX[i]);
            if (dir < 0) { this.ba[ki]++; this.side[ki][1]--; this.side[ki][0]++; }
          }
          this.X[i] = ix; this.Y[i] = iy;
          continue;
        }
        /* inside the wall: it goes on to the other side, at its own pace */
        this.X[i] += dir * (k.through || sp * .8) * DT;
        this.Y[i] += (r() - .5) * 1.4;
        if (this.Y[i] < m) this.Y[i] = m; if (this.Y[i] > h - m) this.Y[i] = h - m;
        if (dir > 0 && this.X[i] >= g.x + g.hw) { this.TR[i] = 0; this.X[i] = g.x + g.hw + .5; this.VX[i] = Math.abs(this.VX[i]); this.ab[ki]++; this.side[ki][0]--; this.side[ki][1]++; }
        else if (dir < 0 && this.X[i] <= g.x - g.hw) { this.TR[i] = 0; this.X[i] = g.x - g.hw - .5; this.VX[i] = -Math.abs(this.VX[i]); this.ba[ki]++; this.side[ki][1]--; this.side[ki][0]++; }
        continue;
      }
      if (r() < DT / k.tau) { var a = r() * TAU; this.VX[i] = Math.cos(a); this.VY[i] = Math.sin(a); }
      var nx = this.X[i] + this.VX[i] * sp * DT, ny = this.Y[i] + this.VY[i] * sp * DT;
      if (ny < m) { ny = 2 * m - ny; this.VY[i] = Math.abs(this.VY[i]); }
      if (ny > h - m) { ny = 2 * (h - m) - ny; this.VY[i] = -Math.abs(this.VY[i]); }
      if (g) {
        var L = g.x - g.hw, R = g.x + g.hw;
        if (this.X[i] <= L && nx > L) {
          var p = g.pass ? g.pass(this.names[ki], ny, 1, this) : 0;
          if (p > 0 && (p >= 1 || r() < p)) { this.TR[i] = 1; nx = L + .5; }
          else { nx = 2 * L - nx; this.VX[i] = -Math.abs(this.VX[i]); }
        } else if (this.X[i] >= R && nx < R) {
          var p2 = g.pass ? g.pass(this.names[ki], ny, -1, this) : 0;
          if (p2 > 0 && (p2 >= 1 || r() < p2)) { this.TR[i] = -1; nx = R - .5; }
          else { nx = 2 * R - nx; this.VX[i] = Math.abs(this.VX[i]); }
        }
      }
      if (nx < m || nx > w - m) {
        var s = nx < m ? 0 : 1;
        /* `keep`: the open far edge of a side (see the head of this file) */
        if (g && k.keep && this.side[ki][s] > k.keep[s]) {
          this.side[ki][s]--; this.side[ki][1 - s]++;
          nx = s ? m + 1 : w - m - 1; ny = m + r() * (h - 2 * m);
          this.VX[i] = s ? Math.abs(this.VX[i]) : -Math.abs(this.VX[i]);
        } else if (nx < m) { nx = 2 * m - nx; this.VX[i] = Math.abs(this.VX[i]); }
        else { nx = 2 * (w - m) - nx; this.VX[i] = -Math.abs(this.VX[i]); }
      }
      this.X[i] = nx; this.Y[i] = ny;
    }
    if (this.onMove) this.onMove(this);
    this.t += DT;
  };

  /* A scene's clock over a simulation. `rules(story, sim)` sets what the story decides at each moment (a divider rising,
     the heat). The story's time is the film's own; while a step waits for the reader the particles go on moving (idle:
     the story stands still, the particles do not), and a jump back replays the story from its start, so any moment can be
     drawn on demand and is the same each time. */
  function Track(sim, rules) {
    var off = 0, last = 0, heldAt = null;
    function run(to) {
      var guard = 0;
      while (sim.t - off + 1e-9 < to && guard++ < 9000) { if (rules) rules(sim.t - off, sim); sim.step(); }
    }
    return {
      sim: sim,
      seek: function (t) { sim.reset(); sim.holding = false; heldAt = null; off = 0; last = 0; run(t); last = t; },
      to: function (t) {
        if (t < last - 1e-6 || t - last > 5) this.seek(t);
        else { run(t); last = t; }
      },
      idle: function (dt) {
        var n = Math.max(1, Math.round(dt / DT));
        if (heldAt !== last) { heldAt = last; sim.held = sim.side.map(function (q) { return q[0]; }); }
        sim.holding = true;
        while (n-- > 0) { if (rules) rules(last, sim); sim.step(); off += DT; }
        sim.holding = false;
      },
      time: function () { return last; }
    };
  }

  global.RsSim = { make: function (o) { return new Sim(o); }, Track: Track, rng: rng, DT: DT };
})(window);
