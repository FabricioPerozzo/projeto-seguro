# Projeto Seguro

Sistema de autenticacao de usuarios com TODO List privada, desenvolvido como trabalho academico com foco em seguranca de software.

## Documentacao

- [Requisitos da aplicacao](requisitos.md)
- [Seguranca da aplicacao](seguranca.md)
- [Debitos tecnicos](debitos-tecnicos.md)

## Tecnologias

- Node.js
- Express 5
- SQLite3
- bcrypt
- express-session
- helmet
- dotenv

## Pre-requisitos

- Node.js 18+
- npm

## Configuracao

1. Clone o repositorio:

```bash
git clone <url-do-repositorio>
cd projeto-seguro
```

2. Instale as dependencias:

```bash
npm install
```

3. Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

4. Edite o `.env` e defina uma chave segura para `SESSION_SECRET`:

```
SESSION_SECRET=sua_chave_secreta_aqui
SESSION_MAX_AGE=180000
BCRYPT_SALT_ROUNDS=10
PORT=3001
DB_PATH=./database.db
```

| Variavel           | Descricao                                     |
| ------------------ | --------------------------------------------- |
| SESSION_SECRET     | Chave secreta para assinar a sessao           |
| SESSION_MAX_AGE    | Tempo de vida da sessao em ms (padrao: 3 min) |
| BCRYPT_SALT_ROUNDS | Numero de rounds do bcrypt (padrao: 10)       |
| PORT               | Porta do servidor (padrao: 3001)              |
| DB_PATH            | Caminho do arquivo do banco SQLite            |

## Executando

### Desenvolvimento

Use o script `dev` para desenvolvimento local. Ele executa lint + formatacao automatica, migrate, seed e inicia o servidor com live reload (nodemon):

```bash
npm run dev
```

### Producao

Crie as tabelas no banco:

```bash
npm run migrate
```

(Opcional) Insira dados de teste:

```bash
npm run seed
```

Inicie o servidor:

```bash
npm start
```

O sistema estara disponivel em `http://localhost:3001`.

## Scripts disponiveis

| Script              | Descricao                                           |
| ------------------- | --------------------------------------------------- |
| npm run dev         | Lint + format + migrate + seed + servidor (nodemon) |
| npm start           | Inicia o servidor                                   |
| npm run migrate     | Cria as tabelas no banco                            |
| npm run seed        | Insere dados de teste                               |
| npm run lint        | Verifica erros de lint                              |
| npm run lint:format | Corrige lint e formata o codigo                     |

## Usuarios de teste (seed)

| Usuario | Senha    |
| ------- | -------- |
| admin   | admin123 |
| usuario | senha123 |

## Estrutura do projeto

```
projeto-seguro/
  db/
    connection.js    - Conexao com o banco SQLite
    migrate.js       - Criacao das tabelas
    seed.js          - Dados de teste
  public/
    style.css        - Estilos da aplicacao
    login.js         - Script da pagina de login
    register.js      - Script da pagina de cadastro
    dashboard.js     - Script da dashboard
  views/
    login.html       - Pagina de login
    register.html    - Pagina de cadastro
    dashboard.html   - Area protegida (TODO List)
  server.js          - Servidor Express e rotas
  .env.example       - Template de variaveis de ambiente
  requisitos.md      - Requisitos da aplicacao
  seguranca.md       - Documentacao de seguranca
```
