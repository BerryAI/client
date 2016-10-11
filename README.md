# Getting Setup
1. Install NodeJS packages:  `npm install`
2. Install bower.js: `npm install -g bower`
3. Install bower.js packages:  `bower install`
4. Download nw.js, install it and put it into executable `PATH`. (http://nwjs.io/ , choose the SDK version)
5. Update nw's ffmpeg library so you can play mp3 files (as well as many others): https://github.com/nwjs/nw.js/wiki/Using-MP3-&-MP4-(H.264)-using-the--video--&--audio--tags.

# Running the application
1. start geth `geth --rpc --rpcapi="db,eth,net,web3,personal" --rpcport "8545" --rpcaddr "127.0.0.1" --rpccorsdomain "localhost" --testnet`
2. Start IPFS: `ipfs daemon`
3. `nw` with the path to the folder containing package.json (e.g. `nw .`)
