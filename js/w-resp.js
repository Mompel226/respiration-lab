/* ============================================================
   w-resp.js — the Respiration Lab's four step animations.

   Each step's words are in parts with their level (the Inheritance Lab's rule): IGCSE lines first; an IB line names its statement of
   the IB Biology guide (2025) in the line itself; Beyond lines are in neither syllabus.
   True at every frame:
   - glucose never enters a mitochondrion: enzymes split it in the cytoplasm, and the two smaller molecules enter (IB HL C1.2.8, C1.2.11);
   - the counts are the equation's: 1 glucose, 6 oxygen, 6 carbon dioxide, 6 water; in yeast 2 alcohol and 2 carbon dioxide;
   - muscle makes no carbon dioxide in anaerobic respiration, and nothing anaerobic happens in a mitochondrion;
   - in the blood, oxygen is on the red blood cells (combined with haemoglobin); glucose, carbon dioxide and lactic acid are in the plasma;
   - lactic acid leaves the muscle in a vein and reaches the liver through the heart, a lung, the heart and the aorta, inside the vessels (js/rs-art.js);
   - the heart and the breathing never stand still, also while a step waits for the reader;
   - after exercise, the heart and the breathing stay fast until the oxygen debt has been removed.
   THE FENCE: no film counts or times anything about exercise or breathing (Breathing Rate Lab report, T11T12); the one graph, the oxygen
   uptake of the oxygen debt (Daniel's go, 27 Nov 2026), is a sketch with no values.
   ============================================================ */
