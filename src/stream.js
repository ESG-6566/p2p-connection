/* eslint-disable no-console */

import * as lp from 'it-length-prefixed'
import map from 'it-map'
import { pipe } from 'it-pipe'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import * as fs from 'fs'
import { Uint8ArrayList } from 'uint8arraylist';

export function stdinToStream (stream) {
  // Read utf-8 from stdin
  process.stdin.setEncoding('utf8')
  pipe(
    // Read from stdin (the source)
    process.stdin,
    // Turn strings into buffers
    (source) => map(source, (string) => uint8ArrayFromString(string)),
    // Encode with length prefix (so receiving side knows how much data is coming)
    (source) => lp.encode(source),
    // Write to the stream (the sink)
    stream.sink
  )
}

export function streamToConsole (stream) {
  pipe(
    // Read from the stream (the source)
    stream.source,
    // Decode length-prefixed data
    (source) => lp.decode(source),
    // Turn buffers into strings
    (source) => map(source, (buf) => uint8ArrayToString(buf.subarray())),
    // Sink function
    async function (source) {
      // For each chunk of data
      for await (const msg of source) {
        // Output the data as a utf8 string
        console.log('> ' + msg.toString().replace('\n', ''))
      }
    }
  )
}

export function fileToStream (filePath, stream) {
  pipe(
    // Read file as a binary stream
    fs.createReadStream(filePath),
    // Encode with length prefix
    (source) => lp.encode(source),
    // Write to the stream (the sink)
    stream.sink
  );
}

export function streamToFile(stream, outputPath) {
  pipe(
    // Read from the stream (the source)
    stream.source,
    // Decode length-prefixed data
    (source) => lp.decode(source),
    // Sink function to save the file
    async function (source) {
      // Create a write stream to save the file
      const writeStream = fs.createWriteStream(outputPath);

      // For each chunk of data
      for await (const chunk of source) {
        let bufferChunk;

        // Check if chunk is an instance of Uint8ArrayList
        if (chunk instanceof Uint8ArrayList) {
          bufferChunk = Buffer.from(chunk.subarray()); // Convert Uint8ArrayList to Buffer
        } else {
          bufferChunk = Buffer.from(chunk); // Convert Uint8Array to Buffer
        }

        // Write the buffer chunk to the file
        writeStream.write(bufferChunk);
      }

      // Close the write stream
      writeStream.end();
    }
  );
}