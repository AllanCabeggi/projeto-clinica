const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const app = require('./main');

function banco(t) {
  const db = app.conectar(':memory:');
  t.after(() => db.close());
  app.cadastrarPaciente(db, 'Paciente fictício', '00000000001', '11900000000');
  app.cadastrarMedico(db, 'Médico fictício', 'TESTE/SP');
  return db;
}
function consulta(db) {
  app.agendar(db, 1, 1, '2026-10-26 09:00');
  app.realizar(db, 1, 'Queixa fictícia', 'Diagnóstico fictício', 'Conduta fictícia');
}

test('CPF é normalizado e não pode ser duplicado', t => {
  const db = banco(t);
  assert.equal(app.cpfLimpo('000.000.000-01'), '00000000001');
  assert.throws(() => app.cadastrarPaciente(db, 'Outro', '000.000.000-01', '123'));
  assert.throws(() => app.cpfLimpo('abc00000000001'));
});
test('Vínculos inexistentes e horário ocupado são recusados', t => {
  const db = banco(t);
  app.agendar(db, 1, 1, '2026-10-26 09:00');
  assert.throws(() => app.agendar(db, 1, 1, '2026-10-26 09:00'));
  assert.throws(() => app.agendar(db, 999, 1, '2026-10-26 10:00'));
  assert.throws(() => app.agendar(db, 1, 999, '2026-10-26 10:00'));
});
test('Cancelamento impede consulta e libera o horário', t => {
  const db = banco(t);
  app.agendar(db, 1, 1, '2026-10-26 09:00');
  app.mudarSituacao(db, 1, 'Cancelado');
  assert.throws(() => app.realizar(db, 1, 'Q', 'D', 'C'));
  app.agendar(db, 1, 1, '2026-10-26 09:00');
  assert.equal(app.agenda(db).length, 2);
});
test('Faltas são listadas e não geram consulta', t => {
  const db = banco(t);
  app.agendar(db, 1, 1, '2026-10-26 09:00');
  app.agendar(db, 1, 1, '2026-10-26 10:00');
  app.mudarSituacao(db, 1, 'Não compareceu');
  assert.equal(app.agenda(db, true).length, 1);
  assert.throws(() => app.realizar(db, 1, 'Q', 'D', 'C'));
});
test('Consulta confirma realização e não aceita duplicação ou reabertura', t => {
  const db = banco(t);
  app.agendar(db, 1, 1, '2026-10-26 09:00');
  app.mudarSituacao(db, 1, 'Confirmado');
  app.realizar(db, 1, 'Q', 'D', 'C');
  assert.equal(app.agenda(db)[0].situacao, 'Realizado');
  assert.throws(() => app.realizar(db, 1, 'Q', 'D', 'C'));
  assert.throws(() => app.mudarSituacao(db, 1, 'Cancelado'));
});
test('Histórico permite vários médicos e isola os pacientes', t => {
  const db = banco(t);
  consulta(db);
  app.cadastrarMedico(db, 'Segundo médico', 'TESTE2/SP');
  app.cadastrarPaciente(db, 'Outro paciente', '00000000002', '123');
  app.agendar(db, 1, 2, '2026-10-27 09:00');
  app.realizar(db, 2, 'Q2', 'D2', 'C2');
  app.agendar(db, 2, 1, '2026-10-27 10:00');
  app.realizar(db, 3, 'Q3', 'D3', 'C3');
  assert.equal(app.historico(db, 1).length, 2);
  assert.equal(app.historico(db, 2).length, 1);
  assert.equal(app.historico(db, 1)[1].medico, 'Segundo médico');
});
test('Pagamentos, limites do período e baixa usam somente valores recebidos', t => {
  const db = banco(t);
  consulta(db);
  app.registrarPagamento(db, 1, '150,00', '2026-10-26', 'PIX', 'Pago');
  app.registrarPagamento(db, 1, '50', '2026-10-26', 'Dinheiro', 'Pendente');
  app.registrarPagamento(db, 1, '20', '2026-10-27', 'Crédito', 'Pago');
  assert.equal(app.totalRecebido(db, '2026-10-26', '2026-10-26'), 15000);
  assert.equal(app.totalRecebido(db, '2026-10-26', '2026-10-27'), 17000);
  assert.equal(app.totalRecebido(db, '2026-01-01', '2026-01-01'), 0);
  assert.equal(app.pendencias(db).length, 1);
  app.baixarPagamento(db, 2);
  assert.equal(app.pendencias(db).length, 0);
  assert.equal(db.prepare('SELECT data FROM pagamento WHERE id=2').get().data, app.hoje());
  assert.throws(() => app.baixarPagamento(db, 2));
  assert.throws(() => app.registrarPagamento(db, 999, '1', '2026-10-26', 'PIX', 'Pago'));
});
test('Valores, códigos e datas inválidos são recusados', t => {
  const db = banco(t);
  assert.equal(app.dinheiro('150,50'), 15050);
  assert.equal(app.dinheiro('0.01'), 1);
  for (const v of ['0', '-1', 'NaN', '1.234', '1e3', 'Infinity', '90071992547409999']) assert.throws(() => app.dinheiro(v));
  for (const d of ['2026-02-30', '2026-13-01', '2026-2-01', 'texto']) assert.throws(() => app.dataValida(d));
  assert.equal(app.dataValida('2024-02-29'), '2024-02-29');
  assert.throws(() => app.agendar(db, 1, 1, '2026-10-26 24:00'));
  assert.throws(() => app.agendar(db, -1, 1, '2026-10-26 09:00'));
  assert.throws(() => app.totalRecebido(db, '2026-10-27', '2026-10-26'));
});
test('Menu percorre as 14 opções e trata entrada incorreta', async t => {
  const db = banco(t), saidas = [];
  const executar = async (op, valores = []) => {
    let i = 0;
    await app.executar(db, op, async () => {
      assert.ok(i < valores.length, 'Faltou resposta no teste');
      return valores[i++];
    }, s => saidas.push(s));
  };
  await executar('1', ['Outro paciente', '00000000002', '123']);
  await executar('2', ['Outro médico', 'TESTE2/SP']);
  await executar('3');
  await executar('4', ['1', '1', '2026-10-26 09:00']);
  await executar('5');
  await executar('6', ['1', '1']);
  await executar('7', ['1', 'Q', 'D', 'C']);
  await executar('8', ['1']);
  await executar('9', ['1', '150', app.hoje(), '4', '1']);
  await executar('10'); await executar('13');
  await executar('11', ['1']);
  await executar('12', [app.hoje(), app.hoje()]);
  await executar('14');
  assert.ok(saidas.some(s => s.includes('R$ 150.00')));
  await assert.rejects(() => executar('99'), /Opção inválida/);
  await assert.rejects(() => executar('1', ['']), /Preencha/);
});
test('Programa real funciona com entrada, erro, saída e persistência em arquivo', t => {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'clinica-teste-'));
  t.after(() => fs.rmSync(pasta, { recursive: true, force: true }));
  for (const f of ['main.js', 'schema.sql']) fs.copyFileSync(path.join(__dirname, f), path.join(pasta, f));
  const iniciar = input => spawnSync(process.execPath, [path.join(pasta, 'main.js')], { input, encoding: 'utf8', timeout: 10000 });
  const primeiro = iniciar('99\n1\nPaciente persistente\n00000000001\n123\n0\n');
  assert.equal(primeiro.status, 0, primeiro.stderr);
  assert.match(primeiro.stdout, /Opção inválida/);
  assert.match(primeiro.stdout, /Operação concluída/);
  const segundo = iniciar('3\n0\n');
  assert.equal(segundo.status, 0, segundo.stderr);
  assert.match(segundo.stdout, /Paciente persistente/);
  const fim = iniciar('1\n');
  assert.equal(fim.status, 0, fim.stderr);
});
