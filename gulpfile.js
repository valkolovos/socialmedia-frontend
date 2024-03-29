'use strict';
const { src, dest, watch, series } = require('gulp');
const log = require('fancy-log');
const colors = require('ansi-colors');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const bourbon = require('node-bourbon').includePaths;
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const del = require('del');
const panini = require('panini');
const uglify = require('gulp-uglify-es').default;
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const prettyHtml = require('gulp-pretty-html');
const sassLint = require('gulp-sass-lint');
const htmllint = require('gulp-htmllint');
const jshint = require('gulp-jshint');
const newer = require('gulp-newer');
const autoprefixer = require('gulp-autoprefixer');
const accessibility = require('gulp-accessibility');
const babel = require('gulp-babel');
const nodepath = 'node_modules/';
const assetspath = 'assets/';
const fs = require('fs');
const webpack = require('webpack-stream');
const named = require('vinyl-named')
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin');

// File paths
const files = {
  scssPath: 'app/scss/**/*.scss',
  jsPath: 'app/js/**/*.js'
}

// ------------ SETUP TASKS -------------
// Copy Bulma filed into Bulma development folder
function setupBulma() {
  console.log('---------------COPYING BULMA FILES---------------');
  return src([nodepath + 'bulma/*.sass', nodepath + 'bulma/**/*.sass'])
    .pipe(dest('src/assets/sass/'));
}

// ------------ DEVELOPMENT TASKS -------------

// COMPILE SCSS INTO CSS
function compileSCSS() {
  console.log('---------------COMPILING SCSS---------------');
  return src(['src/assets/scss/core.scss'])
    .pipe(sass({
      outputStyle: 'compressed',
      sourceComments: 'map',
      sourceMap: 'scss',
      includePaths: bourbon
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(dest('dist/assets/css'))
    .pipe(browserSync.stream());
}

// USING PANINI, TEMPLATE, PAGE AND PARTIAL FILES ARE COMBINED TO FORM HTML MARKUP
function compileHTML() {
  console.log('---------------COMPILING HTML WITH PANINI---------------');
  panini.refresh();
  return src('src/pages/**/*.html')
    .pipe(panini({
      root: 'src/pages/',
      layouts: 'src/layouts/',
      /*pageLayouts: {
        //All pages inside src/pages/blog will use the blog.html layout
        'blog': 'blog'
      }*/
      partials: 'src/partials/',
      helpers: 'src/helpers/',
      data: 'src/data/'
    }))
    .pipe(dest('dist'))
    .pipe(browserSync.stream());
}

// COPY CUSTOM JS
function compileJS() {
  console.log('---------------COMPILE CUSTOM JS---------------');
  let webpackConfig = {
    optimization: {
      minimize: true,
			minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            format: {
              comments: false,
            }
          }
        })
      ]
    },
    module:{
      rules: [
        {
          use: {
            loader: 'babel-loader'
          }
        }
      ]
    }
  }
  return src([
    'src/assets/js/main.js',
    'src/assets/js/components/lightbox.js',
    'src/assets/js/pages/feed.js',
    'src/assets/js/pages/profile-friends.js',
    'src/assets/js/pages/login.js',
    'src/assets/js/components/compose.js',
    'src/assets/js/components/autocompletes.js',
    //'src/assets/js/components/webcam.js',
    'src/assets/js/components/widgets.js',
    'src/assets/js/components/elements.js',
    //'src/assets/js/components/modal-uploader.js',
    'src/assets/js/navigation/navbar-options.js',
    'src/assets/js/touch.js',
    //'src/assets/js/tour.js',
    //'src/assets/js/pages/chat.js',
    //'src/assets/js/pages/events.js',
    //'src/assets/js/pages/explorer.js',
    //'src/assets/js/pages/stories.js',
    //'src/assets/js/pages/friends.js',
    //'src/assets/js/pages/inbox.js',
    //'src/assets/js/pages/landing.js',
    //'src/assets/js/pages/news.js',
    //'src/assets/js/pages/map.js',
    'src/assets/js/pages/profile.js',
    //'src/assets/js/pages/questions.js',
    //'src/assets/js/pages/shop.js',
    //'src/assets/js/pages/signup.js',
    'src/assets/js/pages/signup-v2.js',
    //'src/assets/js/pages/settings.js',
    //'src/assets/js/pages/videos.js',
  ])
    .pipe(named())
    .pipe(webpack(webpackConfig))
    .pipe(uglify())
    .pipe(dest('dist/assets/js/'))
    .pipe(browserSync.stream());
}

// RESET PANINI'S CACHE OF LAYOUTS AND PARTIALS
function resetPages(done) {
  console.log('---------------CLEARING PANINI CACHE---------------');
  panini.refresh();
  done();
}

