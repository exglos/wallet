import { ethers } from './ethers.min.js';

let Wallet;

const Password = {};
Password.generate = (extraRandom, passwordLength) => {
    let entropy = BigInt(ethers.sha256(ethers.randomBytes(40)));
    if (extraRandom) {
        entropy += BigInt(ethers.id(extraRandom));
    }

    const base62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    if (!passwordLength || passwordLength < 12) {
        passwordLength = 30;
    } else if (passwordLength > 50) {
        passwordLength = 50;
    }
    passwordLength -= 6;
    let password = '';
    for (let i = 0; i < passwordLength; i++) {
        password += base62.charAt(Number(entropy % 62n));
        entropy /= 62n;
    }
    return password + ethers.id(password).slice(2, 8);
};
Password.getWallet = (password) => {
    if (password.length < 12) {
        throw new Error('short password');
    }
    if (!password.includes(' ')) {
        const checksum = ethers.id(password.slice(0, -6)).slice(2, 8);
        if (checksum !== password.slice(-6)) {
            throw new Error('incorrect password');
        }
        password = ethers.id(password);
    } else {
        let path = null;
        if (/\d/.test(password)) {
            path = password.substr(password.lastIndexOf(' ') + 1);
            password = password.substr(0, password.length - path.length - 1);
            if (!path.startsWith('m')) {
                path = `m/44'/60'/0'/0/${Number(path) - 1}`;
            }
        }
        password = ethers.HDNodeWallet.fromPhrase(password, null, path).privateKey;
    }

    const provider = ethers.getDefaultProvider(null, {
        alchemy: 'm6nHD1aQAIbJHAYLnIMoBzMLOep-bLyC',
        infura: '-'
    });
    Wallet = new ethers.Wallet(password, provider);
    password = null;
};

const Loading = {};
Loading.show = () => {
    document.getElementById('loading').style.display = 'block';
};
Loading.hide = () => {
    document.getElementById('loading').style.display = 'none';
};

const Start = {};
Start.init = () => {
    document.getElementById('startPassword').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            Start.open();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            document.getElementById('startPasswordHint').innerHTML = '';
            document.getElementById('startPassword').value = '';
        }
    });
    document.getElementById('startPassword').addEventListener('input', () => {
        document.getElementById('startPasswordHint').innerHTML = '';
    });

    document.getElementById('startOpen').addEventListener('click', Start.open);
    document.getElementById('startCreate').addEventListener('click', Start.create);
};
Start.show = () => {
    document.getElementById('start').style.display = 'block';
};
Start.hide = () => {
    document.getElementById('startPasswordHint').innerHTML = '';
    document.getElementById('startPassword').value = '';
    document.getElementById('start').style.display = 'none';
};
Start.open = () => {
    Loading.show();
    setTimeout(() => {
        try {
            Password.getWallet(document.getElementById('startPassword').value);
            document.getElementById('startPassword').value = '';
        } catch (error) {
            document.getElementById('startPasswordHint').innerHTML = error.shortMessage || error.message || 'error';
            return Loading.hide();
        }

        Start.hide();
        Main.show();
        Loading.hide();
    }, 0);
};
Start.create = () => {
    Start.hide();
    Create.show();
};
Start.init();

const Create = {};
Create.init = () => {
    document.getElementById('createOk').addEventListener('click', Create.ok);
};
Create.show = () => {
    document.getElementById('create').style.display = 'block';
    document.getElementById('createPassword').innerHTML = 'generating...';
    setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const random = params.get('passwordRandom');
        const length = params.get('passwordLength');
        document.getElementById('createPassword').innerHTML = Password.generate(random, length);
    }, 0);
};
Create.hide = () => {
    document.getElementById('create').style.display = 'none';
    document.getElementById('createPassword').innerHTML = '';
};
Create.ok = () => {
    Create.hide();
    Start.show();
};
Create.init();

const Main = {};
Main.init = () => {
    document.getElementById('headerAccount').innerHTML = '';
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = Explorer.getAddressUrl(Wallet.address);
    a.innerHTML = Wallet.address;
    document.getElementById('headerAccount').appendChild(a);
    Main.lookupAddress();

    document.getElementById('headerEther').addEventListener('click', Ether.show);
    document.getElementById('headerTokens').addEventListener('click', Tokens.show);
    document.getElementById('headerExglos').addEventListener('click', Exglos.show);
    document.getElementById('headerPlus').addEventListener('click', Plus.show);

    Ether.show();
};
Main.show = () => {
    if (!Main.initDone) {
        Main.init();
        Main.initDone = true;
    }

    document.getElementById('main').style.display = 'block';
};
Main.hide = () => {
    document.getElementById('main').style.display = 'none';
};
Main.lookupAddress = async () => {
    try {
        let name = await Wallet.provider.lookupAddress(Wallet.address);
        if (name) {
            document.getElementById('headerAccount').childNodes[0].innerHTML = `${name} ${Wallet.address}`;
            document.title = `${name} | ${document.title}`;
        }
    } catch (error) {
        console.error(error);
    }
};
Main.setBalance = (balance) => {
    document.getElementById('headerBalance').innerHTML = `${ethers.formatEther(balance)} ETH`;
};
Main.switchTab = (tab) => {
    if (Main.tab) {
        Main.tab.hide();
    }
    Main.tab = tab;
};

