# Seguranca da Aplicacao

## Por que a aplicacao e segura

### Armazenamento de senhas

As senhas nunca sao armazenadas em texto puro. Utilizamos bcrypt com salt rounds configuravel (padrao: 10) para gerar hashes. Isso significa que mesmo com acesso direto ao banco de dados, um atacante nao consegue recuperar as senhas originais. O bcrypt e propositalmente lento, tornando ataques de forca bruta contra os hashes extremamente custosos.

### Prevencao de SQL Injection

Todas as queries utilizam prepared statements (parametros `?`). Os valores do usuario nunca sao concatenados diretamente nas queries SQL.

Exemplo de como a aplicacao faz:

```
db.get('SELECT * FROM users WHERE username = ?', [username])
```

Se um atacante tentar enviar `admin' OR '1'='1` como username, o valor inteiro sera tratado como string literal pelo SQLite, e a query simplesmente nao encontrara nenhum usuario com esse nome.

### Headers de seguranca HTTP

A aplicacao utiliza o middleware helmet, que define automaticamente headers de seguranca:

- Content-Security-Policy: restringe origens de scripts, estilos e outros recursos. Apenas scripts do proprio dominio (`'self'`) sao permitidos, bloqueando inline scripts e scripts de terceiros
- X-Content-Type-Options: `nosniff`, impede que o browser interprete arquivos com MIME type incorreto
- X-Frame-Options: impede que a aplicacao seja carregada em iframes de outros sites (clickjacking)
- Strict-Transport-Security: forca uso de HTTPS em ambientes que suportam
- X-XSS-Protection: camada adicional de protecao contra XSS em browsers antigos

### Content Security Policy e scripts externos

Todo o JavaScript da aplicacao esta em arquivos externos na pasta `public/` (login.js, register.js, dashboard.js). Nao ha inline scripts nem inline event handlers nos HTMLs. Isso permite que a CSP do helmet funcione com `script-src 'self'`, bloqueando qualquer tentativa de injecao de scripts inline.

### Gerenciamento de sessao

- Cookie com `httpOnly: true`: impede que JavaScript no browser acesse o cookie de sessao, mitigando roubo de sessao via XSS
- Cookie com `sameSite: 'strict'`: o browser nao envia o cookie em requisicoes originadas de outros sites, mitigando ataques CSRF
- Sessao com tempo de expiracao configuravel (padrao: 3 minutos)
- Logout via POST destroi a sessao no servidor, invalidando o cookie imediatamente. O uso de POST impede que o logout seja acionado por links em emails, imagens ou requisicoes GET forjadas

### Politica de senhas

A aplicacao exige senhas com no minimo 6 caracteres, pelo menos 1 letra maiuscula, 1 numero e 1 caractere especial. A validacao acontece tanto no frontend (feedback interativo) quanto no backend (regex), garantindo que a regra nao pode ser burlada desabilitando JavaScript.

### Validacao de entrada no cadastro

O backend valida tamanho e formato dos campos de cadastro:

- Username: maximo 30 caracteres
- Email: maximo 100 caracteres, com validacao de formato

Isso previne envio de payloads excessivamente grandes e garante integridade dos dados.

### Mensagens de erro genericas no login

A aplicacao retorna "Usuario ou senha invalidos" tanto para usuario inexistente quanto para senha incorreta. Isso impede que um atacante descubra quais usernames existem no sistema (enumeracao de usuarios).

### Isolamento de dados entre usuarios

Todas as queries de tarefas filtram por `user_id` no backend. Mesmo que um usuario tente manipular requisicoes para acessar tarefas de outro usuario, o backend sempre usa o `user_id` da sessao autenticada, nunca um valor enviado pelo cliente.

### Variaveis de ambiente

Segredos como `SESSION_SECRET` ficam no arquivo `.env`, que esta no `.gitignore`. O servidor recusa iniciar se `SESSION_SECRET` nao estiver definido, evitando que rode com configuracao insegura. O repositorio inclui apenas o `.env.example` como template.

### Banco de dados

- Foreign keys habilitadas (`PRAGMA foreign_keys=ON`): garante integridade referencial
- WAL mode: reduz risco de corrupcao do banco em caso de falha

## Exemplos de ataques que nao funcionariam

### SQL Injection no login

Ataque: enviar `' OR 1=1 --` no campo de username.

Por que falha: a query usa prepared statement. O valor e tratado como string literal, nao como parte do SQL. O banco procura um usuario cujo username e literalmente `' OR 1=1 --`, que nao existe.

### XSS via inline script injection

Ataque: injetar `<script>document.cookie</script>` em algum campo para roubar o cookie de sessao.

Por que falha: multiplas camadas de protecao atuam simultaneamente. A CSP bloqueia execucao de qualquer inline script. O cookie tem flag `httpOnly`, entao mesmo que um script executasse, `document.cookie` nao retornaria o cookie de sessao. Os titulos das tarefas sao inseridos no DOM via `textContent` (nao `innerHTML`), impedindo execucao de HTML/JS injetado.

### CSRF (Cross-Site Request Forgery)

Ataque: criar uma pagina maliciosa que faz um POST para `/api/todos` ou `/login` usando o cookie do usuario.

Por que falha: o cookie tem `sameSite: 'strict'`, entao o browser nao envia o cookie em requisicoes originadas de outros dominios.

### Logout forjado via GET

Ataque: incluir uma tag `<img src="http://localhost:3001/logout">` em um email ou pagina para forcar o logout do usuario.

Por que falha: a rota de logout aceita apenas POST. Requisicoes GET para `/logout` nao tem efeito.

### Enumeracao de usuarios

Ataque: testar diversos usernames no login para descobrir quais existem.

Por que falha: a resposta e sempre "Usuario ou senha invalidos", independente de o usuario existir ou nao. O atacante nao consegue distinguir entre usuario inexistente e senha errada.

### Acesso a tarefas de outro usuario

Ataque: alterar o ID da tarefa na requisicao PUT/DELETE para tentar modificar tarefas de outro usuario.

Por que falha: todas as queries incluem `AND user_id = ?` com o ID da sessao. Mesmo que o atacante acerte o ID de uma tarefa alheia, a query nao encontra resultado porque o `user_id` nao bate.

### Bypass da validacao de senha no frontend

Ataque: desabilitar JavaScript e enviar o formulario de cadastro com uma senha fraca.

Por que falha: o backend valida a senha com a mesma regex antes de aceitar o cadastro. A validacao no frontend e apenas para UX.

### Payload excessivo no cadastro

Ataque: enviar um username ou email com milhares de caracteres para sobrecarregar o servidor.

Por que falha: o backend valida tamanho maximo dos campos (username: 30, email: 100) antes de processar o cadastro.

## Limitacoes conhecidas

Consulte o arquivo [debitos-tecnicos.md](debitos-tecnicos.md) para a lista de limitacoes e melhorias pendentes.
