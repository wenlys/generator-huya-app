const generators = require('yeoman-generator');
const yosay = require('yosay');
const path = require('path');
const copydir = require('copy-dir');

module.exports = generators.Base.extend({
	initializing: function () {
		let folderName = path.basename(this.destinationRoot());
		this.projectName = folderName || "huya_app";
	 },
	prompting : {
		welcome () {
			this.log(yosay(
				'欢迎您，你将要创建 虎牙移动端app 脚手架'
			))
	    },
	    ask () {
			return this.prompt([{
				type: 'input',
		        name: 'projectName',
		        message: '产品上线的名称(小写字母已下划线为分隔) ',
		        default: this.projectName
			}, {
				type: 'input',
		        name: 'testSVN',
		        message: '测试svn物理地址',
		        store: true
			}, {
				type: 'input',
		        name: 'prodSVN',
		        message: '线上svn物理地址',
		        store: true
			}, {	
                type: 'list',
                name: 'lib',
                message: '请选择开发类库',
                choices: [
                	{name: 'jquery', value: 'jquery'}, 
                	{name: 'zepto', value: 'zepto'}
                ]
			}, {   
                type: 'list',
                name: 'layout',
                message: '适配布局选项',
                choices: [
                    {name: '不需要', value: 'no'}, 
                    {name: '淘宝flexible布局', value: 'flexible'},
                    {name: 'vw结合rem布局', value: 'vmRem'}
                ],
                default: 'no'
            }, {
                type: 'confirm',
                name: 'noCustomBase',
                message: '不定制base.js（不定制走cdn）',
                default : true
            }, {	
                type: 'list',
                name: 'category',
                message: '您的项目属于哪个类别',
                choices: [
                	{name: 'web', value: 'web'}, 
                	{name: 'h5', value: 'h5'},
                	{name: 'pc', value: 'pc'}
                ]
			}, {
				type: 'confirm',
				name: 'antiHijack',
				message: '是否需要防挟持'
		    }]).then((answers) => {

				this.projectName = answers.projectName;
				this.testSVN = answers.testSVN.replace(/\\/g,'/');
				this.prodSVN = answers.prodSVN.replace(/\\/g,'/');
				this.lib = answers.lib;
                this.layout = answers.layout;
				this.category = answers.category;
				this.antiHijack = answers.antiHijack;
                this.noCustomBase = answers.noCustomBase;
			})
	    }
	},
	writing : {
		templates() {
			// 复制项目模板
            copydir.sync(this.templatePath(), this.destinationPath(), function(stat, filepath, filename){
                // 文件不复制
                if(filename === 'base.js' || filename === 'index.html' || filename === 'package.json' || filename === 'pages_module.scss'){
                    return false;
                }
                return true;
            });
		},
        lib() {
        	this.fs.copyTpl(
            	this.templatePath('lib/base.js'),
            	this.destinationPath('lib/base.js'),
                {
                    lib: this.lib
                }
            );
        },
        views() {
        	this.fs.copyTpl(
            	this.templatePath('views/index.html'),
            	this.destinationPath('views/index.html'),
                {
                    antiHijack: this.antiHijack,
                    noCustomBase: this.noCustomBase,
                    lib: this.lib,
                    layout: this.layout
                }
            );
        },
        packages() {
        	this.fs.copyTpl(
            	this.templatePath('package.json'),
            	this.destinationPath('package.json'),
                {
                    projectName: this.projectName,
                    category: this.category,
                    testSVN: this.testSVN,
                    prodSVN: this.prodSVN,
                }
            );
        },
        pagesModule() {
            this.fs.copyTpl(
                this.templatePath('css/pages/pages_module.scss'),
                this.destinationPath('css/pages/pages_module.scss'),
                {
                    layout: this.layout
                }
            );
        }
	},
	end() {
	    this.log('成功创建项目模板!');
	}

});