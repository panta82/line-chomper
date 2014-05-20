var Stream = require("stream");

var libLineChomper = require("../lib/line-chomper");

describe("Random access using byte offsets", function () {

	it("can chomp file from byte offset to end", function (done) {
		libLineChomper.chomp(__dirname + "/files/small-nix.txt", { fromByte: 11 }, function (err, lines) {
			expect(lines.length).toEqual(2);
			expect(lines[0]).toEqual("");
			expect(lines[1]).toEqual("line4");
			done();
		});
	});

	it("can chomp file from byte offset to byte offset", function (done) {
		libLineChomper.chomp(__dirname + "/files/small-nix.txt", { fromByte: 8, toByte: 15 }, function (err, lines) {
			expect(lines.length).toEqual(2);
			expect(lines[0]).toEqual("");
			expect(lines[1]).toEqual("line4");
			done();
		});
	});

	it("can chomp file from byte offset, limited by byte length", function (done) {
		libLineChomper.chomp(__dirname + "/files/small-nix.txt", { fromByte: 0, byteCount: 8 }, function (err, lines) {
			expect(lines.length).toEqual(2);
			expect(lines[0]).toEqual("line1");
			expect(lines[1]).toEqual("line2");
			done();
		});
	});

	it("can chomp arbitrary stream, respecting byte offsets", function (done) {
		var stream = new Stream.Readable();
		stream._read = function () {};

		stream.push("line1\n");
		stream.push("line2");

		libLineChomper.chomp(stream, { fromByte: 3, toByte: 7 }, function (err, lines) {
			expect(lines.length).toEqual(1);
			expect(lines[0]).toEqual("line2");
			done();
		});

		stream.resume();
		stream.push(null);
	});
});