// Clínica Simples: JavaScript, Node.js e SQLite. Sem pacotes externos.
const { DatabaseSync } = require('node:sqlite');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

function conectar(arquivo = path.join(__dirname, 'clinica.db')) {
  const db = new DatabaseSync(arquivo);
  db.exec('PRAGMA foreign_keys=ON');
  db.exec(readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
  return db;
}

function texto(valor) {
  const v = String(valor ?? '').trim();
  if (!v) throw new Error('Preencha todos os campos.');
  return v;
}
function codigo(valor) {
  if (!/^[1-9][0-9]*$/.test(String(valor)) || !Number.isSafeInteger(Number(valor))) {
    throw new Error('O código deve ser um inteiro positivo.');
  }
  return Number(valor);
}
function cpfLimpo(valor) {
  const cpf = texto(valor).replace(/[.\-\s]/g, '');
  if (!/^[0-9]{11}$/.test(cpf)) throw new Error('CPF deve conter 11 dígitos.');
  return cpf;
}
function dinheiro(valor) {
  const v = texto(valor).replace(',', '.');
  if (!/^[0-9]+(?:\.[0-9]{1,2})?$/.test(v)) throw new Error('Use valor positivo com até duas casas decimais.');
  const [inteiro, decimal = ''] = v.split('.');
  const centavos = Number(inteiro) * 100 + Number(decimal.padEnd(2, '0'));
  if (!Number.isSafeInteger(centavos) || centavos <= 0) throw new Error('Valor inválido.');
  return centavos;
}
function dataValida(valor) {
  const v = texto(valor);
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(v)) throw new Error('Use AAAA-MM-DD.');
  const data = new Date(v + 'T00:00:00Z');
  if (!Number.isFinite(data.getTime()) || data.toISOString().slice(0, 10) !== v) throw new Error('Data inválida.');
  return v;
}
function hoje() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}
function cadastrarPaciente(db, nome, cpf, telefone) {
  return db.prepare('INSERT INTO paciente(nome,cpf,telefone) VALUES(?,?,?)')
    .run(texto(nome), cpfLimpo(cpf), texto(telefone));
}
function cadastrarMedico(db, nome, crm) {
  return db.prepare('INSERT INTO medico(nome,crm) VALUES(?,?)').run(texto(nome), texto(crm).toUpperCase());
}
function agendar(db, paciente, medico, quando) {
  const v = texto(quando);
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2} (?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(v)) {
    throw new Error('Use AAAA-MM-DD HH:MM com horário válido.');
  }
  dataValida(v.slice(0, 10));
  return db.prepare('INSERT INTO agendamento(paciente_id,medico_id,data_hora) VALUES(?,?,?)')
    .run(codigo(paciente), codigo(medico), v);
}
function mudarSituacao(db, id, situacao) {
  if (!['Confirmado', 'Cancelado', 'Não compareceu'].includes(situacao)) throw new Error('Situação inválida.');
  const r = db.prepare("UPDATE agendamento SET situacao=? WHERE id=? AND situacao IN ('Agendado','Confirmado')")
    .run(situacao, codigo(id));
  if (r.changes !== 1) throw new Error('Agendamento inexistente ou encerrado.');
}
function realizar(db, id, queixa, diagnostico, conduta) {
  // O gatilho SQL valida a situação e marca Realizado na mesma operação.
  return db.prepare('INSERT INTO consulta(agendamento_id,queixa,diagnostico,conduta) VALUES(?,?,?,?)')
    .run(codigo(id), texto(queixa), texto(diagnostico), texto(conduta));
}
function registrarPagamento(db, consulta, valor, data, forma, situacao) {
  if (!['Dinheiro', 'Crédito', 'Débito', 'PIX'].includes(forma) || !['Pendente', 'Pago'].includes(situacao)) {
    throw new Error('Forma ou situação inválida.');
  }
  return db.prepare('INSERT INTO pagamento(consulta_id,valor_centavos,data,forma,situacao) VALUES(?,?,?,?,?)')
    .run(codigo(consulta), dinheiro(valor), dataValida(data), forma, situacao);
}
function baixarPagamento(db, id) {
  const r = db.prepare("UPDATE pagamento SET situacao='Pago',data=? WHERE id=? AND situacao='Pendente'").run(hoje(), codigo(id));
  if (r.changes !== 1) throw new Error('Pagamento inexistente ou já pago.');
}
function totalRecebido(db, inicio, fim) {
  dataValida(inicio); dataValida(fim);
  if (inicio > fim) throw new Error('Início deve ser anterior ou igual ao fim.');
  return db.prepare("SELECT COALESCE(SUM(valor_centavos),0) AS total FROM pagamento WHERE situacao='Pago' AND data BETWEEN ? AND ?")
    .get(inicio, fim).total;
}
const AGENDA = 'SELECT a.id,p.nome AS paciente,m.nome AS medico,a.data_hora,a.situacao FROM agendamento a JOIN paciente p ON p.id=a.paciente_id JOIN medico m ON m.id=a.medico_id';
function agenda(db, faltas = false) {
  return db.prepare(AGENDA + (faltas ? " WHERE a.situacao='Não compareceu'" : '') + ' ORDER BY a.data_hora').all();
}
function historico(db, paciente) {
  return db.prepare('SELECT c.id,a.data_hora,m.nome AS medico,c.queixa,c.diagnostico,c.conduta FROM consulta c JOIN agendamento a ON a.id=c.agendamento_id JOIN medico m ON m.id=a.medico_id WHERE a.paciente_id=? ORDER BY a.data_hora').all(codigo(paciente));
}
function pendencias(db) {
  return db.prepare("SELECT p.nome,p.telefone,pg.id AS pagamento,printf('%.2f',pg.valor_centavos/100.0) AS valor,pg.data FROM pagamento pg JOIN consulta c ON c.id=pg.consulta_id JOIN agendamento a ON a.id=c.agendamento_id JOIN paciente p ON p.id=a.paciente_id WHERE pg.situacao='Pendente' ORDER BY p.nome").all();
}
function listar(saida, titulo, linhas) {
  saida('\n' + titulo);
  for (const linha of linhas) saida(Object.values(linha).join(' | '));
  if (!linhas.length) saida('Nenhum registro encontrado.');
}
const MENU = '\nCLÍNICA SIMPLES\n1 Cadastrar paciente       2 Cadastrar médico\n3 Listar cadastros         4 Agendar consulta\n5 Listar agenda            6 Confirmar, cancelar ou marcar falta\n7 Realizar consulta        8 Histórico do paciente\n9 Registrar pagamento    10 Listar pagamentos\n11 Baixar pagamento      12 Total recebido por período\n13 Pagamentos pendentes  14 Pacientes que faltaram\n0 Sair';

