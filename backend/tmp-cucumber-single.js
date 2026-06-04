module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['tests/step_definitions/**/*.ts', 'tests/support/**/*.ts'],
    paths: []
  }
};
