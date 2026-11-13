/* CuerpoFit: página para leads (sin servidor, sin cookies, sin píxeles).
   Se mide SOLO por el texto que llega al wpp: una variante por origen (?de=) y por botón (ver TEXTOS). */
(function () {
  "use strict";

  var TEL = "5491178129062";

  // ?de=tt | ig | bio | wa  ->  cómo aparece en el mensaje armado
  var ORIGENES = { tt: "TikTok", ig: "Instagram", bio: "link de la bio", wa: "WhatsApp" };

  // Valores = los del closer hoy (closer/precios.py, data/ab/closer_precio.json: 39k campeón 80%;
  // exterior 35/70 USD al 80%). Links de pago = los mismos que manda el closer (config/closer.json y privado).
  var PRECIOS = {
    ar: {
      mes: "39 mil pesos", unico: "78 mil pesos", ahorro: "39 mil pesos",
      pago: { mes: "https://mpago.la/331QJt7", unico: "https://mpago.la/1kyTLs5" },
      medio: "Se paga con Mercado Pago (link seguro, se abre en otra pestaña)",
      alt: "Si preferís transferencia, escribime y te paso los datos por WhatsApp"
    },
    ext: {
      mes: "35 dólares", unico: "70 dólares", ahorro: "35 dólares",
      pago: { mes: "https://www.paypal.com/ncp/payment/E6J6PM3WRL3B2", unico: "https://www.paypal.com/ncp/payment/NRNS2NNHFP3FY" },
      medio: "Se paga en dólares con tarjeta de débito o crédito (por PayPal, sin hacerte cuenta)",
      alt: "Si no tenés tarjeta, escribime y te paso otras formas (Prex o Western)"
    }
  };

  var params = new URLSearchParams(location.search);
  var de = (params.get("de") || "").toLowerCase();
  var origen = ORIGENES[de] || "";
  var cola = origen ? " (" + origen + ")" : "";

  // Mensajes armados (uno por botón y por origen). Listados en TANDA_W1.md para que el closer / CM los reconozcan.
  var TEXTOS = {
    hablar: function () { return "hola Ripo, vengo de la página" + cola; },
    mes: function () { return "hola Ripo, vi la página y quiero arrancar con el plan mes a mes" + cola; },
    unico: function () { return "hola Ripo, vi la página y quiero arrancar con el pago único" + cola; },
    pague: function () {
      var q = ultimoPago === "unico" ? "el pago único" : ultimoPago === "mes" ? "el primer mes" : "el plan";
      return "hola Ripo, pagué " + q + " desde la página, te mando el comprobante" + cola;
    }
  };

  var ua = navigator.userAgent || "";
  var ios = /iPhone|iPad|iPod/i.test(ua), android = /Android/i.test(ua);
  var tt = /TikTok|musical_ly|BytedanceWebview|Bytedance|trill/i.test(ua);
  var ig = /Instagram/i.test(ua), fb = /FBAN|FBAV|FB_IAB/i.test(ua), wv = /; wv\)/.test(ua);
  var inApp = tt || ig || fb || wv;
  var ultimoPago = "";

  function waUrl(texto) { return "https://wa.me/" + TEL + "?text=" + encodeURIComponent(texto); }
  function href(texto) {
    // Android dentro de IG / FB: intent (abre WhatsApp o WhatsApp Business); TikTok lo bloquea igual (landing_wa, 02/11)
    if (android && inApp && !tt) {
      return "intent://send/?phone=" + TEL + "&text=" + encodeURIComponent(texto) +
        "#Intent;scheme=whatsapp;S.browser_fallback_url=" + encodeURIComponent(waUrl(texto)) + ";end";
    }
    return waUrl(texto);
  }

  function armar() {
    document.querySelectorAll(".js-wa").forEach(function (a) {
      var f = TEXTOS[a.getAttribute("data-boton")] || TEXTOS.hablar;
      a.href = href(f());
    });
  }
  armar();

  // ---------- si WhatsApp no se abre: hoja con número y mensaje para copiar
  var hoja = document.getElementById("hoja");
  var copiarMsj = document.getElementById("copiar-msj");
  function abrirHoja(texto) {
    copiarMsj.setAttribute("data-copiar", texto);
    copiarMsj.textContent = "Copiar mensaje";
    hoja.hidden = false;
    document.getElementById("hoja-x").focus();
  }
  function cerrarHoja() { hoja.hidden = true; }
  document.getElementById("hoja-x").addEventListener("click", cerrarHoja);
  hoja.addEventListener("click", function (e) { if (e.target === hoja) cerrarHoja(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !hoja.hidden) cerrarHoja(); });

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest(".js-wa");
    if (!a) return;
    var f = TEXTOS[a.getAttribute("data-boton")] || TEXTOS.hablar;
    var texto = f();
    a.href = href(texto);
    if (tt) {
      // TikTok no deja abrir WhatsApp (57 toques, 0 llegadas el 02/11): directo a la ayuda
      e.preventDefault();
      abrirHoja(texto);
      return;
    }
    var salio = false;
    function ver() { if (document.hidden) salio = true; }
    document.addEventListener("visibilitychange", ver);
    setTimeout(function () {
      document.removeEventListener("visibilitychange", ver);
      if (!salio && !document.hidden) abrirHoja(texto);
    }, inApp ? 2500 : 4000);
  });

  // ---------- copiar (número o mensaje)
  function copiar(txt, el) {
    function ok() { var o = el.textContent; el.textContent = "Copiado"; setTimeout(function () { el.textContent = o; }, 1800); }
    function viejo() {
      var t = document.createElement("textarea");
      t.value = txt; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); ok(); } catch (err) {}
      document.body.removeChild(t);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, viejo); else viejo();
  }
  document.querySelectorAll(".copiar").forEach(function (b) {
    b.addEventListener("click", function () { copiar(b.getAttribute("data-copiar"), b); });
  });

  // ---------- aviso dentro de TikTok
  if (tt) document.getElementById("inapp").hidden = false;

  // ---------- país y precios
  function paisInicial() {
    var p = (params.get("pais") || "").toLowerCase();
    if (p === "ar" || p === "ext") return p;
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (/^America\/(Argentina|Buenos_Aires|Cordoba|Catamarca|Jujuy|Mendoza)/.test(tz)) return "ar";
      if (tz) return "ext";
    } catch (err) {}
    return "";
  }
  function ponerPais(p) {
    var P = PRECIOS[p];
    if (!P) return;
    document.querySelectorAll(".pais-b").forEach(function (b) { b.setAttribute("aria-checked", b.getAttribute("data-pais") === p ? "true" : "false"); });
    document.querySelectorAll("[data-v]").forEach(function (el) {
      var v = P[el.getAttribute("data-v")];
      if (typeof v === "string") el.textContent = v;
    });
    document.querySelectorAll(".js-pago").forEach(function (a) { a.href = P.pago[a.getAttribute("data-op")]; });
    document.getElementById("precios").hidden = false;
    document.getElementById("pagar").hidden = false;
    document.getElementById("pais-pide").hidden = true;
  }
  document.querySelectorAll(".pais-b").forEach(function (b) {
    b.addEventListener("click", function () { ponerPais(b.getAttribute("data-pais")); });
  });
  document.querySelectorAll(".js-pago").forEach(function (a) {
    a.addEventListener("click", function () { ultimoPago = a.getAttribute("data-op"); armar(); });
  });
  ponerPais(paisInicial());

  // ---------- filtro de resultados
  var chips = document.querySelectorAll(".chip");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var f = c.getAttribute("data-f");
      chips.forEach(function (x) { x.classList.toggle("on", x === c); x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
      document.querySelectorAll(".res").forEach(function (r) { r.hidden = f !== "todos" && r.getAttribute("data-g") !== f; });
      document.getElementById("carrusel").scrollLeft = 0;
    });
  });

  // ---------- botón fijo abajo: aparece cuando el botón de arriba ya no se ve y se va en el cierre
  var barra = document.getElementById("barra");
  if ("IntersectionObserver" in window) {
    var heroVis = true, cierreVis = false;
    var upd = function () {
      var ver = !heroVis && !cierreVis;
      barra.classList.toggle("ver", ver);
      barra.setAttribute("aria-hidden", ver ? "false" : "true");
      barra.querySelector("a").tabIndex = ver ? 0 : -1;
    };
    new IntersectionObserver(function (es) { heroVis = es[0].isIntersecting; upd(); }).observe(document.getElementById("cta-hero"));
    new IntersectionObserver(function (es) { cierreVis = es[0].isIntersecting; upd(); }).observe(document.getElementById("cierre"));
  }

  // ---------- claro / oscuro
  document.getElementById("tema").addEventListener("click", function () {
    var root = document.documentElement;
    var actual = root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var nuevo = actual === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", nuevo);
    try { localStorage.setItem("cf-tema", nuevo); } catch (err) {}
  });
})();
