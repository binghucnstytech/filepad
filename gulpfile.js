var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var del = require('del');
var _ = require('lodash');
var watchify = require('watchify');
var gutil = require('gulp-util');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var babelify = require('babelify');

var gzip = require('gulp-gzip');
var tar = require('gulp-tar');
var sftp = require('gulp-sftp');
var secret = require('./server/secret.json');

var secret = require('./server/secret.json');

var env = 'prod';

function handleError(task) {
    return function(err) {
        gutil.log(gutil.colors.red(err));
    };
}

gulp.task('clean:dev', function () {
    return del(['.tmp']);
});

gulp.task('clean:dist', function () {
    return del(['dist']);
});

gulp.task('styles',function(){
    return gulp.src('app/styles/**/*.scss')
        .pipe($.plumber())
        .pipe($.compass({
            css: '.tmp/styles',
            sass: 'app/styles'
        }));
});

function scripts(watch){
    var filePath = './app/scripts/app.js';
    var extensions = ['.jsx','.js'];

    var bundler, rebundle;
    bundler = browserify(_.extend({},watchify.args,{
        entries: [filePath],
        extensions: extensions,
        debug: false, // env === 'dev',
    }));



    if(watch) {
        bundler = watchify(bundler);
    }

    var globalShim = require('browserify-global-shim').configure({
        'bend': 'Bend'
    });



    bundler.transform(babelify.configure({
        optional: ["es7.decorators","es7.classProperties","es7.objectRestSpread","es7.asyncFunctions","runtime"]
    }));

    bundler.transform(globalShim);
    bundler.transform('reactify');

    rebundle = function() {
        var stream = bundler.bundle();
        stream.on('error', handleError('Browserify'));

        if(watch) {
            return stream
                .pipe(source('app.js'))
                .pipe(gulp.dest('.tmp/scripts/bundle'))
                .pipe(reload({stream: true}));
        }

        return stream
            .pipe(source('app.js'))
            .pipe(gulp.dest('.tmp/scripts/bundle'))
    };

    bundler.on('update', rebundle);
    bundler.on('log', gutil.log);

    return rebundle();
}

gulp.task('copy:bend',function(){
    return gulp.src("app/vendor/bend.js")
        .pipe(gulp.dest('.tmp/scripts/bundle'));
});

gulp.task('copy:bend:dist',function(){
    return gulp.src("app/vendor/bend.js")
        .pipe(gulp.dest('dist/public/scripts/bundle'));
});

gulp.task('watchScripts',['copy:bend'],function(){
    return scripts(true);
});

gulp.task('scripts',function () {
    return scripts(false);
});


gulp.task('server', ['watchScripts'],function () {

    browserSync({
        notify: true,
        logPrefix: 'BS',
        port: 8000,
        server: {
            baseDir: ['.tmp','app']
        }
    });

    gulp.watch('app/*.html',[reload]);
    gulp.watch('app/styles/**/*.scss', ['styles',reload]);
});

gulp.task('serve', ['server']);
gulp.task('build', function(callback){
    runSequence(['clean:dev','clean:dist'],['styles','scripts'],'bundle',callback);
});

gulp.task('bundle',function(){
    var assets = $.useref.assets({ searchPath: '{.tmp,app}'});

    var revAll = new $.revAll({dontRenameFile: [/^\/favicon.ico$/g, '.html']});

    var jsFilter = $.filter(['**/*.js']);
    var cssFilter = $.filter(['**/*.css']);
    var htmlFilter = $.filter(['*.html']);

    return gulp.src('app/*.html')
        .pipe(assets)
        .pipe(assets.restore())
        .pipe($.useref())

        .pipe(jsFilter)
        .pipe($.uglify()) // BEWARE: Uglify fails on ES6 injections!
        .pipe(jsFilter.restore())

        .pipe(cssFilter)
        .pipe($.minifyCss())
        .pipe(cssFilter.restore())

        .pipe(htmlFilter)
        // .pipe($.htmlmin({collapseWhitespace: true}))
        .pipe(htmlFilter.restore())
        .pipe(revAll.revision())

        .pipe(gulp.dest('dist/public'));
});

gulp.task('copy:assets',function(){
    return gulp.src(['app/images/**/*'])
        .pipe(gulp.dest('dist/public/images'));
});


gulp.task('copy:server',function(){
    return gulp.src(['server/**/*','!server/node_modules','!server/secret.json'])
        .pipe(gulp.dest('dist/'));
});


gulp.task('deploy',function(callback){
    runSequence(
        'build',
        'copy:bend:dist',
        'copy:server',
        'copy:assets',
        'deploy:compress',
        'deploy:remote-write',
        'deploy:remote-extract',
        'deploy:bootstrap-server',
        'deploy:restart-server',
        callback);
});

gulp.task('deploy-only',function(callback){
    runSequence(
        'copy:server',
        'copy:assets',
        'deploy:compress',
        'deploy:remote-write',
        'deploy:remote-extract',
        'deploy:bootstrap-server',
        'deploy:restart-server',
        callback);
});

var archive = "compressed.tar.gz";
var ssh = require('gulp-ssh')({
    ignoreErrors: false,
    sshConfig: {
        host: secret.hostname,
        username: secret.username,
        password: secret.password
    }
});

gulp.task('deploy:compress',function(){
    return gulp.src('./dist/**/*.*')
        .pipe(tar('compressed.tar'))
        .pipe(gzip())
        .pipe(gulp.dest('./.tmp'));
});

gulp.task('deploy:remote-write',function(){
    return gulp.src('.tmp/'+archive)
        .pipe(sftp({
            host: secret.hostname,
            user: secret.username,
            pass: secret.password,
            remotePath: secret.dest
        }));
});

gulp.task('deploy:remote-extract',function(){
    return ssh.shell(['cd '+secret.dest,'tar -zxvf '+archive])
        .pipe(gulp.dest('gulp_logs/remote-extract'));
});

gulp.task('deploy:bootstrap-server',function(){
    return ssh.shell(['cd '+secret.dest,'npm install'])
        .pipe(gulp.dest('gulp_logs/remote-bootstrap'));
});

gulp.task('deploy:restart-server',function(){
    return ssh.shell(['pm2 restart ' + secret.mainProcess])
        .pipe(gulp.dest('gulp_logs/remote-restart'));
});



gulp.task('default',['build']);