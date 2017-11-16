/* eslint-disable */

var oPackage = require('./package.json');

fis.set('new date', Date.now())

// 项目过滤
fis.set('project.ignore', [
    'docs/**', 
    'package.json',
    'package-lock.json', 
    '**.cmd', 
    '**.sh',
    '**.log',
    '**/*.md',
    'components/**/*.json',
    'fis-conf.js',
    'components/demo/**',
    'node_modules/**',
    'command/**',
    '.yo-rc.json'
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
        "browsers": ["Android >= 2.4", "iOS >= 4", "ie >= 8", "firefox >= 15"]
    })
});
// 对于有__的css就不要产出了，比如__xx.css,这种当做是内联的 
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
    useSameNameRequire: true,
    isMod: true,
});

fis.match('/widget/**/**.html', {
    release : false
},true);


fis.match('/widget/async/**/**.scss', {
    release : false,
    useSprite: false,
},true);




fis.hook('commonjs');


//https://github.com/fex-team/fis3-preprocessor-js-require-css
fis.match('*.{js,es6}', {
    preprocessor: [
        fis.plugin('js-require-file'),
        fis.plugin('js-require-css',{
            mode : 'inline'
        })    
    ]
})


fis.set('project.fileType.text', 'es6');
fis.match('**.es6', {
    isMod: true,
    parser: fis.plugin('babel-6.x', {
        // presets: [
        // 注意一旦这里在这里添加了 presets 配置，则会覆盖默认加载的 preset-2015 等插件，因此需要自行添加所有需要使用的 presets
        // ]
    }),
    rExt: 'js'
},true);


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
    postpackager: [
        fis.plugin('loader', {
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
        }),
        createSW
    ]
})

//-------------- sw配置 ----------------------
var extrasObj = {
    extras: {
        preCache: true
    }
}
// 设置html.img,js,css缓存
fis.match('::image', extrasObj);
fis.match(' /views/**.html', extrasObj);
fis.match('{**.js, **.css, **.scss}',extrasObj);
// 设置sw文件的配置
fis.match('sw.jstmpl', {
    rExt: '.js',
    useHash: false,
    extras: {
        register: 'sw',
        swConf: {
            version: fis.get('new date'),   // 控制每次发版的时候都不一样，主要是为了更新sw.js文件
            project: oPackage.category + '-' + oPackage.projectName,  // 项目昵称，主要是确保唯一性
            accessPath: '/' + oPackage.category + '/' + oPackage.projectName  // 访问路径，主要是用来缓存html的
        }
    },
    optimizer: fis.plugin('uglify-js')
},true);
// 生成sw文件配置方法
function createSW(ret, conf, settings, opt) {

    // ret.src 所有的源码，结构是 {'<subpath>': <File 对象>}
    // ret.ids 所有源码列表，结构是 {'<id>': <File 对象>}
    // ret.map 如果是 spriter、postpackager 这时候已经能得到打包结果了，
    //         可以修改静态资源列表或者其他

    var precacheConfig = [];

    // 找出要换成的html
    fis.util.map(ret.src, function(subpath, oFile) {
        if (oFile.isHtmlLike && (oFile.extras && oFile.extras.preCache)) {
            precacheConfig.push(oFile.release);
        }
    })

    // 对打包后的资源列表进行缓存
    fis.util.map(ret.map.res, function(key, oFile) {
        if (key.indexOf('sw') == -1 && (oFile.extras && oFile.extras.preCache) && !oFile.aioPkg && !oFile.cssspritePkg) {
            precacheConfig.push(oFile.uri);
        }
    })

    // 对打包后的资源列表进行缓存
    fis.util.map(ret.map.pkg, function(key, oFile) {
        precacheConfig.push(oFile.uri);
    })
    
    // 找出sw的文件，以后可以写成插件的形式就不用这样搞了
    fis.util.map(ret.ids, function(subpath, file) {
        if (file.extras.register == 'sw') {
            var swConf = file.extras.swConf;
            var swContent = file.getContent();

            swConf.precacheConfig = precacheConfig.join('|=|');

            swContent = swContent.replace(/\{\{([^\}]*)\}\}/igm, function($1, $2) { 
                var $2 = $2 && $2.trim();
                if(swConf[$2]) {
                    return swConf[$2];
                }  
            })

            file.setContent(swContent);
        }
    })
 
}
//-------------- sw配置 ----------------------





fis.match('/lib/base/**', {
    release: false
});

//view 的文件发布到根目录下
fis.match('views/(**)', {
   release : '/$1',
   useHash : false, 
},true)





fis.match('!**.scss', {
    parser: fis.plugin('jdists', {
        remove: "prod"
    })
});


// 测试发布配置
fis.media('dev')
    .match('**', {
        //domain : '//test.hd.huya.com/<%= category %>/<%= projectName %>',
        domain: '//test.hd.huya.com/' + oPackage.category + '/' + oPackage.projectName,
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
                to: oPackage.testSVN + '/' + oPackage.category + '/'  + oPackage.projectName
            })
        ]
    })
    //测试正式线上的可以用这个
    .match('*.{js,css,scss,png,jpg}', {
        query: '?t=' + fis.get('new date')
    })


// 生成sourceMap配置
fis.media('map')
    .match('**', {
        deploy: [
            //https://github.com/fex-team/fis3-deploy-skip-packed
            fis.plugin('skip-packed'),
            fis.plugin('local-deliver', {
                to: '../map'
            })
        ]
    })
    .match('/lib/base/**', {
        release: true
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
            },
            sourceMap: true
        })
    })


// 正式发布配置
fis.media('prod')
    .match('**', { 
        useHash: true,  // 文件md5
        domain : '//a.msstatic.com/huya/hd/' + oPackage.category + '/' + oPackage.projectName,
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
                to: oPackage.prodSVN + '/' + oPackage.category + '/' + oPackage.projectName
            })
        ]
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
    //压缩css    
    .match('**.{css,scss}', {
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
