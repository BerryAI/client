contract PayPerPlay {
    address public owner;

    uint public coinsPerPlay;

    // we might want to allow for an arbitrary path indicator.
    string public resourceUrl; // e.g. ipfs://<hash>

    // "private" doesn't actually hide anything...
    string private resourceKey;

    function PayPerPlay(uint _coinsPerPlay, string _resourceUrl, string _resourceKey) {
        owner = msg.sender;
        coinsPerPlay = _coinsPerPlay;
        resourceUrl = _resourceUrl;
        resourceKey = _resourceKey;
    }

    modifier onlyOwner {
        if (msg.sender != owner) throw;
        _
    }

    modifier noCoins {
        if (msg.value > 0) throw;
        _
    }

    modifier enoughCoins {
        if (msg.value < coinsPerPlay) throw;
        _
    }

    function getResourceUrl() constant returns (string) {
        return resourceUrl;
    }

    function getSomething() constant returns (string) {
        return "something";
    }

    function getBytes() constant returns (bytes32) {
        return 444;
    }

    function getNumber() constant returns (uint) {
        return 54321;
    }

    function setResourceUrl(string newValue) onlyOwner {
        resourceUrl = newValue;
    }

    function kill() onlyOwner{
        selfdestruct(owner);
    }

    function play() enoughCoins returns (string url, string key) {
        // users can only purchase one play at a time.  don't steal their money
        var toRefund = msg.value - coinsPerPlay;

        // I believe there is minimal risk in calling the sender directly, as it
        // should not be able to stall the contract for any other callers.
        if (toRefund > 0 && !msg.sender.send(toRefund)) {
            throw;
        }

        // TODO: this is obviously not stopping anyone from getting access
        return (resourceUrl, resourceKey);
    }

    function () {
        // we should not accept payment this way, we need the method that
        // accepts payment to return some useful information.
        throw;
    }
}