var Stream = require("stream");

var libLineChomper = require("../lib/line-chomper");

describe("Random access using line offsets", function () {

	it("can chomp file from line offset to end", function (done) {
		libLineChomper.chomp(__dirname + "/files/small-nix.txt", { fromLine: 1 }, function (err, lines) {
			expect(lines.length).toEqual(3);
			expect(lines[0]).toEqual("line2");
			expect(lines[2]).toEqual("line4");
			done();
		});
	});

	it("can chomp file from line offset to line offset", function (done) {
		libLineChomper.chomp(__dirname + "/files/small-nix.txt", { fromLine: 2, toLine: 3 }, function (err, lines) {
			expect(lines.length).toEqual(1);
			expect(lines[0]).toEqual("");
			done();
		});
	});

	it("can chomp file from line offset, respecting line count", function (done) {
		libLineChomper.chomp(
			__dirname + "/files/small-nix.txt",
			{
				fromLine: 0,
				lineCount: 1,
				toLine: 100
			},
			function (err, lines) {
				expect(lines.length).toEqual(1);
				expect(lines[0]).toEqual("line1");
				done();
			}
		);
	});

	it("can chomp arbitrary stream, respecting line offsets", function (done) {
		var stream = new Stream.Readable();
		stream._read = function () {};

		stream.push("line1\n");
		stream.push("line2\n");
		stream.push("line3\n");

		libLineChomper.chomp(stream, { fromLine: 1, toLine: 5 }, function (err, lines) {
			expect(lines.length).toEqual(2);
			expect(lines[0]).toEqual("line2");
			expect(lines[1]).toEqual("line3");
			done();
		});

		stream.resume();
		stream.push(null);
	});

	it("can map line offsets", function (done) {
		libLineChomper.mapLineOffsets(__dirname + "/files/small-nix.txt", 10, function (err, lineOffsets) {
			expect(err).toBeNull();
			expect(lineOffsets.length).toEqual(1);
			expect(lineOffsets[0].line).toEqual(2);
			expect(lineOffsets[0].offset).toEqual(12);
			done();
		});
	});

	it("can use mapped line offsets", function (done) {
		var options = {
			lineOffsets: [
				{ line: 1, offset: 6 },
				{ line: 2, offset: 12 },
				{ line: 3, offset: 13 }
			],
			fromLine: 3
		};
		libLineChomper.chomp(__dirname + "/files/small-nix.txt", options, function (err, lines) {
			expect(lines.length).toEqual(1);
			expect(lines[0]).toEqual("line4");
			done();
		});
	})
});