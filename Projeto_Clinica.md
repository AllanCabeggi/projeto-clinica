# Clínica Simples
## Projeto de Análise e Projeto de Sistemas

Aluno(a): __________________________________________
RGM: _______________________________________________
Demais integrantes (nome completo e RGM): __________________________
Professor: __________________________________________
Data de referência: 26/10/2026

## 1. Ideia do projeto
A Clínica Simples é um sistema local para uma pequena clínica organizar pacientes, médicos, agendamentos, consultas e pagamentos. O objetivo é acompanhar o caminho do paciente desde a marcação até o recebimento da consulta.

O projeto usa JavaScript com Node.js 22.13 ou superior, menu no terminal e banco SQLite. É uma solução acadêmica pequena, feita para ser fácil de executar e explicar. Não precisa de internet, servidor ou pacotes externos. O banco usa o módulo node:sqlite, incluído no Node.js.

O enunciado apresenta 45 dados a considerar. Por definição deste projeto, foram escolhidos somente 15. Os demais recursos do domínio ficam fora desta versão. Essa redução segue o pedido do aluno e precisa estar alinhada com o professor antes da entrega, pois o PDF original pede um sistema completo.

## 2. Os 15 dados escolhidos
A numeração da coluna “PDF” é a mesma da lista original. RF é o identificador usado neste projeto.

| ID | PDF | Dado considerado | Como será atendido |
| --- | --- | --- | --- |
| RF01 | 1 | Cada paciente possui CPF único. | CPF sem pontuação e restrição UNIQUE. |
| RF02 | 2 | Um paciente pode realizar várias consultas. | Vários agendamentos e consultas por paciente. |
| RF03 | 3 | Cada consulta pertence a um único paciente. | Paciente obtido pelo agendamento da consulta. |
| RF04 | 4 | Cada consulta é realizada por um único médico. | Médico obtido pelo agendamento da consulta. |
| RF05 | 5 | Um médico pode realizar várias consultas. | Vários agendamentos e consultas por médico. |
| RF06 | 25 | Uma consulta pode gerar pagamentos. | Consulta com zero ou vários pagamentos. |
| RF07 | 26 | Pagamento registra valor, data, forma e situação. | Valor em centavos, data e opções fixas. |
| RF08 | 31 | Um paciente pode possuir vários agendamentos. | Chave do paciente em cada agendamento. |
| RF09 | 32 | Um médico pode possuir vários agendamentos. | Chave do médico em cada agendamento. |
| RF10 | 33 | Um agendamento deve possuir uma situação. | Agendado, Confirmado, Realizado, Cancelado ou Não compareceu. |
| RF11 | 34 | Agendamento cancelado não gera consulta realizada. | Bloqueio no banco de dados. |
| RF12 | 35 | Identificar pacientes que não compareceram. | Lista dos agendamentos com falta. |
| RF13 | 36 | Consultar histórico completo de consultas do paciente. | Lista de todas as consultas desta versão, em ordem de data. |
| RF14 | 40 | Consultar faturamento da clínica por período. | Soma dos pagamentos pagos entre duas datas. |
| RF15 | 42 | Identificar pacientes com pagamentos pendentes. | Lista com paciente, contato, valor e pagamento. |

Justificativa: esses itens formam um fluxo pequeno que funciona do começo ao fim. CPF evita duplicidade; paciente e médico sustentam os atendimentos; a agenda controla a situação; a consulta guarda o atendimento; os pagamentos permitem acompanhar recebimentos e pendências.

Fora do escopo: especialidades, convênios, alergias, prontuário separado, exames, medicamentos, prescrições, procedimentos, funcionários e múltiplas unidades. O histórico será formado pelas consultas. Não haverá prontuário adicional nem cadastro de especialidades nesta versão.

