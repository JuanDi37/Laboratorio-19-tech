// Mejoras progresivas: el contenido sigue visible sin JavaScript.
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const text = (selector, value) => { $(selector).textContent = value; };
const press = (selector, active) => $$(selector).forEach(button => {
  button.setAttribute('aria-pressed', String(button === active));
});
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: .04 });
  $$('.concept-card, .diagram, .section-heading').forEach(element => {
    element.classList.add('will-reveal'); observer.observe(element);
  });
}
// Un solo tokenizador preserva el texto y evita insertar HTML del código fuente.
const token = /(\/\/[^\n]*|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:const|let|await|async|import|from|return|if|else|new|true|false|try|catch|while)\b|\b\d+(?:\.\d+)?\b)/g;
$$('code[data-language]').forEach(element => {
  const source = element.textContent, fragment = document.createDocumentFragment();
  let cursor = 0;
  for (const match of source.matchAll(token)) {
    fragment.append(document.createTextNode(source.slice(cursor, match.index)));
    const span = document.createElement('span');
    const value = match[0];
    span.className = 'syntax-' + (/^(\/\/|#)/.test(value) ? 'comment' : /^["']/.test(value) ? 'string' : /^\d/.test(value) ? 'number' : 'keyword');
    span.textContent = value; fragment.append(span); cursor = match.index + value.length;
  }
  fragment.append(document.createTextNode(source.slice(cursor))); element.replaceChildren(fragment);
});


import { hashEvent, verifySchnorr } from './crypto.js';
let fixture = null, mode = 'original', operation = 0, blocked = false, outage = false;
async function renderEvent() {
  if (!fixture) return;
  const current = ++operation;
  const event = structuredClone(fixture);
  if (mode !== 'original') event.content = event.content.slice(0, -1) + '!';
  try {
    const id = await hashEvent(event);
    if (mode === 'rehash') event.id = id;
    const validSignature = await verifySchnorr(event.sig, event.id, event.pubkey);
    if (current !== operation) return;
    text('#nostr-content', event.content); text('#event-id', event.id);
    text('#event-json', JSON.stringify(event, null, 2));
    text('#signature-status', id !== event.id ? 'Integridad: FALLA. La firma corresponde al ID original, pero el contenido cambió. Evento no aceptable.' : validSignature ? 'Integridad: CORRECTA. Firma Schnorr: VÁLIDA. Verificación criptográfica local del fixture.' : 'Integridad: CORRECTA con ID nuevo. Firma Schnorr: FALLA. El autor no firmó el contenido modificado.');
  } catch (error) { if (current === operation) text('#signature-status', 'Verificación no disponible: ' + error.message + '. Usamos Live Server en localhost.'); }
}
$$('[data-event-mode]').forEach(button => button.addEventListener('click', () => { mode = button.dataset.eventMode; press('[data-event-mode]', button); renderEvent(); }));
function renderRelays(query = false) {
  const id = fixture?.id || 'ID del fixture';
  const lines = ['ESCENARIO ILUSTRATIVO / sin conexiones reales.'];
  $$('[data-relay]').forEach(element => {
    const isClass = element.dataset.relay === 'clase';
    const unavailable = isClass ? blocked : outage;
    element.classList.toggle('blocked', isClass && blocked); element.classList.toggle('offline', !isClass && outage);
    element.querySelector('span').textContent = unavailable ? isClass ? 'Bloqueo / modelo' : 'Sin conexión / modelo' : 'Copia disponible / modelo';
    const name = element.querySelector('strong').textContent;
    lines.push(name + ': ' + (unavailable ? isClass ? JSON.stringify(['OK', id, false, 'blocked: clave de prueba bloqueada']) : 'sin conexión; no recibimos OK.' : query ? 'REQ por ID → EVENT del fixture; EOSE.' : JSON.stringify(['OK', id, true, ''])));
  });
  const count = (outage ? 0 : 3) + (blocked ? 0 : 1);
  lines.push('Copias accesibles en el modelo: ' + count + '/4. ' + (count ? 'La consulta puede recuperar desde otro destino.' : 'Sin copias remotas accesibles; la firma local permanece.'));
  text('#relay-output', lines.join('\n'));
  $('#relay-block').setAttribute('aria-pressed', String(blocked)); $('#relay-outage').setAttribute('aria-pressed', String(outage));
  text('#relay-block', blocked ? 'Retirar bloqueo de clase' : 'Simular bloqueo en clase');
  text('#relay-outage', outage ? 'Restaurar otros relays' : 'Simular caída de otros relays');
}
$('#relay-block').addEventListener('click', () => { blocked = !blocked; renderRelays(); });
$('#relay-outage').addEventListener('click', () => { outage = !outage; renderRelays(); });
$('#relay-query').addEventListener('click', () => renderRelays(true));
try {
  const response = await fetch('event-demo.json');
  if (!response.ok) throw new Error('HTTP ' + response.status);
  fixture = await response.json(); await renderEvent(); renderRelays();
} catch (error) { text('#signature-status', 'Fixture local no disponible: ' + error.message + '. Abrimos con Live Server.'); }
