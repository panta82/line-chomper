var Stream = require("stream");

var libTools = require("../lib/tools"),
	libLineChomper = require("../lib/line-chomper");

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

	it("should keep last empty line if specified", function (done) {
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

describe("Advanced chomping", function () {
	beforeEach(function () {
		this.addMatchers({
			toBeANumber: function () {
				return libTools.isNumber(this.actual);
			}
		})
	});

	it("can chomp file one line at a time, without buffering", function (done) {
		var counter = 0;
		libLineChomper.chomp(
			__dirname + "/files/small-nix.txt",
			function (line, offset, sizeInBytes) {
				expect(offset).toBeANumber();
				expect(sizeInBytes).toBeANumber();
				counter++;
			},
			function (err, lines) {
				expect(err).toBeNull();
				expect(lines).toBeFalsy();
				expect(counter).toEqual(4);
				done();
			}
		);
	});

	function verifySmallFileByteCounts(lines, singleCharTerminator) {
		if (singleCharTerminator) {
			expect(lines[3].offset).toEqual(13);
			expect(lines[3].sizeInBytes).toEqual(6);
		} else {
			expect(lines[3].offset).toEqual(16);
			expect(lines[3].sizeInBytes).toEqual(7);
		}
	}

	it("can correctly count bytes in file with *nix-styled line terminators", function (done) {
		libLineChomper.chomp(__dirname + "/files/small-nix.txt", { returnDetails: true }, function (err, lines) {
			verifySmallFileByteCounts(lines, true);
			done();
		});
	});

	it("can correctly count bytes in file with mac-styled line terminators", function (done) {
		libLineChomper.chomp(__dirname + "/files/small-mac.txt", { returnDetails: true }, function (err, lines) {
			verifySmallFileByteCounts(lines, true);
			done();
		});
	});

	it("can correctly count bytes in file with pc-styled line terminators", function (done) {
		libLineChomper.chomp(__dirname + "/files/small-pc.txt", { returnDetails: true }, function (err, lines) {
			verifySmallFileByteCounts(lines, false);
			done();
		});
	});
});