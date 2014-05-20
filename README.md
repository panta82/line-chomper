# line-chomper

Chomps utf-8 based byte stream into lines. 

- Interactive line processing (callback-based, no loading the entire file into RAM)
- Optionally, return all lines in an array (detailed or raw mode)
- Interactively interrupt streaming, or perform map/filter like processing
- Detect any newline convention (PC/Mac/Linux)
- Correct eof / last line treatment
- Correct handling of multi-byte UTF-8 characters
- Retrieve byte offset and byte length information on per-line basis
- Random access, using line-based or byte-based offsets
- Automatically map line-offset information, to speed up random access
- Zero dependencies
- Tests

**************

### Basic usage

```javascript

var chomp = require("line-chomper").chomp;

chomp("/path/to/file.txt", function (err, lines) {
	lines.forEach(function (line) {
		console.log(line);
	});
});

```

### Interactive processing

```javascript

chomp(
    "/path/to/large-file.txt",
    function (line, offset, sizeInBytes) {
        console.log("At " + offset + ": " + line + " (size: " + sizeInBytes + " b)");
    },
    function (err, count) {
		console.log("Processed " + count + " lines");
	});
});

```

### Process arbitrary stream

```javascript

var req = http.request({ host: url }, function (resStream) {
	chomp(resStream, function (err, lines) {
		/* process lines */
	});
});

req.on("error", function (e) {
	console.log("problem with request: " + e.message);
});

req.end();

```

### Map / filter using lineCallback

```javascript

var counter = 0;
chomp(
    "/path/to/file.txt",
    {
		returnLines: true,
		lineCallback: function (line) {
			if (counter === 10) {
                return false; // stop streaming
            }
            counter++;
            if (!line) {
                return null; // filter out
            }
            return line.toUpperCase(); // map to uppercase
		}
	},
    function (err, lines) {
		console.log(lines); // First 10 non-empty lines, converted to uppercase
	});
});

```

### Random access based on line numbers (also can accept byte offsets)

```javascript

chomp(
	fs.createReadStream("path/to/file"),
	{
		fromLine: 100,
		toLine: 199
	},
	function (err, lines) {
	}
);

```

### Map line offsets to speed up random access in large files

```javascript

require("line-chomper").mapLineOffsets(fileName, function (err, lineOffsets) {
    redis.save("offsets." + fileName, lineOffsets);
});

// later...

function getExcerpt(fileName, start, count, callback) {
    redis.get("offsets." + fileName, function (err, lineOffsets) {
        chomp(
            fileName,
            {
                lineOffsets: lineOffsets,
			    fromLine: start,
			    lineCount: count
            },
            callback
        );
    });
}

```

For more usage examples, check out the spec folder.

**************

## Options

All options with defaults and helpful comments can be seen [here](lib/vars.js).

**************

## FAQ

**Q**: Why another line splitter library?

> **A:** I was frustrated with other libraries being
1. too old / outdated
2. nice but (I hear) buggy
3. lacking advanced options for random access that I need for my project

**Q**: Why the name '*-chomper'? That word doesn't mean what you think it means
> **A:** All the good, obvious names were taken

**Q**: What's next?
> **A:** Probably a slow decline into the maintenance mode, unless there is pressing need to expand. Bug fixes are always welcome. Also, I might add an advanced asynchronous chunk-by-chunk processing mode, suitable for handling large files with progress reports, buffered DB access and such.
*TL;DR:*
1. Bug fixes
2. Maybe a new feature or two
3. Profit

**************

## Licence

Apache v2. I'm told it's nice and fluffy. Read it [here](LICENCE).