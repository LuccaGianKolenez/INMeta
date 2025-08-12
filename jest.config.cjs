/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],

  // Tratar .ts como ESM
  extensionsToTreatAsEsm: ['.ts'],

  // Compilar TS para ESM (substitui o uso de `globals`)
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true, tsconfig: { isolatedModules: true } }],
  },

  // Permitir imports NodeNext com sufixo .js nos caminhos relativos
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // (Opcional) garantir que só pegue os .test.ts
  testMatch: ['**/*.test.ts'],
};