const Ether = {};
Ether.init = () => {
    const params = new URLSearchParams(window.location.search);
    const address = params.get('etherAddress');
    if (address) {
        document.getElementById('etherAddress').value = address;
    }
    document.getElementById('etherAddress').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            Ether.continue();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            document.getElementById('etherAddressHint').innerHTML = '';
            document.getElementById('etherAddress').value = '';
        }
    });
    document.getElementById('etherAddress').addEventListener('input', () => {
        document.getElementById('etherAddressHint').innerHTML = '';
    });

    const value = params.get('etherValue');
    if (value) {
        document.getElementById('etherValue').value = value;
    }
    document.getElementById('etherValue').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            Ether.continue();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            document.getElementById('etherValueHint').innerHTML = '';
            document.getElementById('etherValue').value = '';
        }
    });
    document.getElementById('etherValue').addEventListener('input', () => {
        document.getElementById('etherValueHint').innerHTML = '';
    });

    document.getElementById('etherContinue').addEventListener('click', Ether.continue);

    setInterval(Ether.updateBalance, 30000);
    Ether.updateBalance();
};
Ether.show = () => {
    if (!Ether.initDone) {
        Ether.init();
        Ether.initDone = true;
    }

    Main.switchTab(Ether);
    document.getElementById('headerEther').className = 'active';
    document.getElementById('ether').style.display = 'block';
};
Ether.hide = () => {
    document.getElementById('headerEther').className = '';
    document.getElementById('ether').style.display = 'none';
};
Ether.updateBalance = async () => {
    try {
        const balance = await Wallet.provider.getBalance(Wallet);
        if (Ether.balance !== balance) {
            Ether.balance = balance;
            Main.setBalance(balance);
            document.getElementById('etherBalance').innerHTML = `${ethers.formatEther(Ether.balance)} ETH`;
        }
    } catch (error) {
        console.error(error);
    }
};
Ether.continue = () => {
    Loading.show();
    setTimeout(async () => {
        document.getElementById('etherAddressHint').innerHTML = '';
        document.getElementById('etherValueHint').innerHTML = '';
        let enteredAddress, address, value;
        try {
            enteredAddress = document.getElementById('etherAddress').value;
            if (!enteredAddress) {
                throw new Error('enter address or ens');
            }
            address = await ethers.resolveAddress(enteredAddress, Wallet);
        } catch (error) {
            document.getElementById('etherAddressHint').innerHTML = error.shortMessage || error.message || 'error';
            document.getElementById('etherAddress').focus();
            return Loading.hide();
        }
        try {
            value = document.getElementById('etherValue').value;
            if (!value) {
                throw new Error('enter the value');
            }
            value = ethers.parseEther(value);
            if (value < 0n) {
                throw new Error('enter positive number');
            }
            while (Ether.balance === undefined) {
                await new Promise((resolve) => setTimeout(resolve, 300));
            }
            if (Ether.balance === 0n) {
                throw new Error('zero balance');
            } else if (value > Ether.balance) {
                throw new Error('too big value');
            }
        } catch (error) {
            document.getElementById('etherValueHint').innerHTML = error.shortMessage || error.message || 'error';
            document.getElementById('etherValue').focus();
            return Loading.hide();
        }

        Tx.description =
            `send ${ethers.formatEther(value)} ETH to ` +
            (enteredAddress.startsWith('0x') ? enteredAddress : `${enteredAddress} (${address})`);
        Tx.request = { to: address, value: value };

        Tx.show();
        Loading.hide();
    }, 0);
};
Ether.addTx = (div) => {
    document.getElementById('etherAddress').value = '';
    document.getElementById('etherValue').value = '';

    const container = document.getElementById('etherNewTxs');
    container.insertBefore(div, container.firstChild);
};

