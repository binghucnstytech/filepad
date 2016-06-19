var gulp = require('gulp');
var runSequence = require('run-sequence');
var gulpSequence = require('gulp-sequence');
var del = require('del');
var gutil = require('gulp-util');
var webpack = require('webpack');
var webpackConfig = require('./webpack.production.config.js');

var gzip = require('gulp-gzip');
var tar = require('gulp-tar');
var sftp = require('gulp-sftp');
var secret = require('./server/secret.json');

var env = 'prod';

function handleError(task) {
  return function (err) {
    gutil.log(gutil.colors.red(err));
  };
}

gulp.task('webpack', function (callback) {
  return webpack(webpackConfig, function (err, stats) {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }

    gutil.log('[webpack]', stats.toString({
      // output options
    }));
    callback();
  });
});

gulp.task('clean:dev', function () {
  return del(['.tmp']);
});

gulp.task('clean:dist', function () {
  return del(['dist']);
});

gulp.task('build', function (callback) {
  gulpSequence(
    ['clean:dev', 'clean:dist'],
    'webpack',
    callback);
});

gulp.task('copy:bend:dist', function () {
  return gulp.src('app/vendor/bend.js')
    .pipe(gulp.dest('dist/public/vendor'));
});

gulp.task('copy:assets', function () {
  return gulp.src(['app/images/**/*'])
    .pipe(gulp.dest('dist/public/images'));
});

gulp.task('copy:server', function () {
  return gulp.src([
    'server/**/*',
    '!server/node_modules',
    '!server/secret.json',
  ]).pipe(gulp.dest('dist/'));
});

gulp.task('deploy', function (callback) {
  gulpSequence(
    'build',
    'copy:bend:dist',
    'copy:server',
    'copy:assets',
    'deploy:compress',
    callback);

    // 'deploy:remote-write',
    // 'deploy:remote-extract',
    // 'deploy:bootstrap-server',
    // 'deploy:restart-server',
});

gulp.task('deploy-only', function (callback) {
  gulpSequence(
    'copy:server',
    'copy:assets',
    'deploy:compress',
    'deploy:remote-write',
    'deploy:remote-extract',
    'deploy:bootstrap-server',
    'deploy:restart-server',
    callback);
});

var archive = 'compressed.tar.gz';
var ssh = require('gulp-ssh')({
  ignoreErrors: false,
  sshConfig: {
    host: secret.hostname,
    username: secret.username,
    password: secret.password,
  },
});

gulp.task('deploy:compress', function () {
  return gulp.src('./dist/**/*.*')
    .pipe(tar('compressed.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('./.tmp'));
});

gulp.task('deploy:remote-write', function () {
  return gulp.src('.tmp/' + archive)
    .pipe(sftp({
      host: secret.hostname,
      user: secret.username,
      pass: secret.password,
      remotePath: secret.dest,
    }));
});

gulp.task('deploy:remote-extract', function () {
  return ssh.shell(['cd ' + secret.dest, 'tar -zxvf ' + archive])
    .pipe(gulp.dest('gulp_logs/remote-extract'));
});

gulp.task('deploy:bootstrap-server', function () {
  return ssh.shell(['cd ' + secret.dest, 'npm install'])
    .pipe(gulp.dest('gulp_logs/remote-bootstrap'));
});

gulp.task('deploy:restart-server', function () {
  return ssh.shell(['pm2 restart ' + secret.mainProcess])
    .pipe(gulp.dest('gulp_logs/remote-restart'));
});

gulp.task('default', ['build']);
