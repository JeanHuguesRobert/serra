export default {
  presets: [
    ['@babel/preset-env', {
      targets: { node: 'current' },
      modules: false
    }]
  ],
  env: {
    test: {
      presets: [
        ['@babel/preset-env', {
          targets: { node: 'current' },
          modules: 'commonjs'
        }]
      ],
      plugins: ['@babel/plugin-transform-modules-commonjs']
    }
  }
}