const Tokens = {
    list: [{ address: '0x3dDee7CdF8D71490b518b1E6e6f2198433636903', name: 'Exglos', symbol: 'EXG', decimals: 18 }],
    n: 0
};
Tokens.init = () => {
    document.getElementById('tokensMenu0').addEventListener('click', Tokens.select);
    document.getElementById('tokensMenuPlus').addEventListener('click', Tokens.plus);

    const params = new URLSearchParams(window.location.search);
    const address = params.get('tokenAddress');
    if (address) {
        document.getElementById('tokensAddress').value = address;
    }
    document.getElementById('tokensAddress').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            Tokens.continue();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            document.getElementById('tokensAddressHint').innerHTML = '';
            document.getElementById('tokensAddress').value = '';
        }
    });
    document.getElementById('tokensAddress').addEventListener('input', () => {
        document.getElementById('tokensAddressHint').innerHTML = '';
    });

    const value = params.get('tokenValue');
    if (value) {
        document.getElementById('tokensValue').value = value;
    }
    document.getElementById('tokensValue').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            Tokens.continue();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            document.getElementById('tokensValueHint').innerHTML = '';
            document.getElementById('tokensValue').value = '';
        }
    });
    document.getElementById('tokensValue').addEventListener('input', () => {
        document.getElementById('tokensValueHint').innerHTML = '';
    });

    document.getElementById('tokensContinue').addEventListener('click', Tokens.continue);

    document.getElementById('tokensContract').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            Tokens.add();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            document.getElementById('tokensContractHint').innerHTML = '';
            document.getElementById('tokensContract').value = '';
        }
    });
    document.getElementById('tokensContract').addEventListener('input', () => {
        document.getElementById('tokensContractHint').innerHTML = '';
    });
    document.getElementById('tokensAdd').addEventListener('click', Tokens.add);

    Tokens.startUpdateExglosBalance();

    const contract = params.get('tokenContract');
    if (contract) {
        Tokens.plus();
        document.getElementById('tokensContract').value = contract;
        Tokens.add();
    } else {
        Tokens.select();
    }
};
Tokens.show = () => {
    if (!Tokens.initDone) {
        Tokens.init();
        Tokens.initDone = true;
    }

    Main.switchTab(Tokens);
    document.getElementById('headerTokens').className = 'active';
    document.getElementById('tokens').style.display = 'block';
};
Tokens.hide = () => {
    document.getElementById('headerTokens').className = '';
    document.getElementById('tokens').style.display = 'none';
};
Tokens.select = (event) => {
    Tokens.n = event && event.target ? Number(event.target.id.substr(10)) : Tokens.list.length - 1;
    for (let i = Tokens.list.length - 1; i >= 0; i--) {
        document.getElementById(`tokensMenu${i}`).className = '';
    }
    document.getElementById(`tokensMenu${Tokens.n}`).className = 'active';
    document.getElementById('tokensMenuPlus').className = '';
    document.getElementById('tokensSelected').style.display = 'block';
    document.getElementById('tokensPlus').style.display = 'none';

    Tokens.displayParams();
};
Tokens.plus = () => {
    for (let i = Tokens.list.length - 1; i >= 0; i--) {
        document.getElementById(`tokensMenu${i}`).className = '';
    }
    document.getElementById('tokensMenuPlus').className = 'active';
    document.getElementById('tokensSelected').style.display = 'none';
    document.getElementById('tokensPlus').style.display = 'block';
};
Tokens.add = () => {
    Loading.show();
    setTimeout(async () => {
        document.getElementById('tokensContractHint').innerHTML = '';
        let contract;
        try {
            contract = document.getElementById('tokensContract').value;
            if (!contract) {
                throw new Error('enter address or ens');
            }
            contract = await ethers.resolveAddress(contract, Wallet);
        } catch (error) {
            document.getElementById('tokensContractHint').innerHTML = error.shortMessage || error.message || 'error';
            document.getElementById('tokensContract').focus();
            return Loading.hide();
        }

        for (let i = Tokens.list.length - 1; i >= 0; i--) {
            if (Tokens.list[i].address === contract) {
                document.getElementById(`tokensMenu${i}`).click();
                document.getElementById('tokensContract').value = '';
                return Loading.hide();
            }
        }

        const n = Tokens.list.push({ address: contract }) - 1;
        const button = document.createElement('button');
        button.id = `tokensMenu${n}`;
        button.addEventListener('click', Tokens.select);
        button.innerHTML = contract.substr(0, 8);
        const div = document.createElement('div');
        div.appendChild(button);
        const lastItem = document.getElementById('tokensMenuPlus').parentElement;
        document.getElementById('tokensMenu').insertBefore(div, lastItem);
        document.getElementById('tokensContract').value = '';
        button.click();
        Loading.hide();

        Tokens.loadParams(n);
        setInterval(() => Tokens.updateBalance(n), 30000);
        Tokens.updateBalance(n);
    }, 0);
};
Tokens.loadParams = (n) => {
    const token = Tokens.list[n];
    const abi = [
        'function decimals() view returns (uint8)',
        'function name() view returns (string)',
        'function symbol() view returns (string)'
    ];
    const contract = new ethers.Contract(token.address, abi, Wallet);
    setTimeout(async () => {
        try {
            token.decimals = await contract.decimals();
            Tokens.displayParams();
        } catch (error) {
            console.error(error);
        }
    }, 0);
    setTimeout(async () => {
        try {
            token.symbol = await contract.symbol();
            document.getElementById(`tokensMenu${n}`).innerHTML = token.symbol.substr(0, 8);
            Tokens.displayParams();
        } catch (error) {
            console.error(error);
        }
    }, 0);
    setTimeout(async () => {
        try {
            token.name = await contract.name();
            Tokens.displayParams();
        } catch (error) {
            console.error(error);
        }
    }, 0);
};
Tokens.displayParams = () => {
    const token = Tokens.list[Tokens.n];
    document.getElementById('tokensName').innerHTML = '';
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = Explorer.getAddressUrl(token.address);
    a.innerHTML = token.name ? token.name : token.address;
    document.getElementById('tokensName').appendChild(a);

    let balance;
    if (!token.balance && token.balance !== 0n) {
        balance = 'loading balance...';
    } else {
        balance = token.decimals ? ethers.formatUnits(token.balance, token.decimals) : `${token.balance} no decimals`;
        if (token.symbol) {
            balance += ` ${token.symbol}`;
        }
    }
    document.getElementById('tokensBalance').innerHTML = balance;

    document.getElementById('tokensValueSpan').innerHTML = 'value to send' + (token.symbol ? `, ${token.symbol}` : '');
};
Tokens.startUpdateExglosBalance = () => {
    if (Tokens.updateExglosBalanceStarted) {
        return;
    }
    Tokens.updateExglosBalanceStarted = true;
    setInterval(Tokens.updateBalance, 30000);
    Tokens.updateBalance();
};
Tokens.updateBalance = async (n) => {
    n = n || 0;
    const token = Tokens.list[n];
    try {
        const abi = ['function balanceOf(address) view returns (uint256)'];
        const contract = new ethers.Contract(token.address, abi, Wallet);
        const balance = await contract.balanceOf(Wallet);
        if (token.balance !== balance) {
            token.balance = balance;
            Tokens.displayParams();
            if (n === 0) {
                Exglos.setBalance(balance);
            }
        }
    } catch (error) {
        if (error.code === 'BAD_DATA') {
            if (token.balance !== 0n) {
                token.balance = 0n;
                Tokens.displayParams();
            }
        } else {
            console.error(error);
        }
    }
};
Tokens.continue = () => {
    Loading.show();
    setTimeout(async () => {
        document.getElementById('tokensAddressHint').innerHTML = '';
        document.getElementById('tokensValueHint').innerHTML = '';
        const token = Tokens.list[Tokens.n];
        let enteredAddress, address, value;
        try {
            enteredAddress = document.getElementById('tokensAddress').value;
            if (!enteredAddress) {
                throw new Error('enter address or ens');
            }
            address = await ethers.resolveAddress(enteredAddress, Wallet);
        } catch (error) {
            document.getElementById('tokensAddressHint').innerHTML = error.shortMessage || error.message || 'error';
            document.getElementById('tokensAddress').focus();
            return Loading.hide();
        }
        try {
            value = document.getElementById('tokensValue').value;
            if (!value) {
                throw new Error('enter the value');
            }
            value = ethers.parseUnits(value, token.decimals || 0);
            if (value < 0n) {
                throw new Error('enter positive number');
            }
            while (Ether.balance === undefined) {
                await new Promise((resolve) => setTimeout(resolve, 300));
            }
            if (Ether.balance === 0n) {
                throw new Error('zero eth balance');
            }
            while (token.balance === undefined) {
                await new Promise((resolve) => setTimeout(resolve, 300));
            }
            if (value > token.balance) {
                document.getElementById('tokensValue').value = ethers.formatUnits(token.balance, token.decimals || 0);
                throw new Error('too big value');
            }
        } catch (error) {
            document.getElementById('tokensValueHint').innerHTML = error.shortMessage || error.message || 'error';
            document.getElementById('tokensValue').focus();
            return Loading.hide();
        }

        Tx.description =
            'send ' +
            (token.decimals ? ethers.formatUnits(value, token.decimals) : `${value} no decimals`) +
            ` ${token.symbol || 'tokens'} to ` +
            (enteredAddress.startsWith('0x') ? enteredAddress : `${enteredAddress} (${address})`);
        const abi = ['function transfer(address, uint256)'];
        const data = new ethers.Interface(abi).encodeFunctionData('transfer', [address, value]);
        Tx.request = { to: token.address, data: data };

        Tx.show();
        Loading.hide();
    }, 0);
};
Tokens.addTx = (div) => {
    document.getElementById('tokensAddress').value = '';
    document.getElementById('tokensValue').value = '';

    const container = document.getElementById('tokensNewTxs');
    container.insertBefore(div, container.firstChild);
};

