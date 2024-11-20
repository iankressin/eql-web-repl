const keywords = new Set(['GET', 'FROM', 'ON', 'WHERE']);

export function highlightKeywords(q: string[]) {
  let beforeWord: string = '';
  let entity: string = '';
  return q
    .map((word) => {
      if (keywords.has(word)) {
        beforeWord = word;
        return `<span style="color: #BCB3FA">${word}</span>`;
      } else {
        if (beforeWord === 'ON') {
          beforeWord = word;
          entity = '';
          return `<span style="color: #EDCF7A">${word}</span>`;
        } else if (beforeWord === 'FROM') {
          beforeWord = word;
          entity = word;
          return word;
        } else if (entity !== '') {
          beforeWord = word;
          return `<span style="color: #EDCF7A">${word}</span>`;
        } else {
          beforeWord = word;
          return word;
        }
      }
    })
    .join(' ');
}
