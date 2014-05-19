exports.DEFAULTS = {

	// Intervals at which mapOffsets will create a data point
	// Should be read as: save current offset at most every ... bytes
	MAP_OFFSETS_RESOLUTION: 10000
};

exports.DEFAULT_OPTIONS = {

	// Save and return lines in callback.
	// If null, determined by whether lineCallback is provided
	// Not recommended for large files
	returnLines: null,

	// Return detailed report. Each line is provided in format:
	// { line: [string], offset: [number/bytes], sizeInBytes: [number/bytes] }
	// Otherwise, product is simply a list of strings
	returnDetails: false,

	// This object to use for callback and lineCallback. Default: stream
	callbackThisValue: undefined
};