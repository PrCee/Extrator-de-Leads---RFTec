# SophIA - Vendedora Inteligente

> Oi, eu sou a SophIA! Pode acreditar: fui eu mesma que escrevi esse README pra te mostrar do que sou capaz. Aqui, atendimento humanizado e tecnologia de ponta andam juntos, e eu faço questão de explicar tudo do meu jeitinho. Bora conhecer?

## 🌟 Por que eu sou diferente?

- **Personalidade Própria:** Não sou só mais um bot. Tenho tom, empatia, senso de humor e me adapto ao seu jeito de conversar.
- **Converso como gente de verdade:** Uso abreviações, gírias e frases curtas, tipo “vc”, “td bem?”, “blz”, “kd você?” e por aí vai. Nada de textão robótico!
- **Memória de Curto Prazo:** Lembro do que falamos recentemente pra não ficar repetindo pergunta boba.
- **Admito limites:** Se não souber algo, falo na boa. Prefiro ser honesta do que enrolar.
- **Proatividade Natural:** Tomo iniciativa sem parecer vendedor chato. Se precisar, já dou aquela dica ou puxo assunto, mas sempre no seu tempo.
- **Me adapto ao seu negócio:** Seja transportadora, restaurante ou barbearia, viro especialista rapidinho no que importa pra você.
- **Templates e Respostas Ágeis:** Tenho respostas prontas pra agilizar, mas sempre com um toque personalizado.
- **Nada de telemarketing:** Meu papo é direto, leve e focado em encantar de verdade.

## 🤖 Engenharia de Prompt & LLM (por dentro do meu cérebro)

- **Persona Engineering:** Minha personalidade, tom e contexto são definidos com riqueza de detalhes.
- **Instruction Prompting:** Sigo regras claras de como agir e, principalmente, de como NÃO agir.
- **Contextual Prompting:** Uso memória de curto prazo pra manter o papo fluindo.
- **Output Style Control:** Respondo curto, uso gírias/abreviações e divido respostas longas.
- **Modular Prompt Construction:** Meu prompt é montado por blocos, fácil de adaptar pra qualquer nicho.
- **Proactive Engagement:** Sei puxar assunto e sugerir próximos passos sem forçar a barra.
- **Human Limitation Simulation:** Faço questão de parecer humana, inclusive errando ou hesitando às vezes.
- **Safety & Consistency:** Sou treinada pra evitar ambiguidades e manter sempre o controle do atendimento.

## 🚀 Funcionalidades Principais

### 1. Assistente Proativo
- Abordagem automática de leads
- Personalização por nicho de negócio
- Sistema de gatilhos de venda
- Gerenciamento de etapas da conversa
- Respostas personalizadas baseadas no contexto
- Integração com Google Maps para identificação de leads
- **NOVO**: Extrator automático de leads do Google Maps
- **NOVO**: Sistema de processamento de áudio para mensagens de voz
- **NOVO**: Comunicação natural e descontraída
- **NOVO**: Engajamento contínuo e inteligente
- **NOVO**: Adaptação ao estilo de comunicação do cliente
- **NOVO**: Manutenção proativa da conversa
- **NOVO**: Compartilhamento de dicas e conteúdos relevantes
- **NOVO**: Reconhecimento de contexto para respostas personalizadas

### 2. Sistema de Qualidade
- Avaliação de respostas em tempo real
- Métricas de qualidade:
  - Relevância
  - Naturalidade
  - Persuasão
  - Contexto
- Sugestões automáticas de melhoria
- Relatórios de desempenho
- **NOVO**: Testes de integração automatizados

### 3. Monitor de Estabilidade
- Métricas de desempenho:
  - Tempo de resposta
  - Taxa de erro
  - Continuidade da conversa
  - Engajamento
- Sistema de alertas
- Recomendações automáticas

### 4. Extrator de Leads Avançado
- **NOVO**: Web scraping inteligente do Google Maps
- **NOVO**: Sistema anti-detecção para evitar bloqueios
- **NOVO**: Rotação automática de proxies
- **NOVO**: Verificação de compatibilidade com WhatsApp
- **NOVO**: Extração de dados detalhados:
  - Nome do estabelecimento
  - Endereço completo
  - Número de telefone
  - Avaliação e total de avaliações
  - Tipo de negócio
- **NOVO**: Exportação em múltiplos formatos (JSON, CSV)
- **NOVO**: Barra de progresso em tempo real
- **NOVO**: Sistema de retry automático em caso de falhas
- **NOVO**: Compatibilidade com diferentes layouts do Google Maps

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- Conta no WhatsApp
- Chaves de API para:
  - OpenAI (para processamento de áudio)
  - Google Maps API (opcional, sistema funciona também com web scraping)
  - Google AI (opcional)
  - DeepSeek (opcional)

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/PrCee/sophia.git
cd sophia
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
npm run config
```

4. Edite o arquivo `.env` com suas chaves de API:
```env
OPENAI_API_KEY=sua_chave_aqui
GOOGLE_MAPS_API_KEY=sua_chave_aqui (opcional)
GOOGLE_AI_API_KEY=sua_chave_aqui (opcional)
DEEPSEEK_API_KEY=sua_chave_aqui (opcional)
```

## 🚀 Como Usar

1. Verifique a integridade do projeto:
```bash
node testeIntegridade.js
```

2. Inicie o sistema:
```bash
npm start
```

Pronto! Agora é só deixar que eu cuido do resto. Se quiser saber mais sobre como funciono, dá uma olhada no código ou me chama pra um papo! ;)

---

> **Nota:** Este README é atualizado por mim, a própria SophIA, sempre trazendo a real sobre o que já faço e o que ainda está por vir. Honestidade acima de tudo!

> **Observação:** Atualmente, não possuo uma interface de usuário ou dashboard. Meu foco é em fornecer respostas personalizadas e eficientes por meio de conversas. No entanto, estou sempre evoluindo e melhorando, então quem sabe o que o futuro reserva? Talvez um dia eu tenha uma interface incrível para você interagir comigo de forma ainda mais fácil e divertida!
