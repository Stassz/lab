// Використовуємо localStorage для зберігання клієнтів
if (!localStorage.getItem('clients')) {
    localStorage.setItem('clients', JSON.stringify([]));
}

function getClients() {
    return JSON.parse(localStorage.getItem('clients'));
}

function setClients(clients) {
    localStorage.setItem('clients', JSON.stringify(clients));
}

// Виведення повідомлень
function showMessage(message, isError = false) {
    const messageBox = document.getElementById('message-box');
    messageBox.textContent = message;
    messageBox.style.color = isError ? 'red' : 'green';
}

// Відображення форми створення нового рахунку
function showCreateAccount() {
    document.getElementById('action-title').textContent = "Створити новий рахунок";
    document.getElementById('form-content').innerHTML = `
        <input type="text" id="clientId" placeholder="Ідентифікатор клієнта">
        <input type="text" id="clientName" placeholder="Ім'я клієнта">
        <input type="number" id="clientBalance" placeholder="Початковий баланс">
        <input type="password" id="clientPin" placeholder="PIN-код">
        <button onclick="createAccount()">Створити рахунок</button>
    `;
}

function createAccount() {
    const clientId = document.getElementById('clientId').value;
    const clientName = document.getElementById('clientName').value;
    const clientBalance = parseFloat(document.getElementById('clientBalance').value);
    const clientPin = document.getElementById('clientPin').value;

    let clients = getClients();

    // Перевірка, чи існує клієнт з таким ID
    if (clients.some(client => client.id === clientId)) {
        showMessage('Клієнт з таким ідентифікатором вже існує!', true);
        return;
    }

    clients.push({ id: clientId, name: clientName, balance: clientBalance, pin: clientPin, isLocked: false, transactions: [] });
    setClients(clients);

    showMessage('Рахунок успішно створено!');
}

// Відображення балансу клієнта
function showCheckBalance() {
    document.getElementById('action-title').textContent = "Перевірити баланс";
    document.getElementById('form-content').innerHTML = `
        <input type="text" id="clientId" placeholder="Ідентифікатор клієнта">
        <button onclick="checkBalance()">Перевірити баланс</button>
    `;
}

function checkBalance() {
    const clientId = document.getElementById('clientId').value;
    const clients = getClients();
    const client = clients.find(client => client.id === clientId);

    if (!client) {
        showMessage('Клієнта не знайдено!', true);
        return;
    }

    if (client.isLocked) {
        showMessage('Рахунок заблоковано!', true);
        return;
    }

    showMessage(`Баланс клієнта ${client.name}: ${client.balance}`);
}

// Поповнення рахунку
function showDeposit() {
    document.getElementById('action-title').textContent = "Поповнити рахунок";
    document.getElementById('form-content').innerHTML = `
        <input type="text" id="clientId" placeholder="Ідентифікатор клієнта">
        <input type="number" id="amount" placeholder="Сума для поповнення">
        <button onclick="deposit()">Поповнити</button>
    `;
}

function deposit() {
    const clientId = document.getElementById('clientId').value;
    const amount = parseFloat(document.getElementById('amount').value);

    let clients = getClients();
    let client = clients.find(client => client.id === clientId);

    if (!client) {
        showMessage('Клієнта не знайдено!', true);
        return;
    }

    if (client.isLocked) {
        showMessage('Рахунок заблоковано!', true);
        return;
    }

    client.balance += amount;
    client.transactions.push({ type: 'deposit', amount: amount });
    setClients(clients);

    showMessage(`Рахунок поповнено на ${amount}.`);
}

// Зняття коштів
function showWithdraw() {
    document.getElementById('action-title').textContent = "Зняти кошти";
    document.getElementById('form-content').innerHTML = `
        <input type="text" id="clientId" placeholder="Ідентифікатор клієнта">
        <input type="number" id="amount" placeholder="Сума для зняття">
        <button onclick="withdraw()">Зняти</button>
    `;
}

function withdraw() {
    const clientId = document.getElementById('clientId').value;
    const amount = parseFloat(document.getElementById('amount').value);

    let clients = getClients();
    let client = clients.find(client => client.id === clientId);

    if (!client) {
        showMessage('Клієнта не знайдено!', true);
        return;
    }

    if (client.isLocked) {
        showMessage('Рахунок заблоковано!', true);
        return;
    }

    if (client.balance < amount) {
        showMessage('Недостатньо коштів на рахунку!', true);
        return;
    }

    client.balance -= amount;
    client.transactions.push({ type: 'withdraw', amount: amount });
    setClients(clients);

    showMessage(`Знято ${amount} з рахунку клієнта ${client.name}.`);
}