## 3. Regras adotadas e limites
O atendimento começa por um agendamento. Cada agendamento tem exatamente um paciente e um médico e pode gerar no máximo uma consulta. A consulta obtém os dois vínculos por esse agendamento, evitando guardar informações repetidas.

Uma consulta só pode ser registrada quando o agendamento está Agendado ou Confirmado. Ao registrar a consulta, a situação muda para Realizado na mesma transação. Agendamentos Realizados, Cancelados ou com Não compareceu são encerrados. Não se reabre agendamento nesta versão.

Para simplificar, cada horário é um instante de início. O mesmo médico não pode ocupar dois agendamentos no mesmo instante, exceto quando um deles foi cancelado. Não há cálculo de duração nem tratamento de sobreposição entre horários diferentes.

Cada pagamento representa uma parcela de cobrança. Pendente significa ainda não recebida; Pago significa recebida. A data é prevista enquanto pendente e passa a ser a data do recebimento quando ocorre a baixa. Não há tabela separada de cobrança nem cálculo de saldo total da consulta.

Neste projeto, “faturamento por período” significa total efetivamente recebido, contando apenas pagamentos com situação Pago e datas dentro do intervalo, incluindo os dois extremos. Essa é uma simplificação do controle financeiro, sem apuração contábil.

O CPF é normalizado e deve ter 11 dígitos. O protótipo não verifica os dígitos verificadores. CRM é um texto único com UF, sem consulta a órgãos externos. Usar apenas dados fictícios na apresentação.

Atores representam responsabilidades no processo. Todos utilizam o mesmo menu local; não há login ou permissões por perfil. É um protótipo acadêmico para um computador, sem edição ou exclusão geral de cadastros.

## 4. Equipe e Scrum
Será usado um único Scrum Team, chamado Squad Clínica. Separar em vários squads aumentaria a organização sem necessidade para esse tamanho de projeto. A distribuição abaixo é uma proposta; preencher os nomes reais antes de entregar.

| Papel | Responsável a preencher | Responsabilidade |
| --- | --- | --- |
| Product Owner | Integrante 1 | Priorizar backlog e conferir o que atende à clínica. |
| Scrum Master | Integrante 2 | Organizar reuniões e acompanhar impedimentos. |
| Developers: programação | Integrante 3 | Implementar menu, regras e consultas SQL. |
| Developers: dados e testes | Integrante 4 | Conferir modelo, banco e testes. |
| Developers: documentação | Integrante 5 | Organizar casos de uso, diagramas e apresentação. |

O grupo pode ter menos pessoas, acumulando responsabilidades. O PDF permite no máximo sete integrantes; se houver seis ou sete, distribuir apoio em desenvolvimento, testes e documentação. Não é preciso criar cargos adicionais.

Eventos propostos: planejamento no início de cada sprint; conversa diária de até 10 minutos; revisão com demonstração ao fim; retrospectiva curta para decidir uma melhoria. O quadro terá três colunas: A fazer, Em andamento e Concluído. Um item só fica Concluído depois de implementado, verificado e documentado.

## 5. Product backlog
Histórias agrupam os 15 requisitos; não são 15 módulos diferentes. Pontos são apenas estimativas relativas de esforço.

| Item | História de usuário | Requisitos | Prioridade | Pontos | Sprint |
| --- | --- | --- | --- | --- | --- |
| PB01 | Como recepcionista, quero cadastrar pacientes sem CPF duplicado. | RF01 | Alta | 2 | 1 |
| PB02 | Como recepcionista, quero cadastrar médicos e vincular a agenda a paciente e médico. | RF08, RF09 | Alta | 3 | 1 |
| PB03 | Como recepcionista, quero controlar a situação do agendamento e evitar atendimento cancelado. | RF10, RF11 | Alta | 3 | 2 |
| PB04 | Como médico, quero registrar consultas com paciente e médico definidos. | RF02, RF03, RF04, RF05 | Alta | 3 | 2 |
| PB05 | Como médico, quero consultar o histórico do paciente. | RF13 | Alta | 2 | 2 |
| PB06 | Como recepcionista, quero identificar os pacientes que faltaram. | RF12 | Média | 1 | 2 |
| PB07 | Como financeiro, quero registrar e baixar pagamentos de uma consulta. | RF06, RF07 | Alta | 3 | 3 |
| PB08 | Como financeiro, quero consultar total recebido e pacientes com pendências. | RF14, RF15 | Alta | 2 | 3 |

