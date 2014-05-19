var libFs = require("fs"),
	Stream = require("stream"),
	StringDecoder = require('string_decoder').StringDecoder,
	Buffer = require("buffer").Buffer;

var libTools = require("./tools"),
	libVars = require("./vars");

function doOpenReadStream(fileName, options, callback) {
	var stream = libFs.createReadStream(fileName, options),
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

function doChompStream(stream, options, callback) {
	var lines = undefined,
		trailingChunk = null,
		dataOffset = 0,
		error = null,
		decoder = new StringDecoder("utf-8"),
		lineTerminator = null,
		callbackThisValue = options.callbackThisValue || stream;

	if (options.returnLines || (options.returnLines === null && !options.lineCallback)) {
		lines = [];
	}

	stream.on("data", streamOnData);
	stream.on("error", streamOnError);
	stream.on("end", streamOnEnd);
	stream.on("close", streamOnClose);

	function streamOnData(data) {
		var decoded = decoder.write(data);
		processDecoded(decoded);
		dataOffset += data.length;
	}

	function streamOnError(err) {
		error = err;
	}

	function streamOnEnd() {
		processDecoded(decoder.end(), true);
	}

	function streamOnClose() {
		stream.removeListener("data", streamOnData);
		stream.removeListener("error", streamOnError);
		stream.removeListener("end", streamOnEnd);
		stream.removeListener("close", streamOnClose);

		if (error) {
			callback(error);
		} else {
			if (lines) {
				callback(null, lines);
			} else {
				callback(null);
			}
		}
	}

	function tryDetermineLineTerminator(raw) {
		var res = null,
			index = null;

		testFor("\r\n");
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

		if (lineTerminator === null) {
			lineTerminator = tryDetermineLineTerminator(decoded);
		}

		var parsedLines = lineTerminator ? decoded.split(lineTerminator) : [decoded];
		if (!eof) {
			trailingChunk = parsedLines[parsedLines.length - 1];
			parsedLines.length--;
		}

		var chunkOffset = 0;
		for (var i = 0; i < parsedLines.length; i++) {
			var parsedLine = parsedLines[i],
				lineSizeInBytes = Buffer.byteLength(parsedLine || "", "utf-8") + lineTerminator.length,
				resLine = parsedLine.trim(),
				resOffset = dataOffset + chunkOffset;
			if (options.lineCallback) {
				options.lineCallback.call(callbackThisValue, resLine, resOffset, lineSizeInBytes);
			}
			if (lines) {
				if (options.returnDetails) {
					lines.push({
						line: resLine,
						offset: resOffset,
						sizeInBytes: lineSizeInBytes
					});
				} else {
					lines.push(resLine);
				}
			}
			chunkOffset += lineSizeInBytes;
		}
	}
}

function chomp(source, userOptions, callback) {
	if (arguments.length < 3) {
		callback = userOptions;
		userOptions = {};
	}
	else if (libTools.isFunction(userOptions)) {
		userOptions = {
			lineCallback: userOptions
		};
	}

	var options = libTools.shallowCopy(userOptions, libTools.shallowCopy(libVars.DEFAULT_OPTIONS));

	if (source instanceof Stream) {
		return doChompStream(source, options, callback);
	}

	if (libTools.isString(source)) {
		return doOpenReadStream(source, options, function (err, stream) {
			if (err) {
				return callback(err);
			}
			return doChompStream(stream, options, callback);
		})
	}

	return callback(new Error("Unknown source format. Please provide either filePath or ReadStream"));
}
exports.chomp = chomp;

function mapOffsets(source, resolution, callback) {
	if (arguments.length < 3) {
		callback = resolution;
		resolution = libVars.DEFAULTS.MAP_OFFSETS_RESOLUTION;
	}

	var currentSectionFrom = resolution,
		lineCount = 0,
		results = [];

	return chomp(source, lineCallback, completedCallback);

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

	function completedCallback(err) {
		if (err) {
			return callback(err);
		}
		return callback(null, results);
	}
}
exports.mapOffsets = mapOffsets;