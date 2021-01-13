const logger = require("node-color-log");
const request = require("request");
var fs = require("fs");

// BEAUTIFUL LOGS

const successfulConsoleLog = (text) => {
	logger.bgColor("black").info(text);
};

const errorConsoleLog = (text) => {
	logger.bgColor("black").error(text);
};

const getCurrentTime = () => {
	var currentdate = new Date();
	return (
		currentdate.getDate() +
		"/" +
		(currentdate.getMonth() + 1) +
		"/" +
		currentdate.getFullYear() +
		" " +
		currentdate.getHours() +
		":" +
		currentdate.getMinutes() +
		":" +
		currentdate.getSeconds()
	);
};

const downloadFile = (url, path, callback) => {
	request.head(url, (err, res, body) => {
		request(url)
			.on("error", (err) => console.log("DOWNLOAD FILE ERROR:" + err))
			.pipe(fs.createWriteStream(path))
			.on("close", callback);
	});
};

const removeFile = (path) => {
	fs.unlink(path, (err) => {
		if (err) {
			console.error(err);
			return;
		}
	});
};

const getFileExtension = (str) => {
	console.log(str);
	return str.slice(((str.lastIndexOf(".") - 1) >>> 0) + 2);
};

exports.successfulConsoleLog = successfulConsoleLog;
exports.errorConsoleLog = errorConsoleLog;
exports.getCurrentTime = getCurrentTime;
exports.downloadFile = downloadFile;
exports.getFileExtension = getFileExtension;
exports.removeFile = removeFile;
