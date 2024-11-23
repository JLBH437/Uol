let userName = prompt("Qual é o seu nome?");

while (!userName || userName.trim() === "") {
    alert("Por favor, insira um nome válido.");
    userName = prompt("Qual é o seu nome?");
}


alert("Olá, " + userName + "! Bem-vindo ao nosso site!");