var libTools = require("../lib/tools"),
	libLineChomper = require("../lib/line-chomper");

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
			function (err, count) {
				expect(err).toBeNull();
				expect(count).toEqual(4);
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

	it("can interactively interrupt line-by-line streaming", function (done) {
		var counter = 0;
		libLineChomper.chomp(
			__dirname + "/files/small-nix.txt",
			{
				returnLines: true,
				lineCallback: function (line) {
					counter++;
					if (counter === 2) {
						return false;
					}
					expect(counter).toBeLessThan(3);
				}
			},
			function (err, lines) {
				expect(lines.length).toEqual(1);
				expect(lines[0]).toEqual("line1");
				expect(counter).toEqual(2);
				done();
			}
		);
	});

	it("can interactively perform map and filter operations", function (done) {
		libLineChomper.chomp(
			__dirname + "/files/small-nix.txt",
			{
				returnLines: true,
				lineCallback: function (line) {
					if (!line) {
						return null;
					} else {
						return line.toUpperCase();
					}
				}
			},
			function (err, lines) {
				expect(lines.length).toEqual(3);
				expect(lines[0]).toEqual("LINE1");
				expect(lines[1]).toEqual("LINE2");
				expect(lines[2]).toEqual("LINE4");
				done();
			}
		);
	});
});