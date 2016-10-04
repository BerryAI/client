// 100, "url", 100, ["0x008d4c913ca41f1f8d73b43d8fa536da423f1fb4", "0x02"], [20, 30]
contract PayPerPlay {
    uint public coinsPerPlay;

    address public owner;

    // we might want to allow for an arbitrary path indicator.
    string public resourceUrl; // e.g. ipfs://<hash>

    address[] public recipients;
    uint[] public shares;

    uint public totalShares;

    mapping(address => uint) public pendingPayment;

    uint public playCount;
    uint public totalEarned;

    function PayPerPlay(
            uint _coinsPerPlay,
            string _resourceUrl,
            uint _totalShares,
            address[] _recipients,
            uint[] _shares) {
        owner = msg.sender;
        resourceUrl = _resourceUrl;
        updateLicense(_coinsPerPlay, _recipients, _shares);
    }

    modifier adminOnly {
        if (msg.sender != owner) throw;
        if (msg.value > 0) throw;
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

    function play() enoughCoins {
        // users can only purchase one play at a time.  don't steal their money
        var toRefund = msg.value - coinsPerPlay;

        // I believe there is minimal risk in calling the sender directly, as it
        // should not be able to stall the contract for any other callers.
        if (toRefund > 0 && !msg.sender.send(toRefund)) {
            throw;
        }

        distributePayment(coinsPerPlay);
        totalEarned += coinsPerPlay;
        playCount++;
    }

    function collectPendingPayment() noCoins {
        var toSend = pendingPayment[msg.sender];
        pendingPayment[msg.sender] = 0;
        if (toSend > 0 && !msg.sender.send(toSend)) {
            // throw to ensure pendingPayment[msg.sender] is reverted
            throw;
        }
    }

    /*** Admin functions ***/

    function updateCoinsPerPlay(uint _coinsPerPlay) adminOnly {
        coinsPerPlay = _coinsPerPlay;
    }

    function transferOwnership(address newOwner) adminOnly {
        owner = newOwner;
    }

    function updateResourceUrl(string _resourceUrl) adminOnly {
        resourceUrl = _resourceUrl;
    }

    /*
     * Updates share allocations.  All old allocations are over written
     */
    function updateLicense(uint _coinsPerPlay, address[] _recipients, uint[] _shares) adminOnly {
        if (_recipients.length != _shares.length) throw;
        if (_recipients.length == 0) throw;

        coinsPerPlay = _coinsPerPlay;
        totalShares = 0;
        recipients = _recipients;
        shares = _shares;
        for (uint i=0; i < recipients.length; i++) {
            totalShares += shares[i];
        }

        // make sure shares were assigned
        if (totalShares == 0)
            throw;
    }

    function distributeBalance() adminOnly {
        distributePayment(this.balance);
    }

    function kill(bool _distributeBalanceFirst) adminOnly {
        if (_distributeBalanceFirst) {
            distributeBalance(); // is there any risk here?
        }
        selfdestruct(owner);
    }

    /*** internal ***/
    function distributePayment(uint _total) internal {
        for (uint i=0; i < recipients.length; i++) {
            var amount = (shares[i] * _total) / totalShares;
            var recipient = recipients[i];

            if (amount > 0 && !recipient.send(amount)) {
                // don't throw, otherwise the contract can stall
                pendingPayment[recipient] += amount;
            }
        }
    }
}