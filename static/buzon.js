/* NEO — buzon de avisos. Lo que manda el portatil aparece flotando en las gafas.
   La clave llega en la URL (?k=...) desde la APK, nunca desde este fichero. */
(function () {
  var BUZON = "https://neo-rokid-buzon.dortizs76.workers.dev";
  var K = new URLSearchParams(location.search).get("k") || localStorage.getItem("neoK") || "";
  if (!K) return;
  localStorage.setItem("neoK", K);

  var st = document.createElement("style");
  st.textContent =
    "#aviso{position:fixed;left:0;right:0;top:14px;z-index:9999;padding:0 10px;pointer-events:none;" +
    "font-family:ui-monospace,Menlo,monospace;font-size:15px;line-height:1.3;color:#b6ffd4;" +
    "text-shadow:0 0 6px rgba(0,0,0,.95),0 1px 2px #000;opacity:0;transition:opacity .5s ease}" +
    "#aviso.on{opacity:1}" +
    "#aviso .marca{display:block;font-size:9px;letter-spacing:.22em;color:#4ce08c;opacity:.85;margin-bottom:3px}";
  document.head.appendChild(st);

  var box = document.createElement("div");
  box.id = "aviso";
  document.body.appendChild(box);

  var cola = [], pintando = false, visto = 0;

  function hablar(t) {
    try {
      if (!window.speechSynthesis) return;
      var u = new SpeechSynthesisUtterance(t);
      u.lang = "es-ES";
      u.rate = 1.05;
      var v = speechSynthesis.getVoices().filter(function (x) { return /es/i.test(x.lang); });
      if (v.length) u.voice = v[0];
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  function pintar() {
    if (pintando || !cola.length) return;
    pintando = true;
    var m = cola.shift();
    box.innerHTML = '<span class="marca">NEO</span>' + m.t;
    box.classList.add("on");
    hablar(m.t);
    setTimeout(function () {
      box.classList.remove("on");
      setTimeout(function () {
        pintando = false;
        pintar();
      }, 600);
    }, 20000);
  }

  function tic() {
    // con la app en segundo plano manda la APK (Aviso.java), aqui no se toca la cola
    if (document.hidden) return;
    fetch(BUZON + "/pull?k=" + encodeURIComponent(K), { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.msgs || !d.msgs.length) return;
        d.msgs.forEach(function (m) { cola.push(m); });
        pintar();
      })
      .catch(function () {});
  }

  window.neoAviso = function (texto) {
    cola.push({ t: String(texto), k: "local" });
    pintar();
  };

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) tic();
  });
  var suelto = new URLSearchParams(location.search).get("a");
  try { console.log("buzon suelto=" + suelto); } catch (e) {}
  if (suelto) {
    cola.push({ t: suelto, k: "apk" });
    pintar();
  }

  tic();
  setInterval(tic, 15000);
})();
