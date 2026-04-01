const pw = document.getElementById('password');
const confirm = document.getElementById('confirmPassword');
const matchError = document.getElementById('matchError');
const form = document.getElementById('registerForm');

const rules = {
    'rule-length': (v) => v.length >= 6,
    'rule-upper': (v) => /[A-Z]/.test(v),
    'rule-number': (v) => /[0-9]/.test(v),
    'rule-special': (v) => /[^A-Za-z0-9]/.test(v)
};

pw.addEventListener('input', () => {
    const val = pw.value;
    for (const [id, test] of Object.entries(rules)) {
        document.getElementById(id).classList.toggle('valid', test(val));
    }
    if (confirm.value) {
        matchError.style.display = val !== confirm.value ? 'block' : 'none';
    }
});

confirm.addEventListener('input', () => {
    matchError.style.display = pw.value !== confirm.value ? 'block' : 'none';
});

form.addEventListener('submit', (e) => {
    const val = pw.value;
    const allValid = Object.values(rules).every((test) => test(val));
    if (!allValid || pw.value !== confirm.value) {
        e.preventDefault();
        if (!allValid) {
            alert('A senha nao atende todos os requisitos');
        } else {
            alert('As senhas nao coincidem');
        }
    }
});

const params = new URLSearchParams(window.location.search);
const erro = params.get('erro');
if (erro) {
    const msg = document.getElementById('errorMsg');
    const mensagens = {
        senha: 'A senha nao atende os requisitos de seguranca',
        duplicado: 'Usuario ou email ja cadastrado',
        username: 'Usuario invalido (maximo 30 caracteres)',
        email: 'Email invalido (maximo 100 caracteres)'
    };
    msg.textContent = mensagens[erro] || 'Erro ao cadastrar';
    msg.style.display = 'block';
}
