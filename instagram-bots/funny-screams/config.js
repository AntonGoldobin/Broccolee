const ProxyList = require("free-proxy");
const proxyList = new ProxyList();

const getIstaConfig = () => {
	return proxyList
		.random()
		.then(function(proxies) {
			return {
				inputLogin: "funnyscreamstg",
				inputPassword: "Abt^d456asd",
				inputProxy: proxies,
			};
		})
		.catch(function(error) {
			throw new Error(error);
		});
};

getIstaConfig().then((res) => console.log(res));

module.exports.getIstaConfig = getIstaConfig;
