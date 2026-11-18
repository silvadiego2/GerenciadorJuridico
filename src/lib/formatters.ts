// src/lib/formatters.ts

export function formatPhone(value?: string | null): string {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '').slice(0, 11);
  
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function formatCEP(value?: string | null): string {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function formatDocument(value: string, type: 'fisica' | 'juridica'): string {
  const cleaned = value.replace(/\D/g, '');
  if (type === 'fisica') {
    return cleaned.slice(0, 11).replace(/(\d{3})(\d{3})?(\d{3})?(\d{2})?/, (_, p1, p2, p3, p4) => {
      let res = p1;
      if (p2) res += `.${p2}`;
      if (p3) res += `.${p3}`;
      if (p4) res += `-${p4}`;
      return res;
    });
  } else {
    return cleaned.slice(0, 14).replace(/(\d{2})(\d{3})?(\d{3})?(\d{4})?(\d{2})?/, (_, p1, p2, p3, p4, p5) => {
      let res = p1;
      if (p2) res += `.${p2}`;
      if (p3) res += `.${p3}`;
      if (p4) res += `/${p4}`;
      if (p5) res += `-${p5}`;
      return res;
    });
  }
}

export interface ViaCepResponse {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export async function fetchAddressByCEP(cep: string): Promise<ViaCepResponse | null> {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.erro) return null;

    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || ''
    };
  } catch {
    return null;
  }
}
