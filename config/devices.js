module.exports = [
  {
    id: 'mobile',
    label: 'Moto G (412x823)',
    opts: {
      formFactor: 'mobile',
      screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
    },
  },
  {
    id: 'desktop',
    label: 'Escritorio (1350x940)',
    opts: {
      formFactor: 'desktop',
      screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
    },
  },
];