import time
import random
import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from fake_useragent import UserAgent
import os
from datetime import datetime
from typing import Optional

class LeadExtrator:
    def __init__(self):
        self.driver = None
        self.leads_processados = set()
        self.leads_por_dia = 50
        self.nichos = {
            'Escritórios': {
                'termos': ['escritório comercial', 'escritório empresarial', 'escritório corporativo'],
                'areas': ['Guarulhos', 'Arujá', 'Santana', 'Tucuruvi', 'Jaçanã', 'Tremembé']
            },
            'Clínicas': {
                'termos': ['clínica médica', 'consultório médico', 'clínica de saúde', 'clínica odontológica'],
                'areas': ['Guarulhos', 'Arujá', 'Santana', 'Tucuruvi', 'Jaçanã', 'Tremembé']
            },
            'Escolas': {
                'termos': ['escola particular', 'colégio particular', 'curso profissionalizante', 'escola técnica'],
                'areas': ['Guarulhos', 'Arujá', 'Santana', 'Tucuruvi', 'Jaçanã', 'Tremembé']
            },
            'Imobiliárias': {
                'termos': ['imobiliária', 'corretor de imóveis', 'agência imobiliária'],
                'areas': ['Guarulhos', 'Arujá', 'Santana', 'Tucuruvi', 'Jaçanã', 'Tremembé']
            },
            'Lojas': {
                'termos': ['loja de roupas', 'loja de calçados', 'loja de eletrônicos', 'loja de móveis'],
                'areas': ['Guarulhos', 'Arujá', 'Santana', 'Tucuruvi', 'Jaçanã', 'Tremembé']
            },
            'Restaurantes': {
                'termos': ['restaurante', 'lanchonete', 'pizzaria', 'padaria'],
                'areas': ['Guarulhos', 'Arujá', 'Santana', 'Tucuruvi', 'Jaçanã', 'Tremembé']
            },
            'Academias': {
                'termos': ['academia', 'academia de ginástica', 'academia de musculação'],
                'areas': ['Guarulhos', 'Arujá', 'Santana', 'Tucuruvi', 'Jaçanã', 'Tremembé']
            },
            'Salões': {
                'termos': ['salão de beleza', 'barbearia', 'cabeleireiro'],
                'areas': ['Guarulhos', 'Arujá', 'Santana', 'Tucuruvi', 'Jaçanã', 'Tremembé']
            }
        }
        self.setup_driver()

    def setup_driver(self):
        """Configura o driver do Selenium com opções para evitar detecção"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--disable-notifications')
        chrome_options.add_argument('--disable-popup-blocking')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument('--disable-extensions')
        chrome_options.add_experimental_option('excludeSwitches', ['enable-automation'])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        # Adiciona a chave da API do Google Maps
        chrome_options.add_argument('--google-api-key=AIzaSyDeNMN9xmMebh96IOUWCG8-XOM2hvuP_vE')
        
        self.driver = webdriver.Chrome(options=chrome_options)
        
        # Remove webdriver flags
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        self.driver.execute_script("Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]})")
        self.driver.execute_script("Object.defineProperty(navigator, 'languages', {get: () => ['pt-BR', 'pt', 'en-US', 'en']})")
        
        # Adiciona mais propriedades para parecer mais humano
        self.driver.execute_script("""
            Object.defineProperty(navigator, 'platform', {get: () => 'Win32'});
            Object.defineProperty(navigator, 'hardwareConcurrency', {get: () => 8});
            Object.defineProperty(navigator, 'deviceMemory', {get: () => 8});
            Object.defineProperty(navigator, 'maxTouchPoints', {get: () => 0});
        """)

    def simular_comportamento_humano(self):
        """Simula comportamento humano para evitar detecção"""
        try:
            # Scroll suave e aleatório
            for _ in range(random.randint(3, 6)):
                scroll_amount = random.randint(300, 700)
                self.driver.execute_script(f"window.scrollBy(0, {scroll_amount});")
                time.sleep(random.uniform(1, 2))
                
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
                
                # Pausa aleatória entre movimentos
                time.sleep(random.uniform(0.5, 1.5))
            
            # Simula cliques aleatórios em elementos não interativos
            try:
                elementos = self.driver.find_elements(By.CSS_SELECTOR, "div[role='article']")
                if elementos:
                    elemento_aleatorio = random.choice(elementos)
                    self.driver.execute_script("arguments[0].click();", elemento_aleatorio)
                    time.sleep(random.uniform(1, 2))
            except:
                pass
            
            # Pausa final aleatória
            time.sleep(random.uniform(2, 4))
            
        except Exception as e:
            print(f"Erro ao simular comportamento humano: {e}")

    def extrair_leads_por_nicho(self, nicho):
        """Extrai leads para um nicho específico"""
        if nicho not in self.nichos:
            print(f"Nicho '{nicho}' não encontrado!")
            return

        nicho_info = self.nichos[nicho]
        leads_totais = []

        for termo in nicho_info['termos']:
            for area in nicho_info['areas']:
                if len(self.leads_processados) >= self.leads_por_dia:
                    print(f"Limite diário de {self.leads_por_dia} leads atingido!")
                    return leads_totais

                print(f"\nBuscando: {termo} em {area}")
                leads = self.extrair_leads_do_maps(area, termo)
                if leads:
                    leads_totais.extend(leads)
                    self.leads_processados.update(set(lead['telefone'] for lead in leads))

                # Pausa entre buscas
                time.sleep(random.uniform(2, 4))

        return leads_totais

    def extrair_leads_do_maps(self, area: str, query: str) -> Optional[list]:
        """Extrai leads diretamente do Google Maps"""
        if len(self.leads_processados) >= self.leads_por_dia:
            print("⚠️ Limite diário de leads atingido")
            return None

        try:
            print(f"🔄 Iniciando busca por: {query} em {area}")
            
            # Adiciona delay aleatório antes da busca
            time.sleep(random.uniform(3, 6))
            
            # Faz a busca no Google Maps
            print("🌐 Acessando Google Maps...")
            self.driver.get(f"https://www.google.com/maps/search/{query}+{area}")
            
            # Pausa inicial aleatória
            print("⏳ Aguardando carregamento inicial...")
            time.sleep(random.uniform(4, 7))
            
            # Simula comportamento humano
            print("👤 Simulando comportamento humano...")
            self.simular_comportamento_humano()
            
            # Aguarda os resultados carregarem com timeout maior
            print("🔍 Aguardando resultados...")
            try:
                WebDriverWait(self.driver, 15).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div[role='feed']"))
                )
                print("✅ Resultados carregados!")
            except:
                print("❌ Timeout aguardando resultados...")
                return None
            
            # Extrai os resultados
            print("📋 Extraindo resultados...")
            resultados = self.driver.find_elements(By.CSS_SELECTOR, "div[role='article']")
            print(f"📊 Encontrados {len(resultados)} resultados")
            
            leads = []
            
            for i, resultado in enumerate(resultados, 1):
                if len(leads) >= self.leads_por_dia:
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
                    
                    # Pausa aleatória entre extrações
                    time.sleep(random.uniform(1, 2))

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

    def verificar_whatsapp(self, telefone):
        """Verifica se o número tem WhatsApp"""
        if not telefone:
            return False

        # Verifica se tem 11 dígitos (com DDD) ou 13 dígitos (com código do país)
        return len(telefone) in [11, 13]

    def gerar_csv(self, area, query, leads):
        """Gera arquivo CSV com os leads"""
        if not leads:
            print("Nenhum lead para gerar CSV!")
            return

        # Cria diretório se não existir
        if not os.path.exists('leads'):
            os.makedirs('leads')

        # Gera timestamp para o nome do arquivo
        timestamp = datetime.now().strftime("%Y-%m-%dT%H-%M-%S-%f")
        
        # Nome do arquivo baseado no nicho
        nome_arquivo = f"leads/{area.lower()}_{query.lower()}_{timestamp}.csv"
        
        # Separa leads com e sem WhatsApp
        leads_com_whatsapp = [lead for lead in leads if lead['tem_whatsapp']]
        leads_sem_whatsapp = [lead for lead in leads if not lead['tem_whatsapp']]
        
        # Cria DataFrame e salva CSV
        with open(nome_arquivo, 'w', encoding='utf-8-sig') as f:
            f.write("LEADS COM WHATSAPP\n")
            f.write("==================\n")
            pd.DataFrame(leads_com_whatsapp).to_csv(f, index=False)
            f.write("\nLEADS SEM WHATSAPP\n")
            f.write("==================\n")
            pd.DataFrame(leads_sem_whatsapp).to_csv(f, index=False)
        
        print(f"\nArquivo CSV gerado: {nome_arquivo}")
        print(f"Total de leads: {len(leads)}")
        print(f"Leads com WhatsApp: {len(leads_com_whatsapp)}")
        print(f"Leads sem WhatsApp: {len(leads_sem_whatsapp)}")

    def resetar_contador(self):
        """Reseta o contador de leads processados"""
        self.leads_processados.clear()

    def fechar(self):
        """Fecha o navegador"""
        if self.driver:
            self.driver.quit()

# Exemplo de uso
if __name__ == "__main__":
    extrator = LeadExtrator()
    try:
        # Testa com alguns nichos
        nichos_teste = ['Escritórios', 'Clínicas', 'Escolas']
        for nicho in nichos_teste:
            print(f"\nProcessando nicho: {nicho}")
            leads = extrator.extrair_leads_por_nicho(nicho)
            if leads:
                extrator.gerar_csv(nicho, '', leads)
            time.sleep(2)  # Pausa entre nichos
    finally:
        extrator.fechar()