const Exglos = {};
Exglos.init = () => {
    const value = new URLSearchParams(window.location.search).get('exglosValue');
    if (value) {
        document.getElementById('exglosEth').value = value;
        Exglos.setExg();
    }
    document.getElementById('exglosEth').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            Exglos.buy();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            document.getElementById('exglosEth').value = '';
            document.getElementById('exglosExg').value = '';
            document.getElementById('exglosError').innerHTML = '';
        }
    });
    document.getElementById('exglosEth').addEventListener('input', Exglos.setExg);

    document.getElementById('exglosExg').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            Exglos.buy();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            document.getElementById('exglosEth').value = '';
            document.getElementById('exglosExg').value = '';
            document.getElementById('exglosError').innerHTML = '';
        }
    });
    document.getElementById('exglosExg').addEventListener('input', Exglos.setEth);

    document.getElementById('exglosBuy').addEventListener('click', Exglos.buy);
    document.getElementById('exglosReinvest').addEventListener('click', Exglos.reinvest);
    document.getElementById('exglosWithdraw').addEventListener('click', Exglos.withdraw);

    Tokens.startUpdateExglosBalance();
    setInterval(Exglos.updateDivs, 60000);
    Exglos.updateDivs();
};
Exglos.show = () => {
    if (!Exglos.initDone) {
        Exglos.init();
        Exglos.initDone = true;
    }

    Main.switchTab(Exglos);
    document.getElementById('headerExglos').className = 'active';
    document.getElementById('exglos').style.display = 'block';
};
Exglos.hide = () => {
    document.getElementById('headerExglos').className = '';
    document.getElementById('exglos').style.display = 'none';
};
Exglos.setEth = () => {
    document.getElementById('exglosEth').value = '';
    document.getElementById('exglosError').innerHTML = '';
    let exg = document.getElementById('exglosExg').value;
    if (exg === '') {
        return;
    }
    try {
        exg = ethers.parseEther(exg);
        if (exg < 0n) {
            throw new Error('non-positive value');
        }
    } catch (error) {
        document.getElementById('exglosError').innerHTML = error.shortMessage || error.message || 'error';
        return;
    }
    document.getElementById('exglosEth').value = ethers.formatEther((exg * 16n) / 1000n);
};
Exglos.setExg = () => {
    document.getElementById('exglosExg').value = '';
    document.getElementById('exglosError').innerHTML = '';
    let eth = document.getElementById('exglosEth').value;
    if (eth === '') {
        return;
    }
    try {
        eth = ethers.parseEther(eth);
        if (eth < 0n) {
            throw new Error('non-positive value');
        }
    } catch (error) {
        document.getElementById('exglosError').innerHTML = error.shortMessage || error.message || 'error';
        return;
    }
    document.getElementById('exglosExg').value = ethers.formatEther((eth * 1000n) / 16n);
};
Exglos.setBalance = (balance) => {
    document.getElementById('exglosBalance').innerHTML = `${ethers.formatEther(balance)} exg`;

    if (balance > 1000000000n) {
        document.getElementById('exglosRef').innerHTML = `ref link: wallet.exglos.com?ref=${Wallet.address}`;
    } else {
        document.getElementById('exglosRef').innerHTML = '';
    }
};
Exglos.updateDivs = async () => {
    try {
        const abi = ['function dividendsOf(address) view returns (uint256)'];
        const contract = new ethers.Contract(Tokens.list[0].address, abi, Wallet);
        const divs = await contract.dividendsOf(Wallet);
        if (Exglos.divs !== divs) {
            Exglos.divs = divs;
            document.getElementById('exglosButtons').style.display = divs > 1n ? 'block' : 'none';
            document.getElementById('exglosDivs').innerHTML = `dividends ${ethers.formatEther(divs)} eth`;
        }
    } catch (error) {
        console.log(error);
    }
};
Exglos.buy = () => {
    Loading.show();
    setTimeout(async () => {
        document.getElementById('exglosError').innerHTML = '';
        let value;
        try {
            value = document.getElementById('exglosEth').value;
            if (!value) {
                throw new Error('enter the value');
            }
            value = ethers.parseEther(value);
            if (value < 0n) {
                throw new Error('enter positive number');
            }
            while (Ether.balance === undefined) {
                await new Promise((resolve) => setTimeout(resolve, 300));
            }
            if (Ether.balance === 0n) {
                throw new Error('zero eth balance');
            }
            if (value > Ether.balance) {
                throw new Error('too big value');
            }
        } catch (error) {
            document.getElementById('exglosError').innerHTML = error.shortMessage || error.message || 'error';
            document.getElementById('exglosEth').focus();
            return Loading.hide();
        }

        let ref = new URLSearchParams(window.location.search).get('ref');
        try {
            ref = await ethers.resolveAddress(ref, Wallet);
        } catch (error) {
            ref = ethers.ZeroAddress;
        }

        Tx.description = `buy ${document.getElementById('exglosExg').value} exg for ${ethers.formatEther(value)} eth`;
        const abi = ['function buy(address) payable'];
        const data = new ethers.Interface(abi).encodeFunctionData('buy', [ref]);
        Tx.request = { to: Tokens.list[0].address, data: data, value: value };

        Tx.show();
        Loading.hide();
    }, 0);
};
Exglos.reinvest = () => {
    Loading.show();
    setTimeout(async () => {
        document.getElementById('exglosError').innerHTML = '';
        try {
            while (Ether.balance === undefined) {
                await new Promise((resolve) => setTimeout(resolve, 300));
            }
            if (Ether.balance === 0n) {
                throw new Error('zero eth balance');
            }
            while (Exglos.divs === undefined) {
                await new Promise((resolve) => setTimeout(resolve, 300));
            }
            if (Exglos.divs <= 1n) {
                throw new Error('zero divs');
            }
        } catch (error) {
            document.getElementById('exglosError').innerHTML = error.shortMessage || error.message || 'error';
            return Loading.hide();
        }

        Tx.description = `reinvest ${ethers.formatEther(Exglos.divs)} eth`;
        const abi = ['function reinvest()'];
        const data = new ethers.Interface(abi).encodeFunctionData('reinvest');
        Tx.request = { to: Tokens.list[0].address, data: data };

        Tx.show();
        Loading.hide();
    }, 0);
};
Exglos.withdraw = () => {
    Loading.show();
    setTimeout(async () => {
        document.getElementById('exglosError').innerHTML = '';
        try {
            while (Ether.balance === undefined) {
                await new Promise((resolve) => setTimeout(resolve, 300));
            }
            if (Ether.balance === 0n) {
                throw new Error('zero eth balance');
            }
            while (Exglos.divs === undefined) {
                await new Promise((resolve) => setTimeout(resolve, 300));
            }
            if (Exglos.divs <= 1n) {
                throw new Error('zero divs');
            }
        } catch (error) {
            document.getElementById('exglosError').innerHTML = error.shortMessage || error.message || 'error';
            return Loading.hide();
        }

        Tx.description = `withdraw ${ethers.formatEther(Exglos.divs)} eth`;
        const abi = ['function withdraw()'];
        const data = new ethers.Interface(abi).encodeFunctionData('withdraw');
        Tx.request = { to: Tokens.list[0].address, data: data };

        Tx.show();
        Loading.hide();
    }, 0);
};
Exglos.addTx = (div) => {
    document.getElementById('exglosEth').value = '';
    document.getElementById('exglosExg').value = '';

    const container = document.getElementById('exglosNewTxs');
    container.insertBefore(div, container.firstChild);
};

