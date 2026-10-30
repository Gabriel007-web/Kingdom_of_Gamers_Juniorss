const formContato = document.querySelector('#contactForm');
const avisoFormulario = document.querySelector('#formNote');

if (formContato && avisoFormulario) {
  formContato.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!formContato.reportValidity()) return;

    const dados = new FormData(formContato);
    const payload = {
      name: String(dados.get('nome') || '').trim(),
      email: String(dados.get('email') || '').trim(),
      subject: String(dados.get('assunto') || '').trim(),
      message: String(dados.get('mensagem') || '').trim(),
    };
    const botao = formContato.querySelector('button[type="submit"]');
    const textoOriginal = botao?.textContent;
    if (botao) {
      botao.disabled = true;
      botao.textContent = 'Enviando...';
    }

    const abrirEmail = () => {
      const assunto = encodeURIComponent(`[K.G.J.] ${payload.subject}`);
      const mensagem = encodeURIComponent(`Nome: ${payload.name}\nE-mail para retorno: ${payload.email}\n\nMensagem:\n${payload.message}`);
      avisoFormulario.textContent = 'Não foi possível conectar ao backend. Seu aplicativo de e-mail será aberto.';
      window.location.href = `mailto:kgjfrontier@gmail.com.br?subject=${assunto}&body=${mensagem}`;
    };

    if (!window.kgjApi) {
      abrirEmail();
      if (botao) {
        botao.disabled = false;
        botao.textContent = textoOriginal;
      }
      return;
    }

    window.kgjApi.sendContact(payload)
      .then(() => {
        avisoFormulario.textContent = 'Mensagem enviada. A equipe K.G.J. agradece o contato.';
        formContato.reset();
      })
      .catch((erro) => {
        if (erro.status === undefined || erro.status >= 500) {
          abrirEmail();
          return;
        }
        avisoFormulario.textContent = erro.message;
      })
      .finally(() => {
        if (botao) {
          botao.disabled = false;
          botao.textContent = textoOriginal;
        }
      });
  });
}
