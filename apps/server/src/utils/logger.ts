export const logDebug =
  process.env.NODE_ENV === 'development' ? console.log : () => {};
