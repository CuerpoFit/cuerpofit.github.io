/* CuerpoFit: las 10 versiones de la página para ver cuál convierte más (?v=1 ... ?v=10; ?v=a y ?v=b de W2 = 1 y 2).
   Se carga en el <head> antes de pintar, así la versión sale sin parpadeo.

   CÓMO DEJAR MENOS VERSIONES ACTIVAS: editá ACTIVAS (ej. [1, 3, 4, 8]) y volvé a publicar.
   Quien no trae ?v= cae en una de las activas al azar y se queda siempre en esa (se guarda en su navegador);
   si su versión deja de estar activa, se le reparte otra. ?v=N fuerza una versión aunque no esté activa (para probar).

   Qué cambia cada una:
   titulo   1 "Bajá grasa y ganá músculo..." | 2 "Tu cambio físico, juntos 💪" | 3 "+3000 resultados reales en 25 países"
   arriba   pagar (precio y Pagar ahora) | wpp (botón de WhatsApp) | gar (garantía y ver precios) | quien (es para vos si / no) | res (fotos de resultados)
   orden    bloques después de la parte de arriba (resultados, quien, plan, preguntas); el cierre siempre va último
   garantia destacada (tarjeta grande junto al precio) | discreta (una línea debajo del botón y en preguntas)
   trato    cyc "clientas y clientes" | cli "clientes"
   barra    botón fijo de abajo en el celu: pagar (lleva a los precios) | wpp */
(function () {
  var ACTIVAS = [1, 2, 4, 8];   // 13/11: arrancan 4 (difieren en lo de arriba). web/_medir.py lee esta misma lista

  var VERSIONES = {
    1:  { titulo: 1, arriba: "pagar", orden: ["resultados", "quien", "plan", "preguntas"], garantia: "discreta",  trato: "cyc", barra: "pagar" },
    2:  { titulo: 1, arriba: "wpp",   orden: ["resultados", "quien", "plan", "preguntas"], garantia: "discreta",  trato: "cyc", barra: "wpp" },
    3:  { titulo: 1, arriba: "pagar", orden: ["resultados", "plan", "quien", "preguntas"], garantia: "destacada", trato: "cli", barra: "pagar" },
    4:  { titulo: 1, arriba: "quien", orden: ["quien", "resultados", "plan", "preguntas"], garantia: "discreta",  trato: "cli", barra: "wpp" },
    5:  { titulo: 1, arriba: "res",   orden: ["resultados", "plan", "quien", "preguntas"], garantia: "discreta",  trato: "cyc", barra: "wpp" },
    6:  { titulo: 2, arriba: "wpp",   orden: ["resultados", "quien", "plan", "preguntas"], garantia: "discreta",  trato: "cyc", barra: "wpp" },
    7:  { titulo: 3, arriba: "pagar", orden: ["resultados", "plan", "quien", "preguntas"], garantia: "discreta",  trato: "cli", barra: "pagar" },
    8:  { titulo: 1, arriba: "gar",   orden: ["resultados", "plan", "quien", "preguntas"], garantia: "destacada", trato: "cli", barra: "pagar" },
    9:  { titulo: 3, arriba: "wpp",   orden: ["plan", "resultados", "quien", "preguntas"], garantia: "destacada", trato: "cyc", barra: "wpp" },
    10: { titulo: 2, arriba: "quien", orden: ["quien", "resultados", "plan", "preguntas"], garantia: "destacada", trato: "cyc", barra: "pagar" }
  };

  var d = document.documentElement, n, guardada;
  var pedida = (new URLSearchParams(location.search).get("v") || "").toLowerCase();
  if (pedida === "a") pedida = "1";
  if (pedida === "b") pedida = "2";
  n = VERSIONES[pedida] ? +pedida : 0;
  if (!n) {
    try { guardada = +localStorage.getItem("cf-ver"); } catch (e) {}
    n = ACTIVAS.indexOf(guardada) >= 0 ? guardada : ACTIVAS[Math.floor(Math.random() * ACTIVAS.length)];
  }
  try { localStorage.setItem("cf-ver", n); } catch (e) {}

  var c = VERSIONES[n];
  d.setAttribute("data-ver", n);
  d.setAttribute("data-tit", c.titulo);
  d.setAttribute("data-arriba", c.arriba);
  d.setAttribute("data-gar", c.garantia);
  d.setAttribute("data-trato", c.trato);
  d.setAttribute("data-barra", c.barra);
  // orden y fondo alternado de los bloques (con CSS order: sale ordenado desde el primer pintado)
  c.orden.forEach(function (b, i) {
    d.style.setProperty("--o-" + b, i + 1);
    d.style.setProperty("--f-" + b, i % 2 ? "var(--bg)" : "var(--bg2)");
  });
  window.CF_VERSION = { n: n, cfg: c };
})();
