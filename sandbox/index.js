var libLineChomper = require("../index");

function fatal(err, code) {
	console.error("\nFATAL ERROR\n-----------------\n" + err + "\n\n");
	process.exit(code || 1);
}

function generateOffsetMap(fileName, resolution, callback) {
	if (arguments.length < 3) {
		callback = resolution;
		resolution = 10000;
	}

	var currentSectionFrom = resolution,
		lineCount = 0,
		results = [];

	return libLineChomper.chomp(fileName, lineCallback, function (err) {
		if (err) {
			return callback(err);
		}
		return callback(null, results);
	});

	function lineCallback(_, offset, sizeInBytes) {
		if (offset > currentSectionFrom) {
			results.push({
				lineIndex: lineCount,
				offset: offset
			});
			currentSectionFrom += Math.max(resolution, sizeInBytes);
		}
		lineCount++;
	}
}

function readFromArgv() {
	openForReading(process.argv[2] || "test.txt", function (err, stream) {
		if (err) {
			return fatal("Open failed: " + err);
		}

		streamToLines(stream, function (err, lines) {
			if (err) {
				return fatal(err);
			}

			console.log(lines
				.map(function (f) { return f.offset + ": " + f.line; })
				.join("\n"));
			//console.log("end");
		});
	});
}
//readFromArgv();

generateOffsetMap(process.argv[2], function (err, results) {
	console.log(err, results);
});

/*
// STRESS TEST
var count = 0;
setInterval(function tryStartNext() {
	if (count >= 100) {
		return;
	}

	count++;
	openForReading(process.argv[2] || "test.txt", function (err, stream) {
		if (err) {
			return fatal("Open failed: " + err);
		}

		readLines(stream, function (err, lines) {
			count--;
			if (err) {
				return fatal(err);
			}

			console.log("Lines: " + lines.join("|"));
		});
	});
}, 0);
*/