Critérios de aceite: PB01 recusa CPF já cadastrado mesmo com pontuação diferente; PB02 cria vários agendamentos e recusa código inexistente e horário ocupado; PB03 permite confirmar, cancelar ou marcar falta e bloqueia consulta cancelada; PB04 cria uma única consulta por agendamento e marca Realizado; PB05 lista todas as consultas do paciente informado; PB06 lista somente faltas; PB07 exige consulta existente, valor positivo e situação válida; PB08 soma somente pagos no período e lista somente pendentes.

## 6. Sprints e datas
O PDF informa apresentação em 26/10/2026. As datas abaixo são um cronograma de referência que termina nessa data. Não são um registro de execução histórica. Ajustar às datas reais do grupo; as entregas listadas são previstas, sem inventar reuniões ou atividades já realizadas.

| Sprint | Datas propostas | Objetivo e tarefas | Entrega prevista | Requisitos |
| --- | --- | --- | --- | --- |
| 1 | 05/10/2026 a 11/10/2026 | Escolher escopo; desenhar banco; criar menu; cadastrar pacientes e médicos; agendar e listar agenda. | Cadastros e agenda básica. PB01 e PB02. | RF01, RF08, RF09 |
| 2 | 12/10/2026 a 18/10/2026 | Alterar situação; registrar consulta; impedir consulta cancelada; consultar histórico e faltas. | Fluxo de atendimento. PB03 a PB06. | RF02, RF03, RF04, RF05, RF10, RF11, RF12, RF13 |
| 3 | 19/10/2026 a 25/10/2026 | Registrar pagamentos; dar baixa; consultar totais e pendências; revisar documentação e preparar demonstração. | Fluxo financeiro e pacote final. PB07 e PB08. | RF06, RF07, RF14, RF15 |

Apresentação prevista no enunciado: 26/10/2026. Na revisão de cada sprint, demonstrar os critérios de aceite correspondentes. A retrospectiva registra um problema encontrado e uma melhoria para a próxima etapa.

## 7. Casos de uso
Atores: Recepcionista cuida de cadastros e agenda; Médico registra consulta e consulta histórico; Financeiro registra recebimentos e consulta relatórios. Paciente solicita atendimento à recepção e não opera o programa diretamente.

### UC01 — Cadastrar paciente
Ator: Recepcionista. Requisito: RF01. Pré-condição: sistema aberto. Fluxo: 1) escolher cadastrar paciente; 2) informar nome, CPF e telefone; 3) sistema remove pontuação do CPF, verifica formato e duplicidade; 4) salva o cadastro. Alternativas: campo vazio, CPF inválido ou duplicado mostram erro e não gravam. Pós-condição: paciente possui código único.

### UC02 — Cadastrar médico e agendar
Ator: Recepcionista. Requisitos: RF08 e RF09. Pré-condição: paciente cadastrado. Fluxo: 1) cadastrar médico com nome e CRM/UF, caso ainda não exista; 2) listar cadastros para obter códigos; 3) informar paciente, médico e data/hora; 4) sistema confere vínculos e disponibilidade; 5) salva como Agendado. Alternativas: CRM duplicado, código inexistente, data inválida ou horário ocupado impedem a gravação. Pós-condição: agendamento vinculado a um paciente e um médico.

