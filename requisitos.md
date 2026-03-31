# Requisitos da Aplicacao

## Objetivo

Sistema web de gerenciamento de tarefas (TODO List) com autenticacao de usuarios, desenvolvido como trabalho academico com foco em seguranca de software.

## Requisitos Funcionais

- RF01: Cadastro de usuario com username, email e senha
- RF02: Login com username e senha
- RF03: Logout via POST com destruicao da sessao
- RF04: Redirecionamento automatico para dashboard quando ja autenticado
- RF05: Redirecionamento para login ao acessar area protegida sem autenticacao
- RF06: Dashboard privada exibindo dados do usuario logado
- RF07: Criar tarefa (todo) vinculada ao usuario autenticado
- RF08: Listar tarefas do usuario autenticado
- RF09: Marcar/desmarcar tarefa como concluida
- RF10: Remover tarefa
- RF11: Feedback visual de erros no login e cadastro
- RF12: Feedback de sucesso apos cadastro concluido
- RF13: Validacao interativa de senha no formulario de cadastro
- RF14: Campo de confirmacao de senha no cadastro

## Requisitos de Seguranca

- RS01: Senhas armazenadas com hash bcrypt (salt rounds configuravel)
- RS02: Sessao com tempo de expiracao configuravel via variavel de ambiente
- RS03: Cookie com flags httpOnly e sameSite strict
- RS04: Mensagem generica de erro no login (sem revelar se usuario ou senha esta incorreto)
- RS05: Validacao de senha forte (minimo 6 caracteres, 1 maiuscula, 1 numero, 1 caractere especial)
- RS06: Validacao de senha tanto no frontend quanto no backend
- RS07: Chave de sessao armazenada em variavel de ambiente, nunca no codigo
- RS08: Servidor recusa iniciar sem SESSION_SECRET definido
- RS09: Cada usuario so acessa suas proprias tarefas (filtragem por user_id no backend)
- RS10: user_id nao exposto nas respostas da API ao cliente
- RS11: Arquivos sensiveis (.env, banco de dados) no .gitignore
- RS12: Queries parametrizadas (prepared statements) para prevencao de SQL injection
- RS13: Banco com foreign keys habilitadas e WAL mode
- RS14: Headers de seguranca HTTP via helmet (CSP, X-Content-Type-Options, X-Frame-Options, etc.)
- RS15: Scripts JavaScript externos (sem inline scripts), em conformidade com Content Security Policy
- RS16: Validacao de tamanho e formato de username (max 30 caracteres) e email (max 100 caracteres) no backend
- RS17: Logout exclusivamente via POST (prevencao de logout forjado via GET)

## Requisitos Nao Funcionais

- RNF01: Aplicacao roda em Node.js com Express
- RNF02: Banco de dados SQLite local
- RNF03: Configuracao via variaveis de ambiente (dotenv)
- RNF04: Scripts de migration e seed separados
- RNF05: Linting e formatacao automatica com ESLint e Prettier
- RNF06: Live reload em desenvolvimento com nodemon
