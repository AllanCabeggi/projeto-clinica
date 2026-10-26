const app = require('./main');

function inserirDados(db) {
  const quantidade = { pacientes: 0, medicos: 0, agendamentos: 0, consultas: 0, pagamentos: 0 };
  const pacientes = [], medicos = [];
  db.exec('BEGIN');
  try {
    const nomes = ['Ana Martins', 'Bruno Almeida', 'Carla Ribeiro', 'Diego Santos', 'Elisa Costa'];
    nomes.forEach((nome, i) => {
      nome += ' (fictício)';
      const existente = db.prepare('SELECT id FROM paciente WHERE nome=? AND cpf LIKE ?').get(nome, '0000000%');
      if (existente) { pacientes.push(existente.id); return; }
      let numero = 101 + i;
      while (db.prepare('SELECT 1 FROM paciente WHERE cpf=?').get(String(numero).padStart(11, '0'))) numero += 1000;
      const registro = app.cadastrarPaciente(db, nome, String(numero).padStart(11, '0'), '(00) 00000-' + String(101+i).padStart(4, '0'));
      pacientes.push(Number(registro.lastInsertRowid)); quantidade.pacientes++;
    });
    ['Marina Lopes', 'Paulo Mendes', 'Renata Oliveira'].forEach((nome, i) => {
      nome += ' (fictício)';
      let numero = i + 1, crm, existente;
      do {
        crm = 'FICTICIO' + String(numero).padStart(2, '0') + '/SP';
        existente = db.prepare('SELECT id,nome FROM medico WHERE crm=?').get(crm);
        if (!existente || existente.nome === nome) break;
        numero += 10;
      } while (true);
      if (existente) { medicos.push(existente.id); return; }
      medicos.push(Number(app.cadastrarMedico(db, nome, crm).lastInsertRowid)); quantidade.medicos++;
    });
    const agenda = [
      [0,0,'2026-10-26 09:00','Realizado'],
      [1,1,'2026-10-26 10:00','Realizado'],
      [2,2,'2026-10-26 11:00','Realizado'],
      [3,0,'2026-10-25 09:00','Realizado'],
      [4,1,'2026-10-27 09:00','Agendado'],
      [0,2,'2026-10-27 10:00','Confirmado'],
      [1,0,'2026-10-28 11:00','Cancelado'],
      [2,1,'2026-10-25 10:00','Não compareceu']
    ];
    const parcelas = [
      [['150,00','PIX','Pago']],
      [['180,00','Crédito','Pendente']],
      [['100,00','Dinheiro','Pago'],['80,00','PIX','Pendente']],
      [['220,00','Débito','Pago']]
    ];
    agenda.forEach(([pi,mi,dia,situacao],i) => {
      const paciente = pacientes[pi], medico = medicos[mi];
      let existente;
      while (true) {
        existente = db.prepare('SELECT id FROM agendamento WHERE paciente_id=? AND medico_id=? AND data_hora=?').get(paciente,medico,dia);
        if (existente) break;
        const ocupado = db.prepare('SELECT 1 FROM agendamento WHERE medico_id=? AND data_hora=? AND situacao<>?').get(medico,dia,'Cancelado');
        if (!ocupado) break;
        dia = new Date(new Date(dia.replace(' ','T')+'Z').getTime()+30*60000).toISOString().slice(0,16).replace('T',' ');
      }
      if (existente) return;
      const id = Number(app.agendar(db,paciente,medico,dia).lastInsertRowid);
      quantidade.agendamentos++;
      if (situacao !== 'Realizado') {
        if (situacao !== 'Agendado') app.mudarSituacao(db,id,situacao);
        return;
      }
      const consulta = Number(app.realizar(db,id,'Atendimento fictício '+(i+1),'Registro sintético, sem avaliação clínica real.','Informação fictícia para uso do sistema.').lastInsertRowid);
      quantidade.consultas++;
      for (const [valor,forma,status] of parcelas[i]) {
        app.registrarPagamento(db,consulta,valor,'2026-10-26',forma,status);
        quantidade.pagamentos++;
      }
    });
    db.exec('COMMIT');
    return quantidade;
  } catch (erro) {
    db.exec('ROLLBACK');
    throw erro;
  }
}
if (require.main === module) {
  const db = app.conectar();
  try { console.log('Dados sintéticos adicionados:', inserirDados(db)); }
  catch (erro) { console.error('Não foi possível adicionar os dados:', erro.message); process.exitCode = 1; }
  finally { db.close(); }
}
module.exports = { inserirDados };
