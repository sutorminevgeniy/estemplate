'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const gulpIf = require('gulp-if'); // для выполнения задачи при соблюденнии условия (упращает запись для задач разработки)
const gulplog = require('gulplog');
const sourcemaps = require('gulp-sourcemaps'); // плагин для удобства разработки. В браузере показываются исходные файлы
const del = require('del'); // обычный модуль удаления (не галп плагин)
const browserSync = require('browser-sync').create(); // для презагрузки браузера при изменении файлов

// Gulp + Webpack = ♡
const webpackStream = require('webpack-stream');
const webpack = webpackStream.webpack;
const named = require('vinyl-named');

// Переменная окружения для отличия сборок разработки от продакшена
// ( gulp build  || NODE_ENV=production gulp build )
const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

// удаление файлов
gulp.task('clean', function() {
  return del('dist'); // удаление файлов из дерриктории
});

// копирование фаилов
gulp.task('image', function() {
  return gulp.src('src/img/**/*.*', {since: gulp.lastRun('image')}) // копирует только изменённые файлы при повторном запуске (при watch частности)
    .pipe(gulp.dest('dist/img'));
});

gulp.task('html', function() {
  return gulp.src('src/*.html', {since: gulp.lastRun('html')}) // копирует только изменённые файлы при повторном запуске (при watch частности)
    .pipe(gulp.dest('dist'));
});

gulp.task('views', function buildHTML() {
  return gulp.src('src/views/*.pug')
  .pipe(pug())
  .pipe(gulp.dest('dist'));
});
 
// обработка стилей
sass.compiler = require('node-sass');
 
gulp.task('sass', function () {
  return gulp.src('./src/sass/*.scss')
    .pipe(gulpIf(isDevelopment, sourcemaps.init())) // инициализирует sourcemaps (для dev)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpIf(isDevelopment, sourcemaps.write())) // добавляет sourcemaps в выходной
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('js', function(callback) {
  let firstBuildReady = false;

  function done(err, stats) {
    firstBuildReady = true;

    if (err) { // hard error, see https://webpack.github.io/docs/node.js-api.html#error-handling
      return;  // emit('error', err) in webpack-stream
    }

    gulplog[stats.hasErrors() ? 'error' : 'info'](stats.toString({
      colors: true
    }));

  }

  let options = {
    output: {
      filename: '[name].js'
    },
    watch:   isDevelopment,
    devtool: isDevelopment ? 'cheap-module-inline-source-map' : null,
    mode: isDevelopment ? 'development' : 'production',
    optimization: {
      noEmitOnErrors: true
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    }  
  };

  return gulp.src('src/js/*.js', {since: gulp.lastRun('js')}) // копирует только изменённые файлы при повторном запуске (при watch частности)
    .pipe(named())
    .pipe(webpackStream(options, null, done))
    .pipe(gulp.dest('dist/js'))
    .on('data', function() { // эмулирование завершения задачи
      if (firstBuildReady) {
        callback();
      }
    });
});

// объединнённая задача для сборки
gulp.task('build', gulp.series( // выполняет задачи по очереди
  'clean',
  gulp.parallel('html', 'views', 'js', 'image', 'sass')) // выполняет задачи паралельно
);

// перезагрузка браузера при обнавление файлов
gulp.task('serve', function() {
  browserSync.init({
    server: 'dist'
  }); // Запускает сервер из папки 'dist'

  browserSync.watch('dist/**/*.*').on('change', browserSync.reload); 
});

// следит за изменением файлов (смотреть сhokidar для удаления файлов)
gulp.task('watch', function() {
  gulp.watch('src/*.html', gulp.series('html'));
  gulp.watch('src/views/*.pug', gulp.series('views'));
  // gulp.watch('src/js/*.js', gulp.series('js'));
  gulp.watch('src/img/**/*.*', gulp.series('image'));
  gulp.watch('./src/sass/*.scss', gulp.series('sass'));
});

// объединнённая задача для разработки
gulp.task('dev',
    gulp.series('build', gulp.parallel('serve', 'watch'))
);