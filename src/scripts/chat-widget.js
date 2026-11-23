// The assistant (U12), loaded only when the launcher is first pressed. A support widget played straight that answers
// only in gibberish. No model and no network: nothing typed here leaves this page or is stored anywhere. Built with
// createElement and textContent only (Trusted Types stays strict). Replies are announced: the transcript is role=log.
import { reply } from './gibberish.js';

let panel, log, input, launcher, busy = false, styled;

function styles() {               // the panel's stylesheet, attached the first time the assistant opens
  return (styled ??= new Promise((done) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = '/chat.css';
    link.addEventListener('load', done); link.addEventListener('error', done);
    document.head.append(link);
  }));
}

function el(tag, attrs = {}, text) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (text != null) e.textContent = text;
  return e;
}
function say(who, text) {
  const msg = el('div', { class: `chat-msg chat-${who}` });
  msg.append(el('span', { class: 'vh' }, who === 'bot' ? 'Assistant: ' : 'You: '), el('span', {}, text));
  log.append(msg);
  log.scrollTop = log.scrollHeight;
}
function build() {
  panel = el('section', { class: 'chat-panel', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'chat-title', id: 'chat-panel' });
  const head = el('header', { class: 'chat-head' });
  const title = el('h2', { id: 'chat-title', class: 'chat-title' });
  title.append(el('span', {}, 'Assistant'), el('span', { class: 'chat-status' }, ' · Online'));
  const close = el('button', { type: 'button', class: 'chat-close', 'aria-label': 'Close the assistant' }, '×');
  close.addEventListener('click', hide);
  head.append(el('span', { class: 'chat-avatar', 'aria-hidden': 'true' }), title, close);
  log = el('div', { class: 'chat-log', role: 'log', 'aria-live': 'polite', 'aria-label': 'Conversation' });
  const form = el('form', { class: 'chat-form' });
  input = el('input', { type: 'text', class: 'chat-input', 'aria-label': 'Message', autocomplete: 'off', maxlength: '500', placeholder: 'Type a message' });
  const send = el('button', { type: 'submit', class: 'chat-send' }, 'Send');
  form.append(input, send);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || busy) return;
    say('you', text);
    input.value = '';
    answer();
  });
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); hide(); } });
  panel.append(head, log, form);
  document.body.append(panel);
  say('bot', 'Hi! How can I help you today?');
}
function answer() {
  busy = true;
  log.setAttribute('aria-busy', 'true');
  const typing = el('div', { class: 'chat-msg chat-bot chat-typing', 'aria-hidden': 'true' });
  typing.append(el('i'), el('i'), el('i'));
  log.append(typing);
  log.scrollTop = log.scrollHeight;
  setTimeout(() => {
    typing.remove();
    log.removeAttribute('aria-busy');
    say('bot', reply());
    busy = false;
  }, 700 + Math.random() * 900);
}
function hide() {
  panel.hidden = true;
  launcher.setAttribute('aria-expanded', 'false');
  launcher.focus();
}
export async function open(button) {
  launcher = button;
  await styles();
  if (!panel) build();
  panel.hidden = false;
  launcher.setAttribute('aria-expanded', 'true');
  input.focus();
}
export function toggle(button) {
  if (panel && !panel.hidden) hide(); else open(button);
}
