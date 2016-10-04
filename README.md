+
 -run: parity --dapps-port 8081 --testnet		 +### Steps to run in Windows PC
 -run: nw with the path to the folder containing package.json (e.g. `nw .`)		 +
 +1. Start IPFS: `ipfs daemon`
 +2. Install NodeJS packages:  `npm install`
 +3. Install bower.js: `npm install -g bower`
 +4. Install bower.js packages:  `bower install`
 +5. Start parity: `parity --dapps-port 8081 --testnet` / `parity --dapps-port 8081 --chain "C:\path-to-folder\parity-test\private-chain.json" --datadir "C:\path-to-folder\parity-test\db" --geth --keys-path "C:\path-to-folder\parity-test\keys" --signer-path "C:\path-to-folder\parity-test\signer" --no-import-keys --author "0xETHER_ADDRESS"` (`--dapps-port 8081` is required)
 +6. Download nw.js, install it and put it into executable `PATH`.
 +7. `nw` with the path to the folder containing package.json (e.g. `nw .`)
+