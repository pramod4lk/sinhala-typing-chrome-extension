// Converts Singlish to Sinhala as you type in text fields on any page.
// Depends on src/transliterator.js being loaded first (globalThis.SinhalaTransliterator).

(function () {
  'use strict';

  const { transliterate } = globalThis.SinhalaTransliterator;
  const TEXT_INPUT_TYPES = new Set(['text', 'search']);

  let enabled = true;
  // The word currently being typed: its roman keystrokes and the Sinhala we inserted for it.
  const state = { el: null, buffer: '', out: '' };

  function reset(el = null) {
    state.el = el;
    state.buffer = '';
    state.out = '';
  }

  chrome.storage.sync.get({ enabled: true }, (items) => {
    enabled = items.enabled;
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' && changes.enabled) {
      enabled = changes.enabled.newValue;
      reset();
    }
  });

  function isTextControl(el) {
    return el instanceof HTMLTextAreaElement ||
      (el instanceof HTMLInputElement && TEXT_INPUT_TYPES.has(el.type));
  }

  function editableTarget(e) {
    const el = e.composedPath()[0];
    if (!(el instanceof HTMLElement)) return null;
    if (isTextControl(el)) return el.readOnly || el.disabled ? null : el;
    if (el.isContentEditable) return el;
    return null;
  }

  // Returns the `len` characters immediately before the caret plus where they are,
  // or null if the selection isn't in a state we can safely edit.
  function textBeforeCaret(el, len) {
    if (isTextControl(el)) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      if (start == null) return null;
      if (len === 0) return { start, end, text: '' };
      if (start !== end || start < len) return null;
      return { start: start - len, end, text: el.value.slice(start - len, start) };
    }

    const sel = el.ownerDocument.getSelection();
    if (!sel || !sel.rangeCount) return null;
    const caret = sel.getRangeAt(0);
    if (len === 0) return { range: caret.cloneRange(), text: '' };
    if (!caret.collapsed) return null;

    // Text nodes inside the editor that start at or before the caret.
    const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (caret.comparePoint(n, 0) > 0) break;
      nodes.push(n);
    }
    let i = nodes.length - 1;
    if (i < 0) return null;

    const endNode = nodes[i];
    let endOffset;
    if (caret.startContainer === endNode) endOffset = caret.startOffset;
    else endOffset = caret.comparePoint(endNode, endNode.length) <= 0 ? endNode.length : 0;

    // Walk backwards across text nodes collecting `len` UTF-16 code units.
    let startNode = endNode;
    let startOffset = endOffset;
    let remaining = len;
    let text = '';
    for (;;) {
      const take = Math.min(remaining, startOffset);
      text = startNode.data.slice(startOffset - take, startOffset) + text;
      startOffset -= take;
      remaining -= take;
      if (remaining === 0) break;
      if (--i < 0) return null;
      startNode = nodes[i];
      startOffset = startNode.length;
    }

    const range = el.ownerDocument.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    return { range, text };
  }

  const SINHALA_OR_ZWJ = /[඀-෿‍]/;

  // True when Sinhala text directly follows the range. Chrome treats e.g. "ක්ම"
  // as one grapheme cluster and execCommand would widen the edit to swallow ම,
  // so in that case we must replace the exact code units ourselves.
  function followedBySinhala(el, where) {
    if (isTextControl(el)) return SINHALA_OR_ZWJ.test(el.value.charAt(where.end));
    const { endContainer, endOffset } = where.range;
    return endContainer.nodeType === Node.TEXT_NODE &&
      SINHALA_OR_ZWJ.test(endContainer.data.charAt(endOffset));
  }

  // Replaces the located text with `text`. execCommand keeps native undo working
  // and fires the input events that React/Vue/rich-text editors listen for.
  function replace(el, where, text) {
    const doc = el.ownerDocument;
    if (isTextControl(el)) {
      el.setSelectionRange(where.start, where.end);
    } else {
      const sel = doc.getSelection();
      sel.removeAllRanges();
      sel.addRange(where.range);
    }

    const hasSelection = isTextControl(el) ? where.start !== where.end : !where.range.collapsed;
    if (!text && !hasSelection) return;
    if (!followedBySinhala(el, where)) {
      const ok = text
        ? doc.execCommand('insertText', false, text)
        : doc.execCommand('delete', false);
      if (ok) return;
    }

    if (isTextControl(el)) {
      el.setRangeText(text, where.start, where.end, 'end');
    } else {
      where.range.deleteContents();
      if (text) {
        const node = doc.createTextNode(text);
        where.range.insertNode(node);
        const sel = doc.getSelection();
        sel.removeAllRanges();
        sel.collapse(node, node.length);
      }
    }
    el.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      inputType: text ? 'insertText' : 'deleteContentBackward',
      data: text || null,
    }));
  }

  // Chrome snaps the caret to grapheme-cluster boundaries, so inserting ක් right
  // before ම leaves it after the whole "ක්ම" cluster. Put it back at the end
  // of what we inserted so the next keystroke finds `state.out` before the caret.
  function restoreCaret(el, where, out) {
    if (isTextControl(el)) {
      const pos = where.start + out.length;
      el.setSelectionRange(pos, pos);
      return;
    }
    const sel = el.ownerDocument.getSelection();
    if (!out || !sel.rangeCount || !sel.isCollapsed) return;
    const node = sel.focusNode;
    const offset = sel.focusOffset;
    if (node.nodeType !== Node.TEXT_NODE || node.data.slice(offset - out.length, offset) === out) return;
    const idx = node.data.lastIndexOf(out, offset - out.length);
    if (idx >= 0) sel.collapse(node, idx + out.length);
  }

  function render(el, where) {
    const out = transliterate(state.buffer);
    replace(el, where, out);
    restoreCaret(el, where, out);
    state.out = out;
  }

  function onKeyDown(e) {
    if (!enabled || e.isComposing || e.keyCode === 229) return;

    const el = editableTarget(e);
    if (!el) {
      reset();
      return;
    }
    if (state.el !== el) reset(el);

    if (e.ctrlKey || e.altKey || e.metaKey) {
      reset(el);
      return;
    }

    if (e.key === 'Backspace') {
      if (!state.buffer) return;
      const where = textBeforeCaret(el, state.out.length);
      if (!where || where.text !== state.out) {
        reset(el);
        return;
      }
      e.preventDefault();
      state.buffer = state.buffer.slice(0, -1);
      render(el, where);
      return;
    }

    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      let where = textBeforeCaret(el, state.out.length);
      if (!where || where.text !== state.out) {
        // Caret moved or the page changed the text: start a fresh word here.
        reset(el);
        where = textBeforeCaret(el, 0);
        if (!where) return;
      }
      e.preventDefault();
      state.buffer += e.key;
      render(el, where);
      return;
    }

    // Shift/CapsLock alone are part of typing a letter, not a word boundary.
    if (e.key === 'Shift' || e.key === 'CapsLock') return;

    // Space, Enter, punctuation, digits, navigation keys, etc. commit the word.
    reset(el);
  }

  window.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('mousedown', () => reset(), true);
  window.addEventListener('focusout', () => reset(), true);
})();
