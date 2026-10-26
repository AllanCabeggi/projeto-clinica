# Clínica Simples

Sistema local de pacientes, médicos, agenda, consultas e pagamentos, com interface básica no navegador. Desenvolvido em JavaScript com Node.js e SQLite.

## Integrantes

- Allan Vinicius Cabeggi Alvarenga — RGM: 45663742
- Júlio César Benicio Inácio — RGM: 42693047

## Execução

É necessário Node.js 22.13 ou superior. Na pasta do projeto:

~~~sh
cd clinica
npm start
~~~

Também pode ser utilizado node server.js ou node main.js. Depois de iniciar, o endereço é http://localhost:3001. O terminal deve permanecer aberto enquanto o programa estiver em uso. Ctrl+C encerra o servidor.

Não é necessário instalar pacotes externos. O arquivo clinica.db é criado automaticamente quando ainda não existe. Os dados permanecem salvos após o encerramento.

## Arquivos

- clinica/server.js: servidor local e recebimento dos formulários.
- clinica/pagina.html: formulários e tabelas da interface.
- clinica/pagina.js: preenchimento da página com os dados do banco.
- clinica/main.js: funções de cadastro, agenda, consultas e pagamentos.
- clinica/schema.sql: estrutura do banco.
- Projeto_Clinica.pdf: documentação do sistema.

O conteúdo da documentação também está em Projeto_Clinica.md e Projeto_Clinica.html. Os diagramas estão em diagrama_casos_uso.svg e diagrama_classes.svg.

## Dados sintéticos

Dentro de clinica, o comando npm run dados ou node dados_sinteticos.js adiciona cinco pacientes, três médicos, oito agendamentos, quatro consultas e cinco pagamentos fictícios. Os registros existentes são preservados, e uma nova execução não duplica os mesmos dados.

O banco clinica.db fica apenas no computador. O repositório contém o script que permite recriar esses dados.
