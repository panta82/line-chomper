var Stream = require("stream");

var libLineChomper = require("../lib/line-chomper");

/*libLineChomper.chomp("../spec/files/small-nix.txt", { fromByte: 0, toByte: 8 }, function (err, lines) {
	console.log(err, lines);
});*/

/*libLineChomper.chomp("../spec/files/small-nix.txt", { fromLine: 1, toLine: 2 }, function (err, lines) {
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


var stream = new Stream.Readable();
stream._read = function () {};

stream.push("line1\n");
stream.push("line2\n");
stream.push("line3\n");

libLineChomper.chomp(stream, { fromLine: 1, toLine: 5 }, function (err, lines) {
	console.log(lines);
});

stream.resume();
stream.push(null);