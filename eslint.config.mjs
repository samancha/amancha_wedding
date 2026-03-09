import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import pluginSecurity from 'eslint-plugin-security';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Add security plugin checks
  {
    plugins: { security: pluginSecurity },
    rules: {
      'security/detect-object-injection': 'warn',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'coverage/**',
    'public/**',
    'node_modules/**',
    '*.lock',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
