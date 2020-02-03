//подключаем модули
const gulp = require("gulp");
const concat = require("gulp-concat");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const uglify = require("gulp-uglify");
const del = require("del");
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const sass1 = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const cache = require('gulp-cache');


//очередность css файлов
const cssFiles = [
    "./node_modules/bootstrap/dist/css/bootstrap.css", //бутстрап не удалять
    "./src/css/all.css",
    "./src/css/material-icons-font.css",
    "./src/css/fonts.scss",
    "./src/css/test-1.scss",
    "./src/css/adaptive-test-1.scss",

];

//очередность js файлов
const jsFiles = [
    "./node_modules/jquery/dist/jquery.js", //жеквери не удалять
    "./node_modules/bootstrap/dist/js/bootstrap.bundle.js", //бутстрап пропись в js файлах и попер джеес не удалять
    "./node_modules/@fortawesome/fontawesome-free/js/all.js",
    "./src/js/test-1.js",
];


//модули для css
function styles() {
    return gulp.src(cssFiles)
        .pipe(sourcemaps.init())
        .pipe(concat('all.css'))
        .pipe(sass1().on('error', sass1.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['>0.01%'],
            cascade: false
        }))
        .pipe(cleanCSS({
            compatibility: 'ie8',
            level: 2
        }))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("./build/css/"))
        .pipe(browserSync.stream());
}

//модули для js
function scripts() {
    return gulp.src(jsFiles)
        .pipe(sourcemaps.init())
        .pipe(concat('all.js'))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify({
            toplevel: true
        }))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("./build/js/"))
        .pipe(browserSync.stream());
}

//функция которая минифицирует картинки

function imgs() {
    return gulp.src("./src/imgmin/**/*")
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 7}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(gulp.dest("./build/imgmin/"))
        .pipe(browserSync.stream());
}

//смотрител вызывается один раз в фоновом режиме что бы не вызивать все функции каждый раз по новому
function watch() {
    browserSync.init({ //иницализируем синхронизацию
        // server: {
        //     baseDir: "./", //в какой папке искать html файлы если php то вписать ссылку на local host
        //     injectChanges: true
        // },
        // notify:false,
        proxy: "gulp-pro-build",
        // tunnel: true,  //эта функция создает ссылку по каторой ты можеш войты с любого устройства даже не подключеного к wifi

    });
    gulp.watch("./src/css/**/*", styles);
    gulp.watch("./src/js/**/*.js", scripts);
    gulp.watch("./*.html").on('change', browserSync.reload);
    gulp.watch("./src/imgmin/**/*", imgs);
    gulp.watch("./**/*.php").on('change', browserSync.reload);
    gulp.watch("./src/css/**/*.css").on('change', browserSync.reload);
    // gulp.watch("./src/js/**/*.js").on('change', browserSync.reload);
    gulp.watch('/public/js/**/*.js').on('change', function (e) {
        return gulp.src(e.path)
            .pipe(browserSync.reload({stream: true}));
    });
    gulp.watch("./src/imgmin/**/*").on('change', browserSync.reload);
    gulp.watch("./src/static/**/*.jpg").on('change', browserSync.reload);


}

//для удобного удаления файлов
function clean() {
    return del(["build/*"]); //полное удаление в папке билд
}

function cacheClean() {

    cache.clearAll();


    // Still pass the files to clear cache for
    // gulp.src('./src/js/**/*.js')
    //     .pipe(cache.clear());

    // Or, just call this for everything


}



//создание таска первое значение в "" это событые которое мы вызываем в консоле gulp styles а второе сама функция
gulp.task("styles", styles);
gulp.task("scripts", scripts);
gulp.task("watch", watch);
gulp.task("clean", clean);
gulp.task("imgs", imgs);
gulp.task('clearCache', cacheClean);

gulp.task("build", gulp.series("clean", //сначала выполняется clean а потом остальные таски
    gulp.parallel("styles", "scripts", "imgs")//два такска которые выполняются паралельно бо они лруг друга не затрагивают
));

gulp.task("dev", gulp.series("build", "watch", 'clearCache'));

