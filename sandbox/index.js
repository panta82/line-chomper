var util = require("util"),
	fs = require("fs"),
	path = require("path"),
	StringDecoder = require('string_decoder').StringDecoder,
	Buffer = require("buffer").Buffer;

function fatal(err, code) {
	console.error("\nFATAL ERROR\n-----------------\n" + err + "\n\n");
	process.exit(code || 1);
}

function openForReading(fileName, options, callback) {
	if (arguments.length < 3) {
		callback = options;
		options = null;
	}

	var stream = fs.createReadStream(path.resolve(__dirname, fileName), options),
		calledBack = false;
	
	stream.once("error", doCallBack);
	stream.once("open", doCallBack.bind(null, null));

	function doCallBack(err) {
		if (!calledBack) {
			calledBack = true;
			if (err) {
				callback(err);
			} else {
				callback(null, stream);
			}
		}
	}
}

function streamToLines(stream, lineCallback, completedCallback) {
	if (arguments.length < 3) {
		completedCallback = lineCallback;
		lineCallback = null;
	}

	var lines,
		trailingChunk = null,
		dataOffset = 0,
		error = null,
		decoder = new StringDecoder("utf-8"),
		lineEnds = null;

	if (!lineCallback) {
		lines = [];
	}

	stream.on("data", function (data) {
		var decoded = decoder.write(data);
		processDecoded(decoded);
		dataOffset += data.length;
	});

	stream.on("error", function (err) {
		error = err;
	});
	stream.on("end", function () {
		processDecoded(decoder.end(), true);
	});
	stream.on("close", function () {
		if (error) {
			completedCallback(error);
		} else {
			completedCallback(null, lines);
		}
	});

	function tryDetermineLineEnds(raw) {
		var res = null,
			index = null;

		testFor("\r\n");
		testFor("\n\r");
		testFor("\r");
		testFor("\n");
		return res;

		function testFor(candidate) {
			var candidateIndex = raw.indexOf(candidate);
			if (candidateIndex >= 0 && (index === null || candidateIndex < index)) {
				index = candidateIndex;
				res = candidate;
			}
		}
	}

	function processDecoded(decoded, eof) {
		eof = eof === true;

		if (trailingChunk !== null) {
			decoded = trailingChunk + (decoded || "");
		}

		if (lineEnds === null) {
			lineEnds = tryDetermineLineEnds(decoded);
		}

		var parsedLines = lineEnds ? decoded.split(lineEnds) : [decoded];
		if (!eof) {
			trailingChunk = parsedLines[parsedLines.length - 1];
			parsedLines.length--;
		}

		var chunkOffset = 0;
		for (var i = 0; i < parsedLines.length; i++) {
			var parsedLine = parsedLines[i],
				lineSizeInBytes = Buffer.byteLength(parsedLine || "", "utf-8") + lineEnds.length;
			if (lineCallback) {
				lineCallback(parsedLine.trim(), dataOffset + chunkOffset, lineSizeInBytes);
			} else {
				lines.push({
					line: parsedLine.trim(),
					offset: dataOffset + chunkOffset,
					sizeInBytes: lineSizeInBytes
				});
			}
			chunkOffset += lineSizeInBytes;
		}
	}
}

function readLines(fileName, options, callback) {
	if (arguments.length < 3) {
		callback = lineCallback;
		lineCallback = null;
	}
	openForReading(process.argv[2] || "test.txt", function (err, stream) {
		if (err) {
			return callback(err);
		}

		return streamToLines(stream, lineCallback, callback);
	});
}

function generateOffsetMap(fileName, resolution, callback) {
	if (arguments.length < 3) {
		callback = resolution;
		resolution = 10000;
	}

	var currentSectionFrom = resolution,
		lineCount = 0,
		results = [];

	return readLines(fileName, lineCallback, function (err) {
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