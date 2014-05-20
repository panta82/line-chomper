# line-chomper

Chomps utf-8 based byte stream into lines. 

- Interactive line processing (callback-based, no loading the entire file into RAM)
- Optional, return all lines in an array instead of event per line
- Interactively interrupt streaming, or perform map/filter like processing
- Detect any newline convention (PC/Mac/Linux)
- Correct end file / last line treatment
- Correct handling of multi-byte UTF-8 characters
- Retrieve byte offset and byte length information
- Random access, using line-based or byte-based offsets
- Automatically compile line-mapping information, to speed up random access

**************

More to come...