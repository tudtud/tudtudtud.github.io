// Wiring. Nothing here knows how a serial or a pot code works.
import { EVIDENCE } from "../data/evidence.js";
import { EXAMPLES } from "../data/examples.js";
import { readSerial } from "./parse-serial.js";
import { fmtSpan } from "./format.js";
import {
  state, clearSignals, setSignal, evaluate, analyse, findEvidence,
  setIntervalFormatter,
} from "./fusion.js";
import * as ui from "./render.js";

const $ = ui.$;
setIntervalFormatter(fmtSpan);   // fusion formats select readouts with our formatter

/* -------------------------------------------------------------- render */

function render() {
  if (!state.serial) { $("result").hidden = true; return; }
  $("result").hidden = false;
  if (state.serial.error) return ui.renderError(state.serial.error);

  const result = analyse();
  ui.renderLanes(result.list, result.conflicts);
  ui.renderBand(result.window, result.broken, result.added);
  ui.renderReadout(result);
  ui.renderNotes(result);
  ui.renderOffer(result);
  ui.renderStatus(result);
}

/* ------------------------------------------------------------- signals */

function applySignal(key, value, source) {
  const { signal, text, bad } = evaluate(key, value);
  setSignal(key, signal, value);
  ui.mirrorControls(key, value, source);
  ui.setReadout(key, text, bad);
  render();
  refreshQuickPick();
}

function onSignalChange(event) {
  const key = event.target.dataset.key;
  if (!key) return;
  state.example = null;               // hand-edited: no longer the verified example
  $("examplePick").value = "";
  applySignal(key, event.target.value, event.target);
}

/* -------------------------------------------------- inline chart control */

function refreshQuickPick() {
  const pick = $("quickPick");
  const current = pick.dataset.key || "";
  pick.innerHTML = `<option value="">— choose a signal —</option>` +
    EVIDENCE.map(ev =>
      `<option value="${ev.key}"${ev.key === current ? " selected" : ""}>` +
      `${state.signals[ev.key] ? "●" : "○"}  ${ev.name}</option>`).join("");
}

function openQuickField(key) {
  $("quickPick").dataset.key = key;
  if (!key) {
    $("quickField").innerHTML = "";
    $("quickRead").textContent = "";
    $("quickRead").classList.remove("bad");
    return;
  }
  $("quickField").innerHTML = ui.fieldMarkup(findEvidence(key), state.raw[key] || "");
  const mirror = $("read-" + key);
  $("quickRead").textContent = mirror ? mirror.textContent : "";
  $("quickRead").classList.toggle("bad", !!mirror?.classList.contains("bad"));
  $("quickField").querySelector("[data-key]")?.focus();
}

/* ------------------------------------------------------------ examples */

function resetControls() {
  clearSignals();
  document.querySelectorAll("[data-key]").forEach(el => el.value = "");
  document.querySelectorAll(".read").forEach(el => {
    el.textContent = ""; el.classList.remove("bad");
  });
}

function loadExample(id) {
  const example = EXAMPLES.find(e => e.id === id);
  resetControls();
  if (!example) { render(); refreshQuickPick(); return; }

  $("serial").value = example.serial;
  state.serial = readSerial(example.serial);
  for (const [key, value] of Object.entries(example.signals)) applySignal(key, value, null);
  state.example = example;

  render();
  refreshQuickPick();
  $("result").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* --------------------------------------------------------------- start */

function dateIt() {
  state.serial = readSerial($("serial").value);
  render();
  $("result").scrollIntoView({ behavior: "smooth", block: "start" });
}

ui.buildAxis();
ui.buildEvidence();

$("examplePick").innerHTML = `<option value="">— none —</option>` +
  EXAMPLES.map(e => `<option value="${e.id}">${e.label}</option>`).join("");

$("examplePick").addEventListener("change", e => loadExample(e.target.value));
$("quickPick").addEventListener("change", e => openQuickField(e.target.value));
$("quickField").addEventListener("input", onSignalChange);
$("quickField").addEventListener("change", onSignalChange);
$("evidence").addEventListener("input", onSignalChange);
$("evidence").addEventListener("change", onSignalChange);
$("go").addEventListener("click", dateIt);
$("serial").addEventListener("keydown", e => e.key === "Enter" && dateIt());
$("clear").addEventListener("click", () => {
  resetControls();
  $("examplePick").value = "";
  render();
  refreshQuickPick();
});

refreshQuickPick();
render();