(function (global) {
  'use strict';
  var L = global.CircLearn, K = global.WKit, D = global.RsDraw, A = global.RsArt, Film = global.RsFilm;
  if (!L || !K || !D || !A || !Film) return;
  var seg = D.seg, ease = D.ease, lerp = D.lerp, clamp = D.clamp, TAU = D.TAU, C = D.C;

  function wob(t, i, a) { return a * Math.sin(t * 1.3 + i * 2.1); }
  function along(a, b, k) { var e = ease(k); return [lerp(a[0], b[0], e), lerp(a[1], b[1], e)]; }
  function mol(c, n, p, rot, u, al) { if (al == null || al > .01) D.mol(c, n, p[0], p[1], rot || 0, u, al == null ? 1 : al); }
  function screen(c, W, H, top, bottom, f) { D.frame(c, 0, 0, W, H, 16, function () { D.ground(c, 0, 0, W, H, top || C.air1, bottom || C.air0); f(); }); }
  /* a flash of energy at the moment of a reaction */
  function flash(c, x, y, t, at, s) { var k = seg(t, at, at + .7); if (k > 0 && k < 1) A.spark(c, x, y - 10 * k, (s || 8) * (.7 + .5 * k), Math.sin(k * Math.PI)); }

  /* two enzymes rest in the cytoplasm, slide to a glucose molecule at (x, y), split it, and slide back unchanged: an enzyme is not used up.
     Times: e0 they start to move, e1 they hold it, e2 they go back. axis 'v': from above and below; 'h': from the left and the right */
  function splitter(c, x, y, t, e0, e1, e2, S, rest, hold, axis) {
    var d = lerp(rest, hold, ease(seg(t, e0, e1))) + (rest - hold) * ease(seg(t, e2, e2 + 1.2));
    if (axis === 'h') { A.enzyme(c, x - d, y, S, 0); A.enzyme(c, x + d, y, S, Math.PI); }
    else { A.enzyme(c, x, y - d, S, Math.PI / 2); A.enzyme(c, x, y + d, S, -Math.PI / 2); }
  }

  /* ==================================================================================== 1. Aerobic respiration in a cell */
  var AERO_M = [0, 5, 11, 15.5, 24, 30];
  L.add('aerofilm', Film({
    title: 'Aerobic respiration in a cell',
    aria: 'Red blood cells bring six oxygen molecules and the plasma brings one glucose molecule to a muscle cell. Two enzymes split the glucose in the cytoplasm. The two smaller molecules enter a mitochondrion, where enzymes release carbon dioxide from them and oxygen forms water, and energy is released. The carbon dioxide diffuses into the plasma, and the energy is used for contraction.',
    key: [['rbc', 'red blood cell'], ['glucose', 'glucose'], ['oxygen', 'oxygen'], ['enzymek', 'enzyme'], ['halfm', 'smaller molecule'], ['co2', 'carbon dioxide'], ['water', 'water'], ['spark', 'energy released']],
    M: AERO_M,
    steps: [
      { t: 0, h: 'Glucose and oxygen enter the cell', p: [['ig', '**Red blood cells** carry **oxygen** to a muscle cell, and the **plasma** carries **glucose**. Both **diffuse** through the cell membrane into the cytoplasm. The molecules are drawn much larger than they really are.'], ['ib', 'Glucose and **fatty acids** are the main **respiratory substrates**, but cells can respire many other carbon compounds. **Cell respiration** releases energy from them inside cells to make **ATP**. **Cell respiration** is not **gas exchange**, which is the diffusion of oxygen and carbon dioxide across a surface such as the wall of an alveolus (C1.2.4).']] },
      /* IB HL C1.2.8: glycolysis */
      { t: 5, h: 'Enzymes split the glucose', p: [['ig', '**Enzymes** in the cytoplasm begin to break down the glucose. They split one glucose molecule into two smaller molecules, and a little energy is released.'], ['ibhl', 'This is **glycolysis**: a chain of reactions in the cytoplasm, each catalysed by a different enzyme. **Phosphorylation**: two ATP are used to add two phosphate groups to the glucose. **Lysis**: the six-carbon sugar splits into two three-carbon sugars. **Oxidation**: hydrogen is removed from each, and **NAD** accepts it. **ATP formation**: four ATP are made. Each glucose gives two **pyruvate**, with a **net yield of 2 ATP and 2 reduced NAD** (C1.2.8).'], ['ibhl', 'Oxidation is the loss of electrons. When hydrogen, with its electron, is removed from a substrate (**dehydrogenation**), the substrate is **oxidized**. NAD accepts the hydrogen, so NAD is **reduced**. Oxidation and reduction happen together: a **redox reaction**. NAD is a **carrier of hydrogen**: reduced NAD later passes the hydrogen to other reactions (C1.2.7).']] },
      /* IB HL C1.2.11 */
      { t: 11, h: 'Into a mitochondrion', p: [['ig', 'The two smaller molecules enter a **mitochondrion**. Glucose itself does not enter. Oxygen enters too.'], ['ib', 'Mitochondria are needed for aerobic respiration, but not for anaerobic respiration (C1.2.5).'], ['ibhl', 'The **link reaction**, in the matrix: each pyruvate is **oxidized** (NAD accepts its hydrogen) and **decarboxylated** (carbon dioxide is removed). The **acetyl group** (2C) that remains is transferred by **coenzyme A** to the Krebs cycle. Lipids are also metabolized to acetyl groups (C1.2.11).']] },
      /* IB HL C1.2.11, C1.2.12, C1.2.16 */
      { t: 15.5, h: 'Oxygen is used, and energy is released', p: [['ig', 'Enzymes in the mitochondrion break down the smaller molecules completely, and **carbon dioxide** is released. **Oxygen is used**, and **water** is formed. These reactions **release energy**.'], ['ib', 'The energy released is used to make **ATP** (**adenosine triphosphate**), a nucleotide. Energy is needed to make ATP from **ADP** (**adenosine diphosphate**) and phosphate (C1.2.1, C1.2.3).'], ['ibhl', 'In the **Krebs cycle**, in the matrix, the acetyl group is transferred to **oxaloacetate** (4C), forming **citrate** (6C). Four **oxidations** (dehydrogenations) and two **decarboxylations** regenerate oxaloacetate, with a yield of ATP and reduced NAD (C1.2.12).'], ['ibhl', 'Reduced NAD from glycolysis, the link reaction and the Krebs cycle gives a pair of electrons to the first carrier of the **electron transport chain** in the inner membrane. This transfers energy, and reduced NAD becomes NAD again (C1.2.13). As the electrons flow along the chain, the carriers use the energy released to pump protons from the matrix into the space between the two membranes: a **proton gradient** (C1.2.14). The protons diffuse into the matrix again, down their gradient, through **ATP synthase**, which uses the energy released to phosphorylate ADP: **chemiosmosis** (C1.2.15). **Oxygen** is the **terminal electron acceptor**: it accepts electrons from the chain and protons from the matrix, forming **metabolic water**, so the electrons continue to flow (C1.2.16).']] },
      { t: 24, h: 'Carbon dioxide leaves', p: [['ig', 'Carbon dioxide **diffuses** out of the cell into the **plasma**, and the blood carries it away. The cell uses the energy, here for **muscle contraction**. In total: **glucose + oxygen → carbon dioxide + water**.'], ['ib', '**ATP** distributes this energy within the cell. ATP is small and soluble, so ATP moves easily inside the cell; the hydrolysis of ATP releases enough energy for many tasks; and ATP is quickly made again from ADP and phosphate. So ATP is called the cell\'s **energy currency** (C1.2.1).'], ['ib', 'The **hydrolysis** of ATP to ADP and phosphate releases energy for the movement of the cell or its parts (here, muscle contraction), **active transport** across membranes and the **synthesis of macromolecules** (**anabolism**) (C1.2.2, C1.2.3).']] }
    ],
    make: function () {
      var W = 560, H = 330, amb = 0, last = 0, MX = 352, MY = 136, ML = 292, MW = 150, u = 44, GX = 150, GY = 148;
      /* a capillary: its red blood cells pass in single file, with the plasma between them and the cell. What is dissolved in the plasma never lies on a red blood cell */
      var BW = 92, LANE = [23, 23], PLASMA = 64, NC = 8, PER = H + 40, drift = [0, 0, 0, 0, 0, 0];
      function cellAt(n, T) { return [LANE[n % 2], (((T * 22 + n * PER / NC) % PER) + PER) % PER - 20]; }
      var O2in = [[124, 36], [214, 44], [122, 250], [214, 240], [112, 112], [112, 186]], R0 = 1.7 * u * .35;
      function o2Off(i) { return .2 + i * .24; }
      /* each oxygen rides the red blood cell that is level with where it will enter the cell */
      var ON = (function () {
        var used = {}, o = [];
        for (var i = 0; i < 6; i++) {
          var best = 0, bd = 1e9;
          for (var n = 0; n < NC; n++) { if (used[n]) continue; var y = cellAt(n, o2Off(i))[1], d = Math.abs(y - O2in[i][1]) + (y < 14 || y > H - 14 ? 400 : 0); if (d < bd) { bd = d; best = n; } }
          used[best] = true; o.push(best);
        }
        return o;
      })();
      function o2At(i, t) {
        var off = o2Off(i);
        if (t < off) return cellAt(ON[i], t + amb);
        if (t < 3.6 + i * .1) return along(cellAt(ON[i], off + amb), O2in[i], seg(t, off, 3.6 + i * .1));
        return O2in[i];
      }
      var O2m = [[296, 84], [344, 78], [392, 80], [436, 92], [452, 142], [410, 190]];
      var CO2m = [[378, 112], [414, 118], [450, 126], [374, 166], [410, 166], [446, 160]];
      var REL = [17, 17.4, 17.9, 18.3, 18.8, 19.2];                   /* each carbon dioxide leaves its smaller molecule */
      var WAT = [[232, 232], [286, 236], [340, 238], [394, 236], [448, 232], [498, 216]];
      function wAt(j) { return 19.8 + j * .56; }
      function co2P(j, t) {
        var from = j % 2 ? [292, 176] : [292, 112], p = along(from, CO2m[j], seg(t, REL[j], REL[j] + .9));
        if (t < 24) return p;
        var a0 = 24 + j * .24, arr = a0 + 2.6, y = 44 + j * 44;
        if (t < arr) return along(CO2m[j], [PLASMA, y], seg(t, a0, arr));
        return [PLASMA + wob(t + drift[j], j, 2), y + (t - arr + drift[j]) * 22];   /* in the plasma, beside the red blood cells */
      }
      function draw(c, t) {
        screen(c, W, H, '#142A40', '#0E1D2E', function () {
          /* the capillary, with the blood moving along it */
          last = t;
          var bl = c.createLinearGradient(0, 0, BW, 0); bl.addColorStop(0, '#B4985A'); bl.addColorStop(.5, '#CDB071'); bl.addColorStop(1, '#AD9154');
          c.fillStyle = bl; c.fillRect(0, 0, BW, H);
          for (var rb = 0; rb < NC; rb++) { var cp0 = cellAt(rb, t + amb); A.rbc(c, cp0[0], cp0[1], 16, Math.PI / 2 + (rb % 3 - 1) * .12); }
          /* the cytoplasm of the muscle cell, behind its membrane */
          var bg = c.createLinearGradient(BW, 0, W, H); bg.addColorStop(0, '#3C3524'); bg.addColorStop(1, '#2C2619');
          c.fillStyle = bg; c.fillRect(BW, 0, W - BW, H);
          c.strokeStyle = 'rgba(232,214,170,.9)'; c.lineWidth = 3; c.beginPath(); c.moveTo(BW, -2); c.lineTo(BW, H + 2); c.stroke();
          c.strokeStyle = 'rgba(232,214,170,.35)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(BW + 5, -2); c.lineTo(BW + 5, H + 2); c.stroke();
          /* the fibres that use the energy, along the foot of the cell */
          var fibK = t < 24 ? 0 : .5 - .5 * Math.cos((t - 24) * 2.6);
          A.myofibril(c, BW + 16, 274, W - BW - 26, 42, fibK);
          D.mito(c, MX, MY, ML, MW, 0, .18 * seg(t, 17, 18.2));
          /* step 2: two enzymes split the glucose */
          splitter(c, GX, GY, t, 5, 6.8, 8.4, 22, 84, 44, 'v');
          if (t < 7.4) {
            var g = t < 3.6 ? along([PLASMA, GY], [GX, GY], seg(t, .3, 3.2)) : [GX, GY];
            mol(c, 'glucose', [g[0], g[1] + (t < 5 ? wob(amb, 1, 2) : 0)], Math.PI / 2 - .2, 1.7 * u, 1 - seg(t, 7.1, 7.4));
          }
          /* the two smaller molecules */
          if (t >= 7.1 && t < 19.9) {
            var ap = ease(seg(t, 7.3, 8.3)), k3 = seg(t, 11.2, 14.8), kd = seg(t, 15.8, 16.7), HR = lerp(R0, 17, ease(k3));
            var a = along(along([GX, GY], [GX - 26, GY], ap), [266, 112], k3), b = along(along([GX, GY], [GX + 26, GY], ap), [266, 176], k3);
            a = along(a, [290, 112], kd); b = along(b, [290, 176], kd);
            var fA = 1 - seg(t, 18.8, 19.4), fB = 1 - seg(t, 19.2, 19.8), showH = seg(t, 7.1, 7.4);
            A.half(c, a[0], a[1], -Math.PI / 2, HR, Math.min(showH, fA), true);
            A.half(c, b[0], b[1], Math.PI / 2, HR, Math.min(showH, fB), false);
            flash(c, GX, GY - 16, t, 7.3, 9);
          }
          /* two enzymes of the mitochondrion: they rest, take each smaller molecule, and move back unchanged */
          var e4 = ease(seg(t, 15.6, 16.5)) * (1 - ease(seg(t, 19.6, 20.6))), eX = lerp(344, 316, e4);
          A.enzyme(c, eX, 112, 19, Math.PI); A.enzyme(c, eX, 176, 19, Math.PI);
          /* oxygen: into the cytoplasm, into the mitochondrion, then water */
          for (var i = 0; i < 6; i++) {
            var o = o2At(i, t);
            if (t >= 11) o = along(O2in[i], O2m[i], seg(t, 11.2 + i * .14, 15));
            var oa = 1 - seg(t, wAt(i), wAt(i) + .4), dr = t < o2Off(i) ? 0 : t < 15 ? 2 : .8;
            mol(c, 'oxygen', [o[0] + wob(amb, i, dr), o[1] + wob(amb, i + 3, dr)], i, u, oa);
          }
          /* carbon dioxide: released one at a time, then out to the blood */
          for (var j = 0; j < 6; j++) {
            var ca = seg(t, REL[j], REL[j] + .35);
            if (ca > 0) {
              var cp = co2P(j, t), out = cp[1] > H - 8 ? clamp(1 - (cp[1] - H + 8) / 10) : 1;
              mol(c, 'co2', [cp[0], cp[1] + (t < 24 ? wob(amb, j, 1.4) : 0)], j * .7, u, ca * out);
            }
            flash(c, j % 2 ? 292 : 292, j % 2 ? 176 : 112, t, REL[j], 9);
          }
          /* water: formed where each oxygen was used, then it spreads into the cytoplasm */
          for (var w = 0; w < 6; w++) {
            var wa = seg(t, wAt(w), wAt(w) + .4);
            if (wa <= 0) continue;
            var wp = t < 24.6 ? O2m[w] : along(O2m[w], WAT[w], seg(t, 24.6 + w * .1, 27.6));
            mol(c, 'water', [wp[0] + wob(amb, w + 2, 1.2), wp[1]], w, u, wa);
            flash(c, O2m[w][0], O2m[w][1], t, wAt(w), 9);
          }
          A.scaleTag(c, W);
          /* the step holds with its energy still on show */
          if (t >= 22.6 && t < 24.8) for (var h = 0; h < 6; h++) A.spark(c, O2m[h][0], O2m[h][1] - 12, 7, seg(t, 22.6, 23.2) * (1 - seg(t, 24, 24.8)) * (.6 + .3 * Math.sin(amb * 3 + h)));
          /* the energy goes to the fibres, which contract */
          if (t >= 24) for (var s = 0; s < 9; s++) {
            var ph = ((t - 24) * .55 + s / 9) % 1, sx = MX + Math.cos(s * 2.3) * 110;
            A.spark(c, lerp(sx, 120 + s * 48, ph), lerp(MY + 44, 292, ph), 6, Math.sin(ph * Math.PI) * clamp((t - 24) / .8));
          }
        });
      }
      return {
        W: W, H: H,
        seek: function () { amb = 0; drift = [0, 0, 0, 0, 0, 0]; }, to: function () {},
        idle: function (d) { amb += d; for (var j = 0; j < 6; j++) if (last >= 26.6 + j * .24) drift[j] += d; },
        draw: draw,
        keyNow: function (t) {
          var k = ['rbc'];
          if (t < 7.6) k.push('glucose');
          if (t < wAt(5) + .3) k.push('oxygen');
          k.push('enzymek');
          if (t >= 7.1 && t < 19.8) k.push('halfm');
          if (t >= REL[0]) k.push('co2', 'spark');
          else if (t >= 7.3 && t < 8.1) k.push('spark');
          if (t >= wAt(0)) k.push('water');
          return k;
        },
        labels: function (t) {
          var it = [];
          if (t < 5) it.push({ id: 'plasma', text: 'blood plasma', x: PLASMA, y: 18, side: 'T' }, { id: 'mem', text: 'cell membrane', x: BW, y: 318, side: 'B' });
          it.push({ id: 'cyto', text: 'cytoplasm of a muscle cell', x: 176, y: 16, side: 'T' });
          it.push({ id: 'mito', text: 'mitochondrion', x: 470, y: 90, side: 'T' });
          if (t >= 5 && t < 9.6) it.push({ id: 'enz', text: 'enzymes', x: GX, y: GY - lerp(84, 44, ease(seg(t, 5, 6.8))) - 6 - 40 * ease(seg(t, 8.4, 9.6)), side: 'T' });
          if (t >= 16.5 && t < 19.6) it.push({ id: 'enz', text: 'enzymes', x: 316, y: 100, side: 'T' });
          if (t >= 18.9 && t < 24) it.push({ id: 'co', text: 'carbon dioxide', x: CO2m[2][0], y: CO2m[2][1] - 6, side: 'T' });
          if (t >= wAt(5) + .4 && t < 24) it.push({ id: 'wa', text: 'water', x: O2m[5][0], y: O2m[5][1] + 6, side: 'B' });
          if (t < wAt(5) + .4 || t >= 24) it.push({ id: 'fib', text: 'parts that contract', x: 370, y: 296, side: 'B' });   /* named from the first step; the name of the water takes its place while the water forms */
          return it;
        }
      };
    }
  }));

  /* ==================================================================================== 2. Without oxygen: yeast and muscle */
  var AN_M = [0, 5, 11, 18, 24];
  L.add('anaerofilm', Film({
    title: 'Without oxygen: yeast and muscle',
    aria: 'A muscle cell on the left and a yeast cell on the right, each with one glucose molecule and too little oxygen. Enzymes in the cytoplasm split the glucose. The muscle cell forms lactic acid. The yeast cell forms alcohol and carbon dioxide. Each releases a little energy, far less than aerobic respiration.',
    key: [['glucose', 'glucose'], ['oxygen', 'oxygen'], ['enzymek', 'enzyme'], ['halfm', 'smaller molecule'], ['lactic', 'lactic acid'], ['ethanol', 'alcohol (ethanol)'], ['co2', 'carbon dioxide'], ['spark', 'energy released']],
    M: AN_M,
    steps: [
      { t: 0, h: 'Glucose, but too little oxygen', p: [['ig', 'A **muscle cell** during **vigorous exercise** (very active exercise), and a **yeast** cell with little or no oxygen. Each cell has glucose, but too little oxygen for aerobic respiration to release all the energy needed. Anaerobic respiration does not use the mitochondria.'], ['ib', 'In humans, anaerobic respiration happens only in the cytoplasm and needs no oxygen and no mitochondria. Anaerobic respiration can use only carbohydrate, such as **glucose**. Aerobic respiration can also use other substrates, such as **fatty acids** (C1.2.5).']] },
      /* IB HL C1.2.8, C1.2.10 */
      { t: 5, h: 'The same first step', p: [['ig', '**In the cytoplasm**, enzymes split each glucose molecule into two smaller molecules. This releases a little energy. Muscle and yeast do this in the same way.'], ['ibhl', 'This is **glycolysis**, the same in humans and in yeast: each glucose gives two **pyruvate**, with a net yield of 2 ATP and 2 **reduced NAD** (C1.2.8, C1.2.10).']] },
      /* IB HL C1.2.9, C1.2.10 */
      { t: 11, h: 'Different products', p: [['ig', 'In **muscle**, the two molecules become **lactic acid**: **glucose → lactic acid**. In **yeast**, each one releases **carbon dioxide** and becomes **alcohol**: **glucose → alcohol + carbon dioxide**.'], ['ib', 'The waste product of anaerobic respiration in humans is **lactate** (in the cell, lactic acid is present as lactate): **glucose → lactate**. The waste products of aerobic respiration are carbon dioxide and water (C1.2.5).'], ['ibhl', 'Without oxygen, reduced NAD cannot pass its hydrogen to an electron transport chain, so the cell would soon have no NAD for glycolysis. In muscle, **pyruvate** accepts the hydrogen and becomes **lactate** (C1.2.9). In yeast, pyruvate loses carbon dioxide, and the two-carbon molecule that remains accepts the hydrogen and becomes **ethanol**: the pathway is the same apart from this last step (C1.2.10). In both, **NAD is regenerated**, so glycolysis can continue.']] },
      { t: 18, h: 'Much less energy', p: [['ig', 'The two bars compare the energy from one glucose molecule.'], ['ig', 'The anaerobic bar is much shorter, because the glucose is only partly broken down: the products still contain chemical energy.', 'card'], ['ib', 'Compare the **relative yields of ATP** for each glucose molecule: anaerobic respiration gives only **2 ATP**, all made in the cytoplasm; aerobic respiration gives about 30, roughly 15 times as much (C1.2.5).']] }
    ],
    make: function () {
      var W = 560, H = 330, amb = 0, u = 44, cL = { x: 144, y: 208 }, cR = { x: 418, y: 152 }, MF = null, ZP = { x: 20, y: 150, w: 248, h: 116 };
      function up(t) { return -24 * ease(seg(t, 18, 19)); }
      /* oxygen runs short: three molecules arrive and are used, and no more come */
      function shortO2(c, q, t, sd) {
        /* from the cell's own outer edge to a mitochondrion, where the last of the oxygen is used */
        var E = sd < 0 ? [[-140, -86], [-140, 92], [-140, -40]] : [[138, -60], [136, 74], [136, 8]], M = [[66, -56], [-82, 48], [-78, -44]];
        /* in the muscle cell the oxygen comes in at its edge and reaches mitochondria between its myofibrils */
        if (sd < 0 && MF && MF.mitos.length > 4) {
          var nM = MF.mitos.length, pick = [MF.mitos[2], MF.mitos[Math.floor(nM / 2)], MF.mitos[nM - 6] || MF.mitos[nM - 1]];
          E = pick.map(function (m2) { return [MF.left + 4 - q.x, m2.y - q.y]; }); M = pick.map(function (m2) { return [m2.x - q.x, m2.y - q.y]; });
        }
        for (var i = 0; i < 3; i++) {
          var a = seg(t, .2 + i * .5, 1.4 + i * .5), f = 1 - seg(t, 2.6 + i * .5, 3.2 + i * .5);
          if (a <= 0 || f <= 0) continue;
          mol(c, 'oxygen', along([q.x + E[i][0], q.y + E[i][1]], [q.x + M[i][0], q.y + M[i][1]], a), i, u, Math.min(a * 2, f));
        }
      }
      function muscle(c, dy, t) {
        var k = t < 18 ? .5 - .5 * Math.cos(t * 3) : .2;
        /* part of one muscle cell; its mitochondria take no part in what follows */
        /* the cell stays where it is, under its heading; only the magnified view moves up when the bars come */
        MF = A.fibre(c, 6, 32, 272, 94, k * .5, { rows: 3, glow: .28 * (1 - seg(t, 1.4, 4.4)), dim: .34 * seg(t, 1.4, 4.4), bg: '#132A40' });
        /* the cytoplasm between two of its myofibrils, magnified more: there glucose is broken down */
        var P = { x: ZP.x, y: ZP.y + dy, w: ZP.w, h: ZP.h };
        A.callout(c, [150, MF.gaps[1]], { x: P.x, y: Math.max(P.y, MF.bottom + 2), w: P.w, h: P.h });
        A.panel(c, P, function () {
          c.fillStyle = '#3A3022'; c.fillRect(P.x, P.y, P.w, P.h);
          A.myofibril(c, P.x - 6, P.y - 6, P.w + 12, 20, k * .5); A.myofibril(c, P.x - 6, P.y + P.h - 14, P.w + 12, 20, k * .5);
        });
      }
      function yeast(c, dy, t) {
        var x = cR.x, y = cR.y + dy, rx = 126, ry = 112;
        c.save(); c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU);
        var bg = c.createRadialGradient(x - rx * .3, y - ry * .35, 8, x, y, Math.max(rx, ry) * 1.1); bg.addColorStop(0, '#5C5138'); bg.addColorStop(1, '#3B3424');
        c.fillStyle = bg; c.fill(); c.lineWidth = 5; c.strokeStyle = '#B6A785'; c.stroke();
        c.lineWidth = 1.2; c.strokeStyle = 'rgba(232,214,170,.7)'; c.beginPath(); c.ellipse(x, y, rx - 5, ry - 5, 0, 0, TAU); c.stroke(); c.restore();
        /* its nucleus and its mitochondria, which play no part here */
        var nx = x + 74, ny = y + 44, ng = c.createRadialGradient(nx - 6, ny - 6, 2, nx, ny, 22); ng.addColorStop(0, C.nuc0); ng.addColorStop(1, C.nuc1);
        c.globalAlpha = .75; c.fillStyle = ng; c.beginPath(); c.arc(nx, ny, 20, 0, TAU); c.fill(); c.globalAlpha = 1;
        [[-78, -44, .3], [66, -56, -.3], [-82, 48, -.2]].forEach(function (m) { c.globalAlpha = lerp(.95, .66, seg(t, 1.4, 4.4)); D.mito(c, x + m[0], y + m[1], 54, 24, m[2], 0); c.globalAlpha = 1; });
      }
      function react(c, q, dy, t, isYeast) {
        var x = q.x, y = q.y + dy;
        splitter(c, x, y, t, 5, 6.8, 8.4, 15, 76, 38, 'h');
        if (t < 7.4) mol(c, 'glucose', [x, y + (t < 5 ? wob(amb, isYeast ? 3 : 1, 1.6) : 0)], -.2, 1.6 * u, 1 - seg(t, 7.1, 7.4));
        var ap = ease(seg(t, 7.3, 8.3)), PA = [x - 34, y - 8], PB = [x + 34, y + 10], RR = 1.6 * u * .35;
        var pa = along([x, y], PA, ap), pb = along([x, y], PB, ap);
        var ch = seg(t, 12.2, 13.2), hAl = Math.min(seg(t, 7.1, 7.4), 1 - ch);
        A.half(c, pa[0], pa[1], 0, RR, hAl, false); A.half(c, pb[0], pb[1], Math.PI, RR, hAl, true);
        flash(c, pa[0], pa[1] - 16, t, 7.3, 9); flash(c, pb[0], pb[1] - 16, t, 7.6, 9);
        if (ch > 0) {
          if (!isYeast) { mol(c, 'lactic', [PA[0] + wob(amb, 1, 1.4), PA[1]], .4, u, ch); mol(c, 'lactic', [PB[0] + wob(amb, 3, 1.4), PB[1]], -.3, u, ch); }
          else { mol(c, 'ethanol', [PA[0] + wob(amb, 1, 1.4), PA[1]], .4, u, ch); mol(c, 'ethanol', [PB[0] + wob(amb, 3, 1.4), PB[1]], -.3, u, ch); }
        }
      }
      /* each smaller molecule of the yeast buds one carbon dioxide, which crosses the wall and leaves */
      function co2At(j, t, dy) {
        var from = j ? [cR.x + 34, cR.y + 8] : [cR.x - 34, cR.y - 6], end = j ? [cR.x + 112, cR.y + 118] : [cR.x - 56, cR.y - 134];
        return [lerp(from[0], end[0], ease(seg(t, 12.6 + j * .4, 16.8))), lerp(from[1], end[1], ease(seg(t, 12.6 + j * .4, 16.8))) + dy];
      }
      function heading(c, text, x, col, side) {
        c.save(); c.font = '700 14px Inter, sans-serif'; var w = c.measureText(text).width + 22, x0 = side === 'left' ? x : x - w;
        D.rr(c, x0, 5, w, 24, 12); c.fillStyle = col; c.fill(); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1; c.stroke();
        c.fillStyle = '#FFF8EE'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(text, x0 + 11, 17.5); c.restore();
      }
      function bars(c, t) {
        var a = seg(t, 18.4, 19.4), x = 54, y = 298, w = 452;
        if (a <= 0) return;
        c.save(); c.globalAlpha = a;
        c.fillStyle = 'rgba(8,16,26,.9)'; D.rr(c, x - 14, y - 50, w + 28, 80, 10); c.fill();
        c.font = '600 13px Inter, sans-serif'; c.fillStyle = '#E8EEF4'; c.textBaseline = 'middle';
        c.fillText('Energy released from one glucose molecule', x - 2, y - 37);
        c.fillText('aerobic', x - 2, y - 17); c.fillText('anaerobic', x - 2, y + 13);
        var bx = x + 80, bw = w - 88, k = ease(seg(t, 18.8, 21));
        /* the true ratio: about 30 to 2 */
        c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(bx, y - 24, bw, 14); c.fillRect(bx, y + 6, bw, 14);
        c.fillStyle = '#FFE680'; c.fillRect(bx, y - 24, bw * k, 14); c.fillRect(bx, y + 6, bw * k * (2 / 30), 14);
        c.restore();
      }
      return {
        W: W, H: H,
        seek: function () { amb = 0; }, to: function () {}, idle: function (d) { amb += d; },
        draw: function (c, t) {
          var dy = up(t);
          screen(c, W, H, '#142A40', '#0E1D2E', function () {
            /* two cells side by side, and plainly two: each half has its own tint and its own heading (Daniel, 27 Nov 2026: "not very clear at a glance") */
            c.fillStyle = 'rgba(196,72,62,.13)'; c.fillRect(0, 0, 284, H); c.fillStyle = 'rgba(196,170,72,.11)'; c.fillRect(284, 0, W - 284, H);
            c.strokeStyle = 'rgba(226,236,246,.6)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(284, 0); c.lineTo(284, H); c.stroke();
            muscle(c, dy, t); yeast(c, dy, t);
            shortO2(c, { x: cL.x, y: cL.y + dy }, t, -1); shortO2(c, { x: cR.x, y: cR.y + dy }, t, 1);
            react(c, cL, dy, t, false); react(c, cR, dy, t, true);
            for (var j = 0; j < 2; j++) { var s = seg(t, 12.6 + j * .4, 13); if (s > 0) mol(c, 'co2', co2At(j, t, dy), j ? -.5 : .3, u, s * (1 - seg(t, 18, 18.6))); }
            bars(c, t);
            heading(c, 'In a muscle cell', 10, '#A8413A', 'left'); heading(c, 'In a yeast cell', W - 10, '#857228', 'right');
            if (t < 18.4) { c.save(); c.font = '500 11px Inter, sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(232,240,248,.72)'; c.fillText('not to scale', 10, H - 9); c.restore(); }
          });
        },
        keyNow: function (t) {
          var k = [];
          if (t < 7.6) k.push('glucose');
          if (t < 4.2) k.push('oxygen');
          k.push('enzymek');
          if (t >= 7.1 && t < 13.2) k.push('halfm');
          if (t >= 12.4) k.push('lactic', 'ethanol');
          if (t >= 7.3 && t < 8.4) k.push('spark');
          if (t >= 12.6 && t < 18.6) k.push('co2');
          return k;
        },
        labels: function (t) {
          var dy = up(t), it = [];   /* each cell is named by the heading of its half */
          if (t < 5) it.push({ id: 'mi', text: 'mitochondrion', x: cR.x - 78, y: cR.y - 44 + dy, side: 'T' }, { id: 'nu', text: 'nucleus', x: cR.x + 74, y: cR.y + 44 + dy, side: 'B' });
          if (t >= 5.4 && t < 12) it.push({ id: 'cy', text: 'cytoplasm (magnified more)', x: ZP.x + ZP.w - 34, y: ZP.y + ZP.h - 22 + dy, side: 'B' });
          if (t >= 13 && t < 18) {
            it.push({ id: 'lac', text: 'lactic acid', x: cL.x - 34, y: cL.y + 8, side: 'B' });
            it.push({ id: 'alc', text: 'alcohol', x: cR.x - 34, y: cR.y + 6, side: 'B' });
            if (t >= 14.6 && t < 18) { var q = co2At(0, t, dy); it.push({ id: 'co', text: 'carbon dioxide', x: q[0], y: Math.max(8, q[1] - 6), side: 'T' }); }
          }
          return it;
        }
      };
    }
  }));

  /* ==================================================================================== 3. The oxygen debt, step by step
     One real body. Nothing is counted or timed (his breathing-rate practical is assessed); its graph is the next film, a sketch with no values. */
  var DEBT_M = [0, 5, 10.5, 16, 22, 27.5, 33, 38];
  var N = 14;
  function heartK(t) { return t < 1 ? 0 : t < 4 ? ease(seg(t, 1, 4)) : t < 33.4 ? 1 : 1 - ease(seg(t, 33.4, 37)); }
  /* the phase of a beat or a breath that speeds up and slows down with no jump */
  var PH = (function () {
    var dt = .02, n = Math.ceil(40 / dt), H = new Float32Array(n + 1), B = new Float32Array(n + 1);
    for (var i = 1; i <= n; i++) { var q = heartK(i * dt); H[i] = H[i - 1] + (1 + 1.5 * q) * dt; B[i] = B[i - 1] + (.24 + .4 * q) * dt; }
    return { h: function (t) { return H[Math.max(0, Math.min(n, Math.round(t / dt)))]; }, b: function (t) { return B[Math.max(0, Math.min(n, Math.round(t / dt)))]; } };
  })();
  /* each oxygen enters on a breath in: the moments the breathing starts to fill the lungs, from the start of step 5 */
  var IN = (function () { var o = [], was = PH.b(22); for (var t = 22.02; t < 32 && o.length < 7; t += .02) { var p = PH.b(t); if (Math.floor(p) > Math.floor(was)) o.push(t); was = p; } return o; })();
  function o2Start(j) { return (IN[Math.floor(j / 4)] || 26) + (j % 4) * .18; }

  L.add('debtfilm', Film({
    title: 'The oxygen debt, step by step',
    aria: 'A body during vigorous exercise. The muscles cannot get enough oxygen and form lactic acid, which builds up in the muscles and blood. After exercise the heart and breathing stay fast: the blood carries the lactic acid through the heart and lungs to the liver, where oxygen is used to break it down into carbon dioxide and water. Then the heart and breathing return to rest.',
    pills: [['h', 'Heart rate:'], ['b', 'Breathing:'], ['d', 'Oxygen debt:']],
    credit: 'Body: BodyParts3D, The Database Center for Life Science, CC BY-SA 2.1 JP, rendered for this lab. The vessels of the arms and of the liver are drawn for this lab. Nothing here is measured.',
    key: [['working', 'muscles working hard'], ['lactic', 'lactic acid'], ['oxygen', 'oxygen'], ['rbc', 'red blood cell'], ['co2', 'carbon dioxide'], ['water', 'water'], ['spark', 'energy released']],
    M: DEBT_M,
    steps: [
      { t: 0, h: 'Vigorous exercise', p: [['ig', 'During **vigorous exercise** the muscles contract more strongly, so they need much more energy. The **heart rate** and the **rate and depth of breathing** increase, to bring more oxygen.']] },
      { t: 5, h: 'Not enough oxygen', p: [['ig', 'The muscles **cannot get enough oxygen** for aerobic respiration, so some muscle cells **respire anaerobically** and form **lactic acid**.']] },
      { t: 10.5, h: 'An oxygen debt builds up', p: [['ig', 'More and more **lactic acid** collects in the muscles and the blood. The **oxygen debt** is the oxygen needed after exercise to remove this lactic acid.', 'card']] },
      { t: 16, h: 'The exercise stops', p: [['ig', 'The muscles rest, but the **heart rate remains high**.', 'card'], ['ig', 'The lactic acid is carried in the **blood plasma**, from the muscles, through the heart and the lungs, to the **liver**.']] },
      { t: 22, h: 'Deeper, faster breathing continues', p: [['ig', 'The **rate and depth of breathing remain high**, so extra oxygen enters the blood in the lungs.', 'card'], ['ig', 'The **red blood cells** carry this oxygen to the liver.']] },
      { t: 27.5, h: 'The liver breaks down the lactic acid', p: [['ig', 'The **liver** cells respire the lactic acid aerobically.', 'card'], ['ig', 'This uses oxygen and forms **carbon dioxide** and **water**. The oxygen debt is now being removed.'], ['bey', 'Much of the lactic acid is changed back into glucose in the liver, and heart and muscle cells also respire some of it.']] },
      { t: 33, h: 'Back to rest', p: [['ig', 'When the **oxygen debt** has been removed, the **heart rate** and the **breathing rate** return to their **resting values**.', 'card']] }
    ],
    make: function () {
      var W = 560, H = 560, amb = 0, ah = 0, ab = 0, last = 0, WIN = { x0: 70, y0: 8, w: 700, h: 720 }, ROOM = { x0: 70, y0: -36, w: 700, h: 764 }, B = A.Body(WIN, W, H), P = { x: 354, y: 10, w: 198, h: 178 };
      var DOTS = [];
      (function () {
        var r = K.rng(12);
        for (var i = 0; i < N; i++) {
          var right = i % 2 === 0, hx = right ? 660 : 182;
          var arm = [hx + (r() - .5) * 26, 440 + r() * 150];   /* in muscle tissue, clear of the vessels */
          DOTS.push({ right: right, arm: arm, u0: (right ? A.R.lacticR : A.R.lacticL).near(arm, .28), born: 5.4 + i * .34, enter: 11 + i * .16, rm: 28 + i * .34, arrive: 20.2 + i * .42,
                      liver: [304 + r() * 62, 596 + r() * 70], blood: i % 3 === 0 });
        }
      })();
      /* lactic acid leaves its muscle cell into the nearest vein, and from there it stays inside the vessels, in the plasma */
      function dotP(q, t) {
        var rt = q.right ? A.R.lacticR : A.R.lacticL, t0 = 16 + (q.enter - 11), e = rt.at(q.u0), k;
        if (!q.blood) {
          if (t < t0) return q.arm;
          if (t < t0 + .7) return along(q.arm, e, seg(t, t0, t0 + .7));
          k = lerp(q.u0, 1, ease(seg(t, t0 + .7, q.arrive)));
        } else {
          if (t < q.enter) return q.arm;
          if (t < q.enter + .9) return along(q.arm, e, seg(t, q.enter, q.enter + .9));
          k = t < 16 ? lerp(q.u0, q.u0 + .07, seg(t, q.enter + .9, 16)) : lerp(q.u0 + .07, 1, ease(seg(t, t0, q.arrive)));
        }
        if (k >= 1) return q.liver;
        var p = rt.at(k), near = seg(k, .97, 1);
        return [lerp(p[0], q.liver[0], near), lerp(p[1], q.liver[1], near)];
      }
      /* oxygen: air as far as the alveoli, then on a red blood cell as far as the liver, where it leaves the cell */
      var AIR_S = 1.7, BLOOD_S = 3;
      function o2P(j, t) {
        var s = o2Start(j);
        if (t < s + AIR_S) return (j % 2 ? A.R.breathR : A.R.breath).at(seg(t, s, s + AIR_S));   /* into both lungs */
        var b = seg(t, s + AIR_S, s + AIR_S + BLOOD_S), q = DOTS[j], p = (j % 2 ? A.R.lungToLiverR : A.R.lungToLiver).at(Math.min(1, b / .92)), near = seg(b, .92, 1);
        return [lerp(p[0], q.liver[0] + 12, near), lerp(p[1], q.liver[1] - 8, near)];
      }
      function onCell(j, t) { var s = o2Start(j) + AIR_S; return t >= s && seg(t, s, s + BLOOD_S) < .92; }
      function draw(c, t) {
        last = t;
        var bh = (PH.h(t) + ah) % 1, br = .5 - .5 * Math.cos((PH.b(t) + ab) * TAU), hb = Math.pow(Math.max(0, Math.sin(bh * TAU)), 2);
        var depth = lerp(.18, 1, heartK(t)) * br, ex = seg(t, .3, 1.4) * (1 - seg(t, 16, 17));
        screen(c, W, H, '#10263A', '#0A1826', function () {
          B.draw(c, [['base', 1], ['muscle', 1]]);
          B.glow(c, 'muscle', '255,170,80', .05 + .2 * ex * (.5 + .5 * Math.sin((t + amb) * 7)));
          B.scaled(c, 'lungs', 1 + .02 * depth, 1 + .06 * depth, 420, 340, .72);
          B.glow(c, 'lungs', '255,255,255', .03 + .1 * depth);
          B.draw(c, [['pulmA', .95], ['pulmV', .95], ['airways', .88], ['gut', .55], ['liver', 1], ['blood', 1]]);
          B.tubes(c, 1);
          B.glow(c, 'liver', '255,214,120', .06 * seg(t, 27.5, 29) * (1 - seg(t, 33, 34.6)));
          var s = 1 + .05 * hb * lerp(.6, 1, heartK(t));
          B.scaled(c, 'heart', s, s, 445, 493, 1);
          /* oxygen, breathed in through a nostril and carried to the liver */
          for (var j = 0; j < N; j++) {
            var st = o2Start(j);
            if (t < st) continue;
            var oa = Math.min(seg(t, st, st + .3), 1 - seg(t, DOTS[j].rm, DOTS[j].rm + .3));
            if (oa > 0) { var op = B.to(o2P(j, t)); if (onCell(j, t)) A.rbc(c, op[0], op[1], 8, j * .7, oa); mol(c, 'oxygen', op, j * .7, 22, oa); }
          }
          /* lactic acid: formed in the muscles, carried to the liver, removed one molecule at a time */
          for (var i = 0; i < N; i++) {
            var q = DOTS[i], la = Math.min(seg(t, q.born, q.born + .5), 1 - seg(t, q.rm, q.rm + .4));
            if (la <= 0) continue;
            mol(c, 'lactic', B.to(dotP(q, t)), i * .7, 22, la);
          }
          /* each molecule's star, over all the molecules */
          for (var f = 0; f < N; f++) {
            var fp = B.to(DOTS[f].liver), pe = seg(t, DOTS[f].rm, DOTS[f].rm + 1.5);
            flash(c, fp[0], fp[1], t, DOTS[f].rm, 9);
            /* what the lactic acid becomes */
            if (pe > 0 && pe < 1) { mol(c, 'co2', [fp[0] - 12 * pe, fp[1] - 26 * pe], f, 22, Math.sin(pe * Math.PI)); mol(c, 'water', [fp[0] + 12 * pe, fp[1] - 20 * pe], f, 22, Math.sin(pe * Math.PI)); }
          }
          inset(c, t, ex); lens(c, t); liverCell(c, t); done(c, t);
        });
      }
      /* steps 4 and 5: a magnified view inside a vessel, with its wall. Red blood cells carry the oxygen; the lactic acid is in the plasma, between them */
      function lens(c, t) {
        var a = seg(t, 16.7, 17.5) * (1 - seg(t, 27.5, 28.2));
        if (a <= 0) return;
        /* step 4 looks into a vein of the arm; step 5 into the aorta, on the way to the liver */
        var to = ease(seg(t, 22, 22.8)), T = t + amb, p = B.to([lerp(593, 432, to), lerp(402, 600, to)]), wall = 13, cy = P.y + P.h / 2, sp = P.w / 3;
        c.save(); c.globalAlpha = a;
        A.callout(c, p, P);
        A.panel(c, P, function () {
          var bg = c.createLinearGradient(0, P.y, 0, P.y + P.h); bg.addColorStop(0, '#BFA363'); bg.addColorStop(.5, '#D8BE82'); bg.addColorStop(1, '#B4985A');
          c.fillStyle = bg; c.fillRect(P.x, P.y + wall, P.w, P.h - 2 * wall);
          /* the wall of the vessel: blue for a vein, red for an artery */
          [['#4F74C8', 1 - to], ['#C4473F', to]].forEach(function (q) { c.globalAlpha = a * q[1]; c.fillStyle = q[0]; c.fillRect(P.x, P.y, P.w, wall); c.fillRect(P.x, P.y + P.h - wall, P.w, wall); });
          c.globalAlpha = a;
          var oA = seg(t, 22, 23);
          for (var r = 0; r < 2; r++) for (var n = 0; n < 4; n++) {
            var cx = P.x - sp / 2 + (((T * 26 + (n + r * .5) * sp) % (sp * 4)) + sp * 4) % (sp * 4), yy = cy + (r ? 44 : -44);
            A.rbc(c, cx, yy, 21, .2 + n, a);
            if (oA > 0) mol(c, 'oxygen', [cx, yy], n, 32, oA * a);
          }
          var lacA = 1 - seg(t, 24.5, 25.5);   /* it leaves the close-up before the last lactic acid reaches the liver */
          if (lacA > 0) for (var m = 0; m < 3; m++) {
            var lx = P.x - 20 + (((T * 26 + m * (P.w + 40) / 3) % (P.w + 40)) + P.w + 40) % (P.w + 40);
            mol(c, 'lactic', [lx, cy + wob(T, m, 3)], m, 32, lacA * a);
          }
        });
        c.restore();
      }
      /* step 6: what happens in the liver, magnified: lactic acid + oxygen -> carbon dioxide + water, and energy is released */
      function liverCell(c, t) {
        var a = seg(t, 28, 28.7) * (1 - seg(t, 33, 33.6));
        if (a <= 0) return;
        var T = t + amb, cx = P.x + P.w / 2, y1 = P.y + 48, y2 = P.y + 132, bob = function (i) { return Math.sin(T * 1.3 + i * 1.9) * 1.6; }, made = ease(seg(t, 29, 30.4));
        c.save(); c.globalAlpha = a;
        A.callout(c, B.to([340, 620]), P);
        A.panel(c, P, function () {
          var bg = c.createLinearGradient(0, P.y, 0, P.y + P.h); bg.addColorStop(0, '#6B4A34'); bg.addColorStop(1, '#4E3425');
          c.fillStyle = bg; c.fillRect(P.x, P.y, P.w, P.h);
          /* one lactic acid with three oxygen forms three carbon dioxide and three water */
          mol(c, 'lactic', [P.x + 44, y1 + bob(0)], .2, 40, a);
          c.strokeStyle = '#F3EEE2'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(P.x + 82, y1); c.lineTo(P.x + 92, y1); c.moveTo(P.x + 87, y1 - 5); c.lineTo(P.x + 87, y1 + 5); c.stroke();
          for (var i = 0; i < 3; i++) mol(c, 'oxygen', [P.x + 112 + i * 27, y1 + bob(i + 1)], i, 40, a);
          D.arrow(c, cx, y1 + 26, cx, y2 - 26, 6, '#FFF3C4', { head: 12, headW: 10 });
          for (var j = 0; j < 3; j++) { mol(c, 'co2', [P.x + 26 + j * 30, y2 + bob(j + 4)], 0, 40, made * a); mol(c, 'water', [P.x + 116 + j * 27, y2 + bob(j + 7)], j, 40, made * a); }
          c.fillStyle = 'rgba(243,238,226,' + (made * a).toFixed(3) + ')'; c.fillRect(P.x + 100, y2 - 1, 8, 2.2); c.fillRect(P.x + 103, y2 - 4, 2.2, 8);
          var sp = ((T * .6) % 1); A.spark(c, cx + 62, y2 - 26 - sp * 8, 7, made * Math.sin(sp * Math.PI) * a);
        });
        c.restore();
      }
      /* step 7: the result, said on the picture */
      function done(c, t) {
        var a = seg(t, 33.4, 34.2);
        if (a <= 0) return;
        c.save(); c.globalAlpha = a;
        A.panel(c, { x: P.x, y: P.y, w: P.w, h: 64 }, function () {
          c.fillStyle = '#12382F'; c.fillRect(P.x, P.y, P.w, 64);
          c.fillStyle = '#E9FFF6'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '600 14px Inter, sans-serif';
          c.fillText('The oxygen debt', P.x + P.w / 2, P.y + 23); c.fillText('has been removed', P.x + P.w / 2, P.y + 42); c.textAlign = 'left';
        });
        c.restore();
      }
      /* steps 1 to 3: one whole muscle cell, magnified, joined to the arm */
      function inset(c, t, ex) {
        var a = 1 - seg(t, 16, 16.8);
        if (a <= 0) return;
        c.save(); c.globalAlpha = a;
        A.callout(c, B.to([640, 470]), P);
        A.panel(c, P, function () {
          var k = (.5 - .5 * Math.cos((t + amb) * 5.4)) * ex;
          var F = A.fibre(c, P.x, P.y + 10, P.w, P.h - 20, k * .55, { rows: 4, glow: .3 * ex, bg: '#0C1A28' });
          /* little oxygen arrives */
          for (var i = 0; i < 2; i++) { var ph = ((t + amb) * .4 + i * .5) % 1, go = F.mitos[i ? F.mitos.length - 8 : 3]; if (go) mol(c, 'oxygen', [lerp(P.x + 4, go.x, ph), lerp(go.y, go.y, ph)], i, 22, Math.sin(ph * Math.PI) * a); }
          /* lactic acid forms in the cytoplasm between the myofibrils */
          for (var n = 0; n < 5; n++) { var f = seg(t, 5.6 + n * 1.5, 6.2 + n * 1.5), gy = F.gaps[n % F.gaps.length]; if (f > 0) mol(c, 'lactic', [P.x + 30 + n * 34 + wob(t + amb, n, 1.2), gy + wob(t + amb, n + 2, .8)], n, 22, f * a); }
        });
        c.restore();
      }
      return {
        W: W, H: H,
        /* in the column of a laptop the picture takes the shape of the room there is */
        fit: function (a) { W = a ? Math.max(460, Math.round(H * a)) : 560; this.W = W; B = A.Body(a ? ROOM : WIN, W, H); P.x = W - 206; P.y = a ? 60 : 10; },
        seek: function () { amb = 0; ah = 0; ab = 0; }, to: function () {},
        /* a step that waits for the reader: the heart goes on beating and the chest goes on breathing, at the rate of this moment */
        idle: function (d) { var q = heartK(last); amb += d; ah += d * (1 + 1.5 * q); ab += d * (.24 + .4 * q); },
        draw: draw,
        keyNow: function (t) {
          var k = [];
          if (t >= 5.4 && t < 32.82) k.push('lactic');
          if (t < 16.8 || (t >= o2Start(0) && t < 32.72)) k.push('oxygen');
          if (t < 16.6) k.push('working');
          if (t >= 28 && t < 34) k.push('co2', 'water');
          if ((t >= 16.7 && t < 28.2) || (t >= o2Start(0) + AIR_S && t < o2Start(N - 1) + AIR_S + BLOOD_S * .92)) k.push('rbc');
          if (t >= 28 && t < 33.12) k.push('spark');
          return k;
        },
        read: function (t, pill) {
          pill('h', t < 1 ? 'resting' : t < 33.4 ? (t < 16 ? 'fast' : 'still fast') : t < 37 ? 'decreasing' : 'resting', t >= 1 && t < 33.4 ? 'warn' : 'ok');
          pill('b', t < 1 ? 'resting' : t < 33.4 ? (t < 16 ? 'deeper and faster' : 'still deeper and faster') : t < 37 ? 'decreasing' : 'resting', t >= 1 && t < 33.4 ? 'warn' : 'ok');
          pill('d', t < 5.4 ? 'none' : t < 16 ? 'building up' : t < 27.5 ? 'not yet removed' : t < 33 ? 'being removed' : 'removed', t >= 5.4 && t < 33 ? 'warn' : 'ok');
        },
        labels: function (t) {
          var it = [], mp = B.to([218, 430]), lp = B.to([304, 628]), hp = B.to([452, 500]), lg = B.to([300, 470]);
          it.push({ id: 'mus', text: 'muscles', x: mp[0], y: mp[1], side: 'T' });
          if (t < 16.8) it.push({ id: 'cell', text: 'part of one muscle cell (magnified)', x: P.x + 90, y: P.y + 11, side: 'T' });
          if (t >= 16) it.push({ id: 'liv', text: 'liver', x: lp[0], y: lp[1], side: 'B' });
          if (t >= 28.5 && t < 33) it.push({ id: 'lc', text: 'liver cell (magnified)', x: P.x + 110, y: P.y + 6, side: 'T' });
          if (t >= 17.2 && t < 27.5) { it.push({ id: 'ves', text: t < 22 ? 'vein (magnified)' : 'artery (magnified)', x: P.x + 132, y: P.y + 6, side: 'T' }); it.push({ id: 'pl', text: 'plasma', x: P.x + 34, y: P.y + P.h / 2 - 5, side: 'T' }); }
          it.push({ id: 'h', text: 'heart', x: hp[0], y: hp[1], side: 'T' });
          if (t >= 16.8) it.push({ id: 'lu', text: 'lungs', x: lg[0], y: lg[1], side: 'T' });
          return it;
        }
      };
    }
  }));

  /* ==================================================================================== 4. The oxygen debt on a graph
     Daniel, 27 Nov 2026: "no need to add data, just add the graph and show what basically explain the graph". A sketch of the
     rate of oxygen uptake against time, with no values: no number on an axis, a label or a pill. The words are the 0610 mark
     schemes' (October/November 2015 paper 32 Q2: "increase", "reaches a plateau", "more gradual decrease", "returns to resting";
     October/November 2012 paper 33 Q4(d): not enough oxygen supplied during exercise, anaerobic respiration, lactic acid, extra
     oxygen to break it down). True at every frame:
     - the muscles need more oxygen at once when exercise starts (the dashed line), but the uptake increases gradually: the
       yellow area between the two is where too little oxygen reaches the muscles and lactic acid forms;
     - after exercise the uptake decreases gradually to the resting rate: the red area between the curve and the resting rate
       is the oxygen debt, and it is larger than the yellow area (it also refills the oxygen stores);
     - no race, no athlete, no breathing rate and no value (his private test T11T12 and his assessed breathing-rate report). */
  var GR_M = [0, 5, 10.5, 16, 21.5, 27.5, 33, 37];
  var G0 = .14, G1 = .56, G2 = .9;                        /* exercise starts, exercise stops, back to the resting rate */
  /* where the pen is on the time axis, 0 to 1, at each moment of the film */
  function penAt(t) {
    if (t < 5) return G0 * ease(seg(t, 0, 3.5));
    if (t < 16) return lerp(G0, .3, seg(t, 5, 9.5));
    if (t < 21.5) return lerp(.3, G1, seg(t, 16, 20));
    if (t < 33) return t < 27.5 ? lerp(G1, .8, seg(t, 21.5, 26.5)) : lerp(.8, .86, seg(t, 27.5, 30));
    return lerp(.86, 1, seg(t, 33, 36));                    /* the curve meets the resting rate (G2) in the last step */
  }
  /* the rate of oxygen uptake, 0 = the resting rate, 1 = what the muscles need during the exercise */
  function upAt(g) {
    if (g <= G0) return 0;
    if (g <= G1) return 1 - Math.exp(-(g - G0) / .035);
    /* a fast fall, then a slow one, reaching the resting rate exactly at G2 with no bump */
    var e = function (d) { return .5 * Math.exp(-d / .03) + .5 * Math.exp(-d / .085); }, d = Math.min(g - G1, G2 - G1), end = e(G2 - G1);
    return (e(d) - end) / (e(0) - end);
  }
  function within(v, a, b) { return v < a ? a : v > b ? b : v; }
  var GC = { up: '#8FE3FF', need: '#F4B942', rest: '#A9B8C6', def: '244,185,66', debt: '240,103,90', ink: '#E9EEF3', soft: '#C3D0DC' };
  var LEGEND = [
    { k: 'up', kind: 'line', text: 'rate of oxygen uptake', from: 0 },
    { k: 'rest', kind: 'dot', text: 'resting rate', from: .6 },
    { k: 'need', kind: 'dash', text: 'oxygen the muscles need', from: 5 },
    { k: 'def', kind: 'area', text: 'not enough oxygen: lactic acid forms', from: 5.6 },
    { k: 'debt', kind: 'area', text: 'oxygen debt', from: 21.8 }
  ];

  L.add('debtgraph', Film({
    title: 'The oxygen debt on a graph',
    aria: 'A sketch graph, with no values, of the rate of oxygen uptake against time. At rest the rate is low and constant. When vigorous exercise starts, the muscles need more oxygen at once, but the rate of oxygen uptake increases gradually: in the yellow area the muscles receive less oxygen than they need, and lactic acid forms. The rate reaches a plateau. When the exercise stops, the rate decreases gradually to the resting rate: the red area between the curve and the resting rate is the oxygen debt.',
    pills: [['m', 'Muscles:'], ['d', 'Oxygen debt:']],
    credit: 'A sketch of the shape only, drawn for this lab: nothing here is measured. Its words are those of the 0610 mark schemes (October/November 2012, paper 33; October/November 2015, paper 32).',
    M: GR_M,
    steps: [
      { t: 0, h: 'At rest', p: [['ig', 'This graph shows the **rate of oxygen uptake**: the volume of oxygen the body absorbs each minute. At rest it is low and constant: the **resting rate**. The graph is a sketch of the shape, so it has no values.']] },
      { t: 5, h: 'Exercise starts', p: [['ig', 'Vigorous exercise starts. The muscles contract more strongly, so they need more energy at once, and more oxygen for aerobic respiration (the **yellow dashed line**). The heart rate and the breathing rate increase gradually, so the rate of oxygen uptake **increases gradually**.']] },
      { t: 10.5, h: 'Not enough oxygen', p: [['ig', 'In the **yellow area**, the muscles receive **less oxygen than they need**. So some muscle cells **respire anaerobically** and form **lactic acid**, which builds up in the muscles and the blood.'], ['bey', 'Biologists call the yellow area the **oxygen deficit**. During it, oxygen stored in the muscles and the blood is also used.']] },
      { t: 16, h: 'The rate reaches a plateau', p: [['ig', 'The rate of oxygen uptake **reaches a plateau**: it remains constant, because the heart and the lungs now supply oxygen as fast as the muscles use it. The lactic acid that formed is still in the muscles and the blood.']] },
      { t: 21.5, h: 'The exercise stops', p: [['ig', 'The exercise stops. The muscles no longer contract strongly, so the dashed line returns to the resting rate. But the rate of oxygen uptake **decreases gradually**, because the **deeper and faster breathing** and the **fast heart rate** continue.']] },
      { t: 27.5, h: 'The oxygen debt is an area', p: [['ig', 'The **red area** is the extra oxygen absorbed after the exercise, above the resting rate. This is the **oxygen debt**: the oxygen needed after exercise to remove the lactic acid. In the **liver**, this oxygen is used for the **aerobic respiration of the lactic acid**.'], ['bey', 'Some of this oxygen also refills the oxygen stores of the muscles and the blood, so the oxygen debt is usually larger than the oxygen deficit.']] },
      { t: 33, h: 'Back to the resting rate', p: [['ig', 'When the oxygen debt has been removed, the rate of oxygen uptake **returns to the resting rate**. A larger red area shows a larger oxygen debt.']] }
    ],
    make: function () {
      var W = 560, H = 440, amb = 0, lay0 = null;
      /* the graph's place on the picture, from the size of its words (larger on a phone): the legend under it, in rows */
      function layout(c, fs) {
        var pad = fs * .75, lh = fs * 1.22, sw = fs * 1.7, gap = fs * 1.1, rows = [{ its: [], n: 1 }], x = 0, inner = W - 2 * pad;
        c.font = '600 ' + fs + 'px Inter, sans-serif';
        LEGEND.forEach(function (q) {
          /* a line too long for the picture breaks after its colon */
          var lines = [q.text], tw = c.measureText(q.text).width;
          if (sw + fs * .45 + tw > inner && q.text.indexOf(': ') > 0) { var i = q.text.indexOf(': '); lines = [q.text.slice(0, i + 1), q.text.slice(i + 2)]; tw = Math.max(c.measureText(lines[0]).width, c.measureText(lines[1]).width); }
          var w = sw + fs * .45 + tw, row = rows[rows.length - 1];
          if (x && x + gap + w > inner) { row = { its: [], n: 1 }; rows.push(row); x = 0; }
          row.its.push({ q: q, lines: lines, x: pad + (x ? x + gap : 0), w: w }); row.n = Math.max(row.n, lines.length);
          x = x ? x + gap + w : w;
        });
        var legH = rows.reduce(function (n, r) { return n + r.n * lh + fs * .28; }, 0), legTop = H - pad - legH;
        var left = pad + fs * 1.9, right = W - pad, gx = function (g) { return left + 4 + g * (right - left - 10); };
        /* when the two moments' words would meet, each takes two lines */
        var wS = c.measureText('exercise starts').width, wE = c.measureText('exercise stops').width, two = gx(G0) + wS / 2 + fs * .8 > gx(G1) - wE / 2;
        var bottom = legTop - fs * 2.5, top = pad + fs * (two ? 2.95 : 1.7), ph = bottom - top, rest = bottom - .17 * ph, need = top + .12 * ph;
        return { fs: fs, pad: pad, rows: rows, lh: lh, sw: sw, legTop: legTop, top: top, bottom: bottom, left: left, right: right, rest: rest, need: need, two: two,
                 x: gx, y: function (u) { return rest - u * (rest - need); } };
      }
      function text(c, s, x, y, fs, col, al, wt) { c.font = (wt || 600) + ' ' + fs + 'px Inter, sans-serif'; c.fillStyle = col; c.textAlign = al || 'left'; c.textBaseline = 'middle'; c.fillText(s, x, y); c.textAlign = 'left'; }
      /* the area between the curve and a level (the dashed line, or the resting rate), from g0 to g1 */
      function area(c, G, g0, g1, up, rgb, a, hatch) {
        if (g1 <= g0 || a <= 0) return;
        c.save(); c.beginPath(); c.moveTo(G.x(g0), up ? G.y(1) : G.y(0));
        for (var g = g0; g <= g1 + 1e-9; g += .002) c.lineTo(G.x(Math.min(g, g1)), G.y(upAt(Math.min(g, g1))));
        c.lineTo(G.x(g1), up ? G.y(1) : G.y(0)); c.closePath();
        c.fillStyle = 'rgba(' + rgb + ',' + a.toFixed(3) + ')'; c.fill();
        if (hatch) stripes(c, G.left, G.top, G.right - G.left, G.bottom - G.top, G.fs, rgb);
        c.restore();
      }
      /* yellow stripes: on the dark ground a pale yellow reads as brown, and the stripes tell the two areas apart without their colours */
      function stripes(c, x, y, w, h, fs, rgb) {
        c.clip(); c.strokeStyle = 'rgba(' + rgb + ',.9)'; c.lineWidth = 1.7; c.beginPath();
        for (var k = -h; k < w; k += fs * .62) { c.moveTo(x + k, y + h); c.lineTo(x + k + h, y); }
        c.stroke();
      }
      function draw(c, t, lay) {
        if (lay) lay0 = lay;
        var fs = within((lay0 ? lay0.f : 14) * .98, 12.5, 28), G = layout(c, fs), pen = penAt(t), T = t + amb, pulse = .5 + .5 * Math.sin(T * 3.2);
        screen(c, W, H, '#10263A', '#0A1826', function () {
          /* the two areas, under the lines */
          var hiDef = t >= 10.5 && t < 16 ? .16 * pulse : 0, hiDebt = t >= 27.5 ? .16 * pulse * (t < 33 ? 1 : .5) : 0;
          area(c, G, G0, Math.min(pen, G1), true, GC.def, .3 + hiDef, true);
          area(c, G, G1, Math.min(pen, G2), false, GC.debt, .6 + hiDebt);
          /* when the exercise starts and stops */
          c.save(); c.setLineDash([fs * .3, fs * .35]); c.strokeStyle = 'rgba(233,238,243,.38)'; c.lineWidth = 1.2;
          [[G0, 5, 'exercise starts'], [G1, 21.5, 'exercise stops']].forEach(function (m) {
            var a = seg(t, m[1], m[1] + .5); if (a <= 0) return;
            c.globalAlpha = a; c.beginPath(); c.moveTo(G.x(m[0]), G.top); c.lineTo(G.x(m[0]), G.bottom); c.stroke();
            c.font = '600 ' + fs + 'px Inter, sans-serif';
            var ln = G.two ? ['exercise', m[2].slice(9)] : [m[2]], tw = c.measureText(ln[0]).width, cx = within(G.x(m[0]), G.pad + tw / 2, W - G.pad - tw / 2);
            ln.forEach(function (s1, i) { text(c, s1, cx, G.top - fs * .75 - (ln.length - 1 - i) * G.lh, fs, GC.soft, 'center'); });
          });
          c.restore();
          /* the axes, with no values */
          c.strokeStyle = GC.ink; c.lineWidth = 1.8; c.beginPath(); c.moveTo(G.left, G.top); c.lineTo(G.left, G.bottom); c.lineTo(G.right, G.bottom); c.stroke();
          c.fillStyle = GC.ink; c.beginPath(); c.moveTo(G.left, G.top - 7); c.lineTo(G.left - 4.5, G.top + 2); c.lineTo(G.left + 4.5, G.top + 2); c.closePath(); c.fill();
          c.beginPath(); c.moveTo(G.right + 2, G.bottom); c.lineTo(G.right - 7, G.bottom - 4.5); c.lineTo(G.right - 7, G.bottom + 4.5); c.closePath(); c.fill();
          c.save(); c.translate(G.pad + fs * .55, (G.top + G.bottom) / 2); c.rotate(-Math.PI / 2); text(c, 'rate of oxygen uptake', 0, 0, fs, GC.ink, 'center', 700); c.restore();
          text(c, 'time', (G.left + G.right) / 2, G.bottom + fs * 1.15, fs, GC.ink, 'center', 700);
          /* the resting rate, dotted, across the whole graph */
          var ra = seg(t, .6, 1.2);
          if (ra > 0) { c.save(); c.globalAlpha = ra; c.setLineDash([1.5, fs * .32]); c.lineCap = 'round'; c.strokeStyle = GC.rest; c.lineWidth = 2.4; c.beginPath(); c.moveTo(G.x(0), G.y(0)); c.lineTo(G.x(1), G.y(0)); c.stroke(); c.restore(); }
          /* the rate of oxygen uptake, drawn as far as the pen */
          c.strokeStyle = GC.up; c.lineWidth = 3.2; c.lineJoin = 'round'; c.beginPath();
          for (var g = 0; g <= pen + 1e-9; g += .002) { var gg = Math.min(g, pen), px = G.x(gg), py = G.y(upAt(gg)); if (g) c.lineTo(px, py); else c.moveTo(px, py); }
          c.stroke();
          /* what the muscles need, dashed, over the curve: it rises at once when the exercise starts and returns at once when it stops */
          if (pen > G0) {
            c.save(); c.setLineDash([fs * .55, fs * .4]); c.strokeStyle = GC.need; c.lineWidth = 2.6; c.beginPath();
            c.moveTo(G.x(G0), G.y(0)); c.lineTo(G.x(G0), G.y(1)); c.lineTo(G.x(Math.min(pen, G1)), G.y(1));
            if (pen > G1) { c.lineTo(G.x(G1), G.y(0)); }
            c.stroke(); c.restore();
          }
          /* the pen */
          var pp = [G.x(pen), G.y(upAt(pen))];
          c.fillStyle = 'rgba(143,227,255,' + (.22 + .18 * pulse).toFixed(3) + ')'; c.beginPath(); c.arc(pp[0], pp[1], fs * .62, 0, TAU); c.fill();
          c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(pp[0], pp[1], fs * .26, 0, TAU); c.fill();
          /* the legend, each line and area named once it is on the graph */
          var yRow = G.legTop;
          G.rows.forEach(function (row) {
            var y = yRow + row.n * G.lh / 2; yRow += row.n * G.lh + fs * .28;
            row.its.forEach(function (it) {
              var q = it.q, a = seg(t, q.from, q.from + .5); if (a <= 0) return;
              c.save(); c.globalAlpha = a; var x0 = it.x, x1 = it.x + G.sw;
              if (q.kind === 'area') { c.fillStyle = 'rgba(' + GC[q.k] + ',' + (q.k === 'def' ? .3 : .74) + ')'; c.beginPath(); c.rect(x0, y - fs * .42, G.sw, fs * .84); c.fill(); if (q.k === 'def') { c.save(); stripes(c, x0, y - fs * .42, G.sw, fs * .84, fs, GC.def); c.restore(); } }
              else {
                c.strokeStyle = GC[q.k]; c.lineWidth = q.kind === 'line' ? 3.2 : q.kind === 'dash' ? 2.6 : 2.4; c.lineCap = q.kind === 'dot' ? 'round' : 'butt';
                c.setLineDash(q.kind === 'dash' ? [fs * .55, fs * .4] : q.kind === 'dot' ? [1.5, fs * .32] : []);
                c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
              }
              it.lines.forEach(function (s1, i) { text(c, s1, x1 + fs * .45, y + (i - (it.lines.length - 1) / 2) * G.lh, fs, GC.ink, 'left', 600); });
              c.restore();
            });
          });
        });
      }
      return {
        W: W, H: H,
        /* in the picture's column the graph keeps its own shape; on a phone it is taller, so that its words can be larger */
        fit: function (a, Dw) { H = Dw && Dw < 440 ? 680 : 440; this.H = H; },
        seek: function () { amb = 0; }, to: function () {},
        idle: function (d) { amb += d; },
        draw: draw,
        read: function (t, pill) {
          pill('m', t < 5 ? 'at rest' : t < 21.5 ? 'working hard' : 'at rest', t >= 5 && t < 21.5 ? 'warn' : 'ok');
          pill('d', t < 5.6 ? 'none' : t < 16 ? 'building up' : t < 21.5 ? 'not yet removed' : t < 33.9 ? 'being removed' : 'removed', t >= 5.6 && t < 33.9 ? 'warn' : 'ok');
        },
        labels: function () { return []; }
      };
    }
  }));
})(window);

