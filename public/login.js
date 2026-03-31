const params = new URLSearchParams(window.location.search);
const erro = params.get('erro');
const sucesso = params.get('sucesso');

if (erro) {
    const msg = document.getElementById('errorMsg');
    const mensagens = {
        credenciais: 'Usuario ou senha invalidos',
        auth: 'Faca login para continuar'
    };
    msg.textContent = mensagens[erro] || 'Erro ao fazer login';
    msg.style.display = 'block';
}

if (sucesso) {
    const msg = document.getElementById('successMsg');
    msg.textContent = 'Conta criada com sucesso, faca login';
    msg.style.display = 'block';
}
