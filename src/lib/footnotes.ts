const FOOTNOTE_REFERENCE_SELECTOR = ".prose [data-footnote-ref]";
const FOOTNOTE_BACK_REFERENCE_SELECTOR = ".prose [data-footnote-backref]";

/**
 * GFM脚注へ参照プレビューと正確な復帰位置を追加する。
 */
export function enhanceFootnotes(root: ParentNode = document): void {
  const references = root.querySelectorAll<HTMLAnchorElement>(FOOTNOTE_REFERENCE_SELECTOR);

  references.forEach((reference, index) => {
    if (reference.dataset.footnoteEnhanced === "true") return;

    const wrapper = reference.parentElement;
    if (!(wrapper instanceof HTMLElement) || wrapper.tagName !== "SUP") return;

    const referenceId = reference.id || `footnote-reference-${index + 1}`;
    wrapper.id = referenceId;
    wrapper.classList.add("footnote-reference");
    reference.removeAttribute("id");

    const target = reference.getAttribute("href");
    const footnote = target?.startsWith("#") ? document.getElementById(target.slice(1)) : null;

    if (footnote) {
      const footnoteClone = footnote.cloneNode(true);

      if (footnoteClone instanceof HTMLElement) {
        footnoteClone.querySelectorAll("[data-footnote-backref]").forEach((backReference) => {
          backReference.remove();
        });

        const previewText = footnoteClone.textContent?.replace(/\s+/g, " ").trim();

        if (previewText) {
          const preview = document.createElement("span");
          preview.id = `${referenceId}-preview`;
          preview.className = "footnote-preview";
          preview.setAttribute("role", "tooltip");
          preview.textContent = previewText;
          wrapper.appendChild(preview);

          const describedBy = new Set(
            (reference.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean),
          );
          describedBy.add(preview.id);
          reference.setAttribute("aria-describedby", [...describedBy].join(" "));
        }
      }
    }

    reference.dataset.footnoteEnhanced = "true";
  });

  root
    .querySelectorAll<HTMLAnchorElement>(FOOTNOTE_BACK_REFERENCE_SELECTOR)
    .forEach((backReference) => {
      backReference.setAttribute("aria-label", "本文の参照位置へ戻る");
    });
}
