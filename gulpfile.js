var _ = require('lodash');
var os = require('os');
var path = require('path');
var gulp = require('gulp');
var prefix = require('gulp-autoprefixer');
var connect = require('gulp-connect');
var less = require('gulp-less');
var rename = require('gulp-rename');
var watchify = require('gulp-watchify');

var ifaces = os.networkInterfaces();

var paths = {
  src: ['js/main.js'],
  dest: 'build/'
};

gulp.task('watchify', watchify(function(watchify) {
  return gulp.src(paths.src)
    .pipe(watchify({
      watch: true
    }))
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest(paths.dest));
}));

gulp.task('less', function() {
  gulp.src('css/main.less')
    .pipe(less())
    .pipe(prefix({browsers: [
      'last 2 Chrome versions',
      'last 2 Firefox versions',
      'last 2 Safari versions',
      'last 2 Explorer versions',
      'last 2 ios_saf versions',
      'last 2 and_chr versions'
      ]}))
    .pipe(gulp.dest('css/'))
    .pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.watch('css/*.less', ['less']);
});

gulp.task('server', function() {
  connect.server({
    host: _.findWhere(ifaces.en0, {family: 'IPv4'}).address,
    livereload: true,
    port: 8081
  });
});

gulp.task('default', ['less', 'watchify', 'server', 'watch']);