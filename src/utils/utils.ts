export const escapeDot = (s: string) => {
  return s.replace(/\./g, '\\.');
};

export const escapeBrackets = (s: string) => {
  return s.replace(/\(/g, '\\(').replace(/\)/g, '\\)');
};

export const numberWithCommas = (s: string) => {
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
