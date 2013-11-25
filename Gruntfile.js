/*
 * hoops-frontend
 * https://github.com/Geoff Hing/hoops-frontend
 * Copyright (c) 2013
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    vendor: grunt.file.readJSON('.bowerrc').directory,

    copy: {
      main: {
        files: [
          {
            src: 'map.html',
            dest: 'dist/'
          },
          {
            src: 'index.html',
            dest: 'dist/'
          },
          {
            src: 'data/*',
            dest: 'dist/'
          },
          {
            src: 'assets/images/*',
            dest: 'dist/'
          },
          {
            expand: true,
            cwd: 'vendor/leaflet-dist/',
            src: ['images/*'],
            dest: 'dist/assets/'
          }
        ]
      }
    },

    requirejs: {
      compile: {
        options: {
          baseUrl: '.',
          name: 'vendor/almond/almond',
          include: ['assets/js/map/app'],
          out: 'dist/assets/js/map.js',
          paths: {
            "jquery": "vendor/jquery/jquery",
            "leaflet": "vendor/leaflet-dist/leaflet",
            "topojson": "vendor/topojson/topojson"
          },
          shim: {
            'topojson': {
              exports: 'topojson'
            }
          },
          //optimize: 'none',
          wrap: true
        }
      }
    },

    filerev: {
      styles: {
        src: ['dist/assets/css/map.css', 'dist/assets/css/index.css']
      },
      scripts: {
        src: ['dist/assets/js/map.js', 'dist/assets/js/index.js']
      }
    },

    useminPrepare: {
      src: ['index.html', 'map.html'],
      options: {
        dest: 'dist',
        flow: {
          steps: { 
            'js': ['concat', 'uglifyjs'],
            'css': ['concat', 'cssmin']
          }, 
          post: {}
        }
      }
    },

    usemin: {
      html: 'dist/*.html'
    },

    // Replace the RequireJS script tag with the optimized, almond-based
    // version
    'regex-replace': {
      main: {
        src: 'dist/map.html',
        actions: [
          {
            name: 'requirejs-newpath',
            search: '<script data-main="assets/js/map/app" src="vendor/requirejs/require.js">',
            replace: '<script src="assets/js/map.js">'
          }
        ]
      }
    },

    // Compile LESS to CSS
    less: {
      options: {
        paths: 'vendor/bootstrap/less',
        imports: {
          reference: ['mixins.less', 'variables.less']
        }
      },
      // Compile Bootstrap's LESS
      bootstrap: {
        src: [
          'vendor/bootstrap/less/bootstrap.less',
        ],
        dest: 'assets/css/bootstrap.css'
      }
    },

    // Before generating any new files,
    // remove any previously-created files.
    clean: {
      example: ['dist']
    }
  });

  // Load npm plugins to provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-filerev');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-regex-replace');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default tasks to be run.
  grunt.registerTask('default', [
    'clean',
    'copy',
    'useminPrepare', 
    'concat',
    'cssmin',
    'uglify',
    'requirejs',
    'filerev', 
    'regex-replace',
    'usemin'
  ]);

};
