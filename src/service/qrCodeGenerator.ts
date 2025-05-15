import QRCode from 'qrcode';
import { logger } from '../utils/logger';

export class QRCodeGenerator {
  private static instance: QRCodeGenerator;

  private constructor() {}

  public static getInstance(): QRCodeGenerator {
    if (!QRCodeGenerator.instance) {
      QRCodeGenerator.instance = new QRCodeGenerator();
    }
    return QRCodeGenerator.instance;
  }

  /**
   * Gera um QR Code para pagamento PIX
   * @param valor Valor do pagamento
   * @param descricao Descrição do pagamento
   * @returns URL do QR Code em base64
   */
  public async gerarQRCodePix(valor: number, descricao: string): Promise<string> {
    try {
      // Aqui você pode integrar com a API do seu banco para gerar o PIX
      // Por enquanto, vamos usar um exemplo com dados mockados
      const dadosPix = {
        chave: 'sua_chave_pix@email.com',
        beneficiario: 'Nome do Beneficiário',
        cidade: 'Sua Cidade',
        valor: valor.toFixed(2),
        descricao: descricao
      };

      // Gera o payload do PIX
      const payload = this.gerarPayloadPix(dadosPix);

      // Gera o QR Code
      const qrCodeBase64 = await QRCode.toDataURL(payload);
      return qrCodeBase64;
    } catch (error) {
      logger.error('Erro ao gerar QR Code:', error);
      throw error;
    }
  }

  /**
   * Gera um QR Code para link de pagamento
   * @param url URL do link de pagamento
   * @returns URL do QR Code em base64
   */
  public async gerarQRCodeLink(url: string): Promise<string> {
    try {
      const qrCodeBase64 = await QRCode.toDataURL(url);
      return qrCodeBase64;
    } catch (error) {
      logger.error('Erro ao gerar QR Code:', error);
      throw error;
    }
  }

  private gerarPayloadPix(dados: any): string {
    // Implementação do payload do PIX seguindo o padrão EMV
    // Este é um exemplo simplificado
    const payload = [
      '00020126', // Versão do payload
      '01' + dados.chave.length.toString().padStart(2, '0') + dados.chave, // Chave PIX
      '52040000', // Merchant Account Information
      '5303986', // Transaction Currency (986 = BRL)
      '54' + dados.valor.length.toString().padStart(2, '0') + dados.valor, // Transaction Amount
      '55' + dados.cidade.length.toString().padStart(2, '0') + dados.cidade, // Merchant City
      '56' + dados.beneficiario.length.toString().padStart(2, '0') + dados.beneficiario, // Merchant Name
      '57' + dados.descricao.length.toString().padStart(2, '0') + dados.descricao, // Additional Data Field
      '6304' // CRC16
    ].join('');

    return payload;
  }
} 