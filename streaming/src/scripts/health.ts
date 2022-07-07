void (async () => {
  //@ts-expect-error: nodejs v18
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await fetch('http://localhost:8080/health');
  console.log('OK');
})();
