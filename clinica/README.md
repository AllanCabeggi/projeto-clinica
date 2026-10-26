# Clínica Simples

Interface local em JavaScript com Node.js e SQLite, para pacientes, médicos, agenda, consultas e pagamentos.

Dentro desta pasta, a execução utiliza npm start, node server.js ou node main.js. É necessário Node.js 22.13 ou superior, sem instalação de pacotes externos.

Depois de iniciar, o endereço é http://localhost:3001. O terminal permanece aberto durante o uso; Ctrl+C encerra o servidor.

O banco clinica.db é criado quando ainda não existe e mantém os dados ao fechar. Os formulários utilizam as mesmas funções de main.js e o banco já existente nesta pasta.

Para adicionar os dados fictícios: npm run dados ou node dados_sinteticos.js. O comando preserva os registros existentes e não duplica os mesmos dados em uma nova execução.
