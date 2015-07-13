'use strict';

// used for gzip server compression
var compression = require( 'compression' );

module.exports = function( grunt ) {

    // Time how long tasks take. Can help when optimizing build times
    require( 'time-grunt' )( grunt );

    // Load grunt tasks automatically just in time
    require( 'jit-grunt' )( grunt, {
        sprite: 'grunt-spritesmith',
        cmq: 'grunt-combine-media-queries'
    } );

    // Configurable paths
    var config = {
        src: 'src',
        dist: 'dist',
        tpl: '<%= config.src %>/template'
    };

    // Define the configuration for all the tasks
    grunt.initConfig( {

        // Project settings
        config: config,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            assemble: {
                files: [ '<%= config.src %>/template/**/*hbs' ],
                tasks: [ 'assemble' ],
                options: {
                    livereload: true
                }
            },
            sass: {
                files: [ '<%= config.src %>/css/{,*/}*.{scss,sass}' ],
                tasks: [ 'sass:dist', 'autoprefixer' ],
                options: {
                    livereload: true
                }
            },
            js: {
                files: [ '<%= config.src %>/js/**/*.js' ],
                tasks: [ 'newer:copy:dist' ],
                options: {
                    livereload: true
                }
            }
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                open: true,
                livereload: true,
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: {
                        target: 'http://localhost:9000/page'
                    },
                    middleware: function( connect ) {
                        return [
                            connect.static( 'dist' ),
                            connect().use( '/bower_components', connect.static( './bower_components' ) ),
                            connect.static( config.src )
                        ];
                    }
                }
            },

            // server with gzip compression
            dist: {
                options: {
                    livereload: false,
                    base: '<%= config.dist %>',
                    middleware: function( connect, options, middlewares ) {
                        middlewares.unshift( compression() );
                        return middlewares;
                    }
                }
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [
                    {
                        dot: true,
                        src: [
                            '<%= config.dist %>',
                            '<%= config.dist %>/*',
                            '!<%= config.dist %>/.git*'
                        ]
                    }
                ]
            },
            server: 'dist'
        },

        // Compiles Sass to CSS and generates necessary files if requested
        sass: {
            options: {
                sourceMap: true,
                includePaths: [ 'bower_components' ]
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.src %>/css',
                        src: [ '*.{scss,sass}' ],
                        dest: '<%= config.dist %>/css',
                        ext: '.css'
                    }
                ]
            }
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: [ 'last 10 versions', '> 1%', 'Firefox > 3.6', 'Opera > 11.1' ]
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.dist %>/css/',
                        src: '{,*/}*.css',
                        dest: '<%= config.dist %>/css/'
                    }
                ]
            }
        },

        // compile page
        assemble: {
            options: {
                flatten: true,
                layout: 'default.hbs',
                layoutdir: '<%= config.tpl %>/layout/',
                partials: [ '<%= config.tpl %>/partial/**/*.hbs' ],
                data: [ '<%= config.tpl %>/data/*.json' ]
            },
            page: {
                src: [ '<%= config.tpl %>/page/*.hbs' ],
                dest: '<%= config.dist %>/page/'
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= config.src %>',
                        dest: '<%= config.dist %>',
                        src: [
                            '*.{ico,png,txt}',
                            'image/**/*',
                            '!image/sprite/**',
                            'js/{,*/}*.*'
                        ]
                    }
                ]
            },
            styles: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= config.src %>',
                        dest: '<%= config.dist %>',
                        src: [
                            'css/*.css'
                        ]
                    }
                ]
            }
        },

        sprite: {
            technology: {
                src: '<%= config.src %>/image/sprite/technology/*.png',
                dest: '<%= config.dist %>/image//sprite/technology.png',
                destCss: '<%= config.src %>/css/generated/sprite/_technology.scss',
                padding: 1,
                imgPath: '/image/sprite/technology.png'
            }
        },

        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            sprite: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= config.dist %>/image/',
                        src: '**/*.{png,jpg,gif}',
                        dest: '<%= config.dist %>/image/'
                    }
                ]
            },
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= config.src %>/image',
                        src: [ '**/*.{png,jpg,gif}', '!sprite/**' ],
                        dest: '<%= config.dist %>/image/'
                    }
                ]
            }
        },

        svgmin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.src %>/svg',
                        src: '**/*.{svg}',
                        dest: '<%= config.dist %>/svg'
                    }
                ]
            }
        },

        // combine media queries
        cmq: {
            options: {
                log: false
            },
            dist: {
                files: {
                    '<%= config.dist %>/css/main_uncss.css': [ '<%= config.dist %>/css/main_uncss.css' ]
                }
            }
        },

        // minify css
        cssmin: {
            options: {
                debug: true,
                advanced: false,
                colors: {
                    opacity: false
                },
                compatibility: {
                    properties: {
                        spaceAfterClosingBrace: true,
                        ieSuffixHack: false
                    }
                }
            },
            optimize: {
                files: {
                    '<%= config.dist %>/css/main.min.css': [
                        '<%= config.dist %>/css/main_uncss.css',
                        '<%= config.dist %>/css/plugins.css'
                    ]
                }
            },
            dist: {
                options: {
                    keepBreaks: true
                },
                files: {
                    '<%= config.dist %>/css/main.css': [
                        '<%= config.dist %>/css/main.css'
                    ]
                }
            }
        },

        // concat js
        concat: {

            // main application js files
            app: {
                src: [

                    // maintain order !
                    'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/dropdown.js',
                    'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/collapse.js',
                    'bower_components/FitVids/jquery.fitvids.js',
                    '<%= config.src %>/js/index.js'
                ],
                dest: '<%= config.dist %>/js/main.js',
                nonull: true
            }
        },

        // minify js
        uglify: {
            // main application js files
            options: {
                mangle: true,
                beautify: false
            },
            app: {
                files: {
                    '<%= config.dist %>/js/main.min.js': [
                        '<%= config.dist %>/js/main.js'
                    ]
                }
            }
        },

        // remove unused css
        uncss: {
            dist: {
                files: {
                    '<%= config.dist %>/css/main_uncss.css': [
                        '<%= config.dist %>/page/*.html'
                    ]
                },
                options: {
                    ignore: [

                        // don't remove these css classes
                        /item\-[a-z\-0-9]+/,
                        /nav\-[a-z\-0-9]+/,
                        /collapse\-[a-z\-0-9]+/,
                        /active/,

                        // for mobile menu
                        /in/
                    ],
                    stylesheets: [ '../css/main.css' ]
                }
            }
        },

        // rewrite page to use assets depending on task
        processhtml: {
            optimize: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.dist %>/',
                        src: [ 'page/*.html' ],
                        dest: '<%= config.dist %>/',
                        ext: '.html'
                    }
                ]
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.dist %>/',
                        src: [ 'page/*.html' ],
                        dest: '<%= config.dist %>/',
                        ext: '.html'
                    }
                ]
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jscs: {
            dependency: {
                src: [
                    'bower.js',
                    'gruntfile.js'
                ]
            },
            base: {
                src: [
                    '<%= config.src %>/js/**/*.js'
                ]
            },
            options: {
                config: '.jscsrc',
                excludeFiles: [
                    '<%= config.src %>/js/nav/**',
                    '<%= config.src %>/js/plugins/**'
                ]
            }
        },
        jshint: {
            dependency: {
                src: [
                    'bower.js',
                    'gruntfile.js'
                ]
            },
            base: {
                src: [
                    '<%= config.src %>/js/**/*.js'
                ]
            },
            options: {
                jshintrc: true,
                reporter: require( 'jshint-stylish' )
            }
        },
        jsonlint: {},
        csslint: {
            base: {
                src: [
                    '<%= config.dist %>/css/main.css'
                ]
            },
            options: {
                csslintrc: '.csslintrc'
            }
        },
        htmlhint: {
            page: {
                src: [
                    '<%= config.dist %>/page/*.html'
                ]
            },
            options: {
                htmlhintrc: '.htmlhintrc'
            }
        },

        // Run some tasks in parallel to speed up build process
        concurrent: {
            build: [
                'assemble',
                'sprite',
                'concat:app'
            ],
            optimize: [
                'uglify:app',
                'uncss'
            ],
            server: [
                'processhtml:optimize',
                'cssmin:optimize'
            ],
            dist: [
                'sass:dist',
                'imagemin',
                'svgmin'
            ],
            qa: [
                'htmlhint',
                'jscs',
                'jshint',
                'csslint'
            ]
        }
    } );

    // build project
    grunt.registerTask( 'build', [
        'clean:server',
        'concurrent:build',
        'concurrent:dist',
        'cssmin:dist',
        'autoprefixer',
        'copy'
    ] );

    // minify js and css and rewrite page for production usage
    grunt.registerTask( 'optimize', [
        'build',
        'concurrent:optimize',
        'cmq',
        'concurrent:server'
    ] );

    // check code style violations with Grunt
    grunt.registerTask( 'qa',
        'check code style for violations - use html, css or js argument to check only this code style',
        function( target ) {
            if ( target === 'html' ) {
                return grunt.task.run( [ 'build', 'htmlhint' ] );
            }
            if ( target === 'css' ) {
                return grunt.task.run( [ 'build', 'csslint' ] );
            }
            if ( target === 'js' ) {
                return grunt.task.run( [ 'build', 'jscs', 'jshint' ] );
            }
            if ( target === 'jscs' ) {
                return grunt.task.run( [ 'build', 'jscs' ] );
            }
            if ( target === 'jshint' ) {
                return grunt.task.run( [ 'build', 'jshint' ] );
            }

            // check all
            grunt.task.run( [
                'build',
                'concurrent:qa'
            ] );
        } );

    grunt.registerTask( 'serve',
        'start the server and preview your src, --allow-remote for remote access',
        function( target ) {
            if ( grunt.option( 'allow-remote' ) ) {
                grunt.config.set( 'connect.options.hostname', '0.0.0.0' );
            }
            if ( target === 'dist' ) {
                return grunt.task.run( [ 'optimize', 'connect:dist:keepalive' ] );
            }

            grunt.task.run( [
                'build',
                'connect:livereload',
                'watch'
            ] );
        } );
};
