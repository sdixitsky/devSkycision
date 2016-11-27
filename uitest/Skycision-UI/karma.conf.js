app
rts = function(config){
  config.set({

    basePath : './',

    files : [
      'src/main/webapp/app/**/**.js',
      'src/main/webapp/app/**.js',
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome','Safari'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-safari-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
