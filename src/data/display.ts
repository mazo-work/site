// The display headline's size class. Night's display face (Doto) is monospaced and wide, so a title with a long word
// (9 letters or more, such as "recruiters") takes a smaller size that keeps the word inside its column; Paper's IM FELL
// is narrow and ignores it. Every other title keeps the mocks' size.
export const displayClass = (title: string) =>
  Math.max(...title.split(/\s+/).map((w) => w.replace(/[^\p{L}\p{N}]/gu, '').length)) >= 9 ? 'display-long' : '';
