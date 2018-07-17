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
// Note: since this site deploys to GitHub Pages, the production build of Jekyll
// is not driven by Gulp. Only GitHub infrastructure can run it.
//——————————————————————————————————————————————————————————————————————————————
gulp.task('dev:jekyll', () => {
  bs.notify('Jekyll building...');

  return spawn('bundle', ['exec', 'jekyll', 'build', '--config=_config.yml,_config.dev.yml'], {stdio: 'inherit'})
    .on('close', reload);
});


//——————————————————————————————————————————————————————————————————————————————
// Sass
//——————————————————————————————————————————————————————————————————————————————
gulp.task('dev:sass', ['dev:sass:commondesign', 'dev:sass:ochaextras', 'dev:sass:styleguide']);

gulp.task('dev:sass:commondesign', () => {
  return sassTask('common-design/css/styles.scss');
});

gulp.task('dev:sass:ochaextras', () => {
  return sassTask('ocha/css/extras.scss');
});

gulp.task('dev:sass:styleguide', () => {
  return sassTask('styleguide/css/styleguide.scss');
});

//——————————————————————————————————————————————————————————————————————————————
// Reusable Sass task. Takes source parameter and outputs to same directory.
//——————————————————————————————————————————————————————————————————————————————
function sassTask(source) {
  bs.notify(`Sass: ${source}`);

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
  gulp.watch(['common-design/**/*.scss'], ['dev:sass:commondesign']);
  gulp.watch(['ocha/**/*.scss'], ['dev:sass:ochaextras']);
  gulp.watch(['styleguide/**/*.scss'], ['dev:sass:styleguide']);
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
