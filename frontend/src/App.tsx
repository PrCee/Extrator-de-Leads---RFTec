import React, { useState, useEffect } from 'react';
import './App.css';

interface Mensagem {
  id: string;
  texto: string;
  remetente: 'usuario' | 'assistente';
  timestamp: Date;
}

const App: React.FC = () => {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Simula carregamento inicial de mensagens
  useEffect(() => {
    const mensagensIniciais: Mensagem[] = [
      {
        id: '1',
        texto: 'Olá! Como posso ajudar você hoje?',
        remetente: 'assistente',
        timestamp: new Date()
      }
    ];
    setMensagens(mensagensIniciais);
  }, []);

  const enviarMensagem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim()) return;

    // Adiciona mensagem do usuário
    const mensagemUsuario: Mensagem = {
      id: Date.now().toString(),
      texto: novaMensagem,
      remetente: 'usuario',
      timestamp: new Date()
    };

    setMensagens(prev => [...prev, mensagemUsuario]);
    setNovaMensagem('');
    setCarregando(true);

    // Simula resposta do assistente após 1 segundo
    setTimeout(() => {
      const respostaAssistente: Mensagem = {
        id: (Date.now() + 1).toString(),
        texto: 'Recebi sua mensagem e estou processando. Em breve responderei com mais detalhes.',
        remetente: 'assistente',
        timestamp: new Date()
      };
      setMensagens(prev => [...prev, respostaAssistente]);
      setCarregando(false);
    }, 1000);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>WhatsApp AI Assistant</h1>
      </header>
      
      <div className="chat-container">
        {mensagens.map(mensagem => (
          <div 
            key={mensagem.id} 
            className={`mensagem ${mensagem.remetente === 'usuario' ? 'usuario' : 'assistente'}`}
          >
            <div className="mensagem-conteudo">
              {mensagem.texto}
            </div>
            <div className="mensagem-timestamp">
              {mensagem.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        
        {carregando && (
          <div className="mensagem assistente">
            <div className="mensagem-conteudo">
              <div className="digitando">Digitando...</div>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={enviarMensagem} className="form-envio">
        <input
          type="text"
          value={novaMensagem}
          onChange={(e) => setNovaMensagem(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={carregando}
        />
        <button type="submit" disabled={carregando}>
          Enviar
        </button>
      </form>
    </div>
  );
};

export default App; 