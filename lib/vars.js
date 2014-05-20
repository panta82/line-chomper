exports.DEFAULTS = {

	/*
		Byte intervals in which mapOffsets will create data points.
		Smaller the value, more precise the mapping will be.
	 */
	mapOffsetsResolution: 10000
};

exports.DEFAULT_OPTIONS = {

	/*
		Save and return lines in callback.
		If null, determined by whether lineCallback is provided
		Not recommended for large files
	 */
	returnLines: null,

	/*
		Return detailed report. Each line is provided in format:
			{ line: [string], offset: [number/bytes], sizeInBytes: [number/bytes] }
		Otherwise, product is simply a list of strings
	 */
	returnDetails: false,

	/*
		Object that will be 'this' reference in callback and lineCallback. Default: stream
	 */
	callbackThisValue: undefined,

	/*
	 	In case the last line is empty, most of the time it is removed from results.
	 	This option allows for opposite behavior.
	 */
	keepLastEmptyLine: false,

	/*
		Byte offsets, for random-access reading. Influence file stream creation, if applicable.
		If byteCount is provided, it will override toByte value
	 */
	fromByte: undefined,
	toByte: undefined,
	byteCount: undefined,

	/*
		If true, byte offsets will cut into lines and return partials
	 	By default, both fromByte and toByte will shift to the next line end
	 */
	cutIntoLines: false,

	/*
	 	When using offsets, all offsets will be counted from this value.
	 	Auto-determined if reading directly from file. If using custom stream, you can use
	 	this option to 'tune' a custom offset
	 */
	initialDataOffset: undefined
};