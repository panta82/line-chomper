var http = require("http");

var libLineChomper = require("../lib/line-chomper");

var options = {
	host: process.argv[2] || "www.google.com",
	port: 80,
	path: "/",
	method: "GET"
};

var req = http.request({ host: url }, function (res) {
	libLineChomper.chomp(res, function (err, lines) {
		/* process lines */
	});
});

req.on("error", function (e) {
	console.log("problem with request: " + e.message);
});

req.end();