const Plus = {};
Plus.init = () => {
    const params = new URLSearchParams(window.location.search);
    const contract = params.get('plusContract');
    if (contract) {
        document.getElementById('plusContract').value = contract;
    }
    document.getElementById('plusContract').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            Plus.continue();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            document.getElementById('plusContractHint').innerHTML = '';
            document.getElementById('plusContract').value = '';
        }
    });
    document.getElementById('plusContract').addEventListener('input', () => {
        document.getElementById('plusContractHint').innerHTML = '';
    });

    const funct = params.get('plusFunction');
    if (funct) {
        document.getElementById('plusFunction').value = funct;
        Plus.initArgs(params);
    }
    document.getElementById('plusFunction').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            Plus.continue();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            document.getElementById('plusFunctionHint').innerHTML = '';
            document.getElementById('plusFunction').value = '';
            document.getElementById('plusArgs').innerHTML = '';
            Plus.fragment = null;
        }
    });
    document.getElementById('plusFunction').addEventListener('input', () => {
        document.getElementById('plusFunctionHint').innerHTML = '';
        document.getElementById('plusArgs').innerHTML = '';
        Plus.fragment = null;
    });

    document.getElementById('plusContinue').addEventListener('click', Plus.continue);
};
Plus.show = () => {
    if (!Plus.initDone) {
        Plus.init();
        Plus.initDone = true;
    }

    Main.switchTab(Plus);
    document.getElementById('headerPlus').className = 'active';
    document.getElementById('plus').style.display = 'block';
};
Plus.hide = () => {
    document.getElementById('headerPlus').className = '';
    document.getElementById('plus').style.display = 'none';
};
Plus.initArgs = (params) => {
    Loading.show();
    setTimeout(() => {
        document.getElementById('plusFunctionHint').innerHTML = '';
        let fragment;
        try {
            fragment = document.getElementById('plusFunction').value;
            if (!fragment) {
                throw new Error('enter function');
            }
            fragment = ethers.Fragment.from(`${fragment.startsWith('function ') ? '' : 'function '}${fragment}`);
            if (fragment.type !== 'function') {
                throw new Error('not a function');
            }
            Plus.fragment = fragment;
        } catch (error) {
            document.getElementById('plusFunctionHint').innerHTML = error.shortMessage || error.message || 'error';
            document.getElementById('plusFunction').focus();
            return Loading.hide();
        }

        const container = document.getElementById('plusArgs');
        container.innerHTML = '';
        for (let i = 0; i < fragment.inputs.length; i++) {
            const name = `${i + 1} ${fragment.inputs[i].type} ${fragment.inputs[i].name}`;
            container.appendChild(Plus.initArg(i, name, params ? params.get(`plusArg${i}`) : ``));
        }
        if (fragment.payable) {
            container.appendChild(Plus.initArg(-1, 'value, eth', params ? params.get('plusValue') : ''));
        }
        Loading.hide();
    }, 0);
};
Plus.initArg = (i, name, value) => {
    const label = document.createElement('label');
    const span = document.createElement('span');
    span.innerHTML = name;
    label.appendChild(span);
    const hint = document.createElement('span');
    hint.className = 'hint';
    hint.id = i === -1 ? `plusValueHint` : `plus${i}Hint`;
    label.appendChild(hint);
    const input = document.createElement('input');
    input.type = 'text';
    input.id = i === -1 ? `plusValue` : `plus${i}`;
    input.value = value;
    input.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            Plus.continue();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            hint.innerHTML = '';
            input.value = '';
        }
    });
    input.addEventListener('input', () => {
        hint.innerHTML = '';
    });
    label.appendChild(input);
    return label;
};
Plus.continue = () => {
    if (!Plus.fragment) {
        return Plus.initArgs();
    }
    Loading.show();
    setTimeout(async () => {
        document.getElementById('plusContractHint').innerHTML = '';
        document.getElementById('plusFunctionHint').innerHTML = '';
        for (let i = 0; i < Plus.fragment.inputs.length; i++) {
            document.getElementById(`plus${i}Hint`).innerHTML = '';
        }
        if (Plus.fragment.payable) {
            document.getElementById('plusValueHint').innerHTML = '';
        }

        let contract;
        try {
            contract = document.getElementById('plusContract').value;
            if (!contract) {
                throw new Error('enter address or ens');
            }
            contract = await ethers.resolveAddress(contract, Wallet);
        } catch (error) {
            document.getElementById('plusContractHint').innerHTML = error.shortMessage || error.message || 'error';
            document.getElementById('plusContract').focus();
            return Loading.hide();
        }

        let args = [];
        for (let i = 0; i < Plus.fragment.inputs.length; i++) {
            let arg;
            try {
                arg = document.getElementById(`plus${i}`).value;
                if (!arg) {
                    throw new Error('enter the value');
                }
                if (Plus.fragment.inputs[i].type === 'address') {
                    arg = await ethers.resolveAddress(arg, Wallet);
                } else if (Plus.fragment.inputs[i].type.includes('int')) {
                    arg = ethers.parseUnits(arg, 0);
                } else if (Plus.fragment.inputs[i].type.includes('bytes')) {
                    if (!ethers.isBytesLike(arg)) {
                        throw new Error('not a bytes');
                    }
                }
            } catch (error) {
                document.getElementById(`plus${i}Hint`).innerHTML = error.shortMessage || error.message || 'error';
                document.getElementById(`plus${i}`).focus();
                return Loading.hide();
            }
            args[i] = arg;
        }

        let data;
        try {
            data = new ethers.Interface([Plus.fragment]).encodeFunctionData(Plus.fragment.name, args);
            while (Ether.balance === undefined) {
                await new Promise((resolve) => setTimeout(resolve, 300));
            }
            if (Ether.balance === 0n) {
                throw new Error('zero eth balance');
            }
        } catch (error) {
            document.getElementById('plusFunctionHint').innerHTML = error.shortMessage || error.message || 'error';
            return Loading.hide();
        }

        let value = 0n;
        if (Plus.fragment.payable) {
            try {
                value = document.getElementById('plusValue').value;
                if (!value) {
                    throw new Error('enter the value');
                }
                value = ethers.parseEther(value);
                if (value < 0n) {
                    throw new Error('enter positive number');
                }
                if (value > Ether.balance) {
                    throw new Error('too big value');
                }
            } catch (error) {
                document.getElementById('plusValueHint').innerHTML = error.shortMessage || error.message || 'error';
                document.getElementById('plusValue').focus();
                return Loading.hide();
            }
        }

        Tx.description = `${Plus.fragment.name}(${args}) ${ethers.formatEther(value)} eth`;
        Tx.request = { to: contract, data: data, value: value };

        Tx.show();
        Loading.hide();
    }, 0);
};
Plus.addTx = (div) => {
    document.getElementById('plusContract').value = '';
    document.getElementById('plusFunction').value = '';
    document.getElementById('plusArgs').innerHTML = '';
    Plus.fragment = null;

    const container = document.getElementById('plusNewTxs');
    container.insertBefore(div, container.firstChild);
};

