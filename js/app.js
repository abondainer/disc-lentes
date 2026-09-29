(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Tono suave de cada color (html2canvas no soporta color-mix)
  const SOFT = { D: "rgba(192,57,43,.10)", I: "rgba(42,77,114,.10)", S: "rgba(30,138,99,.10)", C: "rgba(184,128,26,.12)" };
  const cvars = (L) => `--c:${STYLES[L].color};--c-soft:${SOFT[L]}`;
  const tag = (L) => `<span class="tag" style="background:${STYLES[L].color}">${L}</span>`;
  // Insignia en SVG para la ficha: html2canvas desplaza el texto HTML dentro de cajas, el SVG sale exacto
  const badge = (L, size, r, fs) =>
    `<svg class="badge" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${L}">` +
    `<rect width="${size}" height="${size}" rx="${r}" fill="${STYLES[L].color}"/>` +
    `<text x="${size / 2}" y="${size / 2}" dy=".36em" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-weight="800" font-size="${fs}" fill="#fff">${L}</text></svg>`;

  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento: la app sigue funcionando */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };
  const KEY_RESULT = "disc_lentes_result_v1";

  function toast(msg, ms = 2600) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.add("hidden"), ms);
  }

  /* =========================================================
   * 1. PRESENTACIÓN EMBEBIDA
   * ======================================================= */
  function buildLensSlides() {
    $$(".lens-slide").forEach((el, idx) => {
      const L = el.dataset.lens, s = STYLES[L];
      el.setAttribute("style", cvars(L));
      el.innerHTML = `
        <img class="lens-img" src="${s.img}" alt="">
        <span class="lens-count">LENTE ${idx + 1} DE 4</span>
        <div class="slide-inner">
          <div class="lens-head">
            <div class="lens-letter">${L}</div>
            <div>
              <h3>${s.name}</h3>
              <div class="lens-lema">«${esc(s.lema)}»</div>
              <p class="lens-desc">${esc(s.desc)}</p>
            </div>
          </div>
          <div class="lens-body">
            <div class="lens-box"><h4>Qué valora</h4><p>${esc(s.valora)}</p></div>
            <div class="lens-box"><h4>Qué lo motiva</h4><p>${esc(s.motiva)}</p></div>
            <div class="lens-box"><h4>Qué lo endurece</h4><p>${esc(s.endurece)}</p></div>
            <div class="lens-box comm"><h4>Cómo comunicarte</h4><p><b>${esc(s.comunicar)}</b> ${esc(s.tip)}</p></div>
            <div class="lens-box risk"><h4>Riesgo de sobreuso</h4><p>${esc(s.sobreuso)}</p></div>
          </div>
        </div>`;
    });

    $("#cederGrid").innerHTML = ORDER.map((L) => `
      <div class="r4" style="${cvars(L)}"><b class="l">${L}</b>
        <ul>${STYLES[L].ceder.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>`).join("");

    $("#sobreusoGrid").innerHTML = ORDER.map((L) => `
      <div class="r4" style="${cvars(L)}"><b class="l">${L}</b><p>${esc(STYLES[L].sobreusoCorto)}</p></div>`).join("");

    $("#equipoGrid").innerHTML = ORDER.map((L) => `
      <div class="r4" style="${cvars(L)}"><b class="l">${L}</b>
        <span class="t">${esc(STYLES[L].equipoLabel)}</span><p>${esc(STYLES[L].equipoRol)}</p></div>`).join("");

    $("#seesMatrix").innerHTML =
      `<thead><tr><th></th>${ORDER.map((L) => `<th>A los ${L}</th>`).join("")}</tr></thead><tbody>` +
      ORDER.map((V) => `<tr><th>${tag(V)} Los ${V} ven…</th>${ORDER.map((T) =>
        `<td class="${V === T ? "same" : ""}">${esc(SEES[V][T])}</td>`).join("")}</tr>`).join("") +
      `</tbody>`;

    $("#seesList").innerHTML = ORDER.map((V) => `
      <div class="ml-item" style="${cvars(V)}">
        <div class="ml-head">${tag(V)} Los ${V} ven…</div>
        ${ORDER.map((T) => `<p class="${V === T ? "same" : ""}"><span>A los ${T}:</span> ${esc(SEES[V][T])}</p>`).join("")}
      </div>`).join("");
  }

  function initDeck() {
    const deck = $("#deck"), track = $("#deckTrack");
    const slides = $$(".slide", track);
    const prev = $("#deckPrev"), next = $("#deckNext");
    const n = slides.length;
    let current = 0;
    let target = null; // destino pendiente mientras dura la animación

    const go = (i) => {
      i = Math.max(0, Math.min(n - 1, i));
      target = i;
      const start = track.scrollLeft, dest = i * track.clientWidth;
      track.scrollTo({ left: dest, behavior: "smooth" });
      // respaldo: si el navegador no ejecutó la animación, saltar directo
      setTimeout(() => {
        if (target === i && Math.abs(track.scrollLeft - start) < 1 && Math.abs(start - dest) > 1) {
          track.scrollLeft = dest;
          update();
        }
      }, 700);
    };
    const update = () => {
      if (!track.clientWidth) return;
      const i = Math.round(track.scrollLeft / track.clientWidth);
      current = Math.max(0, Math.min(n - 1, Number.isFinite(i) ? i : 0));
      if (target !== null && Math.abs(track.scrollLeft - target * track.clientWidth) < 2) target = null;
      $("#deckCount").textContent = `${current + 1} / ${n}`;
      $("#deckBar").style.width = `${((current + 1) / n) * 100}%`;
      prev.disabled = current === 0;
      next.disabled = current === n - 1;
      slides.forEach((s, k) => s.setAttribute("aria-hidden", k === current ? "false" : "true"));
    };

    const base = () => (target !== null ? target : current);
    prev.addEventListener("click", () => go(base() - 1));
    next.addEventListener("click", () => go(base() + 1));
    // si el usuario desliza con el dedo/trackpad, se descarta el destino pendiente
    ["touchstart", "wheel"].forEach((ev) => track.addEventListener(ev, () => { target = null; }, { passive: true }));
    let raf;
    track.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", () => {
      track.scrollLeft = current * track.clientWidth;
      update();
    });
    deck.addEventListener("keydown", (e) => {
      if (e.target.matches("input, textarea")) return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(base() + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(base() - 1); }
    });
    $$("[data-goto]", track).forEach((b) => b.addEventListener("click", () => go(+b.dataset.goto)));
    update();
  }

  /* =========================================================
   * 2. TEST
   * ======================================================= */
  // answers[row][col] = 1..4 (col en orden D,I,S,C) ; picks[row] = columnas en el orden tocado
  let picks = ROWS.map(() => []);
  let row = 0;
  let advanceTimer = null;

  const intro = $("#testIntro"), run = $("#testRun");

  function scoreFromPicks(p) {
    const a = [0, 0, 0, 0];
    p.forEach((col, k) => { a[col] = 4 - k; });
    return a;
  }

  function renderRow(dir) {
    const wordsEl = $("#words");
    const order = DISPLAY_ORDER[row];
    const p = picks[row];
    wordsEl.innerHTML = order.map((col) => {
      const k = p.indexOf(col);
      const sc = k >= 0 ? 4 - k : null;
      return `<button type="button" class="word ${sc ? "ranked rk" + sc : ""}" data-col="${col}" aria-pressed="${!!sc}"
                aria-label="${esc(ROWS[row][col])}${sc ? ", calificación " + sc : ""}">
                <span class="score">${sc || ""}</span>${esc(ROWS[row][col])}</button>`;
    }).join("");
    if (dir) {
      wordsEl.classList.remove("slide-in", "slide-back");
      void wordsEl.offsetWidth;
      wordsEl.classList.add(dir > 0 ? "slide-in" : "slide-back");
    }
    $("#rowLabel").textContent = `Tarjeta ${row + 1} de ${ROWS.length}`;
    const done = picks.filter((x) => x.length === 4).length;
    $("#progressBar").style.width = `${(done / ROWS.length) * 100}%`;
    const hints = ["Toca la palabra que <b>más</b> te describe", "Ahora la <b>segunda</b> que más te describe", "Ahora la <b>tercera</b>", ""];
    $("#rowHint").innerHTML = p.length < 4 ? hints[p.length] : "Listo. Puedes seguir o rehacer la tarjeta.";
    $("#nextBtn").disabled = p.length < 4;
    $("#nextBtn").textContent = row === ROWS.length - 1 ? "Ver mi resultado →" : "Siguiente →";
    $("#backBtn").style.visibility = row === 0 ? "hidden" : "visible";
    $("#resetRowBtn").style.visibility = p.length ? "visible" : "hidden";
  }

  function onWordClick(e) {
    const btn = e.target.closest(".word");
    if (!btn) return;
    clearTimeout(advanceTimer);
    const col = +btn.dataset.col;
    const p = picks[row];
    const k = p.indexOf(col);
    if (k >= 0) {
      // desmarcar esta palabra y las que se marcaron después
      p.splice(k);
    } else {
      p.push(col);
      if (p.length === 3) {
        // la palabra restante recibe automáticamente el 1
        const last = [0, 1, 2, 3].find((c) => !p.includes(c));
        p.push(last);
      }
    }
    renderRow();
    if (p.length === 4) advanceTimer = setTimeout(goNext, 650);
  }

  function goNext() {
    clearTimeout(advanceTimer);
    if (picks[row].length < 4) return;
    if (row < ROWS.length - 1) { row++; renderRow(1); }
    else finishTest();
  }

  function startTest() {
    picks = ROWS.map(() => []);
    row = 0;
    intro.classList.add("hidden");
    run.classList.remove("hidden");
    $("#resultado").classList.add("hidden");
    renderRow(1);
    run.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function computeResult() {
    const totals = { D: 0, I: 0, S: 0, C: 0 };
    picks.forEach((p) => {
      const a = scoreFromPicks(p);
      ORDER.forEach((L, c) => { totals[L] += a[c]; });
    });
    const sum = ORDER.reduce((s, L) => s + totals[L], 0);
    if (sum !== SCALE.total) throw new Error(`Suma inválida: ${sum}`);
    const max = Math.max(...ORDER.map((L) => totals[L]));
    const predominant = ORDER.filter((L) => totals[L] > SCALE.mid).sort((a, b) => totals[b] - totals[a]);
    const dominant = max > SCALE.mid ? ORDER.filter((L) => totals[L] === max) : [];
    return {
      name: ($("#nameInput").value || "").trim().slice(0, 60),
      date: new Date().toISOString(),
      totals, predominant, dominant,
    };
  }

  function finishTest() {
    let res;
    try { res = computeResult(); }
    catch (e) { toast("Hubo un problema al calcular. Revisa que todas las tarjetas estén completas."); return; }
    store.set(KEY_RESULT, res);
    run.classList.add("hidden");
    intro.classList.remove("hidden");
    $("#resumeBtn").classList.remove("hidden");
    showResult(res);
  }

  /* =========================================================
   * 3. FICHA TÉCNICA
   * ======================================================= */
  function chartSVG(t) {
    const W = 480, H = 340, padL = 78, padR = 92, padT = 40, padB = 34;
    const x = (i) => padL + ((W - padL - padR) / 3) * i;
    const y = (v) => padT + (SCALE.max - v) / (SCALE.max - SCALE.min) * (H - padT - padB);
    const ticks = [12, 16, 20, 24, 28, 30, 32, 36, 40, 44, 48];
    let g = "";
    ticks.forEach((v) => {
      const isMid = v === SCALE.mid;
      g += `<line x1="${padL - 14}" x2="${W - padR + 14}" y1="${y(v)}" y2="${y(v)}" stroke="${isMid ? "#0F3B49" : "#E3E8EC"}" stroke-width="${isMid ? 2 : 1}"/>`;
      g += `<text x="${padL - 20}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="${isMid ? "#0F3B49" : "#8A99A6"}" font-weight="${isMid ? 700 : 500}">${v}</text>`;
    });
    g += `<text x="${W - padR + 18}" y="${y(SCALE.mid) - 4}" font-size="10" font-weight="700" fill="#0F3B49">Línea</text>`;
    g += `<text x="${W - padR + 18}" y="${y(SCALE.mid) + 9}" font-size="10" font-weight="700" fill="#0F3B49">intermedia</text>`;
    g += `<text x="${padL - 20}" y="${padT - 18}" text-anchor="end" font-size="10" fill="#4E6275" font-weight="600">Estilo alto</text>`;
    g += `<text x="${padL - 20}" y="${H - 8}" text-anchor="end" font-size="10" fill="#4E6275" font-weight="600">Estilo bajo</text>`;
    ORDER.forEach((L, i) => {
      g += `<line x1="${x(i)}" x2="${x(i)}" y1="${padT}" y2="${H - padB}" stroke="#E3E8EC"/>`;
      g += `<text x="${x(i)}" y="${padT - 18}" text-anchor="middle" font-size="15" font-weight="800" fill="${STYLES[L].color}">${L}</text>`;
    });
    const pts = ORDER.map((L, i) => `${x(i)},${y(t[L])}`).join(" ");
    g += `<polyline points="${pts}" fill="none" stroke="#469DE6" stroke-width="3" stroke-linejoin="round"/>`;
    ORDER.forEach((L, i) => {
      g += `<circle cx="${x(i)}" cy="${y(t[L])}" r="8" fill="${STYLES[L].color}" stroke="#fff" stroke-width="2.5"/>`;
      g += `<text x="${i < 3 ? x(i) + 10 : x(i) - 10}" y="${y(t[L]) - 10}" text-anchor="${i < 3 ? "start" : "end"}" font-size="12" font-weight="800" fill="#1A1A1A">${t[L]}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Perfil DISC: D ${t.D}, I ${t.I}, S ${t.S}, C ${t.C}" font-family="Montserrat, sans-serif">${g}</svg>`;
  }

  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" }); }
    catch (e) { return iso.slice(0, 10); }
  }

  function head(res, subtitle) {
    return `<div class="f-head">
      <div class="circle"></div>
      <div style="position:relative">
        <h3>Ficha técnica · Tendencia DISC</h3>
        <div class="f-meta">${res.name ? esc(res.name) + " · " : ""}${fmtDate(res.date)}${subtitle ? " · " + subtitle : ""}</div>
      </div>
      <img src="assets/logo-di-blanco.png" alt="Distilled Innovation">
    </div>`;
  }
  const foot = (page, pages) => `<div class="f-foot"><span>Contenido: Patricia Fuel · <i>Negociar para servir</i> · Plataforma: Distilled Innovation</span><span>${page} / ${pages}</span></div>`;

  function summaryPage(res, pages) {
    const t = res.totals;
    let verdict;
    if (res.dominant.length === 0) {
      verdict = `<div class="verdict"><h4>Perfil equilibrado</h4>
        <p>Tus cuatro totales quedaron exactamente en la línea intermedia (${SCALE.mid}). No hay un temperamento por encima de la línea.</p></div>`;
    } else {
      const big = res.dominant.map((L) => badge(L, 64, 16, 32)).join("");
      const names = res.dominant.map((L) => STYLES[L].name).join(" y ");
      const lemas = res.dominant.map((L) => `«${esc(STYLES[L].lema)}»`).join(" · ");
      verdict = `<div class="verdict">
        <div class="f-sec-title">${res.dominant.length > 1 ? "Tus letras dominantes (empate)" : "Tu letra dominante"}</div>
        <div class="big">${big}<div><h4>${names}</h4><div style="font-weight:600;margin-top:2px">${lemas}</div></div></div>
        <p style="margin-top:14px"><b>Temperamentos predominantes</b> (por encima de la línea intermedia de ${SCALE.mid}):</p>
        <div class="chips">${res.predominant.map((L) => `<span class="chip">${badge(L, 24, 7, 13)}${STYLES[L].name} · ${t[L]}</span>`).join("")}</div>
      </div>`;
    }
    return `<div class="f-page">${head(res)}
      <div class="f-body">
        <div class="f-grid">
          <div>
            <div class="f-sec-title">Totales de tu calificación</div>
            <div class="totals">${ORDER.map((L) => `
              <div class="tot ${t[L] > SCALE.mid ? "up" : ""}" style="${cvars(L)}"><b>${L}</b><span>${t[L]}</span><small>${STYLES[L].name}</small></div>`).join("")}
            </div>
            <div class="tot-sum">Suma de los cuatro totales: ${ORDER.reduce((s, L) => s + t[L], 0)} de ${SCALE.total}.</div>
            ${verdict}
          </div>
          <div>
            <div class="f-sec-title">Perfil DISC</div>
            <div class="chart">${chartSVG(t)}</div>
            <p style="font-size:.85rem;color:#4E6275;margin-top:8px">Los puntos que se encuentran por encima de la línea intermedia son tus temperamentos predominantes.</p>
          </div>
        </div>
        <div class="f-platinum"><b>Regla de platino</b>Trata a los demás como ellos necesitan que los traten.</div>
        <p style="font-size:.8rem;color:#4E6275;margin-top:14px">Este ejercicio da una pauta sobre tu temperamento. Para conocer más a fondo sobre el temperamento, se necesitan estudios más detallados. Esto es sólo una tendencia. No hay estilos buenos ni malos.</p>
      </div>
      ${foot(1, pages)}</div>`;
  }

  function detailPage(res, L, page, pages) {
    const s = STYLES[L];
    return `<div class="f-page" style="${cvars(L)}">${head(res, "Lente " + L)}
      <div class="f-body">
        <div class="f-detail-head">
          ${badge(L, 72, 18, 38)}
          <div><h3>${s.name}</h3><p style="font-weight:700">«${esc(s.lema)}»</p><p style="color:#4E6275">${esc(s.desc)}</p></div>
        </div>
        <div class="f-cols">
          <div class="f-box"><h4>Qué valoras</h4><p>${esc(s.valora)}</p></div>
          <div class="f-box"><h4>Qué te motiva</h4><p>${esc(s.motiva)}</p></div>
          <div class="f-box"><h4>Qué te endurece</h4><p>${esc(s.endurece)}</p></div>
          <div class="f-box"><h4>Qué te puede hacer ceder</h4>${s.ceder.map((c) => `<p class="li">${esc(c)}</p>`).join("")}</div>
          <div class="f-box hl full"><h4>Cómo comunicarse contigo</h4><p><b>${esc(s.comunicar)}</b> ${esc(s.tip)}</p></div>
          <div class="f-box full" style="background:#fff;border:1.5px dashed ${s.color}"><h4>Tu riesgo de sobreuso</h4><p>${esc(s.sobreuso)}</p></div>
          <div class="f-box"><h4>Cómo te ven los otros lentes</h4>
            <table class="f-seen">${ORDER.map((V) => `<tr><th>${badge(V, 24, 7, 13)}</th><td>Los ${V} ven a los ${L}: <b>${esc(SEES[V][L])}</b></td></tr>`).join("")}</table></div>
          <div class="f-box"><h4>Cómo ves tú a los otros lentes</h4>
            <table class="f-seen">${ORDER.map((T) => `<tr><th>${badge(T, 24, 7, 13)}</th><td>Los ${L} ven a los ${T}: <b>${esc(SEES[L][T])}</b></td></tr>`).join("")}</table></div>
          <div class="f-box hl full"><h4>Tu aporte a un equipo de alto rendimiento</h4><p><b>${esc(s.equipoLabel)}:</b> ${esc(s.equipoRol)}.</p></div>
        </div>
        <div class="f-platinum"><b>El secreto es la adaptabilidad</b>Puedo prestar mis lentes y puedo ponerme los del otro.</div>
      </div>
      ${foot(page, pages)}</div>`;
  }

  function fichaHTML(res) {
    const pages = 1 + res.dominant.length;
    return summaryPage(res, pages) + res.dominant.map((L, i) => detailPage(res, L, i + 2, pages)).join("");
  }

  let lastResult = null;
  function showResult(res) {
    lastResult = res;
    $("#ficha").innerHTML = fichaHTML(res);
    const sec = $("#resultado");
    sec.classList.remove("hidden");
    requestAnimationFrame(() => sec.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  /* =========================================================
   * 4. PDF
   * ======================================================= */
  async function downloadPDF() {
    if (!lastResult) return;
    if (!window.html2canvas || !window.jspdf) { toast("No se pudo cargar el generador de PDF. Recarga la página."); return; }
    const btn = $("#pdfBtn");
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = "Generando PDF…";
    const stage = $("#pdfStage");
    try {
      stage.innerHTML = fichaHTML(lastResult);
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      await Promise.all($$("img", stage).map((im) => im.complete ? Promise.resolve() : new Promise((r) => { im.onload = im.onerror = r; })));
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
      const pw = 210, ph = 297;
      const pagesEl = $$(".f-page", stage);
      for (let i = 0; i < pagesEl.length; i++) {
        const canvas = await window.html2canvas(pagesEl[i], { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false });
        const img = canvas.toDataURL("image/jpeg", 0.92);
        let w = pw, h = (canvas.height / canvas.width) * pw;
        if (h > ph) { w = w * (ph / h); h = ph; }
        if (i > 0) pdf.addPage();
        pdf.addImage(img, "JPEG", (pw - w) / 2, 0, w, h);
      }
      const slug = (lastResult.name || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
      pdf.save(`Ficha-DISC${slug ? "-" + slug : ""}.pdf`);
      toast("Tu ficha se descargó en PDF.");
    } catch (e) {
      console.error(e);
      toast("No se pudo generar el PDF. Intenta de nuevo.");
    } finally {
      stage.innerHTML = "";
      btn.disabled = false; btn.textContent = label;
    }
  }

  /* =========================================================
   * INIT
   * ======================================================= */
  buildLensSlides();
  initDeck();

  $("#words").addEventListener("click", onWordClick);
  $("#startBtn").addEventListener("click", startTest);
  $("#nextBtn").addEventListener("click", goNext);
  $("#backBtn").addEventListener("click", () => { clearTimeout(advanceTimer); if (row > 0) { row--; renderRow(-1); } });
  $("#resetRowBtn").addEventListener("click", () => { clearTimeout(advanceTimer); picks[row] = []; renderRow(); });
  $("#retakeBtn").addEventListener("click", () => { $("#resultado").classList.add("hidden"); startTest(); });
  $("#pdfBtn").addEventListener("click", downloadPDF);
  $("#resumeBtn").addEventListener("click", () => { const r = store.get(KEY_RESULT); if (r) showResult(r); });

  const saved = store.get(KEY_RESULT);
  if (saved && saved.totals && saved.dominant) {
    $("#resumeBtn").classList.remove("hidden");
    if (saved.name) $("#nameInput").value = saved.name;
  }

  // Teclado en el test: 1-4 selecciona la palabra en esa posición
  document.addEventListener("keydown", (e) => {
    if (run.classList.contains("hidden") || e.target.matches("input, textarea")) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 4) { const b = $$(".word", $("#words"))[n - 1]; if (b) b.click(); }
  });
})();
