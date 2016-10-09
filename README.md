Getting Setup
1. Install NodeJS packages:  `npm install`
2. Install bower.js: `npm install -g bower`
3. Install bower.js packages:  `bower install`
4. Download nw.js, install it and put it into executable `PATH`. (http://nwjs.io/ , choose the SDK version)
5. Update nw's ffmpeg library so you can play mp3 files (as well as many others): https://github.com/nwjs/nw.js/wiki/Using-MP3-&-MP4-(H.264)-using-the--video--&--audio--tags.

Running the application
1. Start parity: `parity --dapps-port 8081 --testnet` (`--dapps-port 8081` is required)
2. Start IPFS: `ipfs daemon`
3. `nw` with the path to the folder containing package.json (e.g. `nw .`)
