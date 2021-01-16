const Nightmare = require("nightmare");

const webdriver = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

// Some options I set for all instances
const nightmareOptions = {
	gotoTimeout: 10000,
	loadTimeout: 15000,
	waitTimeout: 20000,
};

let options = new chrome.Options();
//Below arguments are critical for Heroku deployment
options.addArguments("--headless");
options.addArguments("--disable-gpu");
options.addArguments("--no-sandbox");

const getRedgifsVideo = (url) => {
	return new Promise(function(resolve, reject) {
		// let nightmare = Nightmare(nightmareOptions);

		// nightmare
		// 	.goto(url)
		// 	.wait("video source:first-child")
		// 	.evaluate(() => document.querySelector("video source:first-child").getAttribute("src"))
		// 	.end()
		// 	.then((url) => {
		// 		nightmare = null;
		// 		resolve(url);
		// 	})
		// 	.catch((error) => {
		// 		console.error("Redgifs search failed:", error);
		// 		nightmare = null;
		// 		reject(error);
		// 	});

		// 	let driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();

		driver.get(url);
		driver
			.wait(webdriver.until.elementLocated(webdriver.By.css("video source:first-child")), 20000)
			.then((el) => {
				console.log(el.getAttribute("src"));
				driver.quit();
				resolve(el.getAttribute("src"));
			})
			.catch((err) => {
				console.log("Selenium BROCCOLEE error: " + err);
				reject(err);
			});
	});
};

// let options = new chrome.Options();
// //Below arguments are critical for Heroku deployment
// options.addArguments("--headless");
// options.addArguments("--disable-gpu");
// options.addArguments("--no-sandbox");

// let driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();

// driver.get("https://www.redgifs.com/watch/decisivebestbettong");
// driver.wait(
//   until.findElement(By.css("video source:first-child")),
//   20000
// ).then(el => console.log(el.getAttribute("src")));

// // .findElement(By.css("video source:first-child"))

// driver.quit();

module.exports.getRedgifsVideo = getRedgifsVideo;
