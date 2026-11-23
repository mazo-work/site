import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

// Marks a component used in JSX (<motion.div>, <Foo>) as used, so
// no-unused-vars stops flagging it. Same job as eslint-plugin-react's
// jsx-uses-vars, without adding ~100 packages for one rule.
const jsxUsesVars = {
  rules: {
    'jsx-uses-vars': {
      meta: { type: 'problem', schema: [] },
      create(context) {
        const mark = (node) => context.sourceCode.markVariableAsUsed(node.name, node)
        return {
          JSXOpeningElement(node) {
            let n = node.name
            while (n.type === 'JSXMemberExpression') n = n.object
            if (n.type === 'JSXIdentifier') mark(n)
          },
        }
      },
    },
  },
}

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      local: jsxUsesVars,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'local/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
