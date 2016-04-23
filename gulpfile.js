var gulp = require('gulp');
var mocha = require('gulp-mocha');
var exit = require('gulp-exit');

gulp.task('test', () => {
  return gulp.src('./tests/*.spec.js', {read: false})
    .pipe(mocha({reporter: 'list'}))
    .pipe(exit());
});
