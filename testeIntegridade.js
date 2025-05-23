import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando integridade do projeto...\n');

// Verifica se os arquivos necessários existem
const arquivosNecessarios = [
  'src/service/googleMapsExtractor.ts',
  'src/service/audio.ts',
  'src/testes/testeIntegracao.ts',
  'frontend/src/App.tsx',
  'frontend/src/App.css',
  'frontend/public/index.html',
  'frontend/public/manifest.json'
];

let todosArquivosExistem = true;
arquivosNecessarios.forEach(arquivo => {
  const existe = fs.existsSync(arquivo);
  console.log(`${existe ? '✅' : '❌'} ${arquivo}`);
  if (!existe) todosArquivosExistem = false;
});

// Verifica se as dependências estão instaladas
console.log('\n📦 Verificando dependências...');
try {
  execSync('npm list @googlemaps/google-maps-services-js @types/uuid', { stdio: 'ignore' });
  console.log('✅ Dependências do backend instaladas');
} catch (error) {
  console.log('❌ Algumas dependências do backend estão faltando');
}

try {
  execSync('cd frontend && npm list react react-dom', { stdio: 'ignore' });
  console.log('✅ Dependências do frontend instaladas');
} catch (error) {
  console.log('❌ Algumas dependências do frontend estão faltando');
}

// Verifica se o arquivo .env existe
const envExiste = fs.existsSync('.env');
console.log(`\n🔐 Arquivo .env: ${envExiste ? '✅ Existe' : '❌ Não existe'}`);

// Instruções para rodar o projeto
console.log('\n🚀 Para rodar o projeto:');
console.log('1. Instale as dependências: npm install');
console.log('2. Configure o ambiente: npm run config');
console.log('3. Para rodar os testes: npm test');
console.log('4. Para rodar o backend: npm run dev');
console.log('5. Para rodar o frontend: cd frontend && npm start');

// Conclusão
console.log('\n📊 Resumo:');
console.log(`- Arquivos necessários: ${todosArquivosExistem ? '✅ Todos existem' : '❌ Alguns faltam'}`);
console.log(`- Configuração: ${envExiste ? '✅ Configurado' : '❌ Não configurado'}`);

if (todosArquivosExistem && envExiste) {
  console.log('\n✨ O projeto está pronto para ser executado!');
} else {
  console.log('\n⚠️ O projeto precisa de ajustes antes de ser executado.');
} 