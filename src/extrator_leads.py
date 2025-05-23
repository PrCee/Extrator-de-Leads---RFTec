import time
import random
import pandas as pd
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from fake_useragent import UserAgent

class LeadExtrator:
    def __init__(self):
        self.leads_processados = set()
        self.limite_diario = 30
        self.nichos = {
            'Advocacia': {
                'termos': ['escritório de advocacia', 'advogado', 'escritório jurídico'],
                'areas': ['Guarulhos', 'Arujá', 'Santa Isabel', 'Itaquaquecetuba', 'Mairiporã']
            },
            'Clínicas': {
                'termos': ['clínica médica', 'consultório médico', 'clínica de saúde'],
                'areas': ['Guarulhos', 'Arujá', 'Santa Isabel', 'Itaquaquecetuba', 'Mairiporã']
            },
            'Educação': {
                'termos': ['escola', 'curso', 'faculdade', 'instituição de ensino'],
                'areas': ['Guarulhos', 'Arujá', 'Santa Isabel', 'Itaquaquecetuba', 'Mairiporã']
            },
            'Imobiliárias': {
                'termos': ['imobiliária', 'corretor de imóveis', 'imóveis'],
                'areas': ['Guarulhos', 'Arujá', 'Santa Isabel', 'Itaquaquecetuba', 'Mairiporã']
            },
            'Contabilidade': {
                'termos': ['escritório de contabilidade', 'contador', 'contabilidade'],
                'areas': ['Guarulhos', 'Arujá', 'Santa Isabel', 'Itaquaquecetuba', 'Mairiporã']
            }
        }
        self.driver = None
        self.setup_driver()

    def setup_driver(self):
        """Configura o driver do Selenium com opções para evitar detecção"""
        options = Options()
        ua = UserAgent()
        options.add_argument(f'user-agent={ua.random}')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

    def simular_comportamento_humano(self):
        """Simula comportamento humano para evitar detecção"""
        # Scroll aleatório
        scroll_amount = random.randint(300, 700)
        self.driver.execute_script(f"window.scrollBy(0, {scroll_amount});")
        time.sleep(random.uniform(1, 3))

    def extrair_leads_por_nicho(self, nicho: str) -> List[str]:
        """Extrai leads de um nicho específico"""
        if nicho not in self.nichos:
            print(f"Nicho {nicho} não encontrado")
            return []

        arquivos_csv = []
        nicho_config = self.nichos[nicho]

        for area in nicho_config['areas']:
            for termo in nicho_config['termos']:
                query = f"{termo} em {area}"
                print(f"🔍 Buscando: {query}")
                
                arquivo_csv = self.extrair_leads(area, query)
                if arquivo_csv:
                    arquivos_csv.append(arquivo_csv)

                # Delay aleatório entre buscas
                time.sleep(random.uniform(2, 4))

        return arquivos_csv

    def extrair_leads(self, area: str, query: str) -> Optional[str]:
        """Extrai leads de uma busca específica"""
        if len(self.leads_processados) >= self.limite_diario:
            print("⚠️ Limite diário de leads atingido")
            return None

        try:
            # Faz a busca no Google
            self.driver.get(f"https://www.google.com/search?q={query}")
            time.sleep(random.uniform(2, 4))

            # Simula comportamento humano
            self.simular_comportamento_humano()

            # Extrai os resultados
            resultados = self.driver.find_elements(By.CSS_SELECTOR, "div[data-hveid]")
            leads = []

            for resultado in resultados:
                if len(leads) >= self.limite_diario:
                    break

                try:
                    nome = resultado.find_element(By.CSS_SELECTOR, "h3").text
                    telefone = resultado.find_element(By.CSS_SELECTOR, "span[data-dtype='d3ph']").text
                    
                    if telefone in self.leads_processados:
                        continue

                    endereco = resultado.find_element(By.CSS_SELECTOR, "span[data-dtype='d3adr']").text
                    site = resultado.find_element(By.CSS_SELECTOR, "a[href^='http']").get_attribute("href")

                    leads.append({
                        'nome': nome,
                        'telefone': telefone,
                        'endereco': endereco,
                        'site': site,
                        'tem_whatsapp': self.verificar_whatsapp(telefone)
                    })

                    self.leads_processados.add(telefone)

                except Exception as e:
                    print(f"Erro ao extrair dados do resultado: {e}")
                    continue

            if leads:
                return self.gerar_csv(area, query, leads)

        except Exception as e:
            print(f"❌ Erro ao extrair leads: {e}")

        return None

    def verificar_whatsapp(self, telefone: str) -> bool:
        """Verifica se um número tem WhatsApp"""
        try:
            # Remove caracteres não numéricos
            numeros = ''.join(filter(str.isdigit, telefone))
            # Verifica se tem 11 dígitos (com DDD) ou 13 dígitos (com código do país)
            return len(numeros) in [11, 13]
        except Exception as e:
            print(f"Erro ao verificar WhatsApp para {telefone}: {e}")
            return False

    def gerar_csv(self, area: str, query: str, leads: List[Dict]) -> str:
        """Gera arquivo CSV com os leads"""
        try:
            # Cria diretório para os arquivos
            diretorio = Path("leads")
            diretorio.mkdir(exist_ok=True)

            # Nome do arquivo com timestamp
            timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            nome_arquivo = f"{area.lower().replace(' ', '_')}_{timestamp}.csv"
            caminho_arquivo = diretorio / nome_arquivo

            # Separa leads com e sem WhatsApp
            leads_com_whatsapp = [lead for lead in leads if lead['tem_whatsapp']]
            leads_sem_whatsapp = [lead for lead in leads if not lead['tem_whatsapp']]

            # Cria DataFrames
            df_com_whatsapp = pd.DataFrame(leads_com_whatsapp)
            df_sem_whatsapp = pd.DataFrame(leads_sem_whatsapp)

            # Salva em CSV
            with open(caminho_arquivo, 'w', encoding='utf-8') as f:
                f.write("LEADS COM WHATSAPP\n")
                f.write("==================\n")
                df_com_whatsapp.to_csv(f, index=False)
                f.write("\nLEADS SEM WHATSAPP\n")
                f.write("==================\n")
                df_sem_whatsapp.to_csv(f, index=False)

            print(f"✅ CSV gerado: {caminho_arquivo}")
            return str(caminho_arquivo)

        except Exception as e:
            print(f"❌ Erro ao gerar CSV: {e}")
            return None

    def resetar_contador(self):
        """Reseta o contador de leads processados"""
        self.leads_processados.clear()
        print("🔄 Contador de leads resetado")

    def fechar(self):
        """Fecha o navegador"""
        if self.driver:
            self.driver.quit()
            self.driver = None

if __name__ == "__main__":
    # Exemplo de uso
    extrator = LeadExtrator()
    try:
        nichos = ['Advocacia', 'Clínicas', 'Educação']
        for nicho in nichos:
            print(f"\n📌 Testando extração para nicho: {nicho}")
            arquivos = extrator.extrair_leads_por_nicho(nicho)
            if not arquivos:
                print(f"Nenhum lead encontrado para {nicho}")
            time.sleep(2)
    finally:
        extrator.fechar() 