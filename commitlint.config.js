export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'design',
        'test',
        'refactor',
        'ci',
        'perf',
        'chore',
        'rename',
        'remove',
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'subject-case': [0],
  },
};
