const uuid = "8d7e7407-3403-4d6b-939a-570791d80d0c"; // Seu UUID
const apiUrl = `https://mock-api.driven.com.br/api/v6/uol/participants/${uuid}`;
const messagesUrl = `https://mock-api.driven.com.br/api/v6/uol/messages/${uuid}`;
let userName = "";

// Seleciona elementos importantes
const inputField = document.querySelector("footer input");
const sendIcon = document.querySelector("footer ion-icon");
const messagesContainer = document.querySelector(".messages");
const sidebar = document.getElementById("sidebar");
const openSidebarIcon = document.getElementById("open-sidebar");
const closeSidebarButton = document.getElementById("close-sidebar");
const sidebarExitButton = document.querySelector(".sidebar-option.exit"); // Botão "Sair" na sidebar

// Função para pedir o nome do usuário
async function promptUserName() {
    while (true) {
        userName = prompt("Qual é o seu nome?");
        if (!userName || userName.trim() === "") {
            alert("Por favor, insira um nome válido.");
            continue;
        }

        try {
            // Envia o nome ao servidor
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: userName }),
            });

            if (response.ok) {
                alert(`Bem-vindo(a) ${userName}!`);
                break; // Sai do loop ao obter sucesso
            } else if (response.status === 400) {
                alert("Esse nome já está em uso. Tente outro.");
            } else {
                throw new Error("Erro inesperado ao conectar ao servidor.");
            }
        } catch (error) {
            alert(`Erro ao conectar ao servidor: ${error.message}`);
        }
    }
}

// Função para formatar o horário
function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
}

// Função para enviar mensagem
async function sendMessage() {
    const messageText = inputField.value.trim();
    if (messageText === "") return;

    // Verifique se a mensagem é privada e se o usuário selecionou destinatários
    const messageObject = {
        from: userName,
        to: selectedUsers.join(", "), // Envia para os usuários selecionados
        text: messageText,
        type: messageVisibility === "Reservadamente" ? "private_message" : "message", // Define tipo de mensagem
    };

    try {
        const response = await fetch(messagesUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messageObject),
        });

        if (response.ok) {
            displayMessage(messageObject); // Exibe mensagem localmente
            inputField.value = ""; // Limpa o campo de entrada
        } else {
            alert("Erro ao enviar a mensagem. Tente novamente.");
        }
    } catch (error) {
        alert(`Erro ao conectar ao servidor: ${error.message}`);
    }
}


// Função para exibir mensagens

function displayMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");

    // Verifica se é uma mensagem de "entrada" ou "saída"
    const isStatusMessage = message.type === "status";

    // Se for uma mensagem de status (entrada ou saída), aplica a cor desejada
    if (isStatusMessage) {
        messageElement.style.backgroundColor = "#DCDCDC"; // Cor para entrada/saída
    } else {
        // Se for uma mensagem privada, aplica o fundo rosa claro
        const isPrivateMessage = message.type === "private_message";
        if (isPrivateMessage) {
            // Exibe a mensagem somente para o remetente e o destinatário
            if (message.from === userName || selectedUsers.includes(message.from)) {
                messageElement.style.backgroundColor = "#FFDEDE"; // Cor para mensagem privada
            } else {
                return; // Não exibe a mensagem se o usuário não for o remetente nem o destinatário
            }
        } else {
            // Caso contrário, a mensagem é pública, então aplica o fundo branco
            messageElement.style.backgroundColor = "#FFFFFF"; // Cor para mensagem pública normal
        }
    }

    // Formatação do tempo, tipo de mensagem e destinatário
    const time = getCurrentTime(); // Hora, minuto e segundo
    const messageType = message.type === "private_message" ? "Reservadamente" : "Publicamente";
    const toUsers = message.to === "Todos" ? "para Todos" : `para ${message.to}`;

    // Monta a mensagem
    messageElement.innerHTML = `
        <span class="message-time">(${time})</span> 
        <strong>${message.from}</strong> 
        (${messageType}) 
        ${toUsers}: ${message.text}
    `;

    // Exibe a mensagem na tela
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll para a última mensagem
}


// Atualizar mensagens periodicamente
async function fetchMessages() {
    try {
        const response = await fetch(messagesUrl);
        if (response.ok) {
            const messages = await response.json();
            messagesContainer.innerHTML = ""; // Limpa o container
            messages.forEach(displayMessage);
        } else {
            console.error("Erro ao buscar mensagens.");
        }
    } catch (error) {
        console.error(`Erro ao conectar ao servidor: ${error.message}`);
    }
}

// Atualiza mensagens a cada 3 segundos
setInterval(fetchMessages, 3000);

// Eventos de envio
sendIcon.addEventListener("click", sendMessage);
inputField.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// Sidebar - Abrir e Fechar
openSidebarIcon.addEventListener("click", () => {
    sidebar.style.visibility = "visible"; // Torna a sidebar visível novamente
    sidebar.classList.add("show");
});

closeSidebarButton.addEventListener("click", () => {
    sidebar.classList.remove("show");
    setTimeout(() => {
        sidebar.style.visibility = "hidden"; // Esconde após a animação
    }, 300); // Tempo da animação
});

// Função de Logout
async function logout() {
    try {
        // Envia um pedido de desconexão
        const response = await fetch(`https://mock-api.driven.com.br/api/v6/uol/status/${uuid}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: userName }),
        });

        if (response.ok) {
            alert(`Você foi desconectado, ${userName}.`);
            // Redireciona para a tela inicial
            window.location.reload(); // Recarrega a página (ou pode redirecionar para outra página)
        } else {
            alert("Erro ao tentar fazer logout. Tente novamente.");
        }
    } catch (error) {
        alert(`Erro ao conectar ao servidor: ${error.message}`);
    }
}

// Evento de logout no item "Sair" da sidebar
sidebarExitButton.addEventListener("click", logout);

// Inicia a aplicação
promptUserName();
fetchMessages(); // Carrega mensagens ao iniciar

// Função para manter a conexão
function keepConnection() {
    fetch(`https://mock-api.driven.com.br/api/v6/uol/status/${uuid}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: userName }),
    })
        .then((response) => {
            if (!response.ok) {
                console.error("Erro ao manter conexão com o servidor.");
            }
        })
        .catch((error) => {
            console.error(`Erro ao conectar ao servidor: ${error.message}`);
        });
}

