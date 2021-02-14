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
	// Create UserFeed instance to get loggedInUser's posts
	const userFeed = ig.feed.user(loggedInUser.pk);
	const myPostsFirstPage = await userFeed.items();
	// All the feeds are auto-paginated, so you just need to call .items() sequentially to get next page
	const myPostsSecondPage = await userFeed.items();

	// const imageBuffer = await get({
	// 	url: readFileAsync("./telegram-bots/downloaded-files/test.mp4"), // random picture with 800x800 size
	// 	encoding: "x264", // this is required, only this way a Buffer is returned
	// });

	console.log(userFeed);
	ig.search.tags("ядианаиякрасоткапотоиучтопомогаюантону").then((posts) => {
		console.log(posts[0]);
		ig.media.like({
			mediaId: posts[0].id,
			moduleInfo: {
				module_name: "feed_contextual_newsfeed_multi_media_liked",
				user_id: loggedInUser.pk,
				username: loggedInUser.username,
			},
			d: 0,
		});

		// console.log(posts[0].id);
		// ig.media.info(posts[0].media_count);
	});

	// const publishResult = await ig.publish.story({
	// 	video: readFileAsync("./telegram-bots/downloaded-files/test.mp4"),
	// 	coverImage: "https://upload.wikimedia.org/wikipedia/commons/3/3f/JPEG_example_flower.jpg",
	// });

	// console.log(publishResult); // publishResult.status should be "ok"

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
