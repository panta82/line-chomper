var Stream = require("stream");

var libLineChomper = require("../lib/line-chomper");

describe("Basic chomping", function () {

	function verifySmallFileProcessedCorrectly(err, lines) {
		expect(err).toBeNull();
		expect(lines).not.toBeNull();
		expect(lines.length).toEqual(5);
		expect(lines[0]).toEqual("line1");
		expect(lines[3]).toEqual("line4");
		expect(lines[4]).toEqual("");
	}

	it("should correctly chomp lines with *nix-style terminators (\\r)", function (done) {
		libLineChomper.chomp(__dirname + "/files/small-nix.txt", function (err, lines) {
			verifySmallFileProcessedCorrectly(err, lines);
			done();
		});
	});
	it("should correctly chomp lines with mac-style terminators (\\n)", function (done) {
		libLineChomper.chomp(__dirname + "/files/small-mac.txt", function (err, lines) {
			verifySmallFileProcessedCorrectly(err, lines);
			done();
		});
	});
	it("should correctly chomp lines with PC-style terminators (\\r\\n)", function (done) {
		libLineChomper.chomp(__dirname + "/files/small-pc.txt", function (err, lines) {
			verifySmallFileProcessedCorrectly(err, lines);
			done();
		});
	});

	it("should accept custom stream", function (done) {
		var stream = new Stream.Readable();
		stream._read = function noop() {};

		stream.push("line1\n");
		stream.push("line2");

		libLineChomper.chomp(stream, function (err, lines) {
			expect(err).toBeNull();
			expect(lines).not.toBeNull();
			expect(lines.length).toEqual(2);
			expect(lines[0]).toEqual("line1");
			expect(lines[1]).toEqual("line2");
			done();
		});

		stream.resume();
		stream.push(null);
	});

	it("should return error for missing files", function (done) {
		libLineChomper.chomp(__dirname + "/files/not-there.txt", function (err, lines) {
			expect(err).not.toBeNull();
			expect(err.code).toEqual("ENOENT");
			done();
		});
	});
});