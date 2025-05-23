# Extrator de Leads - RFTec

Este projeto é um sistema completo de extração e enriquecimento de leads, com uma interface web moderna e integração com múltiplas fontes de dados.

## Funcionalidades Atuais

### Extração de Leads
- Busca automatizada por nichos específicos
- Suporte a múltiplas áreas geográficas
- Verificação de números de WhatsApp
- Geração de arquivos CSV com os leads encontrados
- Limite diário configurável de leads processados
- Simulação de comportamento humano para evitar bloqueios

### Enriquecimento de Dados
- Integração com LinkedIn para dados de funcionários
- Consulta à JUCESC para dados empresariais
- Extração automática de CNPJ
- Identificação de sócios e cargos de gestão

### Interface Web
- Dashboard com métricas em tempo real
- Lista de leads com filtros
- Configuração de busca por área e nicho
- Visualização de status de enriquecimento

## Tecnologias Utilizadas

### Backend
- Python 3.8+
- FastAPI
- Pandas
- Google Maps API
- BeautifulSoup4

### Frontend
- Next.js
- Tailwind CSS
- Shadcn/ui
- TypeScript

## Requisitos

- Python 3.8+
- Chrome Browser instalado
- Conexão com internet
- Node.js 16+ (para o frontend)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/PrCee/Extrator-de-Leads---RFTec.git
cd Extrator-de-Leads---RFTec
```

2. Configure as variáveis de ambiente:
```bash
# .env
LINKEDIN_CLIENT_ID=seu_client_id
LINKEDIN_CLIENT_SECRET=seu_client_secret
JUCESC_USERNAME=seu_usuario
JUCESC_PASSWORD=sua_senha
```

3. Instale as dependências do backend:
```bash
poetry install
```

4. Instale as dependências do frontend:
```bash
cd frontend
npm install
```

## Uso

1. Configure as áreas e nichos no arquivo `config.py`

2. Inicie o backend:
```bash
cd backend
poetry run python main.py
```

3. Inicie o frontend:
```bash
cd frontend
npm run dev
```

4. Acesse a interface web em `http://localhost:3000`

## Estrutura do Projeto

```
.
├── README.md
├── requirements.txt
├── config.py
├── main.py
├── backend/
│   ├── main.py
│   └── api/
├── frontend/
│   ├── app/
│   └── components/
├── src/
│   ├── __init__.py
│   ├── extrator.py
│   └── utils.py
└── leads/
    └── (arquivos CSV gerados)
```

## Roadmap de Desenvolvimento

### Curto Prazo (1-2 meses)
- [ ] Implementar autenticação básica
- [ ] Adicionar validação de números de WhatsApp
- [ ] Melhorar tratamento de erros na API
- [ ] Implementar cache de consultas à JUCESC
- [ ] Adicionar testes automatizados

### Médio Prazo (3-4 meses)
- [ ] Integração com Serasa para score de crédito
- [ ] Sistema de agendamento de buscas
- [ ] Exportação em múltiplos formatos (XLSX, PDF)
- [ ] Dashboard com gráficos e análises
- [ ] Sistema de notificações por email

### Longo Prazo (6+ meses)
- [ ] Integração com CRM
- [ ] Sistema de scoring de leads
- [ ] API pública para parceiros
- [ ] Módulo de automação de contatos
- [ ] Sistema de relatórios personalizados

## Limitações Atuais

- O extrator está sujeito às políticas de uso do Google
- A verificação de WhatsApp é baseada apenas na formatação do número
- O limite diário de leads é definido para evitar bloqueios
- Algumas consultas à JUCESC podem falhar devido a limitações do site
- A integração com LinkedIn requer autenticação manual

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
