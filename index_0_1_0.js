'use strict';
(function () {
    var address = '0x3dDee7CdF8D71490b518b1E6e6f2198433636903';
    var abi = [
        'function balanceOf(address) view returns (uint256)',
        'function dividendsOf(address) view returns (uint256)',
        'function buy(address) payable',
        'function withdraw()',
        'function reinvest()'
    ];
    var provider, wallet, contract;

    window.onload = function () {
        document.getElementById('createOk').onclick = create;
        document.getElementById('accountOk').onclick = account;
        document.getElementById('etherOk').onclick = sendEther;
        document.getElementById('exgBuy').onclick = exgBuy;
        document.getElementById('exgWithdraw').onclick = exgWithdraw;
        document.getElementById('exgReinvest').onclick = exgReinvest;

        provider = ethers.getDefaultProvider(5);
    };

    function create() {
        var password = document.getElementById('createUser').value;
        var entropy = ethers.BigNumber.from(ethers.utils.sha256(ethers.utils.randomBytes(40)));
        var base62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < 24; i++) {
            password += base62.charAt(entropy.mod(62).toNumber());
            entropy = entropy.div(62);
        }
        password += ethers.utils.id(password).substr(2, 6);
        document.getElementById('createPassword').innerHTML = password;
    }

    function account() {
        var password = document.getElementById('accountPassword').value;
        if (password.length < 12) {
            return alert('short password');
        }
        var checksum = ethers.utils.id(password.substr(0, password.length - 6)).substr(2, 6);
        if (checksum !== password.substr(password.length - 6)) {
            return alert('incorrect password');
        }
        wallet = new ethers.Wallet(ethers.utils.id(password), provider);
        var a = document.createElement('a');
        a.target = '_blank';
        a.href = 'https://goerli.etherscan.io/address/' + wallet.address;
        a.innerHTML = wallet.address;
        document.getElementById('accountAddress').innerHTML = 'address ';
        document.getElementById('accountAddress').appendChild(a);
        provider.getTransactionCount(wallet.address).then(function (nonce) {
            document.getElementById('accountNonce').value = nonce;
        }).catch(console.error);
        provider.getFeeData().then(function (fee) {
            document.getElementById('accountMaxGas').value = ethers.utils.formatUnits(fee.maxFeePerGas, 9);
        }).catch(console.error);

        provider.getBalance(wallet.address).then(function (balance) {
            balance = 'balance ' + ethers.utils.formatEther(balance) + ' eth';
            document.getElementById('etherBalance').innerHTML = balance;
        }).catch(console.error);

        contract = new ethers.Contract(address, abi, wallet);
        contract.balanceOf(wallet.address).then(function (balance) {
            balance = 'balance ' + ethers.utils.formatEther(balance) + ' exg';
            document.getElementById('exgBalance').innerHTML = balance;
        }).catch(console.error);
        contract.dividendsOf(wallet.address).then(function (dividends) {
            dividends = 'dividends ' + ethers.utils.formatEther(dividends) + ' eth';
            document.getElementById('exgDividends').innerHTML = dividends;
        }).catch(console.error);
    }

    function sendEther() {
        if (!wallet) {
            return alert('enter account');
        }
        var nonce = document.getElementById('accountNonce').value;
        var maxFee = document.getElementById('accountMaxGas').value;
        try {
            maxFee = ethers.utils.parseUnits(maxFee, 9);
        } catch (error) {
            return alert('incorrect max fee per gas');
        }
        var maxPriority = maxFee.div(5);

        var to = document.getElementById('etherTo').value;
        if (!ethers.utils.isAddress(to)) {
            return alert('incorrect address');
        }
        var value = document.getElementById('etherValue').value;
        try {
            value = ethers.utils.parseEther(value);
        } catch (error) {
            return alert('incorrect value');
        }
        var tx = {
            from: wallet.address,
            to: to,
            nonce: nonce,
            value: value,
            maxFeePerGas: maxFee,
            maxPriorityFeePerGas: maxPriority,
            chainId: 5,
            type: 2
        };
        provider.estimateGas(tx).then(function (gas) {
            tx.gasLimit = gas;
            return wallet.signTransaction(tx);
        }).then(function (signedTx) {
            var text = 'Transfer? Print yes to confirm.';
            if (prompt(text) !== 'yes') {
                throw ('not confirmed');
            }
            return provider.sendTransaction(signedTx);
        }).then(function (txResponse) {
            var a = document.createElement('a');
            a.target = '_blank';
            a.href = 'https://goerli.etherscan.io/tx/' + txResponse.hash;
            a.innerHTML = txResponse.hash;
            var p = document.createElement('p');
            p.appendChild(a);
            document.getElementById('logs').appendChild(p);
            txResponse.wait().then(function (response) {
                alert('tx ' + response.transactionHash + ' is confirmed!');
            }).catch(function (error) {
                console.log(error);
            });
        }).catch(function (error) {
            console.log(error);
            alert(error);
        });
    }

    function exgBuy() {
        if (!wallet) {
            return alert('enter account');
        }
        var nonce = document.getElementById('accountNonce').value;
        var maxFee = document.getElementById('accountMaxGas').value;
        try {
            maxFee = ethers.utils.parseUnits(maxFee, 9);
        } catch (error) {
            return alert('incorrect max fee per gas');
        }
        var maxPriority = maxFee.div(5);

        var value = document.getElementById('exgValue').value;
        try {
            value = ethers.utils.parseEther(value);
        } catch (error) {
            return alert('incorrect value');
        }
        var text = 'Buy? Print yes to confirm.';
        if (prompt(text) !== 'yes') {
            return alert('not confirmed');
        }
        contract.buy('0xE974e991668CDEAF98e03A2154363a8f20494909', {
            nonce: nonce,
            value: value,
            maxFeePerGas: maxFee,
            maxPriorityFeePerGas: maxPriority,
            type: 2
        }).then(function (txResponse) {
            var a = document.createElement('a');
            a.target = '_blank';
            a.href = 'https://goerli.etherscan.io/tx/' + txResponse.hash;
            a.innerHTML = txResponse.hash;
            var p = document.createElement('p');
            p.appendChild(a);
            document.getElementById('logs').appendChild(p);
            txResponse.wait().then(function (response) {
                alert('tx ' + response.transactionHash + ' is confirmed!');
            }).catch(function (error) {
                console.log(error);
            });
        }).catch(function (error) {
            console.log(error);
            alert(error);
        });
    }

    function exgWithdraw() {
        if (!wallet) {
            return alert('enter account');
        }
        var nonce = document.getElementById('accountNonce').value;
        var maxFee = document.getElementById('accountMaxGas').value;
        try {
            maxFee = ethers.utils.parseUnits(maxFee, 9);
        } catch (error) {
            return alert('incorrect max fee per gas');
        }
        var maxPriority = maxFee.div(5);

        var text = 'Withdraw? Print yes to confirm.';
        if (prompt(text) !== 'yes') {
            return alert('not confirmed');
        }
        contract.withdraw({
            nonce: nonce,
            maxFeePerGas: maxFee,
            maxPriorityFeePerGas: maxPriority,
            type: 2
        }).then(function (txResponse) {
            var a = document.createElement('a');
            a.target = '_blank';
            a.href = 'https://goerli.etherscan.io/tx/' + txResponse.hash;
            a.innerHTML = txResponse.hash;
            var p = document.createElement('p');
            p.appendChild(a);
            document.getElementById('logs').appendChild(p);
            txResponse.wait().then(function (response) {
                alert('tx ' + response.transactionHash + ' is confirmed!');
            }).catch(function (error) {
                console.log(error);
            });
        }).catch(function (error) {
            console.log(error);
            alert(error);
        });
    }

    function exgReinvest() {
        if (!wallet) {
            return alert('enter account');
        }
        var nonce = document.getElementById('accountNonce').value;
        var maxFee = document.getElementById('accountMaxGas').value;
        try {
            maxFee = ethers.utils.parseUnits(maxFee, 9);
        } catch (error) {
            return alert('incorrect max fee per gas');
        }
        var maxPriority = maxFee.div(5);

        var text = 'Reinvest? Print yes to confirm.';
        if (prompt(text) !== 'yes') {
            return alert('not confirmed');
        }
        contract.withdraw({
            nonce: nonce,
            maxFeePerGas: maxFee,
            maxPriorityFeePerGas: maxPriority
            //type: 2 test
        }).then(function (txResponse) {
            var a = document.createElement('a');
            a.target = '_blank';
            a.href = 'https://goerli.etherscan.io/tx/' + txResponse.hash;
            a.innerHTML = txResponse.hash;
            var p = document.createElement('p');
            p.appendChild(a);
            document.getElementById('logs').appendChild(p);
            txResponse.wait().then(function (response) {
                alert('tx ' + response.transactionHash + ' is confirmed!');
            }).catch(function (error) {
                console.log(error);
            });
        }).catch(function (error) {
            console.log(error);
            alert(error);
        });
    }
})();