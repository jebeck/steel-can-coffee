var connect = require('gulp-connect');
var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var rename = require('gulp-rename');
var watchify = require('gulp-watchify');

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
    .pipe(gulp.dest('css/'))
    .pipe(connect.reload());
});

gulp.task('watch', function() {
  gulp.watch('css/*.less', ['less']);
});

gulp.task('server', function() {
  connect.server({
    livereload: true,
    port: 8081
  });
});

gulp.task('default', ['less', 'watchify', 'server', 'watch']);