// SASS LINT
function scssLint() {
  console.log('---------------SASS LINTING---------------');
  return src('src/assets/scss/**/*.scss')
    .pipe(sassLint({
      configFile: '.scss-lint.yml'
    }))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
}

// HTML LINTER
function htmlLint() {
  console.log('---------------HTML LINTING---------------');
  return src('dist/*.html')
    .pipe(htmllint({}, htmllintReporter));
}

function htmllintReporter(filepath, issues) {
  if (issues.length > 0) {
    issues.forEach(function (issue) {
      log(colors.cyan('[gulp-htmllint] ') + colors.white(filepath + ' [' + issue.line + ']: ') + colors.red('(' + issue.code + ') ' + issue.msg));
    });
    process.exitCode = 1;
  } else {
    console.log('---------------NO HTML LINT ERROR---------------');
  }
}

// JS LINTER
function jsLint() {
  return src('src/assets/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
}

// WATCH FILES
function watchFiles() {
  watch('src/**/*.html', compileHTML);
  watch(['src/assets/scss/**/*', 'src/assets/scss/**/*'], compileSCSS);
  watch('src/assets/js/**/*.js', compileJS);
  watch('src/assets/img/**/*', copyImages);
}


// BROWSER SYNC
function browserSyncInit(done) {
  console.log('---------------BROWSER SYNC---------------');
  browserSync.init({
    server: './dist'
  });
  return done();
}

// ------------ OPTIMIZATION TASKS -------------

// COPIES AND MINIFY IMAGE TO DIST
function minifyImages() {
  console.log('---------------OPTIMIZING IMAGES---------------');
  return src('src/assets/img/**/*.+(png|jpg|jpeg|gif|svg|mp4|webm|ogg)')
    .pipe(newer('dist/assets/img/'))
    .pipe(imagemin([
      imagemin.gifsicle({ optimizationLevel: 3, interlaced: true }),
      imagemin.mozjpeg({ quality: 85 }),
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.svgo()
    ], {
      verbose: true
    }))
    .pipe(dest('dist/assets/img/'))
    .pipe(browserSync.stream());
}

// COPIES IMAGE TO DIST
function copyImages() {
  console.log('---------------OPTIMIZING IMAGES---------------');
  return src('src/assets/img/**/*')
    .pipe(newer('dist/assets/img/'))
    .pipe(dest('dist/assets/img/'))
    .pipe(browserSync.stream());
}


// PLACES FONT FILES IN THE DIST FOLDER
function copyFont() {
  console.log('---------------COPYING FONTS INTO DIST FOLDER---------------');
  return src([
    'src/assets/font/**/*',
  ])
    .pipe(dest('dist/assets/fonts'))
    .pipe(browserSync.stream());
}

// PLACES DATA FILES IN THE DIST FOLDER
function copyData() {
  console.log('---------------COPYING DATA INTO DIST FOLDER---------------');
  return src([
    'src/data/**/*',
  ])
    .pipe(dest('dist/assets/data'))
    .pipe(browserSync.stream());
}

// CONCATENATE JS PLUGINS
function concatPlugins() {
  console.log('---------------CONCATENATE JS PLUGINS---------------');
  return src([
    nodepath + 'jquery/dist/jquery.min.js',
    nodepath + 'feather-icons/dist/feather.min.js',
    nodepath + 'lozad/dist/lozad.min.js',
    nodepath + 'vivid-icons/dist/vivid-icons.min.js',
    nodepath + 'slick-carousel/slick/slick.min.js',
    nodepath + 'emojionearea/dist/emojionearea.min.js',
    nodepath + 'webui-popover/dist/jquery.webui-popover.min.js',
    nodepath + 'easy-autocomplete/dist/jquery.easy-autocomplete.min.js',
    nodepath + 'dropzone/dist/min/dropzone.min.js',
    nodepath + '@fengyuanchen/datepicker/dist/datepicker.min.js',
    nodepath + 'izitoast/dist/js/iziToast.min.js',
    nodepath + 'quill/dist/quill.min.js',
    nodepath + 'croppie/croppie.min.js',
    nodepath + 'cropperjs/dist/cropper.min.js',
    nodepath + 'dropzone/dist/min/dropzone.min.js',
    nodepath + 'modal-video/js/jquery-modal-video.min.js',
    nodepath + 'plyr/dist/plyr.min.js',
    nodepath + 'hammerjs/hammer.min.js',
    nodepath + 'scrollreveal/dist/scrollreveal.min.js',
    nodepath + 'hopscotch/dist/js/hopscotch.min.js',
    nodepath + 'glider-js/glider.min.js',
    //Additional static js assets
    'src/assets/vendor/js/**/*.js',
  ])
    .pipe(concat('app.js'))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(dest('dist/assets/js'))
    .pipe(browserSync.stream());
}

// CONCATENATE CSS PLUGINS
function concatCssPlugins() {
  console.log('---------------CONCATENATE CSS PLUGINS---------------');
  return src([
    //nodepath + 'slick-carousel/slick/slick.css',
    //nodepath + 'slick-carousel/slick/slick-theme.css',
    nodepath + 'emojionearea/dist/emojionearea.min.css',
    nodepath + 'webui-popover/dist/jquery.webui-popover.min.css',
    nodepath + 'easy-autocomplete/dist/easy-autocomplete.min.css',
    nodepath + 'izitoast/dist/css/iziToast.min.css',
    nodepath + 'quill/dist/quill.core.css',
    nodepath + 'quill/dist/quill.bubble.css',
    nodepath + 'croppie/croppie.css',
    nodepath + 'plyr/dist/plyr.css',
    nodepath + 'dropzone/dist/min/dropzone.min.css',
    nodepath + 'cropperjs/dist/cropper.min.css',
    nodepath + 'hopscotch/dist/css/hopscotch.min.css',
    nodepath + 'glider-js/glider.min.css',
    //Additional static css assets
    'src/assets/vendor/css/**/*.css',
  ])
    .pipe(sourcemaps.init())
    .pipe(concat('app.css'))
    .pipe(sourcemaps.write('./'))
    .pipe(dest('dist/assets/css'))
    .pipe(browserSync.stream());
}

// COPY JS VENDOR FILES
function jsVendor() {
  console.log('---------------COPY JAVASCRIPT VENDOR FILES INTO DIST---------------');
  return src([
    'src/assets/vendor/js/*',
  ])
    .pipe(dest('dist/assets/vendor/js'))
    .pipe(browserSync.stream());
}

// COPY CSS VENDOR FILES
function cssVendor() {
  console.log('---------------COPY CSS VENDOR FILES INTO DIST---------------');
  return src([
    'src/assets/vendor/css/*',

  ])
    .pipe(dest('dist/assets/vendor/css'))
    .pipe(browserSync.stream());
}

// PRETTIFY HTML FILES
function prettyHTML() {
  console.log('---------------HTML PRETTIFY---------------');
  return src('dist/*.html')
    .pipe(prettyHtml({
      indent_size: 4,
      indent_char: ' ',
      unformatted: ['code', 'pre', 'em', 'strong', 'span', 'i', 'b', 'br']
    }))
    .pipe(dest('dist'));
}

// DELETE DIST FOLDER
function cleanDist(done) {
  console.log('---------------REMOVING OLD FILES FROM DIST---------------');
  del.sync('dist');
  return done();
}

// ACCESSIBILITY CHECK
function HTMLAccessibility() {
  return src('dist/*.html')
    .pipe(accessibility({
      force: true
    }))
    .on('error', console.log)
    .pipe(accessibility.report({
      reportType: 'txt'
    }))
    .pipe(rename({
      extname: '.txt'
    }))
    .pipe(dest('accessibility-reports'));
}

function writeConfigs(done) {
  let babelRc = {
    presets: ['env'],
    plugins: [['inline-replace-variables', {
      __API_HOST__: process.env.API_HOST ? process.env.API_HOST : 'http://localhost:8080',
      __BUCKET_PATH__: process.env.BUCKET_PATH ? process.env.BUCKET_PATH : ''
    }]]
  }
  let dataJson = {
    bucket_path: '',
    cache_bust: new Date().valueOf()
  };
  if (process.env.PROJECT) {
    babelRc.plugins = [['inline-replace-variables', {
      __API_HOST__: process.env.APP_HOST,
      __BUCKET_PATH__: `/frontend-${process.env.PROJECT}`
    }]]
    dataJson.bucket_path = `/frontend-${process.env.PROJECT}/`;
  }
  fs.writeFileSync('.babelrc', JSON.stringify(babelRc));
  fs.writeFileSync('src/data/deploy.json', JSON.stringify(dataJson));
  return done();
}


// RUN ALL LINTERS
exports.linters = series(htmlLint, scssLint, jsLint);

// RUN ACCESSIILITY CHECK
exports.accessibility = HTMLAccessibility;

//SETUP
exports.setup = series(setupBulma);

// DEV
exports.dev = series(
  cleanDist, 
  writeConfigs,
  copyFont, 
  copyData, 
  jsVendor, 
  cssVendor, 
  copyImages, 
  compileHTML, 
  concatPlugins, 
  concatCssPlugins, 
  compileJS, 
  resetPages, 
  prettyHTML, 
  compileSCSS, 
  browserSyncInit, 
  watchFiles
);

// BUILD
exports.build = series(
  cleanDist, 
  writeConfigs,
  copyFont, 
  copyData, 
  jsVendor, 
  cssVendor, 
  compileHTML, 
  concatPlugins, 
  concatCssPlugins, 
  compileJS, 
  minifyImages,
  compileSCSS
);

exports.compile = series(
  cleanDist,
  writeConfigs,
  compileJS
)
