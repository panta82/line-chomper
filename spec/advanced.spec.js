var Stream = require("stream");

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