/* ---------- the chart of one question in station `seeds`: a rate, with no time given ----------
   Daniel, 23 Nov 2026: pupils read a rate as a total. The bars are in cm³ per hour, so the chart can say which seeds release
   carbon dioxide faster and cannot say which release more. The page's colours, so it reads in the bright and the dark version. */
(function (global) {
  'use strict';
  var L = global.CircLearn;
  if (!L) return;
  L.diagram('seedrate', function () {
    var left = 86, right = 386, top = 14, base = 262, vMax = 6, bars = [['R', 2], ['S', 5]], w = 92, s = '', v;
    var ink = 'fill:var(--ink)', soft = 'fill:var(--muted)';
    function y(n) { return base - n * (base - top) / vMax; }
    for (v = 0; v <= vMax; v++) {
      s += '<line x1="' + left + '" x2="' + right + '" y1="' + y(v) + '" y2="' + y(v) + '" style="stroke:var(--line);stroke-width:1"/>' +
           '<text x="' + (left - 9) + '" y="' + (y(v) + 5) + '" text-anchor="end" font-size="15" style="' + soft + '">' + v + '</text>';
    }
    bars.forEach(function (b, i) {
      var cx = left + (right - left) * (i + .5) / bars.length;
      s += '<rect x="' + (cx - w / 2) + '" y="' + y(b[1]) + '" width="' + w + '" height="' + (base - y(b[1])) + '" style="fill:var(--accent-tint);stroke:var(--accent);stroke-width:1.6"/>' +
           '<text x="' + cx + '" y="' + (base + 22) + '" text-anchor="middle" font-size="15" font-weight="600" style="' + ink + '">' + b[0] + '</text>';
    });
    s += '<path d="M' + left + ' ' + top + 'V' + base + 'H' + right + '" fill="none" style="stroke:var(--ink);stroke-width:1.6"/>' +
         '<text x="' + ((left + right) / 2) + '" y="' + (base + 46) + '" text-anchor="middle" font-size="15" font-weight="600" style="' + ink + '">Type of seed</text>' +
         '<text transform="translate(24 ' + ((top + base) / 2) + ') rotate(-90)" text-anchor="middle" font-size="15" font-weight="600" style="' + ink + '">' +
           '<tspan x="0" dy="-4">Rate of carbon dioxide release</tspan><tspan x="0" dy="19">/ cm³ per hour</tspan></text>' +
         ['Figure 1. Bar chart showing the effect of the', 'type of seed (R and S) on the rate of carbon', 'dioxide release.'].map(function (t, i) {
           return '<text x="10" y="' + (base + 80 + i * 20) + '" font-size="15" font-style="italic" style="' + ink + '">' + t + '</text>';
         }).join('');
    return '<svg viewBox="0 0 400 ' + (base + 130) + '" role="img" aria-label="Bar chart of the rate of carbon dioxide release by two types of germinating seed: seeds R 2 cm³ per hour, seeds S 5 cm³ per hour.">' + s + '</svg>';
  });
})(window);
