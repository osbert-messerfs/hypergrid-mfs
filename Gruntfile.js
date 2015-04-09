/*jslint node: true */
'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    jshint: {
      options: {
        jshintrc: true,
        ignores: ['src/**/*debug.js']
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      src: {
        src: ['src/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      },
    },
    watch: {
      js: {
        files: ['src/js/*'],
        tasks: ['jshint:src', 'jshint:src', 'uglify:js']
      },
      css: {
        files: ['src/css/*'],
        tasks: ['sync:css']
      },
      html: {
        files: ['src/html/*'],
        tasks: ['sync:html']
      },
      json: {
        files: ['src/json/*'],
        tasks: ['sync:json']
      }
    },
    sync: {
      js: {
        files: [
          {expand: true, cwd: 'src/js', src: '**', dest: 'public/assets/main/js'}
        ]
      },
      css: {
        files: [
          {expand: true, cwd: 'src/css', src: '**', dest: 'public/assets/main/css'}
        ]
      },
      html: {
        files: [
          {expand: true, cwd: 'src/html', src: '**', dest: 'public'}
        ]
      },
      json: {
        files: [
          {expand: true, cwd: 'src/json', src: '**', dest: 'public/json'}
        ]
      }
    },
    copy: {
      css: {
        files: [
          {expand: true, cwd: 'src/css', src: '**', dest: 'public/assets/main/css'}
        ]
      },
      html: {
        files: [
          {expand: true, cwd: 'src/html', src: '**', dest: 'public'}
        ]
      }
    },
    uglify: {
      js: {
        options: {
          screwIE8: true
        },
        files: [{
          src: 'src/js/*.js',
          dest:'public/assets/main/js/',
          expand: true,
          flatten: true,
          ext: '.min.js'
        }]
      }
    },
    bowercopy: {      
      jquery:  {
        files: {
          'public/assets/jquery/js/jquery.js': 'jquery/dist/jquery.js',
          'public/assets/jquery/js/jquery.min.js': 'jquery/dist/jquery.min.js',
          'public/assets/jquery/js/jquery.min.map': 'jquery/dist/jquery.min.map'
        }
      },
      angular: {
        files: {
          'public/assets/angular/js/angular.js': 'angular/angular.js',
          'public/assets/angular/js/angular.min.js': 'angular/angular.min.js',
          'public/assets/angular/js/angular.min.js.map': 'angular/angular.min.js.map'
        }
      },
      bootstrap: {
        files: {
          'public/assets/bootstrap/js/bootstrap.js': 'bootstrap/dist/js/bootstrap.js',
          'public/assets/bootstrap/js/bootstrap.min.js': 'bootstrap/dist/js/bootstrap.min.js',
          'public/assets/bootstrap/css/bootstrap.css': 'bootstrap/dist/css/bootstrap.css',
          'public/assets/bootstrap/css/bootstrap.min.css': 'bootstrap/dist/css/bootstrap.min.css',
          'public/assets/bootstrap/css/bootstrap.css.map': 'bootstrap/dist/css/bootstrap.css.map'
        }
      },
      'angular-bootstrap': {
        files: {
          'public/assets/angular-bootstrap/js/ui-bootstrap-tpls.js': 'angular-bootstrap/ui-bootstrap-tpls.js',
          'public/assets/angular-bootstrap/js/ui-bootstrap-tpls.min.js': 'angular-bootstrap/ui-bootstrap-tpls.min.js'
        }
      },
      'angular-ui-router': {
        files: {
          'public/assets/angular-ui-router/js/angular-ui-router.js': 'angular-ui-router/release/angular-ui-router.js',
          'public/assets/angular-ui-router/js/angular-ui-router.min.js': 'angular-ui-router/release/angular-ui-router.min.js'
        }
      },
      'font-awesome': {
        files: {
          'public/assets/font-awesome/css/font-awesome.css': 'font-awesome/css/font-awesome.css',
          'public/assets/font-awesome/css/font-awesome.css.map': 'font-awesome/css/font-awesome.css.map',
          'public/assets/font-awesome/css/font-awesome.min.css': 'font-awesome/css/font-awesome.min.css',
          'public/assets/font-awesome/fonts/fontawesome-webfont.ttf': 'font-awesome/fonts/fontawesome-webfont.ttf',
          'public/assets/font-awesome/fonts/fontawesome-webfont.woff': 'font-awesome/fonts/fontawesome-webfont.woff',
          'public/assets/font-awesome/fonts/fontawesome-webfont.woff2': 'font-awesome/fonts/fontawesome-webfont.woff2'
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-sync');
  grunt.loadNpmTasks('grunt-bowercopy');

  // Default task.
  grunt.registerTask('default', ['jshint']);

};