### UC03 — Atualizar situação e consultar faltas
Ator: Recepcionista. Requisitos: RF10, RF11 e RF12. Pré-condição: agendamento existente e aberto. Fluxo: 1) listar agenda; 2) informar código; 3) confirmar, cancelar ou marcar falta; 4) sistema grava a situação; 5) se necessário, listar faltas. Alternativa: agendamento encerrado não pode ser alterado. Pós-condição: situação atualizada; uma falta aparece no relatório e um cancelamento impede o atendimento.

### UC04 — Realizar consulta
Ator: Médico. Requisitos: RF02, RF03, RF04, RF05 e RF11. Pré-condição: agendamento Agendado ou Confirmado. Fluxo: 1) informar código do agendamento; 2) registrar queixa, diagnóstico e conduta; 3) sistema grava a consulta e marca o agendamento como Realizado. Alternativas: dados vazios, agendamento cancelado, falta, já realizado ou inexistente impedem a gravação. Pós-condição: uma consulta fica ligada ao paciente e ao médico do agendamento.

### UC05 — Consultar histórico
Ator: Médico. Requisito: RF13. Pré-condição: paciente cadastrado. Fluxo: 1) informar código do paciente; 2) sistema busca todas as suas consultas; 3) exibe data, médico, queixa, diagnóstico e conduta. Alternativa: sem consultas, mostra Nenhum registro encontrado. Pós-condição: nenhuma alteração nos dados.

### UC06 — Registrar e baixar pagamento
Ator: Financeiro. Requisitos: RF06 e RF07. Pré-condição: consulta registrada. Fluxo: 1) obter o código da consulta no histórico; 2) informar valor, data, forma e situação; 3) sistema salva; 4) se pendente, usar a opção de baixa quando recebido; 5) sistema marca Pago e usa a data atual. Alternativas: consulta inexistente, valor inválido ou opções inválidas impedem o registro; pagamento inexistente ou já pago impede a baixa. Pós-condição: pagamento fica disponível para acompanhamento.

### UC07 — Consultar financeiro
Ator: Financeiro. Requisitos: RF14 e RF15. Pré-condição: sistema aberto. Fluxo: 1) escolher total recebido; 2) informar início e fim; 3) sistema soma somente pagos no intervalo; 4) em pagamentos pendentes, exibe paciente, telefone, valor e data prevista. Alternativas: período inválido gera erro; sem recebimentos, total zero; sem pendências, mensagem de lista vazia. Pós-condição: nenhuma alteração nos dados.

## 8. Diagramas simples
Os desenhos usam caixas e linhas para facilitar a leitura e permitir que sejam reproduzidos no papel. O primeiro é uma representação simplificada dos casos de uso; os demais mostram dados, atividades, sequência e estrutura.

### 8.1. Casos de uso
~~~
               +-------- CLÍNICA SIMPLES --------+
Recepcionista--| (UC01 Cadastrar paciente)         |
Recepcionista--| (UC02 Cadastrar médico / agendar) |
Recepcionista--| (UC03 Situação / faltas)          |
Médico---------| (UC04 Realizar consulta)          |
Médico---------| (UC05 Consultar histórico)        |
Financeiro-----| (UC06 Registrar / baixar pgto.)   |
Financeiro-----| (UC07 Consultar financeiro)      |
               +---------------------------------+
~~~

### 8.2. Entidade-relacionamento e cardinalidades
~~~
[PACIENTE] 1 -------- 0..N [AGENDAMENTO] 0..N -------- 1 [MÉDICO]
                                |
                                | 1
                                |
                                | 0..1
                           [CONSULTA]
                                |
                                | 1
                                |
                                | 0..N
                          [PAGAMENTO]
~~~
Cada agendamento tem um paciente e um médico. Cada consulta tem exatamente um agendamento. Um agendamento pode ainda não ter consulta. Cada pagamento pertence a uma consulta. Paciente e médico podem ter zero ou várias consultas, por meio dos agendamentos.

