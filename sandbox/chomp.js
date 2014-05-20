var libLineChomper = require("../lib/line-chomper");

libLineChomper.chomp("../spec/files/small-nix.txt", function (err, lines) {
	console.log(err, lines);
});