const path = require(`path`);
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = {
  mode: `development`,
  // Режим сборки
  entry: `./src/main.js`,
  // Точка входа приложения
  output: {
    // Настройка выходного файла
    filename: `bundle.js`,
    path: path.join(__dirname, `public`)
  },
  // Подключаем sourcemaps
  devtool: `source-map`,
  devServer: {
    // Где искать сборку
    contentBase: path.join(__dirname, `public`),
    // Автоматическая перезагрузка страницы
    // По умолчанию приложение будет доступно по адресу http://localhost:8080
    watchContentBase: true
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new MomentLocalesPlugin({
      localesToKeep: [`es-us`],
    })
  ]
};