// Трансфер між рахунками
function showTransfer() {
    document.getElementById('action-title').textContent = "Переказ коштів";
    document.getElementById('form-content').innerHTML = `
        <input type="text" id="senderId" placeholder="Ідентифікатор відправника">
        <input type="text" id="receiverId" placeholder="Ідентифікатор отримувача">
        <input type="number" id="amount" placeholder="Сума для переказу">
        <button onclick="transfer()">Переказати</button>
    `;
}

function transfer() {
    const senderId = document.getElementById('senderId').value;
    const receiverId = document.getElementById('receiverId').value;
    const amount = parseFloat(document.getElementById('amount').value);

    let clients = getClients();
    let sender = clients.find(client => client.id === senderId);
    let receiver = clients.find(client => client.id === receiverId);

    if (!sender || !receiver) {
        showMessage('Відправника або отримувача не знайдено!', true);
        return;
    }

    if (sender.isLocked || receiver.isLocked) {
        showMessage('Один з рахунків заблоковано!', true);
        return;
    }

    if (sender.balance < amount) {
        showMessage('Недостатньо коштів на рахунку відправника!', true);
        return;
    }

    sender.balance -= amount;
    receiver.balance += amount;
    sender.transactions.push({ type: 'transfer', amount: amount, to: receiver.id });
    receiver.transactions.push({ type: 'transfer', amount: amount, from: sender.id });

    setClients(clients);

    showMessage(`Переказано ${amount} від ${sender.name} до ${receiver.name}.`);
}

// Перегляд історії транзакцій
function showHistory() {
    document.getElementById('action-title').textContent = "Переглянути історію транзакцій";
    document.getElementById('form-content').innerHTML = `
        <input type="text" id="clientId" placeholder="Ідентифікатор клієнта">
        <button onclick="viewHistory()">Переглянути історію</button>
    `;
}

function viewHistory() {
    const clientId = document.getElementById('clientId').value;
    const clients = getClients();
    const client = clients.find(client => client.id === clientId);

    if (!client) {
        showMessage('Клієнта не знайдено!', true);
        return;
    }

    if (client.isLocked) {
        showMessage('Рахунок заблоковано!', true);
        return;
    }

    const transactions = client.transactions.length > 0 
        ? client.transactions.map(transaction => {
            if (transaction.type === 'deposit') {
                return `Поповнення: ${transaction.amount}`;
            } else if (transaction.type === 'withdraw') {
                return `Зняття: ${transaction.amount}`;
            } else if (transaction.type === 'transfer') {
                if (transaction.to) {
                    return `Переказ: ${transaction.amount} до клієнта ${transaction.to}`;
                } else if (transaction.from) {
                    return `Переказ: ${transaction.amount} від клієнта ${transaction.from}`;
                }
            }
            return 'Невідома операція';
        }).join('\n') // Використовуємо символ нового рядка, замість <br>
        : 'Немає транзакцій';

    showMessage(`Історія транзакцій: ${transactions}`);
}



// Заблокувати рахунок
function lockAccount() {
    document.getElementById('action-title').textContent = "Заблокувати рахунок";
    document.getElementById('form-content').innerHTML = `
        <input type="text" id="clientId" placeholder="Ідентифікатор клієнта">
        <button onclick="lockClient()">Заблокувати</button>
    `;
}

function lockClient() {
    const clientId = document.getElementById('clientId').value;
    const clients = getClients();
    const client = clients.find(client => client.id === clientId);

    if (!client) {
        showMessage('Клієнта не знайдено!', true);
        return;
    }

    client.isLocked = true;
    setClients(clients);

    showMessage(`Рахунок клієнта ${client.name} заблоковано.`);
}

// Розблокувати рахунок
function unlockAccount() {
    document.getElementById('action-title').textContent = "Розблокувати рахунок";
    document.getElementById('form-content').innerHTML = `
        <input type="text" id="clientId" placeholder="Ідентифікатор клієнта">
        <button onclick="unlockClient()">Розблокувати</button>
    `;
}

function unlockClient() {
    const clientId = document.getElementById('clientId').value;
    const clients = getClients();
    const client = clients.find(client => client.id === clientId);

    if (!client) {
        showMessage('Клієнта не знайдено!', true);
        return;
    }

    client.isLocked = false;
    setClients(clients);

    showMessage(`Рахунок клієнта ${client.name} розблоковано.`);
}
