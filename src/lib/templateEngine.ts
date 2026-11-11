// src/lib/templateEngine.ts
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ProcessContextData {
  process: any;
  client?: any;
}

export function interpolateTemplate(content: string, context: ProcessContextData): string {
  const { process, client } = context;

  // Formatação de endereço do cliente
  let enderecoFormatado = 'Endereço não informado';
  if (client?.address) {
    const a = client.address;
    const partes = [
      a.street && `${a.street}${a.number ? `, ${a.number}` : ''}`,
      a.complement,
      a.neighborhood,
      a.city && `${a.city}/${a.state || 'BA'}`,
      a.zipCode && `CEP: ${a.zipCode}`
    ].filter(Boolean);
    if (partes.length > 0) enderecoFormatado = partes.join(' - ');
  }

  // Formatação de valor
  const valorFormatado = process?.value
    ? `R$ ${Number(process.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : 'Não atribuído';

  // Data por extenso (ex: Salvador/BA, 11 de novembro de 2026)
  const hojeExtenso = `Salvador/BA, ${format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`;

  const variables: Record<string, string> = {
    // Dados do Cliente
    '{{cliente_nome}}': client?.name || process?.plaintiff || 'CLIENTE NÃO IDENTIFICADO',
    '{{cliente_documento}}': client?.document || 'Documento não informado',
    '{{cliente_tipo}}': client?.type === 'juridica' ? 'pessoa jurídica de direito privado' : 'pessoa física',
    '{{cliente_telefone}}': client?.phone || 'Não informado',
    '{{cliente_email}}': client?.email || 'Não informado',
    '{{cliente_endereco}}': enderecoFormatado,

    // Dados do Processo
    '{{processo_numero}}': process?.number || 'PROCESSO SEM NÚMERO',
    '{{processo_vara}}': process?.court || 'Juízo Competente',
    '{{processo_comarca}}': process?.comarca || 'Salvador/BA',
    '{{processo_autor}}': process?.plaintiff || client?.name || 'Não informado',
    '{{processo_reu}}': process?.defendant || 'Não informado',
    '{{processo_acao}}': process?.subject || process?.title || 'Ação Judicial',
    '{{processo_classe}}': process?.class || 'Procedimento Comum',
    '{{processo_valor}}': valorFormatado,
    '{{processo_distribuicao}}': process?.distribution_date || process?.distributionDate || '-',

    // Gerais
    '{{cidade_data}}': hojeExtenso,
    '{{ano_atual}}': new Date().getFullYear().toString(),
  };

  let rendered = content;
  for (const [key, val] of Object.entries(variables)) {
    rendered = rendered.split(key).join(val || '');
  }

  return rendered;
}
