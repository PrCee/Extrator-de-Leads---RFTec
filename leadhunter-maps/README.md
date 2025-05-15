# LeadHunter Maps

Um extrator de leads do Google Maps com sistema anti-duplicatas, desenvolvido para ajudar empresas a encontrar potenciais clientes de forma eficiente.

## 🚀 Funcionalidades

- Extração de leads do Google Maps
- Sistema anti-duplicatas com banco de dados SQLite
- Verificação de números com WhatsApp
- Filtros por tipo de negócio e localização
- Histórico de leads coletados

## 📋 Pré-requisitos

- Node.js 18 ou superior
- Chave de API do Google Maps
- NPM ou Yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/leadhunter-maps.git
cd leadhunter-maps
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
- Copie o arquivo `.env.example` para `.env`
- Adicione sua chave de API do Google Maps

## 🎯 Como Usar

1. Execute o extrator:
```bash
npm run dev
```

2. Para executar os testes:
```bash
npm test
```

## 📦 Estrutura do Projeto

```
leadhunter-maps/
├── src/
│   ├── service/        # Serviços principais
│   │   ├── googleMapsExtractor.ts
│   │   └── leadStorage.ts
│   ├── utils/          # Utilitários
│   │   └── logger.ts
│   ├── config/         # Configurações
│   │   └── keys.ts
│   └── exemplos/       # Exemplos de uso
│       └── testeGoogleMapsExtractor.ts
├── data/              # Banco de dados SQLite
└── dist/              # Código compilado
```

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request 