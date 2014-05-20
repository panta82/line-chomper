var Stream = require("stream");

var libLineChomper = require("../lib/line-chomper");

/*libLineChomper.chomp("../spec/files/small-nix.txt", function (err, lines) {
	console.log(err, lines);
});*/

var stream = new Stream.Readable();
stream._read = function noop() {};

stream.push("line1\n");
stream.push("line2\n");
stream.push("line3");

libLineChomper.chomp(stream, function (err, lines) {
	console.log(err, lines);
});

stream.resume();
stream.push(null);