// Utils
var gulp = require('gulp');
var del = require('del');
var plumber = require('gulp-plumber');
var errorutil = require('sky-err-util');
var runSequence = require('run-sequence');

// Syntax / transpilation
var babel = require('gulp-babel');
var jshint = require('gulp-jshint');

// Reloads
var browsersync = require('browser-sync').create();

// Advanced compilation
var closurePackage = require('google-closure-compiler')
var closureCompiler = closurePackage.gulp(); 

// Generic dist build tools
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify'); // JS
var cssmin = require('gulp-cssmin'); // CSS
var imagemin = require('gulp-imagemin'); // Images
var templateCache = require('gulp-angular-templatecache'); // HTML

var inject = require('gulp-inject');
var rename = require('gulp-rename');
var concat = require('gulp-concat');



/////////////////////////////////////////////////////////////////////////////////



function pth(rel){
    rel = rel || '';
    return Array.isArray(rel) ? rel.map(r => './src/main/webapp/' + r) : './src/main/webapp/' + rel;
}

var paths = {
    scripts: ['./app/app.js', './app/**/*.js', './build/**/*.js'],
    externs: ['./externs/*'],
    views: ['./app/**/*.html','!./app/**/*.partial.html'],
    templates: ['./templates/*.html'],
    css: [
        pth('static/css/*')
    ]
};


/////////////////////////////////////////////////////////////////////////////////


gulp.task('gcc', () => {
    return gulp.src('./externs/users.aws.service.js')
        .pipe(closureCompiler({
            compilation_level: 'ADVANCED_OPTIMIZATIONS',
            js_output_file: 'awsservice.min.js',
            create_source_map: 'awsservice.min.js.map',
            output_wrapper: '%output%\n//# sourceMappingURL=awsservice.min.js.map',
            // debug: true,
            externs: [
                './externs/aws-sdk-2.3.16.ext.js',
                './externs/aws-cognito-sdk.ext.js',
                './externs/aws-sdk-mobile-analytics.ext.js',
            ].concat([
                closurePackage.compiler.CONTRIB_PATH + '/externs/angular-1.5.js',
                closurePackage.compiler.CONTRIB_PATH + '/externs/angular-1.5-q_templated.js',
            ]),
            language_in: 'ECMASCRIPT6_STRICT',
            language_out: 'ECMASCRIPT5_STRICT',
        }))
        .pipe(gulp.dest('app/users'));
});

function doClosureCompile(filename) {
    return closureCompiler({
        compilation_level: 'SIMPLE',
        js_output_file: filename,
        language_in: 'ECMASCRIPT6_STRICT',
        language_out: 'ECMASCRIPT5_STRICT',
    });
};

gulp.task('gscripts', () => {
    console.log('\n');
    return gulp.src([])
    .pipe(
        closureCompiler({
            compilation_level: 'SIMPLE',
            js: paths.scripts,
            js_output_file: 'index.js',
            create_source_map: 'index.js.map',
            language_in:  'ECMASCRIPT6_STRICT',
            language_out: 'ECMASCRIPT5_STRICT',
        })
    )
    .pipe(gulp.dest('./src/main/webapp'));
});

gulp.task('scripts', () => {
    return gulp.src(paths.scripts)
        .pipe(plumber({
            errorHandler: errorutil
        }))
        // .pipe(jshint())
        // .pipe(jshint.reporter('jshint-stylish'))
        .pipe(sourcemaps.init())
            .pipe(babel({
                presets: ['es2015'],
                // comments: false,
                // compact: true,
            }))
            .pipe(concat('index.js'))
            .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(pth()))
        .on('error',errorutil);
});


/////////////////////////////////////////////////////////////////////////////////


gulp.task('css', () => {
    return gulp.src(paths.css)
        .pipe(browsersync.stream());
});


/////////////////////////////////////////////////////////////////////////////////

gulp.task('templates', () => {
    return gulp.src(paths.templates).pipe(gulp.dest(pth('/templates')));
});

gulp.task('views', () => {
    return gulp.src(paths.views).pipe(gulp.dest(pth('/templates')));
});

gulp.task('upload_module', () => {
    return gulp.src(['app/upload/*.html','app/upload/*.svg'])
        .pipe(templateCache({
            module:'skyApp'
        }))
        .pipe(gulp.dest('build/upload/'))
})

gulp.task('flights_module',() => {
    return gulp.src(['app/flights/*.partial.html'])
        .pipe(templateCache({
            module:'skyApp',
            root:'flights'
        }))
        .pipe(gulp.dest('build/flights/'))
});

gulp.task('cache-templates', runSequence(['upload_module','flights_module']));
gulp.task('html',['views','templates','cache-templates']);

/////////////////////////////////////////////////////////////////////////////////

gulp.task('build-dist',() => {
    return gulp.src(paths.scripts)
        // .pipe(jshint())
            // .pipe(jshint.reporter('jshint-stylish'))
            .pipe(babel({
                presets: ['es2015'],
                comments: false,
                compact: true,
        		plugins: [
                    'transform-remove-console'
                ]
            }))
            .pipe(concat('index.js'))
        .pipe(gulp.dest(pth()));
});



gulp.task('aws-cognito', () => {
    return gulp.src([
            './node_modules/amazon-cognito-identity-js/dist/amazon-cognito-identity.min.js',
            './node_modules/amazon-cognito-identity-js/dist/amazon-cognito-identity.min.js.map'
        ])
        .pipe(gulp.dest('./src/main/webapp/resources/'));
});

gulp.task('build',runSequence(['css','html'],['scripts']));


/////////////////////////////////////////////////////////////////////////////////


gulp.task('serve-dev', ['build'], function () {

    // Serve files from the root of this project
    browsersync.init({
       // reloadOnRestart: true,
        // browser: ["google chrome", "firefox", 'safari'],
        logFileChanges: true,
        port: 8080,
        proxy: "http://localhost:8888",
        serveStatic: ['./src/main/webapp/', './src/main/webapp/static/','./src/main/webapp/resources/']
    });

    gulp.task('watch-scripts-and-partials',runSequence(['cache-templates','scripts']));

    gulp.watch('./app/**/*.partial.html', ['watch-scripts-and-partials', browsersync.reload]);
    
    // add browserSync.reload to the tasks array to make
    // all browsers reload after tasks are complete.
    gulp.watch(paths.scripts, ['scripts', browsersync.reload]);
    gulp.watch(paths.css, ['css']);
    gulp.watch(paths.templates, ['templates', browsersync.reload]);
    gulp.watch(paths.views, ['views', browsersync.reload]);
    // gulp.watch(['./src/main/webapp/*.html','./src/main/webapp/*/**.html'],[browsersync.reload]);
    gulp.watch('./node_modules/amazon-cognito-identity-js/dist/amazon-cognito-identity.min.js',['aws-cognito'])
});


// The default task (called when you run `gulp` from cli)
// gulp.task('default', ['scripts','js-watch']);
gulp.task('serve-g',['gscripts','html'], () => {
    // Serve files from the root of this project
    browsersync.init({
        reloadOnRestart: true,
        // browser: ["google chrome", "firefox", 'safari'],
        logFileChanges: true,
        port: 8080,
        proxy: "http://localhost:8888",
        serveStatic: ['./src/main/webapp/', './src/main/webapp/static/','./src/main/webapp/resources/']
    });
    gulp.watch(paths.templates, ['templates', browsersync.reload]);
    gulp.watch(paths.views, ['views', browsersync.reload]);
    gulp.watch(paths.scripts, ['gscripts', browsersync.reload]);
})
