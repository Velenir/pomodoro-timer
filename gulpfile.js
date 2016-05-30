'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const jade = require('gulp-jade');
const concat = require('gulp-concat');
const iife = require("gulp-iife");


const src = {
	scss: 'scss/*.scss',
	scssPartials: 'scss/partials/*.scss',
	jade: '*.jade',
	jadePartials: 'partials/*jade',
	js: ['js/pubsub.js', 'js/*.js']
};

const dist = {
	base: 'dist',
	css: 'dist/css',
	js: 'dist/js'
};

// Static Server + watching scss/jade files
gulp.task('serve', ['sass', 'jade', 'javascript'], function() {
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
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
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
		.pipe(concat('bundle.js'))
		// .pipe(iife())
		.pipe(gulp.dest(dist.js))
		.pipe(browserSync.stream({once: true}));
});

gulp.task('default', ['serve']);
