from extrator_leads import LeadExtrator
import time

def testar_extrator():
    print("🚀 Iniciando teste do extrator de leads...")
    print("📍 Áreas de busca: Guarulhos, Arujá, Santa Isabel, Itaquaquecetuba e Mairiporã")
    
    extrator = LeadExtrator()
    try:
        # Testa extração para diferentes nichos
        nichos = ['Advocacia', 'Clínicas', 'Educação', 'Imobiliárias', 'Contabilidade']
        
        for nicho in nichos:
            print(f"\n📌 Testando extração para nicho: {nicho}")
            arquivos = extrator.extrair_leads_por_nicho(nicho)
            
            if arquivos:
                print(f"✅ Arquivos gerados para {nicho}:")
                for arquivo in arquivos:
                    print(f"   - {arquivo}")
            else:
                print(f"❌ Nenhum lead encontrado para {nicho}")
            
            # Aguarda um pouco entre os nichos
            time.sleep(2)
            
        print("\n✨ Teste concluído!")
        
    except Exception as e:
        print(f"❌ Erro durante o teste: {e}")
    finally:
        extrator.fechar()

if __name__ == "__main__":
    testar_extrator() 