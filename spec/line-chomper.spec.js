var libLineChomper = require("../lib/line-chomper");

describe("Basic chomping", function () {
	it("should correctly chomp lines with *nix-style terminators (\\r)", function (done) {
		libLineChomper.chomp(__dirname + "/files/small-nix.txt", function (err, lines) {
			expect(err).toBeNull();
			expect(lines).not.toBeNull();
			expect(lines.length).toEqual(5);
			expect(lines[0]).toEqual("line1");
			expect(lines[3]).toEqual("line4");
			expect(lines[4]).toEqual("");
			done();
		});
	});
	it("should correctly chomp lines with mac-style terminators (\\n)", function (done) {
		libLineChomper.chomp(__dirname + "/files/small-mac.txt", function (err, lines) {
			expect(err).toBeNull();
			expect(lines).not.toBeNull();
			expect(lines.length).toEqual(5);
			expect(lines[0]).toEqual("line1");
			expect(lines[3]).toEqual("line4");
			expect(lines[4]).toEqual("");
			done();
		});
	});
	it("should correctly chomp lines with PC-style terminators (\\r\\n)", function (done) {
		libLineChomper.chomp(__dirname + "/files/small-pc.txt", function (err, lines) {
			expect(err).toBeNull();
			expect(lines).not.toBeNull();
			expect(lines.length).toEqual(5);
			expect(lines[0]).toEqual("line1");
			expect(lines[3]).toEqual("line4");
			expect(lines[4]).toEqual("");
			done();
		});
	});
});