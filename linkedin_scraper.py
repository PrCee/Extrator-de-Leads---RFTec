import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import re

class LinkedInScraper:
    def __init__(self):
        self.session = requests.Session()
        # Adicione seus headers aqui para simular um navegador
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    def buscar_empresa(self, nome_empresa):
        """Busca informações da empresa no LinkedIn"""
        try:
            # URL de busca da empresa
            url = f"https://www.linkedin.com/search/results/companies/?keywords={nome_empresa}"
            
            # Faz a requisição
            response = self.session.get(url, headers=self.headers)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Extrai informações básicas
                dados = {
                    'nome_empresa': nome_empresa,
                    'url_linkedin': self._extrair_url_empresa(soup),
                    'funcionarios': self._extrair_numero_funcionarios(soup),
                    'setor': self._extrair_setor(soup)
                }
                
                # Se encontrou a empresa, busca funcionários
                if dados['url_linkedin']:
                    dados['funcionarios_chave'] = self._buscar_funcionarios_chave(dados['url_linkedin'])
                
                return dados
            else:
                print(f"Erro ao buscar empresa {nome_empresa}: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"Erro ao processar empresa {nome_empresa}: {str(e)}")
            return None
    
    def _extrair_url_empresa(self, soup):
        """Extrai a URL do perfil da empresa"""
        try:
            link = soup.find('a', {'class': 'app-aware-link'})
            if link and 'href' in link.attrs:
                return link['href']
            return None
        except:
            return None
    
    def _extrair_numero_funcionarios(self, soup):
        """Extrai o número de funcionários"""
        try:
            texto = soup.find('span', string=re.compile(r'\d+\s*-\s*\d+\s*funcionários'))
            if texto:
                return texto.text.strip()
            return None
        except:
            return None
    
    def _extrair_setor(self, soup):
        """Extrai o setor da empresa"""
        try:
            setor = soup.find('span', string=re.compile(r'Setor'))
            if setor:
                return setor.find_next('span').text.strip()
            return None
        except:
            return None
    
    def _buscar_funcionarios_chave(self, url_empresa):
        """Busca funcionários-chave da empresa"""
        funcionarios = []
        try:
            # URL de busca de funcionários
            url = f"{url_empresa}/people/"
            response = self.session.get(url, headers=self.headers)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Procura por funcionários
                for funcionario in soup.find_all('div', {'class': 'org-people-profile-card'}):
                    nome = funcionario.find('div', {'class': 'org-people-profile-card__profile-title'})
                    cargo = funcionario.find('div', {'class': 'org-people-profile-card__profile-position'})
                    
                    if nome and cargo:
                        funcionarios.append({
                            'nome': nome.text.strip(),
                            'cargo': cargo.text.strip()
                        })
            
            return funcionarios
        except Exception as e:
            print(f"Erro ao buscar funcionários: {str(e)}")
            return []

    def processar_lista_empresas(self, lista_empresas):
        """Processa uma lista de empresas"""
        resultados = []
        for empresa in lista_empresas:
            print(f"Processando empresa: {empresa}")
            dados = self.buscar_empresa(empresa)
            if dados:
                resultados.append(dados)
            time.sleep(5)  # Pausa maior para evitar bloqueio
        return resultados

    def salvar_resultados(self, resultados, arquivo_saida):
        """Salva os resultados em um arquivo CSV"""
        if not resultados:
            print("Nenhum resultado para salvar!")
            return
        
        # Prepara os dados para o DataFrame
        dados_formatados = []
        for resultado in resultados:
            # Dados básicos da empresa
            dados_empresa = {k: v for k, v in resultado.items() if k != 'funcionarios_chave'}
            
            # Adiciona cada funcionário como uma linha separada
            for funcionario in resultado.get('funcionarios_chave', []):
                linha = dados_empresa.copy()
                linha.update(funcionario)
                dados_formatados.append(linha)
        
        # Cria e salva o DataFrame
        df = pd.DataFrame(dados_formatados)
        df.to_csv(arquivo_saida, index=False, encoding='utf-8-sig')
        print(f"Resultados salvos em: {arquivo_saida}")

# Exemplo de uso
if __name__ == "__main__":
    scraper = LinkedInScraper()
    
    # Lista de empresas para testar
    empresas_teste = [
        "Empresa Teste 1",
        "Empresa Teste 2"
    ]
    
    # Processa as empresas
    resultados = scraper.processar_lista_empresas(empresas_teste)
    
    # Salva os resultados
    scraper.salvar_resultados(resultados, "dados_linkedin.csv") 