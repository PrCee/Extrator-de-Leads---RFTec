import requests
from bs4 import BeautifulSoup
import pandas as pd
import time

class JUCESCScraper:
    def __init__(self):
        self.base_url = "https://www.jucesc.sc.gov.br"
        self.session = requests.Session()
        
    def buscar_empresa(self, cnpj):
        """Busca informações da empresa na JUCESC"""
        try:
            # URL de busca
            url = f"{self.base_url}/consulta/empresa/{cnpj}"
            
            # Faz a requisição
            response = self.session.get(url)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Extrai informações básicas
                dados = {
                    'cnpj': cnpj,
                    'razao_social': self._extrair_texto(soup, 'Razão Social'),
                    'nome_fantasia': self._extrair_texto(soup, 'Nome Fantasia'),
                    'data_abertura': self._extrair_texto(soup, 'Data de Abertura'),
                    'situacao': self._extrair_texto(soup, 'Situação'),
                    'capital_social': self._extrair_texto(soup, 'Capital Social'),
                }
                
                # Extrai informações dos sócios
                dados['socios'] = self._extrair_socios(soup)
                
                return dados
            else:
                print(f"Erro ao buscar empresa {cnpj}: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"Erro ao processar empresa {cnpj}: {str(e)}")
            return None
    
    def _extrair_texto(self, soup, label):
        """Extrai texto de um campo específico"""
        try:
            elemento = soup.find('div', string=lambda text: text and label in text)
            if elemento:
                return elemento.find_next('div').text.strip()
            return None
        except:
            return None
    
    def _extrair_socios(self, soup):
        """Extrai informações dos sócios"""
        socios = []
        try:
            # Procura a seção de sócios
            secao_socios = soup.find('div', string=lambda text: text and 'Sócios' in text)
            if secao_socios:
                # Encontra a tabela de sócios
                tabela = secao_socios.find_next('table')
                if tabela:
                    # Processa cada linha da tabela
                    for linha in tabela.find_all('tr')[1:]:  # Pula o cabeçalho
                        colunas = linha.find_all('td')
                        if len(colunas) >= 2:
                            socio = {
                                'nome': colunas[0].text.strip(),
                                'cargo': colunas[1].text.strip()
                            }
                            socios.append(socio)
        except Exception as e:
            print(f"Erro ao extrair sócios: {str(e)}")
        
        return socios

    def processar_lista_empresas(self, lista_cnpjs):
        """Processa uma lista de CNPJs"""
        resultados = []
        for cnpj in lista_cnpjs:
            print(f"Processando CNPJ: {cnpj}")
            dados = self.buscar_empresa(cnpj)
            if dados:
                resultados.append(dados)
            time.sleep(2)  # Pausa para não sobrecarregar o servidor
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
            dados_empresa = {k: v for k, v in resultado.items() if k != 'socios'}
            
            # Adiciona cada sócio como uma linha separada
            for socio in resultado.get('socios', []):
                linha = dados_empresa.copy()
                linha.update(socio)
                dados_formatados.append(linha)
        
        # Cria e salva o DataFrame
        df = pd.DataFrame(dados_formatados)
        df.to_csv(arquivo_saida, index=False, encoding='utf-8-sig')
        print(f"Resultados salvos em: {arquivo_saida}")

# Exemplo de uso
if __name__ == "__main__":
    scraper = JUCESCScraper()
    
    # Lista de CNPJs para testar
    cnpjs_teste = [
        "12345678000199",  # Substitua por CNPJs reais
        "98765432000199"
    ]
    
    # Processa os CNPJs
    resultados = scraper.processar_lista_empresas(cnpjs_teste)
    
    # Salva os resultados
    scraper.salvar_resultados(resultados, "dados_empresas.csv") 