async function executar(db, op, perguntar, saida = console.log) {
  const ler = async msg => texto(await perguntar(msg + ': '));
  switch (op) {
    case '1': cadastrarPaciente(db, await ler('Nome paciente'), await ler('CPF'), await ler('Telefone')); break;
    case '2': cadastrarMedico(db, await ler('Nome médico'), await ler('CRM/UF')); break;
    case '3':
      listar(saida, 'Pacientes: código | nome | CPF | telefone', db.prepare('SELECT * FROM paciente ORDER BY nome').all());
      listar(saida, 'Médicos: código | nome | CRM', db.prepare('SELECT * FROM medico ORDER BY nome').all()); break;
    case '4': agendar(db, await ler('Código paciente'), await ler('Código médico'), await ler('Data/hora AAAA-MM-DD HH:MM')); break;
    case '5': listar(saida, 'Agenda: código | paciente | médico | data/hora | situação', agenda(db)); break;
    case '6': {
      const id = await ler('Código agendamento');
      const situacao = { 1: 'Confirmado', 2: 'Cancelado', 3: 'Não compareceu' }[await ler('1 Confirmar / 2 Cancelar / 3 Marcar falta')];
      mudarSituacao(db, id, situacao); break;
    }
    case '7': realizar(db, await ler('Código agendamento'), await ler('Queixa'), await ler('Diagnóstico'), await ler('Conduta')); break;
    case '8': listar(saida, 'Histórico: consulta | data/hora | médico | queixa | diagnóstico | conduta', historico(db, await ler('Código paciente'))); break;
    case '9': {
      const id = await ler('Código consulta'), valor = await ler('Valor (ex.: 150,00)');
      const data = await ler('Data prevista ou do recebimento AAAA-MM-DD');
      const forma = { 1: 'Dinheiro', 2: 'Crédito', 3: 'Débito', 4: 'PIX' }[await ler('1 Dinheiro / 2 Crédito / 3 Débito / 4 PIX')];
      const situacao = { 1: 'Pendente', 2: 'Pago' }[await ler('1 Pendente / 2 Pago')];
      registrarPagamento(db, id, valor, data, forma, situacao); break;
    }
    case '10': listar(saida, 'Pagamentos: código | consulta | R$ | data | forma | situação', db.prepare("SELECT id,consulta_id,printf('%.2f',valor_centavos/100.0) AS valor,data,forma,situacao FROM pagamento ORDER BY id").all()); break;
    case '11': baixarPagamento(db, await ler('Código pagamento')); break;
    case '12': {
      const inicio = await ler('Início AAAA-MM-DD'), fim = await ler('Fim AAAA-MM-DD');
      saida('Total recebido no período: R$ ' + (totalRecebido(db, inicio, fim) / 100).toFixed(2)); break;
    }
    case '13': listar(saida, 'Pendências: paciente | telefone | pagamento | R$ | vencimento', pendencias(db)); break;
    case '14': listar(saida, 'Faltas: código | paciente | médico | data/hora | situação', agenda(db, true)); break;
    default: throw new Error('Opção inválida.');
  }
  saida('Operação concluída.');
}
async function main() {
  const db = conectar();
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  const linhas = rl[Symbol.asyncIterator]();
  const perguntar = async mensagem => {
    process.stdout.write(mensagem);
    const resposta = await linhas.next();
    if (resposta.done) { const erro = new Error('Entrada encerrada.'); erro.code = 'FIM'; throw erro; }
    return resposta.value.trim();
  };
  try {
    while (true) {
      console.log(MENU);
      const op = await perguntar('Opção: ');
      if (op === '0') break;
      try { await executar(db, op, perguntar); }
      catch (erro) {
        if (erro.code === 'FIM') break;
        console.log('Não foi possível concluir: ' + erro.message);
      }
    }
  } catch (erro) {
    if (erro.code !== 'FIM') throw erro;
  } finally { rl.close(); db.close(); }
}
if (require.main === module) main().catch(erro => { console.error(erro.message); process.exitCode = 1; });
module.exports = { conectar, texto, codigo, cpfLimpo, dinheiro, dataValida, hoje, cadastrarPaciente, cadastrarMedico, agendar, mudarSituacao, realizar, registrarPagamento, baixarPagamento, totalRecebido, agenda, historico, pendencias, executar, main };
