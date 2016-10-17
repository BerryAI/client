var ipfs = require("ipfs");
var request = require("request");
var fs = require("fs");
var ipfsUrl = "http://localhost:5001/api/v0/add";

module.exports.addToIPFS = function(path) {
    return new Promise(function(resolve, reject) {
        var req = request.post(ipfsUrl, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                var ipfsHash = JSON.parse(body).Hash;
                resolve(ipfsHash);
                console.log(ipfsHash + ": " + path);
            }
        });
        req.form().append('file', fs.createReadStream(path));
    });
};