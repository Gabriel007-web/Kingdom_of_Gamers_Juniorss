const formularioConta = document.querySelector('.account-form');

if (formularioConta && window.kgjApi) {
  const botaoConta = formularioConta.querySelector('button');
  const avisoConta = document.querySelector('#accountNotice');
  const cadastro = window.location.pathname.endsWith('/criar-conta.html') || botaoConta?.textContent.toLocaleLowerCase('pt-BR').includes('criar');

  formularioConta.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (!formularioConta.reportValidity()) return;

    const original = botaoConta.textContent;
    botaoConta.disabled = true;
    botaoConta.textContent = cadastro ? 'Criando conta…' : 'Entrando…';
    if (avisoConta) avisoConta.textContent = 'Conectando à K.G.J…';

    const campos = new FormData(formularioConta);
    const dados = {
      email: String(campos.get('email') || '').trim(),
      password: String(campos.get('senha') || ''),
    };
    if (cadastro) dados.name = String(campos.get('nome') || '').trim();

    try {
      const resultado = cadastro ? await window.kgjApi.register(dados) : await window.kgjApi.login(dados);
      if (avisoConta) avisoConta.textContent = `Bem-vindo${resultado.user?.displayName ? `, ${resultado.user.displayName}` : ''}! Redirecionando…`;
      window.location.assign('index.html');
    } catch (erro) {
      if (avisoConta) avisoConta.textContent = erro.status === undefined
        ? 'Não foi possível conectar à API. Inicie o backend e tente novamente.'
        : erro.message;
      botaoConta.disabled = false;
      botaoConta.textContent = original;
    }
  });
}
