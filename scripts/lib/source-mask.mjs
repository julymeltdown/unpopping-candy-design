function maskCharacter(character) {
  return character === '\n' || character === '\r' ? character : ' ';
}

export function maskSource(source, options = {}) {
  const maskQuotedStrings = options.maskQuotedStrings === true;
  const output = [...source];
  let state = 'code';
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];

    if (state === 'line-comment') {
      if (character === '\n') state = 'code';
      else output[index] = maskCharacter(character);
      continue;
    }
    if (state === 'block-comment') {
      output[index] = maskCharacter(character);
      if (character === '*' && next === '/') {
        output[index + 1] = ' ';
        index += 1;
        state = 'code';
      }
      continue;
    }
    if (state === 'template') {
      output[index] = maskCharacter(character);
      if (escaped) { escaped = false; continue; }
      if (character === '\\') { escaped = true; continue; }
      if (character === '`') state = 'code';
      continue;
    }
    if (state === 'single' || state === 'double') {
      if (maskQuotedStrings) output[index] = maskCharacter(character);
      if (escaped) { escaped = false; continue; }
      if (character === '\\') { escaped = true; continue; }
      if ((state === 'single' && character === "'") || (state === 'double' && character === '"')) state = 'code';
      continue;
    }

    if (character === '/' && next === '/') {
      output[index] = ' '; output[index + 1] = ' '; index += 1; state = 'line-comment'; continue;
    }
    if (character === '/' && next === '*') {
      output[index] = ' '; output[index + 1] = ' '; index += 1; state = 'block-comment'; continue;
    }
    if (character === '`') {
      output[index] = ' '; state = 'template'; escaped = false; continue;
    }
    if (character === "'") {
      if (maskQuotedStrings) output[index] = ' ';
      state = 'single'; escaped = false; continue;
    }
    if (character === '"') {
      if (maskQuotedStrings) output[index] = ' ';
      state = 'double'; escaped = false; continue;
    }
  }

  return output.join('');
}
