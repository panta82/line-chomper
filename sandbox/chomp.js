var Stream = require("stream");

var libLineChomper = require("../lib/line-chomper");

/*libLineChomper.mapLineOffsets("../spec/files/small-nix.txt", 1, function (err, lineOffsets) {
	console.log(lineOffsets);
});*/

/*libLineChomper.chomp("../spec/files/small-nix.txt", { fromByte: 11, toByte: 15 }, function (err, lines) {
	console.log(err, lines);
});*/

libLineChomper.chomp("../spec/files/small-nix.txt", { fromLine: 0, lineCount: 2 }, function (err, lines) {
	console.log(lines);
});

/*libLineChomper.chomp("../spec/files/large-nix.txt", { fromLine: 112, toLine: 221 }, function (err, lines) {
	console.log(lines);
});*/

/*var options = {
	lineOffsets: [
		{ line: 1, offset: 6 },
		{ line: 2, offset: 12 },
		{ line: 3, offset: 13 }
	],
	fromLine: 3
};
libLineChomper.chomp("../spec/files/small-nix.txt", options, function (err, lines) {
	console.log(lines);
});*/

/*
var stream = new Stream.Readable();
stream._read = function noop() {};

stream.push("line1\n");
stream.push("line2");

libLineChomper.chomp(stream, { fromByte: 3, toByte: 10 }, function (err, lines) {
	console.log(lines);
});

stream.resume();
stream.push(null);*/