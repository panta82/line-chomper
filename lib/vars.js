exports.DEFAULTS = {

	// Intervals at which mapOffsets will create a data point
	// Should be read as: save current offset at most every ... bytes
	mapOffsetsResolution: 10000
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
	callbackThisValue: undefined,

	// In case the last line is empty, most of the time it is removed from results
	// This option allows for opposite behavior
	keepLastEmptyLine: false,

	// Constrain file reading by byte offsets
	fromByte: undefined,
	toByte: undefined,
	byteCount: undefined,

	// If true, byte offsets will cut into lines and return partials
	// By default, both from and to byte will shift to the next line end
	cutIntoLines: false,

	// When using offsets, all offsets will be counted from this value
	// Auto-determined if reading directly from file
	initialDataOffset: undefined
};