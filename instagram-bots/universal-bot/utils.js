const request = require("request");
var fs = require("fs");

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

const checkFileSize = (path, maxSize) => {
	return fs.statSync(path).size / 1024 / 1024 < maxSize;
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
	return str.slice(((str.lastIndexOf(".") - 1) >>> 0) + 2);
};

exports.getCurrentTime = getCurrentTime;
exports.downloadFile = downloadFile;
exports.getFileExtension = getFileExtension;
exports.removeFile = removeFile;
exports.checkFileSize = checkFileSize;
