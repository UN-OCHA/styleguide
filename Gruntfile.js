module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    sass: {
      dist: {
        files: {
          'docs/common-design/css/styles.css': 'docs/common-design/css/styles.scss'
        }
      }
    },
    watch: {
      sass: {
        files: ['docs/common-design/sass/**/*.scss'],
        tasks: ['sass', 'autoprefixer'],
        options: {
          spawn: false,
        }
      }
    },
    autoprefixer: {
      dist: {
        files: {
          'docs/common-design/css/styles.css': 'docs/common-design/css/styles.css'
        },
        options: {
          browsers: ['last 2 versions', 'iOS 8']
        }
      }
    },
    cssmin: {
      target: {
        files: {
          'docs/common-design/css/styles.min.css': 'docs/common-design/css/styles.min.css'
        }
      }
    },
    shell: {
      jekyllServe: {
        command: 'jekyll serve'
      }
    },
    concurrent: {
      serve: [
        'sass',
        'watch',
        'shell:jekyllServe'
      ],
      options: {
        logConcurrentOutput: true
      }
    },
    modernizr: {
      dist: {
        crawl: false,
        dest: 'assets/js/modernizr-output.js',
        tests: [
          'flexbox',
          'svg',
          'mediaqueries'
        ],
        options: [
          'setClasses'
        ],
        uglify: true
      }
    }
  });

  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks("grunt-modernizr"); //not picked up by load-grunt-tasks

  grunt.registerTask('default', ['sass', 'autoprefixer', 'modernizr']);
  grunt.registerTask('serve', ['concurrent:serve'])

};
