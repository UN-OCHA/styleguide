// Node/Gulp Utilities
var gulp = require('gulp');
var log = require('fancy-log');
var c = require('chalk');
var plumber = require('gulp-plumber');
var spawn = require('child_process').spawn;
var gulpif = require('gulp-if');

// Development Tools
var bs = require('browser-sync');
var reload = bs.reload;
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
// Local debug info
//——————————————————————————————————————————————————————————————————————————————
if (process.env.NODE_ENV === 'production') {
  log(c.bgYellow.black('Production'), c.yellow('environment detected'));
} else {
  log(c.bgYellow.black('Local'), c.yellow('environment detected'));
}


//——————————————————————————————————————————————————————————————————————————————
// BrowserSync
//——————————————————————————————————————————————————————————————————————————————
gulp.task('dev:bs', () => {
  bs({
    server: './_site',
    open: false,
    port: '4000',
  });
});


//——————————————————————————————————————————————————————————————————————————————
// Jekyll for development
//
// Note: since this site runs on GitHub Pages, the production build of Jekyll is
// not driven by Gulp. Only GitHub infrastructure can run it.
//——————————————————————————————————————————————————————————————————————————————
gulp.task('dev:jekyll', () => {
  bs.notify('Jekyll building...');

  return spawn('bundle', ['exec', 'jekyll', 'build', '--config=docs/_config.yml,docs/_config.dev.yml'], {stdio: 'inherit'})
    .on('close', reload);
});


//——————————————————————————————————————————————————————————————————————————————
// Sass
//——————————————————————————————————————————————————————————————————————————————
gulp.task('dev:sass', () => {
  bs.notify('Sass compiling...');

  return gulp.src('_sass/*.scss')
    .pipe(plumber())
    .pipe(gulpif(process.env.NODE_ENV !== 'production', sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      prefix({
        browsers: ['last 2 versions'],
        cascade: false,
      }),
      cssnano(),
    ]))
    .pipe(gulpif(process.env.NODE_ENV !== 'production', sourcemaps.write('./')))
    .pipe(gulp.dest('css'))
    .pipe(gulp.dest('_site/css'))
    .pipe(reload({stream: true}));
});


//——————————————————————————————————————————————————————————————————————————————
// JS Linting
//——————————————————————————————————————————————————————————————————————————————
// gulp.task('dev:js-lint', () => {
//   return gulp.src('_js/**/*.js')
//     .pipe(jshint())
//     .pipe(jshint.reporter(stylish));
// });


//——————————————————————————————————————————————————————————————————————————————
// JS Bundling
//——————————————————————————————————————————————————————————————————————————————
// gulp.task('dev:js-bundle', () => {
//   return gulp.src([
//       './docs/**/*.js',
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
// gulp.task('dev:js', ['dev:js-lint', 'dev:js-bundle']);


//——————————————————————————————————————————————————————————————————————————————
// Build assets and start development server
//——————————————————————————————————————————————————————————————————————————————
gulp.task('dev', ['dev:sass', /*'dev:js',*/ 'dev:bs', 'dev:jekyll', 'watch']);


//——————————————————————————————————————————————————————————————————————————————
// Watch Files For Changes
//——————————————————————————————————————————————————————————————————————————————
gulp.task('watch', () => {
  // gulp.watch('_js/**/*.js', ['dev:js']);
  gulp.watch('_sass/**/*.scss', ['dev:sass']);
  gulp.watch(['_config*', '**/*.{md,html,json}', '!_site/**/*.*', '!node_modules/**/*.*'], ['dev:jekyll']);
});


//——————————————————————————————————————————————————————————————————————————————
// Build site for a deploy to production
//——————————————————————————————————————————————————————————————————————————————
gulp.task('deploy', ['dev:sass', /*'dev:js'*/]);


//——————————————————————————————————————————————————————————————————————————————
// Offer help on command line
//——————————————————————————————————————————————————————————————————————————————
gulp.task('help', taskListing);


//——————————————————————————————————————————————————————————————————————————————
// Help task is default
//——————————————————————————————————————————————————————————————————————————————
gulp.task('default', ['help']);
