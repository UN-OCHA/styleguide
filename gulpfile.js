// Node/Gulp Utilities
var gulp = require('gulp');
var log = require('fancy-log');
var c = require('chalk');
var plumber = require('gulp-plumber');
var spawn = require('child_process').spawn;
var gulpif = require('gulp-if');

// Development Tools
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var notify = browserSync.notify;
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var cssnano = require('cssnano');
var postcss = require('gulp-postcss');
var prefix = require('autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var uglify = require('gulp-uglify');
var taskListing = require('gulp-task-listing');
var changed = require('gulp-changed');
var concat = require('gulp-concat');


//——————————————————————————————————————————————————————————————————————————————
// Debug info
//——————————————————————————————————————————————————————————————————————————————
if (process.env.NODE_ENV === 'production') {
  log(c.bgYellow.black('Production'), c.yellow('environment detected'));
} else {
  log(c.bgYellow.black('Local'), c.yellow('environment detected'));
}


//——————————————————————————————————————————————————————————————————————————————
// BrowserSync
//——————————————————————————————————————————————————————————————————————————————
function browserSyncTask() {
  browserSync({
    server: './_site',
    open: false,
    port: '4000',
  });
};
exports.bs = browserSyncTask;


//——————————————————————————————————————————————————————————————————————————————
// Jekyll for development
//
// Note: since this site deploys to GitHub Pages, the production build of Jekyll
// is not driven by Gulp. Only GitHub infrastructure can run it.
//——————————————————————————————————————————————————————————————————————————————
function jekyllTask() {
  notify('Jekyll building...');

  return spawn('bundle', ['exec', 'jekyll', 'build', '--config=_config.yml,_config.dev.yml'], {stdio: 'inherit'})
    .on('close', reload);
};
exports.jekyll = jekyllTask;


//——————————————————————————————————————————————————————————————————————————————
// Reusable Sass task. Takes source parameter and outputs to same directory.
//
// Note: we do NOT export this task because it requires a parameter. It's marked
// internal-only with underscores.
//——————————————————————————————————————————————————————————————————————————————
function __sassTask(source) {
  notify(`Sass: ${source}`);

  // Take source directory and rework to allow compiled CSS to be placed next to
  // original Sass file.
  let path = source.split('/');
  let file = path.pop();
  let dest = path.join('/');

  return gulp.src(source)
    .pipe(plumber())
    .pipe(gulpif(process.env.NODE_ENV !== 'production', sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      prefix({
        browsers: ['>0.333%', 'iOS 8'],
        cascade: false,
      }),
      // cssnano(),
    ]))
    .pipe(gulpif(process.env.NODE_ENV !== 'production', sourcemaps.write('./')))
    .pipe(gulp.dest(dest))
    .pipe(gulp.dest('_site/' + dest))
    .pipe(reload({stream: true}));
};


//——————————————————————————————————————————————————————————————————————————————
// Sass tasks
//——————————————————————————————————————————————————————————————————————————————
function sassCommonDesign() {
  return __sassTask('common-design/css/styles.scss');
};

function sassOchaExtras() {
  return __sassTask('ocha/css/extras.scss');
};

function sassStyleguide() {
  return __sassTask('styleguide/css/styleguide.scss');
};

const sassAll = gulp.series(sassCommonDesign, sassOchaExtras, sassStyleguide);
exports.sass = sassAll;


//——————————————————————————————————————————————————————————————————————————————
// JS Linting
//——————————————————————————————————————————————————————————————————————————————
// function 'dev:js-lint', () => {
//   return gulp.src('_js/**/*.js')
//     .pipe(jshint())
//     .pipe(jshint.reporter(stylish));
// });


//——————————————————————————————————————————————————————————————————————————————
// JS Bundling
//——————————————————————————————————————————————————————————————————————————————
// function 'dev:js-bundle', () => {
//   return gulp.src([
//       './**/*.js',
//     ])
//     .pipe(concat('main.js'))
//     .pipe(gulpif(process.env.NODE_ENV === 'production', uglify()))
//     .pipe(gulp.dest('js'))
//     .pipe(gulp.dest('_site/js'))
//     .pipe(reload({stream: true}));
// });

//——————————————————————————————————————————————————————————————————————————————
// JS Lint + Bundle
//——————————————————————————————————————————————————————————————————————————————
// function 'dev:js', ['dev:js-lint', 'dev:js-bundle']);


//——————————————————————————————————————————————————————————————————————————————
// Watch Files For Changes
//——————————————————————————————————————————————————————————————————————————————
function watchTask() {
  // gulp.watch('_js/**/*.js', ['dev:js']);
  gulp.watch(['common-design/**/*.scss'], sassCommonDesign);
  gulp.watch(['ocha/**/*.scss'], sassOchaExtras);
  gulp.watch(['styleguide/**/*.scss'], sassStyleguide);
  gulp.watch(['_config*', '**/*.{md,html,json}', '!_site/**/*.*', '!node_modules/**/*.*'], jekyllTask);
};
exports.watch = watchTask;


//——————————————————————————————————————————————————————————————————————————————
// DEFAULT
// Build assets and start development server
//——————————————————————————————————————————————————————————————————————————————
const defaultTask = gulp.parallel(gulp.series(sassAll, jekyllTask, browserSyncTask), watchTask);
exports.default = defaultTask;
exports.dev = defaultTask;


//——————————————————————————————————————————————————————————————————————————————
// Build site for a deploy to production
//
// @see .bin/deploy.sh
//——————————————————————————————————————————————————————————————————————————————
exports.deploy = gulp.series(sassAll);
