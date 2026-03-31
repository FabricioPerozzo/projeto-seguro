# Debitos Tecnicos

## DT01: Sessao armazenada em memoria

O express-session por padrao armazena sessoes em memoria (MemoryStore). Em producao isso causa vazamento de memoria e nao escala. Para o escopo academico e aceitavel, mas em um ambiente real seria necessario usar um store externo (Redis, banco de dados, etc.).

## DT02: Falta de rate limiting

A aplicacao nao limita tentativas de login por IP/usuario. Um atacante poderia fazer multiplas tentativas por segundo (brute force). Em um ambiente real, seria necessario adicionar rate limiting nas rotas de autenticacao.

## DT03: Banco de dados SQLite

O SQLite e um banco embutido no processo da aplicacao, sem controle de acesso proprio. Em producao, utilizar um banco isolado (como PostgreSQL) em servidor dedicado, sem exposicao direta a internet, com autenticacao e conexao restrita a aplicacao.
