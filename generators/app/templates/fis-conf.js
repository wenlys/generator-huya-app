// 项目过滤
fis.set('project.ignore', [
    'docs/**',
    '.git/**',
    '.svn/**',  
    'package.json', 
    '**.cmd', 
    '**.sh',
    '**/*.md',
    'components/**/*.json',
    'fis-dev.js',
    'fis-pub.js',
    'fis-conf.js',
]);


// scss文件处理
fis.match('*.{scss,sass}', {
    //sass编译
    parser: fis.plugin('node-sass'), //启用fis-parser-sass插件
    //产出css后缀的名字
    rExt: '.css',
    //使用雪碧图
    useSprite: true,
    //标准化处理，加css前缀
    preprocessor: fis.plugin('autoprefixer', {
        // https://www.npmjs.com/package/fis3-preprocessor-autoprefixer
        "browsers": ["Android >= 2.1", "iOS >= 4", "ie >= 8", "firefox >= 15"]
    })
});
// 对于有_的css就不要产出了，比如_xx.css,这种当做是内联的 
fis.match(/(__(.*)\.(css|less|scss|sass))/i, {
    release : false
});
//对内联的scss进行编译
//https://github.com/fex-team/fis3-demo/tree/master/use-xlang
fis.match('*:scss', {
    parser: fis.plugin('node-sass')
})


//解析模板  https://github.com/fouber/fis-parser-utc
fis.match('**.tmpl', {
    //utc编译
    parser: fis.plugin('utc'), //启用fis-parser-utc插件
    isJsLike: true, //只是内嵌，不用发布
    isMod: false,
    release : false
},true);



// widget源码目录下的资源被标注为组件
fis.match('/widget/**', {
    useSameNameRequire: true,
    isMod: true
});
fis.match('/components/**', {
    useSameNameRequire: true,
    isMod: true
});
fis.match('/modules/**', {
    isMod: true,
});



fis.hook('commonjs');


//https://github.com/fex-team/fis3-preprocessor-js-require-css
fis.match('*.js', {
    preprocessor: [
        fis.plugin('js-require-file'),
        fis.plugin('js-require-css',{
            mode : 'inline'
        })    
    ]
})


fis.set('project.fileType.text', 'es6');
fis.match('**.es6', {
    parser: fis.plugin('babel-6.x', {
        // presets: [
        // 注意一旦这里在这里添加了 presets 配置，则会覆盖默认加载的 preset-2015 等插件，因此需要自行添加所有需要使用的 presets
        // ]
    }),
    rExt: 'js'
});


//启用打包插件，必须匹配 ::package
fis.match('::package', {
    //css精灵合并  更多配置  https://github.com/fex-team/fis-spriter-csssprites
    spriter: fis.plugin('csssprites', {
        //图之间的边距
        margin: 5,
        //使用矩阵排列方式，默认为线性`linear`
        layout: 'matrix'
    }),
    //可开启定制的打包插件  https://github.com/fex-team/fis3-packager-map
    /*packager: fis.plugin('map', {
        'pkg/index.js': [
            'modules/a.js',
            'modules/index.js'
        ]
    }),*/
    //分析并打包依赖的资源 更多配置  https://github.com/fex-team/fis3-postpackager-loader
    postpackager: fis.plugin('loader', {
        resourceType : 'mod',
        useInlineMap: true,
        allInOne : {
            js: function (file) {
                return "/pkg/js/" + file.filename + "_aio.js";
            },
            css: function (file) {
                return "/pkg/css/" + file.filename + "_aio.css";
            }
        }
    })
})



//view 的文件发布到根目录下
fis.match('views/(**)', {
   release : '/$1',
   useHash : false, 
},true)


// 测试正式线上的可以用这个
/*fis.set('new date', Date.now())

fis.match('*.{{js,css,scss,png,jpg}}', {
  query: '?=t' + fis.get('new date')
});*/



fis.match('!**.scss', {
    parser: fis.plugin('jdists', {
        remove: "prod"
    })
});


//过滤掉被打包的资源。
fis.match('**', {
    domain : '//test.hd.huya.com/<%= projectName %>',
    deploy: [
        //https://github.com/fex-team/fis3-deploy-skip-packed
        fis.plugin('skip-packed',{
            // 默认被打包了 js 和 css 以及被 css sprite 合并了的图片都会在这过滤掉，
            // 但是如果这些文件满足下面的规则，则依然不过滤
            /*ignore: [
                '/img/b1.png'
            ]*/
        }),
        fis.plugin('local-deliver', {
            to: '<%= testSVN %>/<%= projectName %>'
        })
    ]
})


//发布配置
fis.media('prod')
    //发布的时候，不使用编译缓存,全部MD5
    .match('**', { 
        useCache: false,
        useHash: true
    })
    // http://fis.baidu.com/fis3/docs/api/config-glob.html
    .match('*.html:js', {
        // 对内联的html的js进行压缩
        optimizer: fis.plugin('uglify-js')
    })
    .match('*.html:css', {
        // 对内联的html的css进行压缩 
        optimizer: fis.plugin('clean-css')
    })
    .match('*:scss', {
        // 对内联的html的scss进行压缩 
        optimizer: fis.plugin('clean-css')
    })
    .match('*.png', {
        // 压缩图片
        optimizer : fis.plugin('png-compressor',{
            type : 'pngquant' //default is pngcrush
        })
    })
    //压缩scss    
    .match('**.scss', {
        optimizer: fis.plugin('clean-css')
    })
    //压缩css    
    .match('**.css', {
        optimizer: fis.plugin('clean-css')
    })
    //压缩js
    .match('**.js', {
        optimizer: fis.plugin('uglify-js', {
            mangle: {
                expect: ['exports, module, require, define'] //不想被压的
            },
            //自动去除console.log等调试信息
            compress : {
                //drop_console: true
            }
        })
    })
    .match('!**.scss',{
        parser: fis.plugin('jdists', {
            remove: "debug"
        })
    })


fis.media('prod')
    .match('**', {
        domain : '//hd.huya.com/<%= projectName %>',
        deploy: [
            //https://github.com/fex-team/fis3-deploy-skip-packed
            fis.plugin('skip-packed',{
                // 默认被打包了 js 和 css 以及被 css sprite 合并了的图片都会在这过滤掉，
                // 但是如果这些文件满足下面的规则，则依然不过滤
                /*ignore: [
                    '/img/b1.png'
                ]*/
            }),
            fis.plugin('local-deliver', {
                to: '<%= prodSVN %>/<%= projectName %>'
            })
        ]
    })
