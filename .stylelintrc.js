module.exports = {
  extends: ['stylelint-config-recommended-scss', 'stylelint-config-recess-order', 'stylelint-prettier/recommended'],
  plugins: ['stylelint-scss'],
  rules: {
    'block-no-empty': null,
    'no-descending-specificity': null,
    'font-family-no-missing-generic-family-keyword': null,
  },
};