// Configura a chamada de manter conexão a cada 5 segundos
setInterval(keepConnection, 5000);

// Elementos da Sidebar
const sidebarUsersList = document.querySelector(".users-list");
const allOption = document.querySelector(".sidebar-option");

// Simula usuários online (a ser substituído por requisição ao servidor)
const onlineUsers = [
    "Maria",
    "João",
    "Carlos",
    "Ana",
];

// Estado dos usuários selecionados
let selectedUsers = ["Todos"];  // Inicializando com "Todos" já selecionado

// Atualiza a lista de usuários online na sidebar
function updateUserList(participants = []) {
    sidebarUsersList.innerHTML = ""; // Limpa a lista

    // Combine os usuários locais com os participantes da API
    const allUsers = [...onlineUsers, ...participants.map(p => p.name)];

    allUsers.forEach((user) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <ion-icon name="person-circle"></ion-icon>
            <span>${user}</span>
            <ion-icon name="checkmark" class="checkmark-icon"></ion-icon>
        `;

        // Marca usuários já selecionados
        if (selectedUsers.includes(user)) {
            listItem.classList.add("selected");
        }

        // Adiciona evento de clique para selecionar/deselecionar
        listItem.addEventListener("click", () => {
            if (selectedUsers.includes(user)) {
                selectedUsers = selectedUsers.filter((u) => u !== user); // Remove da seleção
                listItem.classList.remove("selected");
            } else {
                selectedUsers.push(user); // Adiciona à seleção
                listItem.classList.add("selected");
            }

            // Atualiza o texto do footer com o nome do usuário selecionado
            updateFooterMessageStatus();
        });

        sidebarUsersList.appendChild(listItem);
    });
}

// Atualiza a opção "Todos"
allOption.addEventListener("click", () => {
    if (selectedUsers.includes("Todos")) {
        selectedUsers = selectedUsers.filter((u) => u !== "Todos");
        allOption.classList.remove("selected");
    } else {
        selectedUsers = ["Todos"];
        allOption.classList.add("selected");
        updateUserList(); // Deseleciona os demais
    }

    // Atualiza o status do footer
    updateFooterMessageStatus();
});

// Atualiza a lista de usuários online na sidebar
function updateUserList(participants = []) {
    sidebarUsersList.innerHTML = ""; // Limpa a lista

    // Combine os usuários locais com os participantes da API
    const allUsers = [...onlineUsers, ...participants.map(p => p.name)];

    allUsers.forEach((user) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <ion-icon name="person-circle"></ion-icon>
            <span>${user}</span>
            <ion-icon name="checkmark" class="checkmark-icon"></ion-icon>
        `;

        // Marca usuários já selecionados
        if (selectedUsers.includes(user)) {
            listItem.classList.add("selected");
        }

        // Adiciona evento de clique para selecionar/deselecionar
        listItem.addEventListener("click", () => {
            if (selectedUsers.includes(user)) {
                selectedUsers = selectedUsers.filter((u) => u !== user); // Remove da seleção
                listItem.classList.remove("selected");
            } else {
                selectedUsers.push(user); // Adiciona à seleção
                listItem.classList.add("selected");
            }

            // Atualiza o texto do footer com o nome do usuário selecionado
            updateFooterMessageStatus();
        });

        sidebarUsersList.appendChild(listItem);
    });
}

// Estado inicial da visibilidade
let messageVisibility = "Público"; // ou "Reservadamente"

// Elementos do footer
const messageStatusElement = document.getElementById("message-status");

function updateFooterMessageStatus() {
    let visibilityText = messageVisibility === "Público" ? "(público)" : "(reservadamente)";
    let usersText = selectedUsers.length === 1 && selectedUsers[0] !== "Todos" ? selectedUsers[0] : selectedUsers.join(", ");

    messageStatusElement.textContent = `Enviando para ${usersText} ${visibilityText}`;
}

// Atualiza o texto inicial do rodapé
updateFooterMessageStatus();

// Função para buscar participantes
async function fetchParticipants() {
    try {
        const response = await fetch(`https://mock-api.driven.com.br/api/v6/uol/participants/${uuid}`);
        if (response.ok) {
            const participants = await response.json();
            updateUserList(participants);  // Atualiza a lista de participantes
        } else {
            console.error("Erro ao buscar participantes.");
        }
    } catch (error) {
        console.error(`Erro ao conectar ao servidor: ${error.message}`);
    }
}

// Chama a função para buscar os participantes ao iniciar a página
fetchParticipants();

// Atualiza a lista de participantes a cada 10 segundos
setInterval(fetchParticipants, 10000);

// Adicionar eventos para as opções de visibilidade
const visibilityOptions = document.querySelectorAll(".visibility-option");
visibilityOptions.forEach(option => {
    option.addEventListener("click", () => {
        // Remover seleção de todas as opções
        visibilityOptions.forEach(opt => opt.classList.remove("selected"));

        // Marcar a opção clicada como selecionada
        option.classList.add("selected");

        // Atualizar a visibilidade baseada na opção escolhida
        messageVisibility = option.querySelector("span").textContent;

        // Atualizar o texto no footer
        updateFooterMessageStatus();
    });
});