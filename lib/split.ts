/* Text splitting for the reveal system. Paragraphs split into words; words are then grouped into the lines the
   browser laid them out on, so each line can start a beat after the one above (rollers.com.au's title reveal,
   SplitText "lines,words": each line's words rise from yPercent 100 with 0.1s between lines). */

export function splitLines(root: HTMLElement) {
  const original = root.innerHTML;
  const words: HTMLElement[] = [];
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        (child.textContent ?? "").split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { fragment.appendChild(document.createTextNode(" ")); return; }
          const mask = document.createElement("span");
          mask.className = "wm";
          const word = document.createElement("span");
          word.className = "wi";
          word.textContent = part;
          mask.appendChild(word);
          words.push(word);
          fragment.appendChild(mask);
        });
        child.replaceWith(fragment);
      } else if (child.nodeType === Node.ELEMENT_NODE && (child as HTMLElement).tagName !== "BR") {
        walk(child);
      }
    });
  };
  walk(root);
  // Group by the mask's top edge: one group per rendered line.
  const lines: HTMLElement[][] = [];
  let top = Number.NaN;
  words.forEach((word) => {
    const y = (word.parentElement as HTMLElement).getBoundingClientRect().top;
    if (Number.isNaN(top) || Math.abs(y - top) > 4) { lines.push([]); top = y; }
    lines[lines.length - 1].push(word);
  });
  return { words, lines, revert: () => { root.innerHTML = original; } };
}
