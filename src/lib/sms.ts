/**
 * Kavenegar SMS adapter (سرویس پیامک کاوه‌نگار).
 * When KAVENEGAR_API_KEY is set, OTP codes are sent via the Verify/Lookup API
 * and the in-app demo code is automatically disabled.
 */
export function isSmsConfigured(): boolean {
  return Boolean(process.env.KAVENEGAR_API_KEY);
}

export async function sendOtpSms(phone: string, code: string): Promise<boolean> {
  const apiKey = process.env.KAVENEGAR_API_KEY;
  if (!apiKey) return false;

  const template = process.env.KAVENEGAR_TEMPLATE ?? "nobatsalamat";

  try {
    const url = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json?receptor=${encodeURIComponent(
      phone
    )}&token=${encodeURIComponent(code)}&template=${encodeURIComponent(template)}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(8000), cache: "no-store" });
    const data = (await res.json().catch(() => null)) as {
      return?: { status?: number };
    } | null;

    if (!data?.return?.status || data.return.status !== 200) {
      console.error(`[SMS] Kavenegar rejected OTP for ${phone}: status ${data?.return?.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[SMS] Failed to send OTP to ${phone}:`, err);
    return false;
  }
}
