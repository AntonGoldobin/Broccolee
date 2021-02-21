// const Instagram = require("instagram-web-api");

// const client = new Instagram({ username: "funnyscreamstg", password: "Abt^d456asd" });

const { IgApiClient } = require("instagram-private-api");
const { sample } = require("lodash");
const { readFile } = require("fs");
const { promisify } = require("util");
const readFileAsync = promisify(readFile);
const { get } = require("request-promise"); // request is already declared as a dependency of the library
const { post } = require("selenium-webdriver/http");

async function login() {
	ig.state.generateDevice("funnyscreamstg");
	await ig.account.login("funnyscreamstg", "Abt^d456asd");
}

const file = "https://ath2.unileverservices.com/wp-content/uploads/sites/4/2020/02/IG-annvmariv-1024x1016.jpg";

const ig = new IgApiClient();
// You must generate device id's before login.
// Id's generated based on seed
// So if you pass the same value as first argument - the same id's are generated every time
ig.state.generateDevice("funnyscreamstg");
(async () => {
	// Execute all requests prior to authorization in the real Android application
	// Not required but recommended
	await ig.simulate.preLoginFlow();
	const loggedInUser = await ig.account.login("funnyscreamstg", "Abt^d456asd");
	// The same as preLoginFlow()
	// Optionally wrap it to process.nextTick so we dont need to wait ending of this bunch of requests
	process.nextTick(async () => await ig.simulate.postLoginFlow());

	// const imageBuffer = await get({
	// 	url: readFileAsync("./telegram-bots/downloaded-files/test.mp4"), // random picture with 800x800 size
	// 	encoding: "x264", // this is required, only this way a Buffer is returned
	// });

	// console.log(posts[0].id);
	// ig.media.info(posts[0].media_count);
	// });
	var videoBuffer = await readFileAsync("./telegram-bots/downloaded-files/test.mp4");
	const publishResult = await ig.publish.story({
		video: videoBuffer,
		coverImage: readFileAsync("./telegram-bots/downloaded-files/preview.jpg"),
	});

	console.log(publishResult); // publishResult.status should be "ok"

	// await ig.publish.story({ file: imageBuffer, caption: "my caption" });

	// await ig.media.like({
	// 	// Like our first post from first page or first post from second page randomly
	// 	mediaId: sample([ myPostsFirstPage[0].id, myPostsSecondPage[0].id ]),
	// 	moduleInfo: {
	// 		module_name: "profile",
	// 		user_id: loggedInUser.pk,
	// 		username: loggedInUser.username,
	// 	},
	// 	d: sample([ 0, 1 ]),
	// });
})();