const Tx = {}; // Tx.request = {to, data, value, nonce, gasLimit, maxPriorityFeePerGas, maxFeePerGas}
Tx.init = () => {
    document.getElementById('txNonce').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            Tx.confirm();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            document.getElementById('txNonce').value = '';
            document.getElementById('txError').innerHTML = '';
        }
    });
    document.getElementById('txNonce').addEventListener('input', () => {
        document.getElementById('txError').innerHTML = '';
    });

    document.getElementById('txPriority').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            Tx.confirm();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            document.getElementById('txPriority').value = '';
            document.getElementById('txBalance').innerHTML = '';
            document.getElementById('txError').innerHTML = '';
        }
    });
    document.getElementById('txPriority').addEventListener('input', Tx.displayBalance);

    document.getElementById('txMax').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            Tx.confirm();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            document.getElementById('txMax').value = '';
            document.getElementById('txBalance').innerHTML = '';
            document.getElementById('txError').innerHTML = '';
        }
    });
    document.getElementById('txMax').addEventListener('input', Tx.displayBalance);

    document.getElementById('txGas').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            Tx.confirm();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            document.getElementById('txGas').value = '';
            document.getElementById('txBalance').innerHTML = '';
            document.getElementById('txError').innerHTML = '';
        }
    });
    document.getElementById('txGas').addEventListener('input', Tx.displayBalance);

    document.getElementById('txCancel').addEventListener('click', Tx.hide);
    document.getElementById('txConfirm').addEventListener('click', Tx.confirm);
};
Tx.show = () => {
    if (!Tx.initDone) {
        Tx.init();
        Tx.initDone = true;
    }
    Main.hide();
    document.getElementById('tx').style.display = 'block';

    document.getElementById('txDescription').innerHTML = Tx.description;
    Tx.getNonce();
    Tx.getFeeData();
    Tx.estimateGas();
};
Tx.hide = () => {
    Main.show();
    document.getElementById('tx').style.display = 'none';
    document.getElementById('txDescription').innerHTML = '';
    document.getElementById('txNonce').value = '';
    document.getElementById('txNonce').placeholder = '';
    document.getElementById('txPriority').value = '';
    document.getElementById('txPriority').placeholder = '';
    document.getElementById('txMax').value = '';
    document.getElementById('txMax').placeholder = '';
    document.getElementById('txGas').value = '';
    document.getElementById('txGas').placeholder = '';
    document.getElementById('txBalance').innerHTML = '';
    document.getElementById('txError').innerHTML = '';

    Tx.description = null;
    Tx.request = null;
};
Tx.getNonce = async () => {
    try {
        const nonce = await Wallet.provider.getTransactionCount(Wallet);
        if (!Tx.request) {
            return;
        }
        Tx.request.nonce = nonce;
        document.getElementById('txNonce').placeholder = nonce;
        if (document.getElementById('txNonce').value === '') {
            document.getElementById('txNonce').value = nonce;
        }
    } catch (error) {
        console.error(error);
    }
};
Tx.getFeeData = async () => {
    try {
        const feeData = await Wallet.provider.getFeeData();
        if (!Tx.request) {
            return;
        }
        Tx.request.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
        const priority = ethers.formatUnits(feeData.maxPriorityFeePerGas, 9);
        document.getElementById('txPriority').placeholder = priority;
        if (document.getElementById('txPriority').value === '') {
            document.getElementById('txPriority').value = priority;
        }
        Tx.request.maxFeePerGas = feeData.maxFeePerGas;
        const max = ethers.formatUnits(feeData.maxFeePerGas, 9);
        document.getElementById('txMax').placeholder = max;
        if (document.getElementById('txMax').value === '') {
            document.getElementById('txMax').value = max;
        }

        Tx.displayBalance();
    } catch (error) {
        console.error(error);
    }
};
Tx.estimateGas = async () => {
    try {
        const gas = await Wallet.estimateGas(Tx.request);
        if (!Tx.request) {
            return;
        }
        Tx.request.gasLimit = gas;
        document.getElementById('txGas').placeholder = Number(gas);
        if (document.getElementById('txGas').value === '') {
            document.getElementById('txGas').value = Number(gas);
        }

        Tx.displayBalance();
    } catch (error) {
        let message = 'reverted ';
        if (error.message) {
            let i = error.message.indexOf('shortMessage') + 14;
            message += error.message.slice(i, error.message.indexOf(',', i) - 2);
        }
        document.getElementById('txError').innerHTML = message;
        console.error(error);
    }
};
Tx.displayBalance = () => {
    document.getElementById('txBalance').innerHTML = '';
    if (!Tx.request) {
        return;
    }
    let max = document.getElementById('txMax').value;
    let gas = document.getElementById('txGas').value;
    try {
        max = ethers.parseUnits(max, 9);
        gas = ethers.parseUnits(gas, 0);
    } catch (error) {
        return;
    }
    if (max <= 0 || gas <= 0) {
        return;
    }
    gas = max * gas;

    let balance = Ether.balance;
    let display = `ETH ${ethers.formatEther(Ether.balance)}`;
    if (Tx.request.value && Tx.request.to !== Wallet.address) {
        balance -= Tx.request.value;
        display += `<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- ${ethers.formatEther(Tx.request.value)}`;
    }
    balance -= gas;
    display += `<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- ${ethers.formatEther(gas)}`;
    display += `<br />&nbsp;&nbsp;&nbsp;= ${ethers.formatEther(balance)}`;
    document.getElementById('txBalance').innerHTML = display;
};
Tx.confirm = () => {
    Loading.show();
    setTimeout(async () => {
        document.getElementById('txError').innerHTML = '';
        try {
            let nonce = document.getElementById('txNonce').value;
            if (nonce) {
                nonce = Number(nonce);
                if (isNaN(nonce) || nonce < 0) {
                    document.getElementById('txNonce').focus();
                    throw new Error('enter non-negative nonce');
                }
                Tx.request.nonce = nonce;
            }
            let priority = document.getElementById('txPriority').value;
            if (priority) {
                priority = ethers.parseUnits(priority, 9);
                if (priority < 0n) {
                    throw new Error('enter positive priority gas price');
                }
                Tx.request.maxPriorityFeePerGas = priority;
            }
            let max = document.getElementById('txMax').value;
            if (max) {
                max = ethers.parseUnits(max, 9);
                if (max <= 0n) {
                    throw new Error('enter positive max gas price');
                }
                Tx.request.maxFeePerGas = max;
            }
            let gas = document.getElementById('txGas').value;
            if (gas) {
                gas = ethers.parseUnits(gas, 0);
                if (gas < 21000n) {
                    throw new Error('enter gas > 21000');
                }
                Tx.request.gasLimit = gas;
            }

            if (prompt('print yes to confirm') !== 'yes') {
                throw new Error('not confirmed');
            }

            const txResponse = await Wallet.sendTransaction(Tx.request);

            Main.tab.addTx(Tx.createNewTxDiv(Tx.description, txResponse.hash, txResponse.nonce));
            Tx.hide();
            Loading.hide();
        } catch (error) {
            document.getElementById('txError').innerHTML = error.shortMessage || error.message || 'error';
            return Loading.hide();
        }
    }, 0);
};
Tx.createNewTxDiv = (description, hash, nonce) => {
    const div = document.createElement('div');
    div.className = 'newTxs';
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = Explorer.getTxUrl(hash);
    a.innerHTML = description;
    div.appendChild(a);
    const p = document.createElement('p');
    p.innerHTML = 'pending...';
    div.appendChild(p);

    const interval = setInterval(async () => {
        try {
            const txReceipt = await Wallet.provider.getTransactionReceipt(hash);
            if (txReceipt) {
                if (txReceipt.status !== 1) {
                    p.innerHTML = 'failed';
                    return clearInterval(interval);
                }
                const n = await txReceipt.confirmations();
                if (n < 11) {
                    p.innerHTML = `${n} confirmation${n > 1 ? 's' : ''}`;
                } else {
                    p.innerHTML = `> 10 confirmations`;
                    clearInterval(interval);
                }
            } else {
                const txCount = await Wallet.provider.getTransactionCount(Wallet);
                if (txCount > nonce) {
                    p.innerHTML = 'replaced';
                    clearInterval(interval);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }, 10000);

    return div;
};

const Explorer = {
    getAddressUrl: (address) => `https://etherscan.io/address/${address}`,
    getTxUrl: (tx) => `https://etherscan.io/tx/${tx}`
};
