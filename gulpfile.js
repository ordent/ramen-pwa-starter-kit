var gulp = require('gulp'),
    readdir = require('recursive-readdir'),
    sass = require('gulp-sass'),
    pathToFolder = 'templates',
    fs = require('fs'),
    template = require('gulp-template'),
    browserSync = require('browser-sync').create(),
    babel = require('gulp-babel'),
    exec = require('child_process').exec,
    uglifyes = require('uglify-es'),
    composer = require('gulp-uglify/composer'),
    uglify = composer(uglifyes, console),
    // uglify = require('gulp-uglify'),
    jsonminify = require('gulp-jsonminify'),
    polyfill = require('babel-polyfill'),
    exec = require('child_process').exec,
    htmlmin = require('gulp-htmlmin');

gulp.task('templates', function(done) {
    readdir(pathToFolder, ['*.scss', '*.json', '*.html'], function(err, files) {
        files.forEach(function(file) {
            let data = file.substr(10);
            data = data.replace(String.fromCharCode(92), String.fromCharCode(47));
            let index = data.lastIndexOf('/');
            let path = data.substr(0, index);
            let scss = file.substr(0, file.lastIndexOf('.')) + '.scss';
            let html = file.substr(0, file.lastIndexOf('.')) + '.html';
            let json = file.substr(0, file.lastIndexOf('.')) + '.json';
            let process = {
                css: '',
                form: '',
                html: '',
                json: '',
            };
            if (fs.existsSync(scss)) {
                process = Object.assign(process, {
                    css: sass.compiler.renderSync({
                        file: scss,
                    }).css,
                });
            }
            if (fs.existsSync(html)) {
                process = Object.assign(process, {
                    html: fs.readFileSync(html, 'utf8'),
                });
            }
            // if (fs.existsSync(json)) {
            //     let x = gulp.src('./ramen-renderer.html')
            //         .pipe(template({
            //             json: json,
            //         }));
            //     process = Object.assign(process, {
            //         json: x,
            //     });
            //     // jsonProcess = Object.assign(jsonProcess, {json: fs.readFileSync(json, "utf8")});
            // }
            return gulp.src(file)
                .pipe(template(process, {interpolate : /<%=([\s\S]+?)%>/g}))
                .pipe(gulp.dest('src/' + path));
        });
    });
    done();
});

gulp.task('reloading', function(done) {
    browserSync.reload();
    done();
});

gulp.task('scripts', function() {
    return gulp.src('./library/*.js')
        // .pipe(babel({
        //     presets: ['env'],
        // }))
        .pipe(uglify())
        .pipe(gulp.dest('src/library'));
});

gulp.task('json', function(done) {
    return gulp.src('./content/*.json')
        .pipe(jsonminify())
        .pipe(gulp.dest('src/content'));
});
gulp.task('index', function(done) {
    return gulp.src('./index/index.html')
        .pipe(htmlmin({collapseWhitespace: true, minifyCSS: true, minifyJS: true, ignoreCustomComments: [/^#/], preserveLineBreaks: false, removeComments: true}))
        .pipe(gulp.dest('./'));
});
gulp.task('default', gulp.series(['templates', 'scripts', 'json'], function(done) {
    // exec('killall node');
    exec('npm run start');
    exec('browser-sync start --port 9000 --proxy 127.0.0.1:8081 --files \'src/**/*.html, src/**/*.js, images/*\' --online false --open false');
    gulp.watch('templates/*', gulp.parallel('templates'));
    gulp.watch('templates/**/*', gulp.parallel('templates'));
    gulp.watch('library/*', gulp.parallel('scripts'));
    gulp.watch('content/*', gulp.parallel('json'));
    gulp.watch('./index/index.html', gulp.parallel('index'));
    done();
}));


gulp.task('express', gulp.series(['templates', 'scripts'], function(done) {
    // exec('killall node');
    exec('npm run start');
    exec('browser-sync start --port 9000 --proxy 127.0.0.1:8081 --files \'src/**/*.html, src/**/*.js, images/*\' --online false --open false');
    gulp.watch('templates/*', gulp.parallel('templates'));
    gulp.watch('templates/**/*', gulp.parallel('templates'));
    gulp.watch('library/*', gulp.parallel('scripts'));
    gulp.watch('content/*', gulp.parallel('json'));
    gulp.watch('./index/index.html', gulp.parallel('index'));
    done();
}));