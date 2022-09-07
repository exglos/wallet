'use strict';
(function () {
    var provider, wallet;

    window.onload = function () {
        document.getElementById('createOk').onclick = createOk;
        document.getElementById('enterOk').onclick = enterOk;
        document.getElementById('sendOk').onclick = sendOk;

        provider = ethers.getDefaultProvider(3);
    };

    function createOk() {
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

    function enterOk() {
        var password = document.getElementById('enterPassword').value;
        if (password.length < 12) {
            return alert('short password');
        }
        var checksum = ethers.utils.id(password.substr(0, password.length - 6)).substr(2, 6);
        if (checksum !== password.substr(password.length - 6)) {
            return alert('incorrect password');
        }
        wallet = new ethers.Wallet(ethers.utils.id(password));
        var a = document.createElement('a');
        a.target = '_blank';
        a.href = 'https://ropsten.etherscan.io/address/' + wallet.address;
        a.innerHTML = wallet.address;
        document.getElementById('enterAddress').innerHTML = 'address ';
        document.getElementById('enterAddress').appendChild(a);
        provider.getBalance(wallet.address).then(function (balance) {
            balance = 'balance ' + ethers.utils.formatEther(balance) + ' eth';
            document.getElementById('enterBalance').innerHTML = balance;
        });
        provider.getTransactionCount(wallet.address).then(function (nonce) {
            document.getElementById('sendNonce').value = nonce;
            document.getElementById('enterNonce').innerHTML = 'nonce ' + nonce;
        });
        provider.getFeeData().then(function (fee) {
            document.getElementById('sendFee').value = ethers.utils.formatUnits(fee.maxFeePerGas, 9);
            document.getElementById('sendPriority').value = ethers.utils.formatUnits(fee.maxPriorityFeePerGas, 9);
            fee = 'gasPrice: ' + ethers.utils.formatUnits(fee.gasPrice, 9) +
                ' gwei, maxFeePerGas: ' + ethers.utils.formatUnits(fee.maxFeePerGas, 9) +
                ' gwei, maxPriorityFeePerGas: ' + ethers.utils.formatUnits(fee.maxPriorityFeePerGas, 9) +
                ' gwei';
            document.getElementById('enterFee').innerHTML = fee;
        });
    }

    function sendOk() {
        if (!wallet) {
            return alert('enter account');
        }
        var to = document.getElementById('sendTo').value;
        if (!ethers.utils.isAddress(to)) {
            return alert('incorrect address');
        }
        var value = document.getElementById('sendValue').value;
        try {
            value = ethers.utils.parseEther(value);
        } catch (error) {
            return alert('incorrect value');
        }
        var nonce = document.getElementById('sendNonce').value;
        var fee = document.getElementById('sendFee').value;
        try {
            fee = ethers.utils.parseUnits(fee, 9);
        } catch (error) {
            return alert('incorrect max fee per gas');
        }
        var priority = document.getElementById('sendPriority').value;
        try {
            priority = ethers.utils.parseUnits(priority, 9);
        } catch (error) {
            return alert('incorrect max priority fee per gas');
        }
        var tx = {
            from: wallet.address,
            to: to,
            nonce: nonce,
            value: value,
            maxFeePerGas: fee,
            maxPriorityFeePerGas: priority,
            chainId: 3,
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
            a.href = 'https://ropsten.etherscan.io/tx/' + txResponse.hash;
            a.innerHTML = txResponse.hash;
            document.getElementById('sendTx').innerHTML = '';
            document.getElementById('sendTx').appendChild(a);
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