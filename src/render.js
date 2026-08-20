// The only module that touches the DOM.
import { CONFIG } from "./config.js";
import { EVIDENCE } from "../data/evidence.js";
import { fmtSpan, toPct } from "./format.js";
import { state } from "./fusion.js";

export const $ = id => document.getElementById(id);

/* ------------------------------------------------------------- controls */

export function fieldMarkup(ev, value = "") {
  if (ev.field.type === "select") {
    const opts = [{ value: "", label: "— not checked —" }, ...ev.field.options];
    return `<select data-key="${ev.key}">${opts.map(o =>
      `<option value="${o.value}"${o.value === value ? " selected" : ""}>${o.label}</option>`
    ).join("")}</select>`;
  }
  return `<input type="text" data-key="${ev.key}" placeholder="${ev.field.placeholder}"
           value="${String(value).replace(/"/g, "&quot;")}" autocomplete="off" spellcheck="false">`;
}

export function buildEvidence() {
  $("evidence").innerHTML = EVIDENCE.map(ev => `
    <div class="ev">
      <div>
        <div class="ev-head">
          <span class="ev-name">${ev.name}</span>
          <span class="bound ${ev.bound}">${ev.boundLabel}</span>
        </div>
        <div class="ev-where">${ev.where}</div>
        <ul class="ev-facts">${ev.facts.map(f => `<li>${f}</li>`).join("")}</ul>
        ${ev.examples ? `<div class="ev-eg">${ev.examples.join("<br>")}</div>` : ""}
      </div>
      <div class="ev-in">
        ${fieldMarkup(ev, state.raw[ev.key] || "")}
        <span class="read" id="read-${ev.key}"></span>
      </div>
    </div>`).join("");
}

export function buildAxis() {
  const ticks = [];
  for (let y = CONFIG.axisMin; y <= CONFIG.axisMax; y += 5)
    ticks.push(`<div class="tick" style="left:${toPct(y)}%">’${String(y).slice(2)}</div>`);
  $("axis").innerHTML = ticks.join("");
}

export function setReadout(key, text, bad) {
  for (const el of [$("read-" + key), $("quickPick").dataset.key === key ? $("quickRead") : null]) {
    if (!el) continue;
    el.textContent = text || "";
    el.classList.toggle("bad", !!bad);
  }
}

export function mirrorControls(key, value, source) {
  document.querySelectorAll(`[data-key="${key}"]`).forEach(el => {
    if (el !== source) el.value = value;
  });
}

/* ------------------------------------------------------- result panels */

export function renderError(message) {
  $("resultLabel").textContent = "No result";
  $("verdict").innerHTML = "&mdash;";
  $("uncertainty").textContent = $("confidence").textContent = "—";
  $("signalCount").textContent = "0";
  $("stats").classList.remove("conflict");
  $("lanes").innerHTML = "";
  $("band").style.width = $("halo").style.width = "0";
  $("whyBlock").className = "why alert";
  $("whyLabel").textContent = "Flags";
  $("why").className = "why-body";
  $("why").innerHTML = `<p>${message}</p>`;
  $("offer").hidden = true;
}

export function renderLanes(list, conflicts) {
  const inConflict = key => conflicts.some(pair => pair.some(c => c.key === key));
  $("lanes").innerHTML = list.map(c => {
    const left  = toPct(c.interval[0]);
    const width = Math.max(toPct(c.interval[1]) - left, 0.6);
    return `<div class="lane-name">${c.name}</div>
      <div class="track" title="${c.name}: ${fmtSpan(c.interval)}">
        <i class="${c.key === "serial" ? "seed" : ""} ${inConflict(c.key) ? "bad" : ""}"
           style="left:${left}%;width:${width}%"></i>
      </div>`;
  }).join("");
}

export function renderBand([lo, hi], broken, added) {
  const band = $("band"), halo = $("halo");
  $("cbs").style.left = toPct(CONFIG.cbsAcquired) + "%";
  band.classList.toggle("bad", broken);

  const [from, to] = broken ? state.serial.interval : [lo, hi];
  band.style.left  = toPct(from) + "%";
  band.style.width = Math.max(toPct(to) - toPct(from), 0.5) + "%";

  const showHalo = !broken && !added;
  halo.style.left  = showHalo ? toPct(state.serial.slop[0]) + "%" : "0";
  halo.style.width = showHalo
    ? toPct(state.serial.slop[1]) - toPct(state.serial.slop[0]) + "%" : "0";
}

export function renderReadout({ window, broken, added, months }) {
  const [tone, word] =
    broken       ? ["s-bad",  "Unresolved"] :
    months <= 9  ? ["s-ok",   "Narrow"]     :
    months <= 20 ? ["s-warn", "Moderate"]   :
                   ["s-bad",  "Wide"];

  $("stats").classList.toggle("conflict", broken);
  $("resultLabel").textContent = broken ? "Signals disagree"
                               : added  ? "Build window, narrowed"
                                        : "Likely build window";
  $("verdict").innerHTML = broken ? "CONFLICT"
    : fmtSpan(window).replace("–", '<span class="dash">–</span>');
  $("uncertainty").innerHTML   = broken ? `<span class="s-bad">—</span>` : `${months} mo`;
  $("confidence").innerHTML    = `<span class="${tone}">${word}</span>`;
  $("signalCount").textContent = `${added + 1} / ${EVIDENCE.length + 1}`;
}

