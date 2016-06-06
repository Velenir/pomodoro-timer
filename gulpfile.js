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


const src = {
	scss: 'scss/*.scss',
	scssPartials: 'scss/partials/*.scss',
	jade: '*.jade',
	jadePartials: 'partials/*jade',
	js: ['js/pubsub.js', 'js/*.js'],
	img: 'images/*'
};

const dist = {
	base: 'dist',
	css: 'dist/css',
	js: 'dist/js',
	img: 'dist/images'
};

// Static Server + watching scss/jade files
gulp.task('serve', ['sass', 'jade', 'javascript', 'images'], function() {
	browserSync.init({
		server: {
			baseDir: dist.base
		}
	});

	gulp.watch([src.scss, src.scssPartials], ['sass']);
	gulp.watch([src.jade, src.jadePartials], ['jade']);
	gulp.watch(src.js, ['javascript']);
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
	let locals = {};

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
		// .pipe(iife())
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

gulp.task('default', ['serve']);


// EXTRAS
// replace images with dataURI in js files

const replace = require('gulp-replace');
const fs = require('fs');
const mime = require('mime');



function replaceWithDataURI(fileRegExp) {
	function base64(fpath) {
		const absPath = process.cwd() + "/" + fpath.replace(/["']/g, '');
		console.log(absPath);
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


gulp.task('datauri', function() {
	return gulp.src(src.js)
		.pipe(concat('bundle.replaced.js'))
		.pipe(replaceWithDataURI(/["'](?:\.\/)?images\/([-\w.]+.(?:svg|png|jpg|jpeg|gif))["']/g))
		// .pipe(iife())
		.pipe(gulp.dest("misc"));
});
