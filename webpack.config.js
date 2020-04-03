const path = require(`path`);
const home = `C:\\Projects\\vvs\\study\\academy\\225851-taskmanager-11`;

module.exports = {
  mode: `development`,
  // Режим сборки
  entry: `./src/main.js`,
  // Точка входа приложения
  output: {
    // Настройка выходного файла
    filename: `bundle.js`,
    path: path.join(home, `public`)
  },
  // Подключаем sourcemaps
  devtool: `source-map`,
  devServer: {
    // Где искать сборку
    contentBase: path.join(home, `public`),
    // Автоматическая перезагрузка страницы
    // По умолчанию приложение будет доступно по адресу http://localhost:8080
    watchContentBase: true
  }
};
