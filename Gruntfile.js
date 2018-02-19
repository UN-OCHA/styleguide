module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    sass: {
      commondesign: {
        files: {
          'docs/common-design/css/styles.css': 'docs/common-design/css/styles.scss'
        }
      },
      ochaextras: {
        files: {
          'docs/ocha/css/extras.css': 'docs/ocha/css/extras.scss'
        }
      },
      styleguide: {
        files: {
          'docs/styleguide/css/styleguide.css': 'docs/styleguide/css/styleguide.scss'
        }
      }
    },
    watch: {
      sass: {
        files: ['docs/common-design/sass/**/*.scss', 'docs/styleguide/sass/**/*.scss', 'docs/ocha/sass/**/*.scss'],
        tasks: ['sass:commondesign', 'autoprefixer:commondesign', 'sass:ochaextras', 'sass:styleguide'],
        options: {
          spawn: false,
        }
      }
    },
    autoprefixer: {
      commondesign: {
        files: {
          'docs/common-design/css/styles.css': 'docs/common-design/css/styles.css'
        },
        options: {
          browsers: ['last 2 versions', 'iOS 8']
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['sass:commondesign', 'autoprefixer:commondesign', 'sass:ochaextras', 'sass:styleguide']);

};
