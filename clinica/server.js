const http = require('node:http');
const app = require('./main');
const { pagina, escapar } = require('./pagina');

function mensagem(erro) {
  const texto = erro.message || 'Não foi possível concluir a operação.';
  if (texto.includes('paciente.cpf')) return 'Já existe um paciente com este CPF.';
  if (texto.includes('medico.crm')) return 'Já existe um médico com este CRM.';
  if (texto.includes('agendamento.medico_id')) return 'O médico já tem um agendamento nesse horário.';
  if (texto.includes('consulta.agendamento_id')) return 'Este agendamento já possui uma consulta.';
  if (texto.includes('FOREIGN KEY')) return 'O cadastro informado não foi encontrado. Atualize a página e confira a seleção.';
  return texto;
}
function dadosDaPagina(db, url) {
  const pacienteHistorico = url.searchParams.get('paciente') || '';
  const inicio = url.searchParams.get('inicio') || app.hoje();
  const fim = url.searchParams.get('fim') || app.hoje();
  return {
    pacientes: db.prepare('SELECT * FROM paciente ORDER BY nome').all(),
    medicos: db.prepare('SELECT * FROM medico ORDER BY nome').all(),
    agendamentos: app.agenda(db),
    consultas: db.prepare('SELECT c.id,p.nome AS paciente,a.data_hora FROM consulta c JOIN agendamento a ON a.id=c.agendamento_id JOIN paciente p ON p.id=a.paciente_id ORDER BY a.data_hora DESC').all(),
    pagamentos: db.prepare('SELECT pg.*,p.nome AS paciente FROM pagamento pg JOIN consulta c ON c.id=pg.consulta_id JOIN agendamento a ON a.id=c.agendamento_id JOIN paciente p ON p.id=a.paciente_id ORDER BY pg.id DESC').all(),
    historico: pacienteHistorico ? app.historico(db, pacienteHistorico) : [],
    pendencias: app.pendencias(db), faltas: app.agenda(db, true),
    total: app.totalRecebido(db, inicio, fim),
    pacienteHistorico, inicio, fim, hoje: app.hoje(),
    secao: url.searchParams.get('secao'), mensagem: url.searchParams.get('mensagem')
  };
}
async function lerFormulario(req) {
  let tamanho = 0, conteudo = '';
  req.setEncoding('utf8');
  for await (const parte of req) {
    tamanho += Buffer.byteLength(parte);
    if (tamanho <= 65536) conteudo += parte;
  }
  if (tamanho > 65536) throw new Error('O formulário ultrapassa o tamanho permitido.');
  return new URLSearchParams(conteudo);
}
function criarServidor(db) {
  const acoes = {
    '/pacientes': { secao: 'pacientes', salvar: f => app.cadastrarPaciente(db,f.get('nome'),f.get('cpf'),f.get('telefone')) },
    '/medicos': { secao: 'medicos', salvar: f => app.cadastrarMedico(db,f.get('nome'),f.get('crm')) },
    '/agendamentos': { secao: 'agenda', salvar: f => app.agendar(db,f.get('paciente'),f.get('medico'),String(f.get('quando') || '').replace('T',' ')) },
    '/agendamentos/situacao': { secao: 'agenda', salvar: f => app.mudarSituacao(db,f.get('id'),f.get('situacao')) },
    '/consultas': { secao: 'consultas', salvar: f => app.realizar(db,f.get('agendamento'),f.get('queixa'),f.get('diagnostico'),f.get('conduta')) },
    '/pagamentos': { secao: 'pagamentos', salvar: f => app.registrarPagamento(db,f.get('consulta'),f.get('valor'),f.get('data'),f.get('forma'),f.get('situacao')) },
    '/pagamentos/baixar': { secao: 'pagamentos', salvar: f => app.baixarPagamento(db,f.get('id')) }
  };
  return http.createServer(async (req, res) => {
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-Content-Type-Options','nosniff');
    const porta = req.socket.localPort;
    const permitidos = ['localhost:'+porta,'127.0.0.1:'+porta];
    if (!permitidos.includes(req.headers.host)) { res.writeHead(403); res.end('Acesso somente por localhost.'); return; }
    const url = new URL(req.url,'http://localhost:'+porta);
    if (req.method === 'GET' && url.pathname === '/favicon.ico') { res.writeHead(204); res.end(); return; }
    if (req.method === 'GET' && url.pathname === '/') {
      try {
        const html = pagina(dadosDaPagina(db,url));
        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); res.end(html);
      } catch (erro) {
        res.writeHead(400,{'Content-Type':'text/html; charset=utf-8'});
        res.end('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Clínica Simples</title><p>'+escapar(mensagem(erro))+'</p><a href="/">Voltar</a></html>');
      }
      return;
    }
    const acao = acoes[url.pathname];
    if (req.method !== 'POST' || !acao) { res.writeHead(404); res.end('Página não encontrada.'); return; }
    if (req.headers.origin && !permitidos.some(host => req.headers.origin === 'http://'+host)) { res.writeHead(403); res.end('Origem não permitida.'); return; }
    let aviso = 'Operação concluída.';
    try { acao.salvar(await lerFormulario(req)); }
    catch (erro) { aviso = mensagem(erro); }
    const destino = '/?'+new URLSearchParams({secao:acao.secao,mensagem:aviso})+'#'+acao.secao;
    res.writeHead(303,{Location:destino}); res.end();
  });
}
function iniciar() {
  const porta = Number(process.env.PORT || 3001);
  if (!Number.isInteger(porta) || porta < 1 || porta > 65535) throw new Error('Porta inválida.');
  const db = app.conectar();
  const servidor = criarServidor(db);
  servidor.once('close',()=>db.close());
  servidor.once('error',erro=>{
    db.close();
    console.error(erro.code === 'EADDRINUSE' ? 'A porta '+porta+' já está em uso. Encerre o servidor anterior e execute novamente.' : erro.message);
    process.exitCode=1;
  });
  servidor.listen(porta,'127.0.0.1',()=>console.log('Clínica Simples: http://localhost:'+porta+'\nPara encerrar, pressione Ctrl+C.'));
  process.once('SIGINT',()=>servidor.close());
  return servidor;
}
if (require.main === module) iniciar();
module.exports = { criarServidor, iniciar };
