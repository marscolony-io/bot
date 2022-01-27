export const escapeDot = (s: string) => {
  return s.replace(/\./g, '\\.');
};

export const escapeBrackets = (s: string) => {
  return s.replace(/\(/g, '\\(').replace(/\)/g, '\\)');
};
