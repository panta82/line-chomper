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
		Otherwise, product is simply a list of strings.
	 */
	returnDetails: false,

	/*
		Object that will be 'this' reference in callback and lineCallback. Default: stream.
	 */
	callbackThisValue: undefined,

	/*
	 	In case the last line is empty, most of the time it is removed from results.
	 	This option allows for opposite behavior.
	 */
	keepLastEmptyLine: false,

	/*
		Remote leading and trailing whitespace from each returned line.
	*/
	trim: true,

	/*
		Byte offsets, for random-access reading. Influence file stream creation, if applicable.
		Range is [inclusive..exclusive). Line will be parsed to the end if cut off.
		If byteCount is provided, it will override toByte value.
	 */
	fromByte: undefined,
	toByte: undefined,
	byteCount: undefined,

	/*
	 	Random access by line. Overrides byte values if both provided. Zero-based.
	 	Range is [inclusive..exclusive). lineCount overrides toLine.
	 */
	fromLine: undefined,
	toLine: undefined,
	lineCount: undefined,

	/*
		Map of line offsets, used for faster seeking. Should be a sorted array of hashes like this:
			{ line: [line number], offset: [byte at which the line starts] }
		Can be generated using mapLineOffsets(). Only used with line-chomper created streams.
	 */
	lineOffsets: null,

	/*
		 When using data or line offsets with line-chomper created stream, these values are used
		 to correctly set up byte and line counting. Mostly for internal use.
	 */
	initialDataOffset: undefined,
	initialLineOffset: undefined

};