### 8.3. Atividades do atendimento
~~~
[Início] -> [Cadastrar paciente/médico] -> [Agendar]
                                            |
                                     [Confirmar se preciso]
                                            |
                                  <O que aconteceu?>
                                    /       |       \
                             Cancelou      Faltou    Atendeu
                                |            |          |
                           [Cancelado]  [Não compareceu] |
                                |            |     [Registrar consulta]
                              [Fim]        [Fim]        |
                                                   [Realizado]
                                                        |
                                                [Registrar pagamento]
                                                        |
                                                  <Foi recebido?>
                                                   /         \
                                                 Sim         Não
                                                  |           |
                                                [Pago]   [Pendente]
                                                  |           |
                                                [Fim]    [Baixar ao receber]
                                                              |
                                                            [Pago] -> [Fim]
~~~

### 8.4. Sequência: realizar consulta
~~~
Médico             Menu / main.js               SQLite
  | código + dados       |                       |
  |--------------------->|                       |
  |                      | INSERT consulta       |
  |                      |---------------------->|
  |                      |      validar situação |
  |                      |      gravar consulta  |
  |                      |      marcar Realizado |
  |                      |<----------------------|
  |                      | COMMIT se tudo certo  |
  |<---------------------|                       |
  | operação concluída   |                       |
~~~
Se ocorrer erro, a transação desfaz a operação. A consulta e a mudança para Realizado ficam juntas.

### 8.5. Estrutura e componentes
~~~
[Pessoa usando o terminal]
            |
            v
[main.js: menu e regras]
            |
            v
[node:sqlite: módulo do Node.js]
            |
            v
[clinica.db: banco local]

schema.sql -> cria tabelas, índice e gatilhos
~~~

## 9. Estrutura dos dados e do projeto
PK é chave primária; FK é chave estrangeira. Os códigos são gerados automaticamente pelo SQLite.

| Tabela | Campos |
| --- | --- |
| paciente | id (PK), nome, cpf (único), telefone |
| medico | id (PK), nome, crm (único, contendo UF) |
| agendamento | id (PK), paciente_id (FK), medico_id (FK), data_hora, situacao |
| consulta | id (PK), agendamento_id (FK e único), queixa, diagnostico, conduta |
| pagamento | id (PK), consulta_id (FK), valor_centavos, data, forma, situacao |

Datas são textos em formato ISO: AAAA-MM-DD; agenda usa AAAA-MM-DD HH:MM. Valores ficam em centavos inteiros para evitar erros de ponto flutuante na gravação. As ligações têm chaves estrangeiras ativadas. Consultas SQL usam parâmetros.

A data/hora do atendimento é a do agendamento, uma simplificação explícita. Não se registra um segundo horário real separado. Não há reaproveitamento de um agendamento realizado, nem alteração do paciente ou médico após o registro.

~~~
clinica/
  main.js          menu, validações e consultas
  schema.sql       estrutura do banco
  test_main.js     testes para executar com Node.js
  package.json     comandos npm start e npm test
  clinica.db       criado ao executar; começa vazio
LEIA-ME.txt         instruções de uso
Projeto_Clinica.md  documentação editável
Projeto_Clinica.pdf documentação para leitura
~~~

### Como executar
Abra a pasta clinica no VS Code e use o terminal. É necessário Node.js 22.13 ou superior.

~~~
node main.js
~~~

Também pode usar npm start. Para verificar o programa, execute npm test ou node --test test_main.js. Não é necessário executar npm install. O banco clinica.db é criado automaticamente na pasta do programa e permanece salvo depois de fechar.

## 10. Plano de testes
Os testes abaixo são o roteiro de aceite, não um registro de que o grupo já os executou.

