var Stream = require("stream");

var libLineChomper = require("../lib/line-chomper");

describe("Basic chomping", function () {

	function verifySmallFileProcessedCorrectly(err, lines, lastEmptyLineKept) {
		expect(err).toBeNull();
		expect(lines).not.toBeNull();
		expect(lines.length).toEqual(lastEmptyLineKept ? 5 : 4);
		expect(lines[0]).toEqual("line1");
		expect(lines[3]).toEqual("line4");
		if (lastEmptyLineKept) {
			expect(lines[4]).toEqual("");
		}
	}

	it("should correctly chomp lines with *nix-style terminators (\\r)", function (done) {
		libLineChomper.chomp(__dirname + "/files/small-nix.txt", function (err, lines) {
			verifySmallFileProcessedCorrectly(err, lines, false);
			done();
		});
	});
	it("should correctly chomp lines with mac-style terminators (\\n)", function (done) {
		libLineChomper.chomp(__dirname + "/files/small-mac.txt", function (err, lines) {
			verifySmallFileProcessedCorrectly(err, lines, false);
			done();
		});
	});
	it("should correctly chomp lines with PC-style terminators (\\r\\n)", function (done) {
		libLineChomper.chomp(__dirname + "/files/small-pc.txt", function (err, lines) {
			verifySmallFileProcessedCorrectly(err, lines, false);
			done();
		});
	});

	it("will keep last empty line if specified", function (done) {
		libLineChomper.chomp(__dirname + "/files/small-nix.txt", { keepLastEmptyLine: true }, function (err, lines) {
			verifySmallFileProcessedCorrectly(err, lines, true);
			done();
		});
	});

	it("can handle empty files", function (done) {
		libLineChomper.chomp(__dirname + "/files/empty.txt", function (err, lines) {
			expect(err).toBeNull();
			expect(lines).not.toBeNull();
			expect(lines.length).toEqual(0);
			done();
		});
	});

	it("trims leading and trailing whitespace", function (done) {
		libLineChomper.chomp(__dirname + "/files/leading-ws.txt", function (err, lines) {
			expect(err).toBeNull();
			expect(lines).not.toBeNull();
			expect(lines.length).toEqual(3);
			expect(lines[0]).toEqual("this line has leading whitespace");
			expect(lines[1]).toEqual("this line has trailing whitespace");
			expect(lines[2]).toEqual("this line has none");
			done();
		});
	});

	it("doesn't trim leading and trailing whitespace if specified", function (done) {
		libLineChomper.chomp(__dirname + "/files/leading-ws.txt", { trim: false }, function (err, lines) {
			expect(err).toBeNull();
			expect(lines).not.toBeNull();
			expect(lines.length).toEqual(3);
			expect(lines[0]).toEqual("    this line has leading whitespace");
			expect(lines[1]).toEqual("this line has trailing whitespace    ");
			expect(lines[2]).toEqual("this line has none");
			done();
		});
	});

	it("can accept arbitrary stream", function (done) {
		var stream = new Stream.Readable();
		stream._read = function () {};

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

	it("will return error for missing files", function (done) {
		libLineChomper.chomp(__dirname + "/files/not-there.txt", function (err, lines) {
			expect(err).not.toBeNull();
			expect(err.code).toEqual("ENOENT");
			done();
		});
	});
});
