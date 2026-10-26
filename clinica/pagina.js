const { readFileSync } = require('node:fs');
const path = require('node:path');

function escapar(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function dinheiro(centavos) {
  return (Number(centavos) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function data(valor) {
  const [dia, hora] = String(valor).split(' ');
  return dia.split('-').reverse().join('/') + (hora ? ' ' + hora : '');
}
function opcoes(lista, rotulo, selecionado = '') {
  return '<option value="">Selecione</option>' + lista.map(item => '<option value="' + item.id + '"' + (String(item.id) === String(selecionado) ? ' selected' : '') + '>' + escapar(rotulo(item)) + '</option>').join('');
}
function tabela(cabecalhos, linhas) {
  if (!linhas.length) return '<p>Nenhum registro encontrado.</p>';
  return '<div class="tabela"><table><thead><tr>' + cabecalhos.map(c => '<th>' + escapar(c) + '</th>').join('') + '</tr></thead><tbody>' + linhas.map(l => '<tr>' + l.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
}
function pagina(d) {
  const e = escapar;
  const aviso = secao => d.secao === secao && d.mensagem ? '<p class="aviso" role="status">' + e(d.mensagem) + '</p>' : '';
  const botaoSituacao = (id, situacao, rotulo) => '<form class="inline" method="post" action="/agendamentos/situacao"><input type="hidden" name="id" value="' + id + '"><input type="hidden" name="situacao" value="' + e(situacao) + '"><button>' + rotulo + '</button></form>';
  const blocos = {
    pacientes: opcoes(d.pacientes, p => p.id + ' - ' + p.nome),
    medicos: opcoes(d.medicos, m => m.id + ' - ' + m.nome),
    agendamentos: opcoes(d.agendamentos.filter(a => ['Agendado','Confirmado'].includes(a.situacao)), a => a.id + ' - ' + a.paciente + ' / ' + a.medico + ' / ' + data(a.data_hora)),
    consultas: opcoes(d.consultas, c => c.id + ' - ' + c.paciente + ' / ' + data(c.data_hora)),
    pacientesHistorico: opcoes(d.pacientes,p=>p.id+' - '+p.nome,d.pacienteHistorico),
    hoje: e(d.hoje), inicio: e(d.inicio), fim: e(d.fim), total: e(dinheiro(d.total)),
    avisoPacientes: aviso('pacientes'), avisoMedicos: aviso('medicos'), avisoAgenda: aviso('agenda'),
    avisoConsultas: aviso('consultas'), avisoPagamentos: aviso('pagamentos'),
    tabelaPacientes: tabela(['Código','Nome','CPF','Telefone'],d.pacientes.map(p=>[e(p.id),e(p.nome),e(p.cpf),e(p.telefone)])),
    tabelaMedicos: tabela(['Código','Nome','CRM/UF'],d.medicos.map(m=>[e(m.id),e(m.nome),e(m.crm)])),
    tabelaAgenda: tabela(['Código','Paciente','Médico','Data e hora','Situação','Ações'],d.agendamentos.map(a=>[e(a.id),e(a.paciente),e(a.medico),e(data(a.data_hora)),e(a.situacao),['Agendado','Confirmado'].includes(a.situacao)?(a.situacao==='Agendado'?botaoSituacao(a.id,'Confirmado','Confirmar'):'')+botaoSituacao(a.id,'Cancelado','Cancelar')+botaoSituacao(a.id,'Não compareceu','Marcar falta'):'—'])),
    tabelaHistorico: d.pacienteHistorico?tabela(['Consulta','Data e hora','Médico','Queixa','Diagnóstico','Conduta'],d.historico.map(c=>[e(c.id),e(data(c.data_hora)),e(c.medico),e(c.queixa),e(c.diagnostico),e(c.conduta)])):'<p>Selecione um paciente para consultar o histórico.</p>',
    tabelaPagamentos: tabela(['Código','Consulta','Paciente','Valor','Data','Forma','Situação','Ação'],d.pagamentos.map(p=>[e(p.id),e(p.consulta_id),e(p.paciente),e(dinheiro(p.valor_centavos)),e(data(p.data)),e(p.forma),e(p.situacao),p.situacao==='Pendente'?'<form method="post" action="/pagamentos/baixar"><input type="hidden" name="id" value="'+p.id+'"><button>Dar baixa</button></form>':'—'])),
    tabelaPendencias: tabela(['Paciente','Telefone','Pagamento','Valor','Data prevista'],d.pendencias.map(p=>[e(p.nome),e(p.telefone),e(p.pagamento),e(Number(p.valor).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})),e(data(p.data))])),
    tabelaFaltas: tabela(['Agendamento','Paciente','Médico','Data e hora'],d.faltas.map(a=>[e(a.id),e(a.paciente),e(a.medico),e(data(a.data_hora))]))
  };
  return readFileSync(path.join(__dirname,'pagina.html'),'utf8').replace(/\{\{(\w+)\}\}/g,(_,chave)=>blocos[chave] ?? '');
}
module.exports = { pagina, escapar };
