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
                ],
                store: true
			}]).then((answers) => {

				this.projectName = answers.projectName;
				this.testSVN = answers.testSVN.replace(/\\/g,'/');
				this.prodSVN = answers.prodSVN.replace(/\\/g,'/');
				this.lib = answers.lib;

				this.log(this.lib);



			})
	    }
	},
	writing : {
		templates() {
			// 复制项目模板
            copydir.sync(this.templatePath(), this.destinationPath(), function(stat, filepath, filename){
                // 文件不复制
                if(filename === 'fis-conf.js' || filename === 'base.js'){
                    return false;
                }
                return true;
            });
		},
		config() {
            this.fs.copyTpl(
            	this.templatePath('fis-conf.js'),
            	this.destinationPath('fis-conf.js'),
                {
                    projectName: this.projectName,
                    testSVN: this.testSVN,
                    prodSVN: this.prodSVN
                }
            );
        },
        lib() {
        	this.fs.copyTpl(
            	this.templatePath('lib/base.js'),
            	this.destinationPath('lib/base.js'),
                {
                    lib: this.lib
                }
            );
        }
	},
	end() {
	    this.log('成功创建项目模板!');
	}

});