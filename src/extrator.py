"""
Módulo principal do extrator de leads
"""

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

from config import NICHOS, LIMITE_DIARIO, CHROME_OPTIONS, DELAYS

class LeadExtrator:
    def __init__(self):
        self.leads_processados = set()
        self.limite_diario = LIMITE_DIARIO
        self.nichos = NICHOS
        self.driver = None
        self.setup_driver()

    def setup_driver(self):
        """Configura o driver do Selenium com opções para evitar detecção"""
        chrome_options = Options()
        ua = UserAgent()
        chrome_options.add_argument(f'user-agent={ua.random}')
        
        for option, value in CHROME_OPTIONS.items():
            if isinstance(value, bool):
                if value:
                    chrome_options.add_argument(f'--{option}')
            else:
                chrome_options.add_argument(f'--{option}={value}')
        
        chrome_options.add_experimental_option('excludeSwitches', ['enable-automation'])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        
        # Remove webdriver flags
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        self.driver.execute_script("Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]})")
        self.driver.execute_script("Object.defineProperty(navigator, 'languages', {get: () => ['pt-BR', 'pt', 'en-US', 'en']})")

    def simular_comportamento_humano(self):
        """Simula comportamento humano para evitar detecção"""
        try:
            # Scroll suave e aleatório
            for _ in range(random.randint(3, 6)):
                scroll_amount = random.randint(300, 700)
                self.driver.execute_script(f"window.scrollBy(0, {scroll_amount});")
                time.sleep(random.uniform(*DELAYS['scroll']))
                
                # Movimento aleatório do mouse (simulado)
                self.driver.execute_script("""
                    var event = new MouseEvent('mousemove', {
                        'view': window,
                        'bubbles': true,
                        'cancelable': true,
                        'clientX': arguments[0],
                        'clientY': arguments[1]
                    });
                    document.dispatchEvent(event);
                """, random.randint(0, 1000), random.randint(0, 1000))
                
                time.sleep(random.uniform(*DELAYS['comportamento_humano']))
            
            # Simula cliques aleatórios em elementos não interativos
            try:
                elementos = self.driver.find_elements(By.CSS_SELECTOR, "div[role='article']")
                if elementos:
                    elemento_aleatorio = random.choice(elementos)
                    self.driver.execute_script("arguments[0].click();", elemento_aleatorio)
                    time.sleep(random.uniform(*DELAYS['entre_leads']))
            except:
                pass
            
        except Exception as e:
            print(f"Erro ao simular comportamento humano: {e}")

    def extrair_leads_por_nicho(self, nicho: str) -> List[Dict]:
        """Extrai leads para um nicho específico"""
        if nicho not in self.nichos:
            print(f"Nicho '{nicho}' não encontrado!")
            return []

        nicho_info = self.nichos[nicho]
        leads_totais = []

        for termo in nicho_info['termos']:
            for area in nicho_info['areas']:
                if len(self.leads_processados) >= self.limite_diario:
                    print(f"Limite diário de {self.limite_diario} leads atingido!")
                    return leads_totais

                print(f"\nBuscando: {termo} em {area}")
                leads = self.extrair_leads_do_maps(area, termo)
                if leads:
                    leads_totais.extend(leads)
                    self.leads_processados.update(set(lead['telefone'] for lead in leads))

                time.sleep(random.uniform(*DELAYS['entre_buscas']))

        return leads_totais

    def extrair_leads_do_maps(self, area: str, query: str) -> Optional[List[Dict]]:
        """Extrai leads diretamente do Google Maps"""
        if len(self.leads_processados) >= self.limite_diario:
            print("⚠️ Limite diário de leads atingido")
            return None

        try:
            print(f"🔄 Iniciando busca por: {query} em {area}")
            
            # Faz a busca no Google Maps
            self.driver.get(f"https://www.google.com/maps/search/{query}+{area}")
            time.sleep(random.uniform(4, 7))
            
            # Simula comportamento humano
            self.simular_comportamento_humano()
            
            # Aguarda os resultados carregarem
            try:
                WebDriverWait(self.driver, 15).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div[role='feed']"))
                )
            except:
                print("❌ Timeout aguardando resultados...")
                return None
            
            # Extrai os resultados
            resultados = self.driver.find_elements(By.CSS_SELECTOR, "div[role='article']")
            print(f"📊 Encontrados {len(resultados)} resultados")
            
            leads = []
            
            for i, resultado in enumerate(resultados, 1):
                if len(leads) >= self.limite_diario:
                    break

                try:
                    print(f"\n🔄 Processando resultado {i}/{len(resultados)}")
                    
                    # Simula comportamento humano antes de extrair cada resultado
                    self.simular_comportamento_humano()
                    
                    # Extrai nome
                    nome = resultado.find_element(By.CSS_SELECTOR, "div[role='heading']").text
                    print(f"📝 Nome: {nome}")
                    
                    # Extrai telefone
                    telefone = None
                    try:
                        telefone = resultado.find_element(By.CSS_SELECTOR, "button[data-item-id='phone']").text
                        print(f"📞 Telefone: {telefone}")
                    except:
                        print("❌ Telefone não encontrado")
                    
                    if telefone in self.leads_processados:
                        print("⚠️ Telefone já processado anteriormente")
                        continue

                    # Verifica se tem WhatsApp
                    tem_whatsapp = self.verificar_whatsapp(telefone) if telefone else False
                    print(f"💬 Tem WhatsApp: {'Sim' if tem_whatsapp else 'Não'}")

                    leads.append({
                        'nome': nome,
                        'telefone': telefone,
                        'tem_whatsapp': tem_whatsapp
                    })

                    self.leads_processados.add(telefone)
                    print("✅ Lead processado com sucesso!")
                    
                    time.sleep(random.uniform(*DELAYS['entre_leads']))

                except Exception as e:
                    print(f"❌ Erro ao extrair dados do resultado: {e}")
                    continue

            if leads:
                print(f"\n✨ Processamento concluído! {len(leads)} leads extraídos")
                return self.gerar_csv(area, query, leads)
            else:
                print("\n⚠️ Nenhum lead válido encontrado")

        except Exception as e:
            print(f"❌ Erro ao extrair leads: {e}")

        return None

    def verificar_whatsapp(self, telefone: str) -> bool:
        """Verifica se o número tem WhatsApp"""
        if not telefone:
            return False
            
        # Remove caracteres não numéricos
        telefone = ''.join(filter(str.isdigit, telefone))
        
        # Verifica se tem 11 dígitos (com DDD) ou 13 dígitos (com código do país)
        return len(telefone) in [11, 13]

    def gerar_csv(self, area: str, query: str, leads: List[Dict]) -> str:
        """Gera arquivo CSV com os leads"""
        if not leads:
            print("Nenhum lead para gerar CSV!")
            return None

        try:
            # Cria diretório se não existir
            diretorio = Path("leads")
            diretorio.mkdir(exist_ok=True)

            # Gera timestamp para o nome do arquivo
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
            
            print(f"\nArquivo CSV gerado: {caminho_arquivo}")
            print(f"Total de leads: {len(leads)}")
            print(f"Leads com WhatsApp: {len(leads_com_whatsapp)}")
            print(f"Leads sem WhatsApp: {len(leads_sem_whatsapp)}")
            
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