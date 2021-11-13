var fs = require('fs');
var portAudio = require('naudiodon');

console.log(portAudio.getDevices());

// Create an instance of AudioInput, which is a ReadableStream
// const ai = new portAudio.AudioInput({
//   channelCount: 2,
//   sampleFormat: portAudio.SampleFormat16Bit,
//   sampleRate: 44100,
//   deviceId : 0 // Use -1 or omit the deviceId to select the default device
// });
//
// // handle errors from the AudioInput
// ai.on('error', err => console.error);
//
// // Create a write stream to write out to a raw audio file
// const ws = fs.createWriteStream('rawAudio.raw');
//
// //Start streaming
// ai.pipe(ws);
// ai.start();

var ai = new portAudio.AudioIO({
inOptions: {
  channelCount: 2,
  sampleFormat: portAudio.SampleFormat16Bit,
  sampleRate: 44100,
  deviceId: -1, // Use -1 or omit the deviceId to select the default device
  closeOnError: true // Close the stream if an audio error is detected, if set false then just log the error
}
});

// Create a write stream to write out to a raw audio file
var ws = fs.createWriteStream('rawAudio.raw');

//Start streaming
ai.pipe(ws);
ai.start();
