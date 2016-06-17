'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const jade = require('gulp-jade');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const iife = require("gulp-iife");
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const del = require('del');
const runSequence = require('run-sequence');


const src = {
	scss: 'scss/*.scss',
	scssPartials: 'scss/partials/*.scss',
	jade: '*.jade',
	jadePartials: 'partials/*jade',
	js: ['js/pubsub.js', 'js/*.js'],
	img: 'images/*',
	audio: 'audio/*'
};

const dist = {
	base: 'dist',
	css: 'dist/css',
	js: 'dist/js',
	img: 'dist/images',
	audio: 'dist/audio'
};

// Static Server + watching scss/jade files
gulp.task('serve', ['sass', 'jade', 'javascript', 'images', 'audio'], function() {
	browserSync.init({
		server: {
			baseDir: dist.base
		}
	});

	gulp.watch([src.scss, src.scssPartials], ['sass']);
	gulp.watch([src.jade, src.jadePartials], ['jade']);
	gulp.watch(src.js, ['javascript']);
});

gulp.task('clean', function(){
	return del('dist');
});

gulp.task('build', function(callback) {
	runSequence('clean', ['sass', 'jade', 'javascript-pub', 'images', 'audio'], callback);
});


// Compile sass into CSS
gulp.task('sass', function() {
	return gulp.src(src.scss)
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(sourcemaps.write('../maps'))
		.pipe(gulp.dest(dist.css))
		.pipe(browserSync.stream({once: true}));
});

// Compile jade into HTML
gulp.task('jade', function() {
	let locals = {title: "Productivity Timer"};

	return gulp.src(src.jade)
		.pipe(jade({ locals }))
		.pipe(gulp.dest(dist.base))
		.pipe(browserSync.stream({once: true}));
});

// Concat all jscripts, keeping non-hoisted classes declarations first
gulp.task('javascript', function() {
	return gulp.src(src.js)
		.pipe(sourcemaps.init())
		.pipe(concat('bundle.js'))
		.pipe(sourcemaps.write('../maps'))
		.pipe(gulp.dest(dist.js))
		.pipe(browserSync.stream({once: true}));
});


// Make publish-ready
gulp.task('javascript-pub', function() {
	const uglifyOptions = {compress: {drop_console: true}};

	return gulp.src(src.js)
		.pipe(sourcemaps.init())
		.pipe(concat('bundle.js'))
		.pipe(babel({ presets: ['es2015'] }))
		.pipe(iife())
		.pipe(uglify(uglifyOptions))
		.pipe(sourcemaps.write('../maps'))
		.pipe(gulp.dest(dist.js))
		.pipe(browserSync.stream({once: true}));
});

// Compress images
gulp.task('images', function () {
	return gulp.src(src.img)
		.pipe(imagemin())
		.pipe(gulp.dest(dist.img));
});

// Copy audio
gulp.task('audio', function () {
	return gulp.src(src.audio)
		.pipe(gulp.dest(dist.audio));
});

gulp.task('default', ['serve']);


// EXTRAS
// replace images with dataURI in js files

const replace = require('gulp-replace');
const fs = require('fs');
const mime = require('mime');



function replaceWithDataURI(fileRegExp) {
	function base64(fpath) {
		const absPath = process.cwd() + "/" + fpath.replace(/["']/g, '');
		console.log("dataURI:", absPath);
		let fileData;
		try {
			fileData = fs.readFileSync(absPath);
		} catch (e) {
			console.log("error", e);
			return fpath;
		}
		return `"data:${mime.lookup(absPath)};base64,${fileData.toString('base64')}"`;
	}

	return replace(fileRegExp, base64);
}


function stripConsole() {
	return replace(/\bconsole.log\(.+\)\s*?(;|\n)/g, '');
}


gulp.task('datauri', function() {
	return gulp.src(src.js)
		.pipe(concat('bundle.replacedURI.js'))
		.pipe(replaceWithDataURI(/(["'])(?:\.*\/)*((?:images|audio)\/[\w\/]+)\.(?:svg|png|jpg|jpeg|gif|mp3|ogg|wav)\1/g))
		.pipe(stripConsole())
		.pipe(iife())
		.pipe(gulp.dest("../pomodoro-misc"));
});


const remoteHost = "http://github.com/";


gulp.task('repath', function() {
	return gulp.src(src.js)
		.pipe(concat('bundle.replacedPath.js'))
		// prepend remote host
		.pipe(replace(/(["'])(?:\.*\/)*((?:images|audio)\/[-\w\/.]+)\1/g, remoteHost + (remoteHost.endsWith("/") ? "$2" : "/$2")))
		.pipe(stripConsole())
		.pipe(iife())
		.pipe(gulp.dest("../pomodoro-misc"));
});


// publish to gh-pages

const ghPages = require('gulp-gh-pages');

gulp.task('publish', ['build'], function() {
	return gulp.src('./dist/**/*')
    .pipe(ghPages());
});
