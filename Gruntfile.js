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
        tasks: ['sass:commondesign', 'postcss:commondesign', 'sass:ochaextras', 'sass:styleguide'],
        options: {
          spawn: false,
        }
      }
    },
    postcss: {
      options: {
        map: true,
        processors: [
          require('autoprefixer')({browsers: ['last 2 versions', 'iOS 8']})
        ]
      },
      commondesign: {
        files: {
          'docs/common-design/css/styles.css': 'docs/common-design/css/styles.css'
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['sass:commondesign', 'postcss:commondesign', 'sass:ochaextras', 'sass:styleguide']);

};
