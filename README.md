# Clínica Simples

Projeto acadêmico de Análise e Projeto de Sistemas feito em JavaScript com Node.js e SQLite. O escopo reúne 15 requisitos do enunciado original.

## Executar

Requer Node.js 22.13 ou superior. No terminal do VS Code:

```sh
cd clinica
npm start
```

Também é possível executar `node main.js`. Não é necessário rodar `npm install`: o programa utiliza apenas módulos nativos do Node.js.

## Testar

Dentro da pasta `clinica`:

```sh
npm test
```

A suíte contém 10 testes, cobrindo regras, menu e persistência dos dados.

## Funcionalidades

- Cadastro de pacientes com CPF único e cadastro de médicos.
- Agendamento, confirmação, cancelamento e registro de faltas.
- Registro de consultas e histórico por paciente.
- Registro de pagamentos, baixa, pendências e total recebido por período.

## Organização

- `clinica/main.js`: programa e regras.
- `clinica/schema.sql`: tabelas e gatilhos SQLite.
- `clinica/test_main.js`: testes automatizados.
- `Projeto_Clinica.md`: documentação editável com requisitos, backlog, sprints, casos de uso e diagramas.
- `Projeto_Clinica.pdf`: documentação para leitura.
- `LEIA-ME.txt`: instruções detalhadas e roteiro de demonstração.

O banco `clinica/clinica.db` é criado automaticamente na primeira execução e fica salvo localmente. Os bancos não são enviados ao repositório.

## Escopo acadêmico

Menu no terminal, sem login ou interface gráfica. Usar dados fictícios na demonstração. As datas das sprints são propostas de planejamento e os nomes e RGMs devem ser preenchidos pelo grupo.
