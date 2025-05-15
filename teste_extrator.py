from extrator_leads import LeadExtrator
import time

def main():
    # Inicializa o extrator
    extrator = LeadExtrator()
    
    try:
        # Lista de nichos para testar
        nichos_para_testar = [
            'Escritórios',
            'Clínicas',
            'Escolas',
            'Imobiliárias',
            'Lojas',
            'Restaurantes',
            'Academias',
            'Salões'
        ]
        
        # Testa cada nicho
        for nicho in nichos_para_testar:
            print(f"\n{'='*50}")
            print(f"Testando nicho: {nicho}")
            print(f"{'='*50}\n")
            
            # Extrai leads para o nicho
            leads = extrator.extrair_leads_por_nicho(nicho)
            
            if leads:
                print(f"\n✅ Total de leads encontrados para {nicho}: {len(leads)}")
            else:
                print(f"\n⚠️ Nenhum lead encontrado para {nicho}")
            
            # Pausa entre nichos para evitar sobrecarga
            time.sleep(5)
            
    except Exception as e:
        print(f"❌ Erro durante a execução: {e}")
    finally:
        # Fecha o driver ao finalizar
        extrator.fechar()

if __name__ == "__main__":
    main() 