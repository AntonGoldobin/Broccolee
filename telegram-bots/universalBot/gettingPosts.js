const snoowrap = require("snoowrap");


const getPosts = (type, snoowrapClientId, snoowrapSecret, snoowrapToken, postLimit) => {
	const r = new snoowrap({
		userAgent:
			"Hello, I need to create this app for my nodejs server for posting images from reddit to my telegram channel",
		clientId: snoowrapClientId,
		clientSecret: snoowrapSecret,
		refreshToken: snoowrapToken,
	});

	if (type === "best") {
		return r
						.getBest({ time: "day", limit: postLimit })
						.then((hotPosts) => hotPosts)
						.catch((err) => errorConsoleLog("Broccolee error: " + err));
	} else {
		return r
						.getTop({ time: "day", limit: postLimit })
						.then((hotPosts) => hotPosts)
						.catch((err) => errorConsoleLog("Broccolee error: " + err));
	}
}

module.exports.getPosts = getPosts;