export function renderNotes({ window: [lo, hi], broken, conflicts, added, notes, stretched }) {
  const out = [];

  if (broken) {
    out.push("<p><strong>These signals can't all be true of one guitar.</strong></p>");
    out.push(conflicts.length
      ? "<ul>" + conflicts.map(([a, b]) =>
          `<li><code>${a.name}</code> says ${fmtSpan(a.interval)}, but <code>${b.name}</code> says ${fmtSpan(b.interval)}.</li>`
        ).join("") + "</ul>"
      : `<p class="muted">No single pair is disjoint, but together the constraints leave nothing.</p>`);
    out.push(`<p class="muted">This is usually a parts guitar or a swapped neck rather than a forgery, and on a player-grade instrument that may be fine. On anything priced as all-original it needs resolving before money moves.</p>`);
  } else {
    const { scheme, n, years } = state.serial;
    const ranges = years.length === 1 ? "one published year range"
                                      : `${years.length} overlapping published year ranges`;
    out.push(`<p><strong>${scheme.label}.</strong> Serial ${n.toLocaleString()} falls inside ${ranges}${
      added ? `, then ${added} further signal${added > 1 ? "s" : ""} narrowed it.` : "."}</p>`);

    if (!added)
      out.push(`<p>The shaded margin is bin slop: plates were stored loose and grabbed by the handful, so one can turn up a year either side of its nominal range.</p>`);

    if (stretched)
      out.push(`<p><strong>The serial sits outside its published band for this build date.</strong> That is ordinary — plates were pulled from bins out of order — so the physical evidence has been trusted over the serial. Worth noting if anyone is quoting the serial as the year.</p>`);

    if (lo < CONFIG.cbsAcquired + 0.05 && hi > CONFIG.cbsAcquired - 0.05)
      out.push(`<p><strong>This window crosses January 1965.</strong> CBS bought Fender on 3 January 1965, but nothing on the line changed for months. Sellers use "pre-CBS" to mean either the ownership date or the feature set, and for 1965 instruments those disagree. Get the neck date before accepting either reading.</p>`);

    if (state.example) {
      const agrees = Math.floor(lo) <= state.example.verifiedYear
                  && Math.floor(hi - 1e-9) >= state.example.verifiedYear;
      out.push(`<p><strong>Verified example.</strong> Known to be a ${state.example.truth}. ` +
        (agrees ? "The computed window agrees."
                : "The computed window does <em>not</em> contain that year — worth investigating.") + "</p>");
    }
  }

  out.push(...notes.map(note => `<p><strong>Cross-check.</strong> ${note}</p>`));

  const alert = broken || notes.length > 0;
  $("whyBlock").classList.toggle("alert", alert);
  $("whyLabel").textContent = alert ? "Flags" : "Notes";
  $("why").className = "why-body";
  $("why").innerHTML = out.join("");
}

export function renderOffer({ window, broken, months }) {
  $("offer").hidden = false;
  $("offerLine").innerHTML = broken
    ? `Conflicting signals are the case where a second opinion is worth most. Send photos and I'll work out whether this is an honest parts guitar, a swapped neck, or something that should end the conversation — plus what to ask the seller. <strong>${CONFIG.price}</strong>.`
    : months > 20
      ? `A window this wide is the ceiling for what these signals can do from a distance. Send photos and I'll go through the neck date, pot codes and hardware and come back with a dated range, a note on what's original, and the questions worth putting to the seller. <strong>${CONFIG.price}</strong>.`
      : `You've narrowed it well. If you're buying, the remaining question is whether the parts agree with each other — send photos and I'll check the whole guitar rather than the calendar. <strong>${CONFIG.price}</strong>.`;

  const body = [
    `Serial: ${state.serial.raw}`,
    `Tool says: ${broken ? "conflicting signals" : fmtSpan(window)}`,
    ``, `Model (if known):`, `Asking price:`, `What I'm trying to decide:`, ``,
    `Photos to attach — as many as you have:`,
    `- Full front and back`, `- Headstock, front and back`, `- Neck plate`,
    `- Control cavity with the pots visible`,
    `- Side of the neck showing the fretboard glue line`,
    `- Neck heel date, if the neck is off`,
  ].join("\n");

  $("offerCta").href = `mailto:${CONFIG.email}`
    + `?subject=${encodeURIComponent(`Dating opinion — Fender serial ${state.serial.raw}`)}`
    + `&body=${encodeURIComponent(body)}`;
  $("offerMeta").textContent =
    `${CONFIG.turnaround} turnaround · written opinion, not an appraisal · no fee if the photos can't support an answer`;
}

export function renderStatus({ added, broken, months }) {
  $("statusLine").innerHTML = added
    ? `<b>${added}</b> signal${added > 1 ? "s" : ""} applied · window now <b>${broken ? "unresolved" : months + " months"}</b>`
    : "Serial only — no corroborating evidence entered.";
}
