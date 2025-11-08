import { v4 as uuidv4 } from 'uuid';

/**
 * Gera uma string curta para usar em QR codes.
 * Opção: gerar apenas um UUID curto (front-end) e enviar ao BFF se quiser persistir/associar.
 * Não inclua segredos no frontend — para tokens assinados prefira uma rota backend.
 */
export function generateQrToken(): string {
  // UUID v4, pode ser encurtado se necessário (ex: base64 do buffer)
  return uuidv4();
}

/**
 * Embala o payload que será codificado no QR. Aqui apenas um wrapper JSON string.
 * Alternativa: criptografar/assinar via backend.
 */
export function buildQrPayload(token: string, meta?: Record<string, unknown>) {
  return JSON.stringify({ t: token, m: meta ?? {}, v: 1 });
}

export function buildQrDataUri(token: string, meta?: Record<string, unknown>) {
  const payload = buildQrPayload(token, meta);
  return `data:text/plain,${encodeURIComponent(payload)}`;
}
