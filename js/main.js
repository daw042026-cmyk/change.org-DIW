/* ==========================================================================
   Interacción de la maqueta. No hay registro, almacenamiento ni envío real:
   solo validación visual, contadores y vista previa.
   ========================================================================== */
(function () {
  "use strict";

  const formatNumber = (n) => n.toLocaleString("es-ES");

  /* ---------- 1. Firma de petición (petición.html) ---------- */
  const formFirma = document.getElementById("form-firma");
  if (formFirma) {
    const goal = 100000;
    const barra = document.getElementById("barra-firmas");
    const contador = document.getElementById("contador-firmas");
    const restantes = document.getElementById("firmas-restantes");
    const mensaje = document.getElementById("mensaje-firma");
    let firmas = parseInt(formFirma.dataset.firmas || "0", 10);

    const actualizar = () => {
      if (barra) {
        const pct = Math.min(100, (firmas / goal) * 100);
        barra.style.width = pct.toFixed(1) + "%";
        barra.setAttribute("aria-valuenow", Math.round(pct));
      }
      if (contador) contador.textContent = formatNumber(firmas);
      if (restantes) restantes.textContent = "Faltan " + formatNumber(Math.max(0, goal - firmas)) + " firmas";
    };
    actualizar();

    formFirma.addEventListener("submit", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!formFirma.checkValidity()) {
        formFirma.classList.add("was-validated");
        return;
      }
      firmas += 1;
      actualizar();
      mensaje.classList.remove("d-none");
      formFirma.reset();
      formFirma.classList.remove("was-validated");
      mensaje.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* ---------- 2. Crear petición (crear.html) ---------- */
  const formCrear = document.getElementById("form-crear");
  if (formCrear) {
    const campos = {
      titulo: { input: "titulo", out: "prev-titulo", max: 70, count: "cnt-titulo" },
      destinatario: { input: "destinatario", out: "prev-destinatario", max: 100, count: null },
      descripcion: { input: "descripcion", out: "prev-descripcion", max: 1500, count: "cnt-descripcion" },
    };

    Object.values(campos).forEach((c) => {
      const el = document.getElementById(c.input);
      const out = document.getElementById(c.out);
      const cnt = c.count ? document.getElementById(c.count) : null;
      const update = () => {
        const value = el.value.trim();
        if (out) {
          out.textContent = value || out.dataset.placeholder;
        }
        if (cnt) {
          cnt.textContent = `${el.value.length}/${c.max}`;
        }
      };
      el.setAttribute("maxlength", c.max);
      el.addEventListener("input", update);
      update();
    });

    // Vista previa de la imagen subida
    const inputImg = document.getElementById("imagen");
    const previewImg = document.getElementById("prev-imagen");
    if (inputImg && previewImg) {
      inputImg.addEventListener("change", () => {
        const file = inputImg.files && inputImg.files[0];
        if (file && file.type.startsWith("image/")) {
          previewImg.src = URL.createObjectURL(file);
        }
      });
    }

    // Categoría en la vista previa
    const selCat = document.getElementById("categoria");
    const outCat = document.getElementById("prev-categoria");
    if (selCat && outCat) {
      const updateCat = () => {
        outCat.textContent = selCat.value ? selCat.options[selCat.selectedIndex].text : "Categoría";
      };
      selCat.addEventListener("change", updateCat);
      updateCat();
    }

    formCrear.addEventListener("submit", (e) => {
      e.preventDefault();
      formCrear.classList.add("was-validated");
      if (!formCrear.checkValidity()) {
        const primero = formCrear.querySelector(":invalid");
        if (primero) primero.focus();
        return;
      }
      const ok = document.getElementById("mensaje-crear");
      ok.classList.remove("d-none");
      ok.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    document.querySelectorAll("[data-guardar-borrador]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const ok = document.getElementById("mensaje-crear");
        ok.textContent = "Borrador guardado (solo demostración: no se almacena nada).";
        ok.classList.remove("d-none");
      });
    });
  }

  /* ---------- 3. Botones de firma rápida en las tarjetas ---------- */
  document.querySelectorAll("[data-firmar-rapido]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const span = btn.querySelector(".num-firmas");
      if (!span) return;
      const actual = parseInt(span.dataset.valor || "0", 10) + 1;
      span.dataset.valor = actual;
      span.textContent = formatNumber(actual);
      btn.classList.replace("btn-cg", "btn-success");
      btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Firmada';
      btn.disabled = true;
    });
  });
  /* ---------- 4. Carrusel de personas (móvil) ---------- */
  const peopleRow = document.querySelector(".people-row");
  if (peopleRow) {
    const cards = Array.from(peopleRow.children);
    const centrar = (card) => {
      const target = card.offsetLeft - (peopleRow.clientWidth - card.offsetWidth) / 2;
      peopleRow.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    };
    const indiceCentrado = () => {
      const centro = peopleRow.scrollLeft + peopleRow.clientWidth / 2;
      let mejor = 0, dist = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - centro);
        if (d < dist) { dist = d; mejor = i; }
      });
      return mejor;
    };
    // Al cargar, centrar la primera tarjeta sin animación
    peopleRow.scrollLeft = 0; // la primera tarjeta se centra con padding en CSS
    const prev = document.querySelector("[data-people-prev]");
    const next = document.querySelector("[data-people-next]");
    if (prev) prev.addEventListener("click", () => centrar(cards[Math.max(0, indiceCentrado() - 1)]));
    if (next) next.addEventListener("click", () => centrar(cards[Math.min(cards.length - 1, indiceCentrado() + 1)]));
  }
})();
