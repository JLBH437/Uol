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

    const messageObject = {
        from: userName,
        to: "Todos",
        text: messageText,
        type: "message", // "private_message" para mensagens privadas
    };

    try {
        const response = await fetch(messagesUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(messageObject),
        });

        if (response.ok) {
            // Exibe a mensagem localmente
            displayMessage(messageObject);
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
    messageElement.innerHTML = `
        <span class="message-time">${getCurrentTime()}</span>
        <strong>${message.from}:</strong> ${message.text}
    `;
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
let selectedUsers = ["Todos"];

// Atualiza a lista de usuários online na sidebar
function updateUserList() {
    sidebarUsersList.innerHTML = ""; // Limpa a lista

    onlineUsers.forEach((user) => {
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
});

// Inicializa a lista de usuários
updateUserList();
