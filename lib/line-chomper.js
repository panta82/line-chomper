var libFs = require("fs"),
	Stream = require("stream"),
	StringDecoder = require('string_decoder').StringDecoder,
	Buffer = require("buffer").Buffer;

var libTools = require("./tools"),
	libVars = require("./vars");

exports.DEFAULT_OPTIONS = libVars.DEFAULT_OPTIONS;
exports.DEFAULTS = libVars.DEFAULTS;

function doOpenReadStream(fileName, options, callback) {
	var streamOptions = {};
	parseOffsets(options, streamOptions);

	var stream = libFs.createReadStream(fileName, streamOptions),
		calledBack = false;

	stream.once("error", doCallBack);
	stream.once("open", doCallBack.bind(null, null));
	stream.owned = true;

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

	function parseOffsets(options, streamOptions) {
		if (options.fromByte !== undefined) {
			streamOptions.start = options.fromByte;
			options.initialDataOffset = options.fromByte;
		}
		if (options.fromLine && options.lineOffsets) {
			var offsetRec = null,
				currentRec = null,
				lineOffsetsLength = options.lineOffsets.length,
				index = 0;
			while (index < lineOffsetsLength) {
				currentRec = options.lineOffsets[index];
				if (currentRec.line >= options.fromLine) {
					break;
				}
				index++;
				offsetRec = currentRec;
			}
			if (offsetRec && offsetRec.line < options.fromLine) {
				streamOptions.start = offsetRec.offset;
				options.initialDataOffset = offsetRec.offset;
				options.initialLineOffset = offsetRec.line;
			}
		}
	}
}

function doChompStream(stream, options, callback) {
	var lines = undefined,
		trailingChunk = null,
		dataOffset = options.initialDataOffset || 0,
		error = null,
		decoder = new StringDecoder("utf-8"),
		lineTerminator = null,
		callbackThisValue = options.callbackThisValue || stream,
		calledBack = false,
		stats = {
			total: options.initialLineOffset || 0,
			skipped: options.initialLineOffset || 0
		};

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
		// NOTE: I'm aware error can be swallowed here. ¯\(°_o)/¯
	}

	function streamOnEnd() {
		tryCallBack(false);
		stream.removeListener("error", streamOnError);
	}

	function streamOnClose() {
		tryCallBack(false);
		stream.removeListener("error", streamOnError);
	}

	function tryCallBack(interrupt) {
		if (calledBack) {
			return;
		}
		calledBack = true;

		if (!interrupt) {
			processDecoded(decoder.end(), true);
		}

		stream.removeListener("data", streamOnData);
		stream.removeListener("end", streamOnEnd);
		stream.removeListener("close", streamOnClose);

		if (interrupt && stream.owned) {
			stream.close();
		}

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

		var trailingChunkLength = 0;
		if (trailingChunk !== null) {
			decoded = trailingChunk + (decoded || "");
			trailingChunkLength = Buffer.byteLength(trailingChunk, "utf-8");
		}

		if (lineTerminator === null) {
			lineTerminator = tryDetermineLineTerminator(decoded);
		}

		if (eof && !decoded && !options.keepLastEmptyLine) {
			return;
		}

		var parsedLines = lineTerminator ? decoded.split(lineTerminator) : [decoded];
		if (!eof) {
			trailingChunk = parsedLines[parsedLines.length - 1];
			parsedLines.length--;
		}

		var chunkOffset = 0;
		for (var i = 0; i < parsedLines.length; i++) {
			var parsedLine = parsedLines[i],
				lineSizeInBytes = Buffer.byteLength(parsedLine || "", "utf-8") + (lineTerminator ? lineTerminator.length : 0),
				resLine = parsedLine.trim(),
				resOffset = dataOffset + chunkOffset - trailingChunkLength;
			chunkOffset += lineSizeInBytes;

			if (options.initialDataOffset && dataOffset === resOffset) {
				// This will happen when we start from some random byte offset, potentially "cutting" in the middle of a line
				stats.slicedBefore = parsedLine;
				continue;
			}

			if (resOffset >= options.toByte) {
				return tryCallBack(true);
			}

			stats.total++;
			if (options.fromByte > resOffset || (options.fromLine >= stats.total)) {
				stats.skipped++;
				continue;
			}

			if (options.lineCallback) {
				var lineCallbackRetValue = options.lineCallback.call(callbackThisValue, resLine, resOffset, lineSizeInBytes);
				if (lineCallbackRetValue === false) {
					return tryCallBack(true);
				}
				else if (lineCallbackRetValue !== undefined && lineCallbackRetValue !== true) {
					resLine = lineCallbackRetValue;
				}
			}

			if (lines && resLine !== null) {
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

			if (options.toLine && stats.total >= options.toLine - 1) {
				return tryCallBack(true);
			}
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

	if (!options.fromByte && (options.toByte || options.byteCount)) {
		options.fromByte = 0;
	}
	if (options.byteCount) {
		options.toByte = options.fromByte + options.byteCount;
	}
	if (!options.fromLine && (options.toLine || options.lineCount)) {
		options.fromLine = 0;
	}
	if (options.lineCount) {
		options.toLine = options.fromLine + options.lineCount;
	}

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

	return callback(new Error("Unknown source format. Please provide either file path or ReadStream"));
}
exports.chomp = chomp;

function mapLineOffsets(source, resolution, callback) {
	if (arguments.length < 3) {
		callback = resolution;
		resolution = libVars.DEFAULTS.mapOffsetsResolution;
	}

	var currentSectionFrom = resolution,
		lineCount = 0,
		results = [];

	return chomp(source, lineCallback, completedCallback);

	function lineCallback(_, offset, sizeInBytes) {
		if (offset > currentSectionFrom) {
			results.push({
				line: lineCount,
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
exports.mapLineOffsets = mapLineOffsets;