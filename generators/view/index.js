const generators = require('yeoman-generator');
const yosay = require('yosay');
const path = require('path');
const copydir = require('copy-dir');

module.exports = generators.Base.extend({
	initializing: function () {

	},
	prompting : {
		welcome () {
			this.log(yosay(
				'欢迎您，你将要创建 虎牙移动端app view文件'
			))
	    },
	    ask () {
			return this.prompt([{
				type: 'input',
		        name: 'viewName',
		        message: 'view文件的名字(小写字母已下划线为分隔) ',
			}]).then((answers) => {

				this.viewName = answers.viewName;
			})
	    }
	},
	writing : {
        views() {

        	var viewConfig = this.config.get('viewConfig');

        	viewConfig.viewName = this.viewName;

        	this.fs.copyTpl(
            	this.templatePath('./view.html'),
            	this.destinationPath('views/' + this.viewName + '.html'),
                viewConfig
            );

        	this.fs.copyTpl(
            	this.templatePath('./view.scss'),
            	this.destinationPath('css/pages/' + this.viewName + '.scss')
            );

            this.fs.copyTpl(
            	this.templatePath('./view.js'),
            	this.destinationPath('modules/' + this.viewName + '/' + this.viewName + '.js')
            );

        }
	},
	end() {
	    this.log('成功创建view文件!');
	}

});