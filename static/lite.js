/* NEO — HUD minimo: NEO, ondas y texto. Todo lo demas, transparente.
   Sin fondo, sin masa, sin punto de estado y sin frase de abajo. */
(function () {
  var b = document.body;
  b.style.cssText = "background:#000;margin:0;overflow:hidden";
  document.documentElement.style.background = "#000";
  var st = document.createElement("style");
  st.textContent = "html,body{background:#000!important;margin:0;overflow:hidden}canvas{background:#000}";
  document.head.appendChild(st);

  var cv = document.getElementById("hud") || document.createElement("canvas");
  if (!cv.parentNode) b.appendChild(cv);
  cv.style.cssText = "position:fixed;left:0;top:0;display:block";

  var fst = document.createElement("style");
  fst.textContent = "@font-face{font-family:VT323;src:url('static/fonts/VT323.woff2') format('woff2'),url('fonts/VT323.woff2') format('woff2');font-display:block}";
  document.head.appendChild(fst);
  var F = "VT323,ui-monospace,Menlo,monospace";
  try { if (document.fonts && document.fonts.load) document.fonts.load("20px VT323"); } catch (e) {}

  var x = cv.getContext("2d"), W, H, CX, niv = 0, ns = 0;

  var col = [150, 235, 200], obj = [150, 235, 200];
  var estado = "ESCUCHANDO";
  var frase = "", fraseTs = 0, turnos = 0;
  var dice = "", diceTs = 0, diceFin = 0;
  var aviso = "", avisoTs = 0, avisoOn = false;
  var hazTs = 0, estAnt = "";

  function js_set(s) {
    if (!s) return;
    var t = ("" + s).toUpperCase();
    var antesDormido = /DORM|REPOSO/.test(estado);
    var ahoraDormido = /DORM|REPOSO/.test(t);
    if (antesDormido && !ahoraDormido) hazTs = performance.now();   // haz de luz al oir "Neo"
    if (ahoraDormido) { frase = ""; dice = ""; diceFin = 0; }
    estado = t;
    if (/ERROR|SIN RED|SIN MICRO|SIN SENAL|SIN SEÑAL|FALLO/.test(t)) obj = [255, 90, 90];
    else if (/ESCUCH|OYENDO/.test(t)) obj = [150, 235, 200];
    else if (/PENS|TRANSCR/.test(t)) obj = [235, 230, 170];
    else if (/HABL/.test(t)) obj = [228, 255, 240];
    else obj = [150, 235, 200];
  }
  window.NEO_SET = js_set;
  window.NEO_TEXTO = function (t) { frase = ("" + t).replace(/\s+/g, " ").trim(); fraseTs = Date.now(); };
  window.NEO_TURNO = function (n) { turnos = n | 0; };
  window.NEO_TAP = function () {};
  window.NEO_PTT = function () {};
  window.NEO_DICE = function (t) { dice = ("" + t).replace(/\s+/g, " ").trim(); diceTs = Date.now(); diceFin = 0; };
  window.NEO_CALLA = function () { if (dice) diceFin = Date.now(); };
  window.NEO_AVISO = function (t) {
    aviso = ("" + t).replace(/\s+/g, " ").trim();
    avisoTs = Date.now();
    avisoOn = aviso.length > 0;
  };
  window.NEO_AVISO_OFF = function () { avisoOn = false; aviso = ""; };
  window.NEO_NIVEL = function (v) { niv = Math.max(0, Math.min(1, v)); };

  function m() {
    W = innerWidth || document.documentElement.clientWidth || 480;
    H = innerHeight || document.documentElement.clientHeight || 640;
    cv.width = W; cv.height = H;
    cv.style.width = W + "px"; cv.style.height = H + "px";
    CX = W / 2;
  }
  addEventListener("resize", m); m();

  function rgb(a) { return "rgba(" + (col[0] | 0) + "," + (col[1] | 0) + "," + (col[2] | 0) + "," + a + ")"; }

  function espaciado(txt, px, py, ex) {
    var ancho = 0, i, c0;
    for (i = 0; i < txt.length; i++) ancho += x.measureText(txt.charAt(i)).width + ex;
    var x0 = px - ancho / 2;
    for (i = 0; i < txt.length; i++) {
      c0 = txt.charAt(i);
      x.fillText(c0, x0, py);
      x0 += x.measureText(c0).width + ex;
    }
    return ancho;
  }

  function envolver(t, max, maxL) {
    maxL = maxL || 4;
    var pal = t.split(" "), lineas = [], act = "", i, w, pue, tro, c, p2;
    for (i = 0; i < pal.length; i++) {
      w = pal[i];
      if (x.measureText(w).width > max) {
        if (act) { lineas.push(act); act = ""; }
        tro = "";
        for (c = 0; c < w.length; c++) {
          p2 = tro + w.charAt(c);
          if (x.measureText(p2).width > max && tro) { lineas.push(tro); tro = w.charAt(c); }
          else tro = p2;
        }
        if (tro) act = tro;
        continue;
      }
      pue = act ? act + " " + w : w;
      if (x.measureText(pue).width > max && act) { lineas.push(act); act = w; }
      else act = pue;
    }
    if (act) lineas.push(act);
    if (lineas.length > maxL) {
      lineas = lineas.slice(0, maxL);
      lineas[maxL - 1] = lineas[maxL - 1].replace(/[.,;:]?$/, "") + "\u2026";
    }
    return lineas;
  }

  function ondas(y0, t, amp) {
    var N = 52, w = W * 0.66, x0 = CX - w / 2, i, u, env, yy, capa;
    x.lineWidth = 1.4;
    for (capa = 0; capa < 2; capa++) {
      x.beginPath();
      for (i = 0; i < N; i++) {
        u = i / (N - 1) * 2 - 1;
        env = Math.cos(u * 1.45); if (env < 0) env = 0;
        yy = y0 + Math.sin(i * 0.62 + t * (capa ? 6.1 : 7.4) + capa * 1.7) * amp * env * (capa ? 0.55 : 1);
        if (i) x.lineTo(x0 + i * w / (N - 1), yy); else x.moveTo(x0, yy);
      }
      x.strokeStyle = rgb(capa ? 0.22 : 0.62);
      x.stroke();
    }
  }

  /* ── la unica vista viva: NEO arriba, ondas debajo, texto al final ── */
  function pinta(t, ahora) {
    if (/DORM|REPOSO/.test(estado)) return;   // dormido: negro, la lente limpia
    var esc = /ESCUCH|OYENDO/.test(estado),
        pen = /PENS|TRANSCR/.test(estado),
        hab = /HABL/.test(estado);
    var amp = 2.4 + 17 * ns * (hab ? 1.15 : 1);
    var yNeo = H * 0.395, yOnd = H * 0.470;

    x.save();
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.globalCompositeOperation = "lighter";

    /* haz de luz al despertar */
    var eh = ahora - hazTs;
    if (eh >= 0 && eh < 620) {
      var u = eh / 620, al = (1 - u) * (1 - u);
      var g = x.createLinearGradient(0, H * 0.24, 0, H * 0.56);
      g.addColorStop(0, "rgba(150,245,215,0)");
      g.addColorStop(0.5, "rgba(190,255,235," + (0.55 * al).toFixed(3) + ")");
      g.addColorStop(1, "rgba(150,245,215,0)");
      x.fillStyle = g;
      var ancho = Math.max(1.2, 12 * (1 - Math.min(1, u * 2.2)));
      x.fillRect(CX - ancho / 2, H * 0.24, ancho, H * 0.32);
    }

    /* N E O */
    x.font = "36px " + F;
    x.shadowColor = "rgba(120,255,215,0.45)";
    x.shadowBlur = 16;
    x.fillStyle = "rgba(240,255,250," + (0.80 + 0.18 * Math.sin(t * 2.2)).toFixed(3) + ")";
    espaciado("NEO", CX, yNeo, 13);

    /* ondas */
    x.shadowColor = "rgba(120,255,215,0.5)";
    x.shadowBlur = 12;
    ondas(yOnd, t, amp);

    /* puntos girando mientras piensa */
    if (pen) {
      for (var k = 0; k < 3; k++) {
        var a = t * 2.1 + k * 2.09;
        x.fillStyle = rgb(0.6);
        x.beginPath();
        x.arc(CX + Math.cos(a) * 30, yOnd + Math.sin(a) * 8, 2.4, 0, 7);
        x.fill();
      }
    }
    x.restore();
    x.globalCompositeOperation = "source-over";

    /* lo que ha oido de ti, en tono bajo */
    var ahora2 = ahora;
    var alf = frase ? Math.max(0, Math.min(1, (8000 - (ahora2 - fraseTs)) / 1200)) : 0;
    if (alf > 0.01) {
      x.save();
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.font = "18px " + F;
      x.lineWidth = 3;
      x.strokeStyle = "rgba(0,14,16,0.75)";
      x.fillStyle = "rgba(180,225,205," + (0.72 * alf).toFixed(3) + ")";
      var lf = envolver(frase, W - 60, 2);
      for (var i = 0; i < lf.length; i++) x.strokeText(lf[i], CX, H * 0.575 + i * 21);
      for (var i2 = 0; i2 < lf.length; i2++) x.fillText(lf[i2], CX, H * 0.575 + i2 * 21);
      x.restore();
    }

    /* lo que dice NEO, blanco */
    if (dice) {
      var fin = diceFin || ahora2;
      var a2 = (ahora2 - fin < 4200) ? Math.min(1, (ahora2 - diceTs) / 240) : Math.max(0, (4200 - (ahora2 - fin)) / 900);
      if (a2 > 0.01) {
        x.save();
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.globalAlpha = Math.min(1, a2);
        x.font = "25px " + F;
        x.lineWidth = 4;
        x.strokeStyle = "rgba(0,14,16,0.92)";
        x.shadowColor = "rgba(0,0,0,0.95)";
        x.shadowBlur = 10;
        x.fillStyle = "rgba(248,255,255,0.99)";
        var ld = envolver(dice, W - 56, 5);
        var yd = H * 0.665 - (ld.length - 1) * 13;
        for (var j = 0; j < ld.length; j++) x.strokeText(ld[j], CX, yd + j * 27);
        for (var j2 = 0; j2 < ld.length; j2++) x.fillText(ld[j2], CX, yd + j2 * 27);
        x.restore();
      }
    }
    if (esc && estAnt !== "ESCUCHANDO") hazTs = ahora2;
  }

  /* ── aviso: solo texto, sin nada mas ── */
  function pintaAviso(t, ahora) {
    var e = Math.min(1, (ahora - avisoTs) / 280);
    x.save();
    x.globalAlpha = e;
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.font = "15px " + F;
    x.shadowColor = "rgba(120,255,215,0.4)";
    x.shadowBlur = 12;
    x.fillStyle = "rgba(235,255,245," + (0.72 + 0.22 * Math.sin(t * 2)).toFixed(3) + ")";
    espaciado("NEO", CX, H * 0.30, 10);
    x.shadowBlur = 0;
    x.strokeStyle = "rgba(150,235,200,0.22)";
    x.lineWidth = 1;
    x.beginPath();
    x.moveTo(CX - W * 0.20, H * 0.355);
    x.lineTo(CX + W * 0.20, H * 0.355);
    x.stroke();
    x.font = "26px " + F;
    x.lineWidth = 4;
    x.strokeStyle = "rgba(0,12,14,0.92)";
    x.shadowColor = "rgba(0,0,0,0.95)";
    x.shadowBlur = 10;
    x.fillStyle = "rgba(248,255,252,0.99)";
    var la = envolver(aviso, W - 56, 5);
    var ya = H * 0.47 - (la.length - 1) * 13;
    for (var i = 0; i < la.length; i++) x.strokeText(la[i], CX, ya + i * 27);
    for (var i3 = 0; i3 < la.length; i3++) x.fillText(la[i3], CX, ya + i3 * 27);
    x.restore();
  }

  var qp = {};
  (function () {
    var s = (location.search || "").replace(/^\?/, "").split("&");
    for (var i = 0; i < s.length; i++) {
      var p = s[i].split("=");
      if (p[0]) { try { qp[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || "").replace(/\+/g, "%20")); } catch (e) { qp[p[0]] = p[1] || ""; } }
    }
  })();
  if (qp.a) window.NEO_AVISO(qp.a);

  function loop(ts) {
    var t = ts / 1000;
    if (!cv.parentNode) document.body.appendChild(cv);
    if (!W || !H) m();
    for (var i = 0; i < 3; i++) col[i] += (obj[i] - col[i]) * 0.12;
    ns = ns * 0.85 + niv * 0.15;
    if (/HABL/.test(estado)) {
      var f = 0.42 + 0.30 * Math.abs(Math.sin(t * 6.5));
      if (f > ns) ns = ns * 0.6 + f * 0.4;
    }
    x.fillStyle = "#000";
    x.fillRect(0, 0, W, H);
    var ahora = Date.now();
    if (avisoOn) pintaAviso(t, ahora);
    else pinta(t, ahora);
    estAnt = /ESCUCH|OYENDO/.test(estado) ? "ESCUCHANDO" : "OTRO";
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
