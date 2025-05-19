"""
Script principal para execução do extrator de leads
"""

from src.extrator import LeadExtrator
import time
import sys

def main():
    print("🚀 Iniciando extrator de leads...")
    print("=" * 50)
    
    # Instancia o extrator
    extrator = LeadExtrator()
    
    try:
        # Lista de nichos para processar
        nichos = [
            'Escritórios',
            'Clínicas',
            'Escolas',
            'Imobiliárias',
            'Lojas',
            'Restaurantes',
            'Academias',
            'Salões'
        ]
        
        # Processa cada nicho
        for nicho in nichos:
            print(f"\n📌 Processando nicho: {nicho}")
            print("=" * 50)
            
            # Extrai leads para o nicho
            leads = extrator.extrair_leads_por_nicho(nicho)
            
            if leads:
                print(f"\n✅ Total de leads encontrados para {nicho}: {len(leads)}")
            else:
                print(f"\n⚠️ Nenhum lead encontrado para {nicho}")
            
            # Pausa entre nichos para evitar sobrecarga
            time.sleep(5)
            
        print("\n✨ Processamento concluído!")
        
    except KeyboardInterrupt:
        print("\n\n⚠️ Processo interrompido pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro durante a execução: {e}")
    finally:
        # Fecha o driver ao finalizar
        extrator.fechar()

if __name__ == "__main__":
    main() 