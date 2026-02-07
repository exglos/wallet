'use strict';
(function () {
    var wallet, balance, erc20, exglos, rss3, txData;

    window.onbeforeunload = function () {
        return '';
    };

    window.onload = function () {
        document.getElementById('startPassword').onkeyup = function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                return open();
            }
            if (event.keyCode === 27) {
                event.preventDefault();
                document.getElementById('startPasswordHint').innerHTML = '';
                document.getElementById('startPassword').value = '';
            }
        };
        document.getElementById('startPassword').oninput = function () {
            document.getElementById('startPasswordHint').innerHTML = '';
        };
        document.getElementById('startOpen').onclick = open;
        document.getElementById('startCreate').onclick = create;
        document.getElementById('createOk').onclick = accept;
        document.getElementById('headerExit').onclick = exit;
        document.getElementById('headerEther').onclick = function () {
            displayTab('ether');
        };
        document.getElementById('headerErc20').onclick = function () {
            displayTab('erc20');
        };
        document.getElementById('headerExglos').onclick = function () {
            loadExglos();
            displayTab('exglos');
        };
        document.getElementById('etherAddress').onkeyup = function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                return etherSend();
            }
            if (event.keyCode === 27) {
                event.preventDefault();
                document.getElementById('etherAddressHint').innerHTML = '';
                document.getElementById('etherAddress').value = '';
            }
        };
        document.getElementById('etherAddress').oninput = function () {
            document.getElementById('etherAddressHint').innerHTML = '';
        };
        document.getElementById('etherValue').onkeyup = function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                return etherSend();
            }
            if (event.keyCode === 27) {
                event.preventDefault();
                document.getElementById('etherValueHint').innerHTML = '';
                document.getElementById('etherValue').value = '';
            }
        };
        document.getElementById('etherValue').oninput = function () {
            document.getElementById('etherValueHint').innerHTML = '';
        };
        document.getElementById('etherSend').onclick = etherSend;
        document.getElementById('erc20Contract').onkeyup = function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                return erc20Enter();
            }
            if (event.keyCode === 27) {
                event.preventDefault();
                document.getElementById('erc20ContractHint').innerHTML = '';
                document.getElementById('erc20Contract').value = '';
            }
        };
        document.getElementById('erc20Contract').oninput = function () {
            document.getElementById('erc20ContractHint').innerHTML = '';
        };
        document.getElementById('erc20Enter').onclick = erc20Enter;
        document.getElementById('erc20List').onclick = erc20Select;
        document.getElementById('erc20Change').onclick = erc20Change;
        document.getElementById('erc20Address').onkeyup = function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                return erc20Send();
            }
            if (event.keyCode === 27) {
                event.preventDefault();
                document.getElementById('erc20AddressHint').innerHTML = '';
                document.getElementById('erc20Address').value = '';
            }
        };
        document.getElementById('erc20Address').oninput = function () {
            document.getElementById('erc20AddressHint').innerHTML = '';
        };
        document.getElementById('erc20Value').onkeyup = function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                return erc20Send();
            }
            if (event.keyCode === 27) {
                event.preventDefault();
                document.getElementById('erc20ValueHint').innerHTML = '';
                document.getElementById('erc20Value').value = '';
            }
        };
        document.getElementById('erc20Value').oninput = function () {
            document.getElementById('erc20ValueHint').innerHTML = '';
        };
        document.getElementById('erc20Send').onclick = erc20Send;
        document.getElementById('exglosEth').onkeyup = function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                return exglosBuy();
            }
            if (event.keyCode === 27) {
                event.preventDefault();
                document.getElementById('exglosEth').value = '';
                document.getElementById('exglosExg').value = '';
                document.getElementById('exglosError').innerHTML = '';
            }
        };
        document.getElementById('exglosEth').oninput = setExglosExg;
        document.getElementById('exglosExg').onkeyup = function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                return exglosBuy();
            }
            if (event.keyCode === 27) {
                event.preventDefault();
                document.getElementById('exglosEth').value = '';
                document.getElementById('exglosExg').value = '';
                document.getElementById('exglosError').innerHTML = '';
            }
        };
        document.getElementById('exglosExg').oninput = setExglosEth;
        document.getElementById('exglosBuy').onclick = exglosBuy;
        document.getElementById('exglosReinvest').onclick = exglosReinvest;
        document.getElementById('exglosWithdraw').onclick = exglosWithdraw;
        document.getElementById('txNonce').onkeyup = function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                return txConfirm();
            }
            if (event.keyCode === 27) {
                event.preventDefault();
                document.getElementById('txNonce').value = '';
                document.getElementById('txError').innerHTML = '';
            }
        };
        document.getElementById('txNonce').oninput = function () {
            document.getElementById('txError').innerHTML = '';
        };
        document.getElementById('txPrice').onkeyup = function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                return txConfirm();
            }
            if (event.keyCode === 27) {
                event.preventDefault();
                document.getElementById('txPrice').value = '';
                document.getElementById('txBalance').innerHTML = '';
                document.getElementById('txError').innerHTML = '';
            }
        };
        document.getElementById('txPrice').oninput = calculateFee;
        document.getElementById('txCancel').onclick = txClose;
        document.getElementById('txConfirm').onclick = txConfirm;
    };

    function create() {
        startLoading();
        setTimeout(function () {
            var entropy = BigInt(ethers.sha256(ethers.randomBytes(40)));
            var random = parse('random');
            if (random) {
                entropy += BigInt(ethers.id(random));
            }

            var base62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var password = '';
            var length = parse('length') - 6;
            if (!length || length < 6) {
                length = 24;
            } else if (length > 46) {
                length = 46;
            }
            for (var i = 0; i < length; i++) {
                password += base62.charAt(Number(entropy % 62n));
                entropy /= 62n;
            }
            password += ethers.id(password).substr(2, 6);

            document.getElementById('start').style.display = 'none';
            document.getElementById('startPasswordHint').innerHTML = '';
            document.getElementById('startPassword').value = '';
            document.getElementById('create').style.display = 'block';
            document.getElementById('createPassword').innerHTML = password;
            password = null;
            stopLoading();
        }, 0);
    }

    function accept() {
        document.getElementById('start').style.display = 'block';
        document.getElementById('create').style.display = 'none';
        document.getElementById('createPassword').innerHTML = '';
    }

    function open() {
        startLoading();
        setTimeout(function () {
            document.getElementById('startPasswordHint').innerHTML = '';
            var password = document.getElementById('startPassword').value;
            if (password.length < 12) {
                document.getElementById('startPasswordHint').innerHTML = 'short password';
                return stopLoading();
            }
            if (password.indexOf(' ') < 0) {
                var checksum = ethers.id(password.substr(0, password.length - 6)).substr(2, 6);
                if (checksum !== password.substr(password.length - 6)) {
                    document.getElementById('startPasswordHint').innerHTML = 'incorrect password';
                    return stopLoading();
                }
                password = ethers.id(password);
            } else {
                var path = null;
                if (password.match(/\d/)) {
                    path = password.substr(password.lastIndexOf(' ') + 1);
                    password = password.substr(0, password.length - path.length - 1);
                    if (path.charAt(0) !== 'm') {
                        path = 'm/44\'/60\'/0\'/0/' + path;
                    }
                }
                try {
                    password = ethers.HDNodeWallet.fromPhrase(password, null, path).privateKey;
                } catch (error) {
                    console.error(error);
                    if (error.message) {
                        error = error.message;
                    }
                    document.getElementById('startPasswordHint').innerHTML = error;
                    return stopLoading();
                }
            }
            try {
                var provider = ethers.getDefaultProvider(parse('network'), {
                    alchemy: 'm6nHD1aQAIbJHAYLnIMoBzMLOep-bLyC',
                    infura: '-'
                });
                wallet = new ethers.Wallet(password, provider);
            } catch (error) {
                alert(error);
                return stopLoading();
            }
            password = null;

            loadBalance();
            setInterval(loadBalance, 30000);

            document.getElementById('startPassword').value = '';
            document.getElementById('start').style.display = 'none';
            document.getElementById('main').style.display = 'block';
            document.getElementById('account').innerHTML = '';
            var a = document.createElement('a');
            a.target = '_blank';
            a.href = explorer('address/' + wallet.address);
            a.innerHTML = wallet.address;
            document.getElementById('account').appendChild(a);
            var arg = parse('etherAddress');
            if (arg && ethers.isAddress(arg)) {
                document.getElementById('etherAddress').value = arg;
            }
            arg = parse('etherValue');
            if (arg) {
                try {
                    if (ethers.parseEther(arg) > 0) {
                        document.getElementById('etherValue').value = arg;
                    }
                } catch (error) {
                }
            }
            arg = parse('erc20Contract');
            if (arg && ethers.isAddress(arg)) {
                document.getElementById('erc20Contract').value = arg;
            }
            stopLoading();
        }, 0);
    }

    function exit() {
        startLoading();
        window.onbeforeunload = null;
        window.location.reload();
    }

    function displayTab(tab) {
        document.getElementById('headerEther').className = tab === 'ether' ? 'active' : '';
        document.getElementById('headerErc20').className = tab === 'erc20' ? 'active' : '';
        document.getElementById('headerExglos').className = tab === 'exglos' ? 'active' : '';
        document.getElementById('ether').style.display = tab === 'ether' ? 'block' : 'none';
        document.getElementById('erc20').style.display = tab === 'erc20' ? 'block' : 'none';
        document.getElementById('exglos').style.display = tab === 'exglos' ? 'block' : 'none';
    }

    function loadBalance() {
        wallet.provider.getBalance(wallet).then(function (result) {
            balance = result;
            result = ethers.formatEther(result) + ' eth';
            document.getElementById('balance').innerHTML = result;
        }).catch(console.error);
    }

    function etherSend() {
        startLoading();
        if (balance === undefined) {
            return setTimeout(etherSend, 200);
        }
        document.getElementById('etherAddressHint').innerHTML = '';
        document.getElementById('etherValueHint').innerHTML = '';
        if (balance === 0n) {
            document.getElementById('etherValueHint').innerHTML = 'zero balance';
            return stopLoading();
        }
        var address = document.getElementById('etherAddress').value;
        if (address === '') {
            document.getElementById('etherAddressHint').innerHTML = 'enter address';
            document.getElementById('etherAddress').focus();
            return stopLoading();
        } else if (!ethers.isAddress(address)) {
            document.getElementById('etherAddressHint').innerHTML = 'incorrect address';
            document.getElementById('etherAddress').focus();
            return stopLoading();
        }
        var value = document.getElementById('etherValue').value;
        if (value === '') {
            document.getElementById('etherValueHint').innerHTML = 'enter value';
            document.getElementById('etherValue').focus();
            return stopLoading();
        }
        try {
            value = ethers.parseEther(value);
        } catch (error) {
            document.getElementById('etherValueHint').innerHTML = 'incorrect number';
            document.getElementById('etherValue').focus();
            return stopLoading();
        }
        if (value < 0n) {
            document.getElementById('etherValueHint').innerHTML = 'negative value';
            document.getElementById('etherValue').focus();
            return stopLoading();
        } else if (value > balance) {
            document.getElementById('etherValueHint').innerHTML = 'too big value';
            document.getElementById('etherValue').focus();
            return stopLoading();
        }

        txData = {
            function: 'etherSend',
            description: 'send ' + ethers.formatEther(value) + ' eth to ' + address,
            value: value,
            to: address
        };
        continueTx();
    }

    function erc20Select(event) {
        if (event.target.tagName !== 'BUTTON') {
            return;
        }
        var address = event.target.id.substr(5);
        document.getElementById('erc20ContractHint').innerHTML = '';
        document.getElementById('erc20Contract').value = address;
        document.getElementById('erc20Contract').focus();
    }

    function erc20Enter() {
        startLoading();
        document.getElementById('erc20ContractHint').innerHTML = '';
        var address = document.getElementById('erc20Contract').value;
        if (address === '') {
            document.getElementById('erc20ContractHint').innerHTML = 'enter address';
            document.getElementById('erc20Contract').focus();
            return stopLoading();
        } else if (!ethers.isAddress(address)) {
            document.getElementById('erc20ContractHint').innerHTML = 'incorrect address';
            document.getElementById('erc20Contract').focus();
            return stopLoading();
        }

        var loadingErc20 = {};
        loadingErc20.contract = new ethers.Contract(
            address,
            [
                'function decimals() view returns (uint8)',
                'function name() view returns (string)',
                'function symbol() view returns (string)',
                'function balanceOf(address) view returns (uint256)',
                'function transfer(address, uint256)',
                'event Transfer(address indexed, address indexed, uint256)'
            ],
            wallet
        );
        loadingErc20.contract.decimals().then(function (result) {
            loadingErc20.decimals = Number(result);
            load();
        }).catch(function (error) {
            console.error(error);
            loadingErc20.decimals = 18;
            load();
        });
        loadingErc20.contract.name().then(function (result) {
            loadingErc20.name = result;
            load();
        }).catch(function (error) {
            console.error(error);
            loadingErc20.name = address;
            load();
        });
        loadingErc20.contract.symbol().then(function (result) {
            loadingErc20.symbol = result;
            load();
        }).catch(function (error) {
            console.error(error);
            loadingErc20.symbol = 'token';
            load();
        });
        loadingErc20.contract.balanceOf(wallet.address).then(function (result) {
            loadingErc20.balance = result;
            load();
        }).catch(function (error) {
            console.error(error);
            if (error.code === 'CALL_EXCEPTION' || error.code === 'BAD_DATA') {
                error = 'not a erc20';
            } else {
                error = error.message;
            }
            document.getElementById('erc20ContractHint').innerHTML = error;
            document.getElementById('erc20Contract').focus();
            stopLoading();
        });

        function load() {
            if (!loadingErc20.decimals && loadingErc20.decimals !== 0) {
                return;
            } else if (!loadingErc20.name || !loadingErc20.symbol || loadingErc20.balance === undefined) {
                return;
            }
            erc20 = loadingErc20;
            erc20.contract.on('Transfer', function (from, to, value, event) {
                if (from === wallet.address || to === wallet.address) {
                    loadErc20(address);
                }
            });

            document.getElementById('erc20Contract').value = '';
            document.getElementById('erc20Select').style.display = 'none';
            document.getElementById('erc20Selected').style.display = 'block';
            var a = document.createElement('a');
            a.target = '_blank';
            a.href = explorer('address/' + address);
            a.innerHTML = erc20.name;
            document.getElementById('erc20Name').appendChild(a);
            document.getElementById('erc20Balance').innerHTML =
                ethers.formatUnits(erc20.balance, erc20.decimals) + ' ' + erc20.symbol;
            document.getElementById('erc20ValueSpan').innerHTML = 'value to send, ' + erc20.symbol;
            stopLoading();
        }
    }

    function loadErc20(address) {
        erc20.contract.balanceOf(wallet.address).then(function (result) {
            if (address !== erc20.contract.address) {
                return;
            }
            erc20.balance = result;
            result = ethers.formatUnits(result, erc20.decimals) + ' ' + erc20.symbol;
            document.getElementById('erc20Balance').innerHTML = result;
        }).catch(console.error);
    }

    function erc20Change() {
        erc20.contract.removeAllListeners();
        erc20 = null;

        document.getElementById('erc20Select').style.display = 'block';
        document.getElementById('erc20Selected').style.display = 'none';
        document.getElementById('erc20Name').innerHTML = '';
        document.getElementById('erc20Balance').innerHTML = '';
        document.getElementById('erc20AddressHint').innerHTML = '';
        document.getElementById('erc20Address').value = '';
        document.getElementById('erc20ValueSpan').innerHTML = '';
        document.getElementById('erc20ValueHint').innerHTML = '';
        document.getElementById('erc20Value').value = '';
    }

    function erc20Send() {
        startLoading();
        document.getElementById('erc20AddressHint').innerHTML = '';
        document.getElementById('erc20ValueHint').innerHTML = '';
        if (balance === 0n) {
            document.getElementById('erc20ValueHint').innerHTML = 'zero balance';
            return stopLoading();
        }
        var address = document.getElementById('erc20Address').value;
        if (address === '') {
            document.getElementById('erc20AddressHint').innerHTML = 'enter address';
            document.getElementById('erc20Address').focus();
            return stopLoading();
        } else if (!ethers.isAddress(address)) {
            document.getElementById('erc20AddressHint').innerHTML = 'incorrect address';
            document.getElementById('erc20Address').focus();
            return stopLoading();
        }
        var value = document.getElementById('erc20Value').value;
        if (value === '') {
            document.getElementById('erc20ValueHint').innerHTML = 'enter value';
            document.getElementById('erc20Value').focus();
            return stopLoading();
        }
        try {
            value = ethers.parseUnits(value, erc20.decimals);
        } catch (error) {
            document.getElementById('erc20ValueHint').innerHTML = 'incorrect number';
            document.getElementById('erc20Value').focus();
            return stopLoading();
        }
        if (value < 0n) {
            document.getElementById('erc20ValueHint').innerHTML = 'negative value';
            document.getElementById('erc20Value').focus();
            return stopLoading();
        } else if (value > erc20.balance) {
            document.getElementById('erc20ValueHint').innerHTML = 'too big value';
            document.getElementById('erc20Value').focus();
            return stopLoading();
        }

        var description = 'send ' + ethers.formatUnits(value, erc20.decimals) + ' ' +
            erc20.symbol + ' (' + erc20.name + ') to ' + address;
        txData = {
            function: 'erc20Send',
            description: description,
            value: value,
            to: address
        };
        continueTx();
    }

    function loadExglos() {
        if (!exglos) {
            exglos = new ethers.Contract(
                '0x3dDee7CdF8D71490b518b1E6e6f2198433636903',
                [
                    'function balanceOf(address) view returns (uint256)',
                    'function dividendsOf(address) view returns (uint256)',
                    'function buy(address) payable',
                    'function withdraw()',
                    'function reinvest()',
                    'event Profit(uint256)',
                    'event Withdraw(address indexed, uint256)',
                    'event Transfer(address indexed, address indexed, uint256)'
                ],
                wallet
            );
            setInterval(loadExglos, 30000);
        }

        exglos.balanceOf(wallet.address).then(function (result) {
            if (result > 1000000000n) {
                document.getElementById('exglosRef').innerHTML =
                    'ref link: wallet.exglos.com?ref=' + wallet.address;
            } else {
                document.getElementById('exglosRef').innerHTML = '';
            }
            result = ethers.formatEther(result);
            document.getElementById('exglosBalance').innerHTML = result + ' exg';
        }).catch(console.error);
        exglos.dividendsOf(wallet.address).then(function (result) {
            document.getElementById('exglosButtons').style.display = result > 1 ? 'block' : 'none';
            result = ethers.formatEther(result);
            document.getElementById('exglosDivs').innerHTML = 'dividends ' + result + ' eth';
        }).catch(console.error);
    }

    function setExglosExg() {
        document.getElementById('exglosExg').value = '';
        document.getElementById('exglosError').innerHTML = '';
        var eth = document.getElementById('exglosEth').value;
        if (eth === '') {
            return;
        }
        try {
            eth = ethers.parseEther(eth);
        } catch (error) {
            document.getElementById('exglosError').innerHTML = 'incorrect number';
            return;
        }
        if (eth < 0) {
            document.getElementById('exglosError').innerHTML = 'non-positive value';
            return;
        }
        document.getElementById('exglosExg').value = ethers.formatEther(eth * 1000n / 16n);
    }

    function setExglosEth() {
        document.getElementById('exglosEth').value = '';
        document.getElementById('exglosError').innerHTML = '';
        var exg = document.getElementById('exglosExg').value;
        if (exg === '') {
            return;
        }
        try {
            exg = ethers.parseEther(exg);
        } catch (error) {
            document.getElementById('exglosError').innerHTML = 'incorrect number';
            return;
        }
        if (exg < 0) {
            document.getElementById('exglosError').innerHTML = 'non-positive value';
            return;
        }
        document.getElementById('exglosEth').value = ethers.formatEther(exg * 16n / 1000n);
    }

    function exglosBuy() {
        startLoading();
        if (balance === undefined) {
            return setTimeout(exglosBuy, 200);
        }
        document.getElementById('exglosError').innerHTML = '';
        if (balance === 0n) {
            document.getElementById('exglosError').innerHTML = 'zero balance';
            return stopLoading();
        }
        var value = document.getElementById('exglosEth').value;
        if (value === '') {
            document.getElementById('exglosEth').focus();
            document.getElementById('exglosError').innerHTML = 'enter value';
            return stopLoading();
        }
        try {
            value = ethers.parseEther(value);
        } catch (error) {
            document.getElementById('exglosEth').focus();
            document.getElementById('exglosError').innerHTML = 'incorrect number';
            return stopLoading();
        }
        if (value < 0n) {
            document.getElementById('exglosEth').focus();
            document.getElementById('exglosError').innerHTML = 'negative value';
            return stopLoading();
        } else if (value > balance) {
            document.getElementById('exglosEth').focus();
            document.getElementById('exglosError').innerHTML = 'too big value';
            return stopLoading();
        }

        var description = 'buy ' + document.getElementById('exglosExg').value +
            ' exg for ' + ethers.formatEther(value) + ' eth';
        var ref = parse('ref');
        if (ref === 'no') {
            ref = ethers.ZeroAddress;
        } else if (ref === 'exglosnet') {
            ref = '0xC5E4045E291EE6a414beb298310fF41b86D53666';
        } else if (ref === 'hyipcheck') {
            ref = '0xE19299E010a3c7870019a9B0E958DD138284A044';
        }
        if (!ethers.isAddress(ref)) {
            ref = '0xE974e991668CDEAF98e03A2154363a8f20494909';
        }
        txData = {
            function: 'exglosBuy',
            description: description,
            value: value,
            ref: ref
        };
        continueTx();
    }

    function exglosReinvest() {
        startLoading();
        if (!balance) {
            return setTimeout(exglosReinvest, 200);
        }
        document.getElementById('exglosError').innerHTML = '';
        txData = {
            function: 'exglosReinvest',
            description: 'reinvest dividends'
        };
        continueTx();
    }

    function exglosWithdraw() {
        startLoading();
        if (!balance) {
            return setTimeout(exglosWithdraw, 200);
        }
        document.getElementById('exglosError').innerHTML = '';
        txData = {
            function: 'exglosWithdraw',
            description: 'withdraw dividends'
        };
        continueTx();
    }

    function continueTx() {
        document.getElementById('main').style.display = 'none';
        document.getElementById('tx').style.display = 'block';
        document.getElementById('txDescription').innerHTML = txData.description;
        stopLoading();

        wallet.provider.getTransactionCount(wallet).then(function (result) {
            if (!txData) {
                return;
            }
            document.getElementById('txNonce').placeholder = result;
            if (document.getElementById('txNonce').value === '') {
                document.getElementById('txNonce').value = result;
            }
        }).catch(console.error);

        wallet.provider.getFeeData().then(function (result) {
            if (!txData) {
                return;
            }
            result = ethers.formatUnits(result.maxFeePerGas, 9);
            document.getElementById('txPrice').placeholder = result;
            if (document.getElementById('txPrice').value === '') {
                document.getElementById('txPrice').value = result;
            }
            calculateFee();
        }).catch(console.error);

        var estimate;
        if (txData.function === 'etherSend') {
            estimate = wallet.estimateGas({value: txData.value, to: txData.to});
        } else if (txData.function === 'erc20Send') {
            estimate = erc20.contract.transfer.estimateGas(txData.to, txData.value);
        } else if (txData.function === 'exglosBuy') {
            estimate = exglos.buy.estimateGas(txData.ref, {value: txData.value});
        } else if (txData.function === 'exglosReinvest') {
            estimate = exglos.reinvest.estimateGas();
        } else if (txData.function === 'exglosWithdraw') {
            estimate = exglos.withdraw.estimateGas();
        }
        estimate.then(function (result) {
            if (!txData) {
                return;
            }
            txData.gasLimit = result;
            document.getElementById('txGas').innerHTML = 'max gas ' + Number(result);
            calculateFee();
        }).catch(console.error);
    }

    function calculateFee() {
        document.getElementById('txBalance').innerHTML = '';
        document.getElementById('txError').innerHTML = '';
        if (!txData || !txData.gasLimit) {
            return;
        }
        var price = document.getElementById('txPrice').value;
        if (price === '') {
            return;
        }
        try {
            price = ethers.parseUnits(price, 9);
        } catch (error) {
            document.getElementById('txError').innerHTML = 'incorrect number';
            return;
        }
        if (price < 0n) {
            document.getElementById('txError').innerHTML = 'non-positive value';
            return;
        }
        var minus = price * txData.gasLimit;
        if (txData.function === 'etherSend' || txData.function === 'exglosBuy') {
            minus = minus + txData.value;
        }
        if (minus > balance) {
            document.getElementById('txPrice').focus();
            document.getElementById('txError').innerHTML = 'too big value';
            return;
        }
        document.getElementById('txBalance').innerHTML =
            ethers.formatEther(balance) + '<br />- ' +
            ethers.formatEther(minus) + '<br />= ' +
            ethers.formatEther(balance - minus) + ' eth';
    }

    function txClose() {
        txData = null;
        document.getElementById('main').style.display = 'block';
        document.getElementById('tx').style.display = 'none';
        document.getElementById('txDescription').innerHTML = '';
        document.getElementById('txNonce').value = '';
        document.getElementById('txNonce').placeholder = '';
        document.getElementById('txPrice').value = '';
        document.getElementById('txPrice').placeholder = '';
        document.getElementById('txGas').innerHTML = 'loading gas...';
        document.getElementById('txBalance').innerHTML = '';
        document.getElementById('txError').innerHTML = '';
    }

    function txConfirm() {
        startLoading();
        document.getElementById('txError').innerHTML = '';
        var tx = {};
        if (txData.gasLimit) {
            tx.gasLimit = txData.gasLimit;
        }
        var nonce = document.getElementById('txNonce').value;
        if (nonce !== '') {
            if (nonce < 0) {
                document.getElementById('txNonce').focus();
                document.getElementById('txError').innerHTML = 'negative nonce';
                return stopLoading();
            }
            tx.nonce = nonce;
        }
        var maxFee = document.getElementById('txPrice').value;
        if (maxFee !== '') {
            try {
                maxFee = ethers.parseUnits(maxFee, 9);
            } catch (error) {
                document.getElementById('txPrice').focus();
                document.getElementById('txError').innerHTML = 'incorrect number';
                return stopLoading();
            }
            tx.maxFeePerGas = maxFee;
            tx.maxPriorityFeePerGas = maxFee / 10n;
        }

        if (prompt('print yes to confirm') !== 'yes') {
            document.getElementById('txError').innerHTML = 'not confirmed';
            return stopLoading();
        }

        var request, erc20Address;
        if (txData.function === 'etherSend') {
            tx.value = txData.value;
            tx.to = txData.to;
            request = wallet.sendTransaction(tx);
        } else if (txData.function === 'erc20Send') {
            request = erc20.contract.transfer(txData.to, txData.value, tx);
            erc20Address = erc20.contract.address;
        } else if (txData.function === 'exglosBuy') {
            tx.value = txData.value;
            request = exglos.buy(txData.ref, tx);
        } else if (txData.function === 'exglosReinvest') {
            request = exglos.reinvest(tx);
        } else if (txData.function === 'exglosWithdraw') {
            request = exglos.withdraw(tx);
        }

        request.then(function (response) {
            response.wait().then(function (receipt) {
                var p = document.getElementById(receipt.hash);
                if (p) {
                    var span = document.createElement('span');
                    span.innerHTML = ' - confirmed';
                    p.appendChild(span);
                }
                if (erc20Address) {
                    loadErc20(erc20Address);
                }
            }).catch(function (error) {
                console.error(error);
                var p = document.getElementById(error.hash ? error.hash : error.transactionHash);
                if (p) {
                    var span = document.createElement('span');
                    span.innerHTML = ' - rejected';
                    if (error.reason) {
                        span.innerHTML += ' (' + error.reason + ')';
                    }
                    p.appendChild(span);
                }
            });

            if (txData.function === 'etherSend') {
                document.getElementById('etherAddress').value = '';
                document.getElementById('etherValue').value = '';
            } else if (txData.function === 'erc20Send') {
                document.getElementById('erc20Address').value = '';
                document.getElementById('erc20Value').value = '';
            } else if (txData.function === 'exglosBuy') {
                document.getElementById('exglosEth').value = '';
                document.getElementById('exglosExg').value = '';
            }
            var a = document.createElement('a');
            a.target = '_blank';
            a.href = explorer('tx/' + response.hash);
            a.innerHTML = txData.description;
            var p = document.createElement('p');
            p.id = response.hash;
            p.appendChild(a);
            document.getElementById('logs').insertBefore(p, document.getElementById('logs').firstChild);
            txClose();
            stopLoading();
        }).catch(function (error) {
            console.error(error);
            if (error.reason) {
                error = error.reason;
            }
            document.getElementById('txError').innerHTML = error;
            stopLoading();
        });
    }

    function startLoading() {
        document.getElementById('loading').style.display = 'block';
    }

    function stopLoading() {
        document.getElementById('loading').style.display = 'none';
    }


    function parse(query) {
        var startIndex = window.location.search.indexOf(query + '=');
        if (startIndex < 0) {
            return null;
        }
        startIndex = startIndex + query.length + 1;
        var stopIndex = window.location.search.indexOf('&', startIndex);
        if (stopIndex < 0) {
            return window.location.search.substring(startIndex);
        } else {
            return window.location.search.substring(startIndex, stopIndex);
        }
    }

    function explorer(link) {
        return 'https://etherscan.io/' + link;
    }
})();