| Teste | Ação | Resultado esperado |
| --- | --- | --- |
| T01 | Cadastrar o mesmo CPF com e sem pontuação. | Segundo cadastro recusado. |
| T02 | Agendar duas consultas do mesmo paciente em datas diferentes. | Dois registros ligados ao mesmo paciente. |
| T03 | Agendar pacientes diferentes com o mesmo médico em horários diferentes. | Agenda aceita os dois. |
| T04 | Informar paciente ou médico inexistente. | Banco recusa o vínculo. |
| T05 | Agendar o mesmo médico no mesmo instante. | Segundo agendamento recusado. |
| T06 | Cancelar e tentar realizar a consulta. | Consulta recusada. |
| T07 | Marcar falta e consultar faltas. | Paciente aparece na lista; não gera consulta. |
| T08 | Realizar agendamento aberto e repetir a operação. | Primeira grava; situação Realizado; repetição recusada. |
| T09 | Realizar consultas com médicos diferentes para um paciente. | Histórico mostra todas, sem misturar pacientes. |
| T10 | Registrar dois pagamentos para a mesma consulta. | Ambos aceitos e vinculados à consulta. |
| T11 | Registrar valor zero, negativo ou três casas decimais. | Pagamento recusado. |
| T12 | Criar R$ 150 pago e R$ 50 pendente. | Total recebido R$ 150; pendência R$ 50. |
| T13 | Dar baixa no pendente e consultar novamente. | Total R$ 200, se ambas as datas estiverem no período; sem pendência. |
| T14 | Consultar período sem pagamentos e intervalo invertido. | Zero no primeiro; erro no segundo. |
| T15 | Fechar e reabrir o programa. | Dados permanecem no banco local. |

Verificação técnica deste pacote: os 10 testes automatizados da versão JavaScript passaram usando Node.js 24.22.1. Foram verificados CPF único, vínculos, conflito de horário, cancelamento, faltas, consulta única, histórico por paciente, pagamentos, validações, as 14 opções do menu e a execução real do programa com persistência ao reabrir. Os testes usam bancos de teste separados e não alteram o banco da apresentação.

## 11. Roteiro curto da apresentação
1. Explicar o problema: cadastros, agenda e pagamentos separados dificultam acompanhar a clínica.
2. Mostrar a tabela dos 15 itens e dizer que essa é a versão reduzida escolhida.
3. Apresentar o Squad Clínica e as três sprints como cronograma proposto.
4. Mostrar o diagrama de dados e explicar o caminho paciente → agendamento → consulta → pagamento.
5. No programa, cadastrar um paciente fictício e um médico fictício; listar os códigos.
6. Agendar, registrar consulta e consultar histórico.
7. Criar um pagamento pendente de R$ 150, consultar pendências, dar baixa e consultar o total recebido.
8. Em outro agendamento, demonstrar cancelamento e tentativa bloqueada de realizar consulta.

Divisão sugerida: uma pessoa explica escopo e Scrum; outra explica casos de uso e banco; outra demonstra o programa. Ajustar conforme o tamanho do grupo, garantindo participação de todos.

## 12. O que conferir antes da entrega
Preencher nomes completos sem abreviações e RGM de todos. O PDF informa máximo de sete integrantes e presença de todos na apresentação em 26/10/2026. Uma pessoa do grupo deve enviar a entrega ao endereço indicado no enunciado: fabiops@cruzeirodosul.edu.br. Este pacote não foi enviado por e-mail.

A redução para 15 itens é uma escolha desta versão, não uma autorização contida no PDF. Confirmar o alinhamento com o professor. Substituir o cronograma proposto pelas datas e entregas reais, sem apresentar planejamento como atividade realizada.

Fonte do trabalho: Projeto_Analise_e_Projeto_de_Sistemas_sem_proibicao_IA.pdf, fornecido pelo aluno, 7 páginas. A proposta acima adapta o domínio e a lista numerada ao escopo reduzido solicitado.

Referência técnica da implementação: documentação oficial do módulo SQLite do Node.js, https://nodejs.org/download/release/v22.13.1/docs/api/sqlite.html.
