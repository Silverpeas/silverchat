/* global module:false */
module.exports = function(grunt) {

  grunt.initConfig({
    app : grunt.file.readJSON('package.json'),
    target : 'build',
    jshint : {
      options : {
        jshintrc : '.jshintrc'
      },
      gruntfile : {
        src : 'Gruntfile.js'
      },
      files : ['js/*.js']
    },
    copy : {
      main : {
        files : [{
          expand : true, src : ['jsxc/**'], dest : '<%= target %>/'
        }, {
          expand : true, src : ['css/**'], dest : '<%= target %>/'
        }, {
          expand : true, src : ['img/**'], dest : '<%= target %>/'
        }, {
          expand : true, src : ['js/silverchat.js'], dest : '<%= target %>/'
        }]
      }
    },
    clean : ['<%= target %>'],
    replace : {
      template : {
        src : ['tmp/template.js'],
        overwrite : true,
        replacements : [{
          from : 'var jsxc.gui.template = {};', to : ''
        }]
      },
      banner : {
        src : ['<%= target %>/js/silverchat.js'],
        overwrite : true,
        replacements : [{
          from : /\/\*![\s\w\d*()-:"';<>]*\*\//g, to : ''
        }]
      }
    },
    insert : {
      options : {},
      gui : {
        src : 'tmp/template.js',
        dest : '<%= target %>/js/silverchat.js',
        match : '//Silverchat GUI templates'
      },
      jsxc : {
        src : 'js/silverchat-jsxc.js',
        dest : '<%= target %>/js/silverchat.js',
        match : '//JSXC functions modification'
      },
      locale : {
        src : 'js/silverchat-locale.js',
        dest : '<%= target %>/js/silverchat.js',
        match : '//Silverchat locales'
      }
    },
    uglify : {
      silverchat : {
        options : {
          mangle : false, sourceMap : true, preserveComments : 'some'
        },
        files : {
          '<%= target %>/js/silverchat.min.js' : ['<%= target %>/js/silverchat.js']
        }
      }
    },
    csslint : {
      strict : {
        options : {
          import : 2
        },
        src : ['<%= target %>/css/*.css']
      },
    },
    watch : {
      js : {
        files : ['js/silverchat*'], tasks : ['copy', 'htmlConvert', 'replace:template', 'insert']
      },
      template : {
        files : ['template/*.html'], tasks : ['copy', 'htmlConvert', 'replace:template', 'insert']
      }
    },
    jsbeautifier : {
      files : ['<%= target %>/js/silverchat.js'],
      options : {
        config : '.jsbeautifyrc'
      }
    },
    htmlConvert : {
      options : {
        target : 'js',
        rename : function(name) {
          return name.match(/([-_0-9a-z]+)\.html$/i)[1];
        },
        quoteChar : '\'', indentString : '', indentGlobal : ''
      },
      'jsxc.gui.template' : {
        src : 'template/*.html', dest : 'tmp/template.js'
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-insert');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-html-convert');

  //Default task
  grunt.registerTask('default', ['build', 'watch']);

  grunt.registerTask('build', function() {
    grunt.config.set('target', 'build');
    grunt.task.run(['jshint', 'clean', 'copy', 'htmlConvert', 'replace:template', 'insert',
      'replace:banner', 'jsbeautifier', 'uglify']);
  });
};
