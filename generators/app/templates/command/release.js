const child_process = require('child_process');
const fs = require('fs');
const TARGET = process.env.npm_lifecycle_event;
const oPackage = require('../package.json');

const projectName = oPackage.projectName;
const testCommand = 'fis3 release -c';
const prodCommand = 'fis3 release prod -c';

let releaseCommand = ''; // 发布的命令
let path = '';

// 当前开发项目的路径
var currentPath = process.cwd();


if (TARGET === 'test') {

	releaseCommand = testCommand;
	path = oPackage.testSVN + '/'+ oPackage.category;
	
} else if (TARGET === 'prod') {

	releaseCommand = prodCommand;
	path = oPackage.prodSVN + '/' + oPackage.category;
}



// 发布目录的操作
function releaseOperate() {
	
	// 创建发布项目
	var createProject = function() {
		// 切换到发布目录
		process.chdir(path);

		if (!fs.existsSync(projectName)) {
			// 判断发布目录下是否存在项目的文件夹
		    fs.mkdirSync(projectName);
		}
	}

	// svn 添加
	var svnAdd = function() {

		return new Promise(function(resolve, reject) {

			process.chdir(path + '/' + projectName);

			child_process.exec('svn add . --no-ignore --force', function (error, stdout, stderr) {
				if (error) {
					reject('svn add 失败:');
				} else {
					console.log('svn add 成功');
					resolve();
				} 
			});

		});
	};

	// svn 更新
	var svnUpdate = function() {

		return new Promise(function(resolve, reject) {

			process.chdir(path + '/' + projectName);

			child_process.exec('svn update', function (error, stdout, stderr) {
				if (error) {
					reject('svn update 失败:');
				} else {
					console.log('svn update 成功');
					resolve();
				} 
			});

		});
	};

	// fis 发布
	var fis3Release = function() {

		return new Promise(function(resolve, reject) {

			// 切回到当前开发项目的路径
			process.chdir(currentPath);

			child_process.exec(releaseCommand, function (error, stdout, stderr) {
				if (error) {
					reject('svn update 失败:');
				} else {
					console.log('fis 开始发布');
					console.log(stdout);
					console.log('fis 发布完成');
					resolve();
				} 
			});

		});
	};

	// svn 提交
	var svnCommit = function() {

		return new Promise(function(resolve, reject) {

			process.chdir(path + '/' + projectName);

			child_process.exec(`svn commit -m "${projectName}--自动发布"`, function (error, stdout, stderr) {
				if (error) {
					reject('svn commit 失败:');
				} else {
					console.log('svn commit 成功');
					resolve();
				} 
			});

		});
	}; 



	function executeSequentially(promises) {
		var result = Promise.resolve();

		promises.forEach(function (promise) {
			result = result.then(promise);
		});

		return result;
	}



	var aPromises = [svnAdd, svnUpdate, fis3Release, svnAdd, svnCommit];


	createProject();


	executeSequentially(aPromises).then(function() {
		console.log('操作完毕 well done!');
	}).catch(function(error) {
		console.log(error);
	});

}


releaseOperate();
