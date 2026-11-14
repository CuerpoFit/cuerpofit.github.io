/* CuerpoFit: página para leads (sin servidor, sin cookies, sin píxeles).
   La versión (1 a 10) la elige assets/versiones.js en el <head>. Se mide de 2 formas:
   1) el texto que llega al wpp lleva el origen (?de=) y la versión entre paréntesis: "(TikTok, v3)" (ver TEXTOS);
   2) contadores anónimos por versión (abacus, el mismo servicio que la portada vieja), todos "<evento>_vN" y 1 vez por sesión
      salvo los toques: visita; sec_<bloque> (hasta dónde bajó); t10 / t30 / t60 (segundos con la página a la vista);
      pagar_mes / pagar_unico, transf, wpp, duo, pague, precios (toques); pais (cambió de país); faq_<pregunta> (abrió).
      La página gracias/ suma g_visita, g_form, g_wpp. Los lee web/_medir.py. */
(function () {
  "use strict";

  var TEL = "5491178129062";
  var root = document.documentElement;

  // ?de=tt | ig | bio | wa  ->  cómo aparece en el mensaje armado
  var ORIGENES = { tt: "TikTok", ig: "Instagram", bio: "link de la bio", wa: "WhatsApp" };

  // Valores = los del closer hoy (closer/precios.py, data/ab/closer_precio.json: 39k campeón; exterior 35/70 USD).
  // Links de pago = los mismos que manda el closer, verificados el 13/11 (MP 39.000 y 78.000 ARS, PayPal 35 y 70 USD).
  var PRECIOS = {
    ar: {
      mes_n: "39.000", mes_u: "pesos argentinos por mes", unico_n: "78.000", unico_u: "pesos argentinos los 3 meses", ahorro: "39.000 pesos",
      pago: { mes: "https://mpago.la/331QJt7", unico: "https://mpago.la/1kyTLs5" },
      medio: "Con tarjeta (crédito, débito o prepaga) o con tu cuenta de Mercado Pago.",
      alt: "Pagar por transferencia", altMsj: "pagar por transferencia"
    },
    ext: {
      mes_n: "35", mes_u: "dólares por mes 🌎", unico_n: "70", unico_u: "dólares los 3 meses 🌎", ahorro: "35 dólares",
      pago: { mes: "https://www.paypal.com/ncp/payment/E6J6PM3WRL3B2", unico: "https://www.paypal.com/ncp/payment/NRNS2NNHFP3FY" },
      medio: "Con tarjeta de débito o crédito, sin hacerte cuenta de PayPal.",
      alt: "Pagar por Prex o Western", altMsj: "pagar por Prex o Western"
    }
  };
  var OPCION = { mes: "mes a mes", unico: "pago único" };

  var params = new URLSearchParams(location.search);
  var origen = ORIGENES[(params.get("de") || "").toLowerCase()] || "";
  var V = window.CF_VERSION || { n: 1, cfg: { arriba: "pagar", orden: [], barra: "pagar" } };
  var version = "v" + V.n;
  var estado = { pais: "ar", op: "mes" };

  function marca(extra) {
    var partes = [extra, origen, version].filter(Boolean);
    return " (" + partes.join(", ") + ")";
  }

  // ---------- contadores por versión (sin datos personales ni cookies): visita (1 por sesión), pagar, transf, wpp
  var NS = "ripo-cf-web-7q2m";
  var prueba = location.protocol === "file:" || /^(localhost|127\.|\[::1\])/.test(location.hostname) || params.has("prueba");
  // abacus deja 30 toques cada 10 s por IP: si responde 429 (muchos juntos o IP compartida) reintenta hasta 3 veces
  function mandar(url, n) {
    try {
      fetch(url, { keepalive: true }).then(function (r) {
        if (r.status === 429 && n < 3) setTimeout(function () { mandar(url, n + 1); }, 11000);
      }).catch(function () {});
    } catch (e) {}
  }
  function contar(ev) {
    if (prueba) { window.CF_EVENTOS = (window.CF_EVENTOS || []).concat(ev + "_" + version); return; }  // en prueba solo se anota (para revisar)
    mandar("https://abacus.jasoncameron.dev/hit/" + NS + "/" + ev + "_" + version, 0);
  }
  var marcadas = {};
  function contarUnaVez(ev) {  // 1 por sesión (visita, secciones, tiempo, preguntas, país)
    var k = "cf-" + ev + "-" + version, ya = marcadas[k];
    try { ya = ya || sessionStorage.getItem(k) === "1"; sessionStorage.setItem(k, "1"); } catch (e) {}
    marcadas[k] = true;
    if (!ya) contar(ev);
  }
  contarUnaVez("visita");
  // para la página gracias/ (vuelta de Mercado Pago o PayPal): el origen (la versión ya la guarda versiones.js en cf-ver)
  try { if (origen) localStorage.setItem("cf-de", (params.get("de") || "").toLowerCase()); } catch (e) {}

  // tiempo con la página a la vista (no cuenta mientras está en WhatsApp u otra app): tramos 10, 30 y 60 segundos
  (function () {
    var seg = 0, tramos = [10, 30, 60];
    var reloj = setInterval(function () {
      if (document.hidden) return;
      seg++;
      if (tramos.indexOf(seg) >= 0) contarUnaVez("t" + seg);
      if (seg >= 60) clearInterval(reloj);
    }, 1000);
  })();

  // Mensajes armados (uno por botón, con origen y versión). Listados en TANDA_W3.md para que el closer / CM los reconozcan.
  var TEXTOS = {
    hablar: function () { return "hola Ripo, vengo de la página" + marca(); },
    alt: function () { return "hola Ripo, quiero entrar a CuerpoFit y " + PRECIOS[estado.pais].altMsj + marca(OPCION[estado.op]); },
    pague: function () {
      return "hola Ripo, pagué " + (estado.op === "unico" ? "el pago único" : "el primer mes") + " desde la página, te mando el comprobante" + marca();
    },
    duo: function () { return "hola Ripo, vi la página y quiero entrar con el plan dúo o trío" + marca(); }
  };

  var ua = navigator.userAgent || "";
  var android = /Android/i.test(ua);
  var tt = /TikTok|musical_ly|BytedanceWebview|Bytedance|trill/i.test(ua);
  var ig = /Instagram/i.test(ua), fb = /FBAN|FBAV|FB_IAB/i.test(ua), wv = /; wv\)/.test(ua);
  var inApp = tt || ig || fb || wv;

  function waUrl(texto) { return "https://wa.me/" + TEL + "?text=" + encodeURIComponent(texto); }
  function href(texto) {
    // Android dentro de IG / FB: intent (abre WhatsApp o WhatsApp Business); TikTok lo bloquea igual (landing_wa, 02/11)
    if (android && inApp && !tt) {
      return "intent://send/?phone=" + TEL + "&text=" + encodeURIComponent(texto) +
        "#Intent;scheme=whatsapp;S.browser_fallback_url=" + encodeURIComponent(waUrl(texto)) + ";end";
    }
    return waUrl(texto);
  }
  function textoDe(a) { return (TEXTOS[a.getAttribute("data-boton")] || TEXTOS.hablar)(); }

  // ---------- bloques en el orden de la versión (el CSS ya los muestra ordenados; esto deja el DOM igual para el teclado y lectores)
  var main = document.getElementById("bloques"), cierre = document.getElementById("cierre");
  V.cfg.orden.forEach(function (b) {
    var el = main.querySelector('[data-bloque="' + b + '"]');
    if (el) main.insertBefore(el, cierre);
  });

  // ---------- la elección del plan: se clona arriba (versiones "pagar") y en el plan
  var tpl = document.getElementById("t-oferta");
  // (el hueco de arriba solo en las versiones "pagar")
  document.querySelectorAll("[data-oferta]").forEach(function (hueco) {
    if (hueco.closest(".arr-pagar") && V.cfg.arriba !== "pagar") return;
    var of = tpl.content.firstElementChild.cloneNode(true);
    var nombre = "op-" + hueco.getAttribute("data-oferta");
    of.querySelectorAll("input[type=radio]").forEach(function (r) { r.name = nombre; });
    hueco.appendChild(of);
  });

  function pintar() {
    var P = PRECIOS[estado.pais];
    root.setAttribute("data-pais", estado.pais);
    document.querySelectorAll(".pais-b").forEach(function (b) {
      b.setAttribute("aria-checked", b.getAttribute("data-pais") === estado.pais ? "true" : "false");
    });
    document.querySelectorAll(".of-ops input").forEach(function (r) { r.checked = r.value === estado.op; });
    document.querySelectorAll("[data-p]").forEach(function (el) {
      var v = P[el.getAttribute("data-p")];
      if (typeof v === "string") el.textContent = v;
    });
    document.querySelectorAll(".js-pago").forEach(function (a) { a.href = P.pago[estado.op]; });
    document.querySelectorAll(".js-wa").forEach(function (a) { a.href = href(textoDe(a)); });
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".pais-b");
    if (b && b.getAttribute("data-pais") !== estado.pais) { estado.pais = b.getAttribute("data-pais"); contarUnaVez("pais"); pintar(); }
  });
  document.addEventListener("change", function (e) {
    if (e.target.matches && e.target.matches(".of-ops input")) { estado.op = e.target.value; pintar(); }
  });

  function paisInicial() {
    var p = (params.get("pais") || "").toLowerCase();
    if (p === "ar" || p === "ext") return p;
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (tz && !/^America\/(Argentina|Buenos_Aires|Cordoba|Catamarca|Jujuy|Mendoza)/.test(tz)) return "ext";
    } catch (err) {}
    return "ar";
  }
  estado.pais = paisInicial();
  pintar();

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
    if (!e.target.closest) return;
    if (e.target.closest(".js-pago")) {
      contar("pagar_" + estado.op);
      try { localStorage.setItem("cf-pago", estado.op); } catch (err) {}  // la página gracias/ sabe qué pagó
    }
    if (e.target.closest('a[href="#plan"]')) contar("precios");
  });
  // preguntas frecuentes: cuál abrió
  document.querySelectorAll("details[data-q]").forEach(function (d) {
    d.addEventListener("toggle", function () { if (d.open) contarUnaVez("faq_" + d.getAttribute("data-q")); });
  });

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest(".js-wa");
    if (!a) return;
    var tipo = a.getAttribute("data-boton");
    if (tipo === "alt") contar("transf");
    else if (tipo === "hablar") contar("wpp");
    else if (tipo === "duo" || tipo === "pague") contar(tipo);
    var texto = textoDe(a);
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

  // ---------- botón fijo abajo: aparece cuando lo de arriba ya no se ve, y se va en el plan y en el cierre
  var barra = document.getElementById("barra");
  var boton = barra.querySelector(".barra-" + (V.cfg.barra === "wpp" ? "wpp" : "pagar"));
  if ("IntersectionObserver" in window) {
    var vis = {};
    var upd = function () {
      var ver = !vis.ancla && !vis.plan && !vis.cierre;
      barra.classList.toggle("ver", ver);
      barra.setAttribute("aria-hidden", ver ? "false" : "true");
      boton.tabIndex = ver ? 0 : -1;
    };
    var mirar = function (el, k) {
      if (!el) return;
      new IntersectionObserver(function (es) { vis[k] = es[0].isIntersecting; upd(); }).observe(el);
    };
    var arr = V.cfg.arriba;
    mirar(document.querySelector(arr === "quien" || arr === "res" ? ".solo-arriba-" + arr + " .js-ancla" : ".arr-" + arr + " .js-ancla"), "ancla");
    mirar(document.querySelector("#plan .of"), "plan");
    mirar(document.getElementById("cierre"), "cierre");
  }

  // ---------- hasta dónde bajó: una marca por bloque la primera vez que entra en pantalla (arriba del 70% de la pantalla)
  if ("IntersectionObserver" in window) {
    var SECS = { inicio: "arriba", resultados: "resultados", "para-quien": "quien", plan: "plan", preguntas: "preguntas", cierre: "cierre" };
    var ojo = new IntersectionObserver(function (es) {
      es.forEach(function (x) {
        if (!x.isIntersecting) return;
        contarUnaVez("sec_" + SECS[x.target.id]);
        ojo.unobserve(x.target);
      });
    }, { rootMargin: "0px 0px -30% 0px" });
    Object.keys(SECS).forEach(function (id) { var el = document.getElementById(id); if (el) ojo.observe(el); });
  }

  // ---------- claro / oscuro
  document.getElementById("tema").addEventListener("click", function () {
    var actual = root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var nuevo = actual === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", nuevo);
    try { localStorage.setItem("cf-tema", nuevo); } catch (err) {}
  });
})();
