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
- Automatically compile line-mapping information, to speed up random access
- Zero dependencies

**************

More to come...