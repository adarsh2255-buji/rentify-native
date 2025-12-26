export const BASE_URL = 'https://hrz5g6hz-8000.inc1.devtunnels.ms/api/v1';

async function handleResponse(response: Response) {
  let data: any = null;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }
  return { ok: response.ok, status: response.status, data };
}
export async function fetchKycStatus(token?: string | null) {
  const API_URL = `${BASE_URL}/auth/status/`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const resp = await fetch(API_URL, { method: 'GET', headers, credentials: 'include' });
  let data: any = null;
  try { data = await resp.json(); } catch (e) { data = null; }
  if (!resp.ok) throw { status: resp.status, data };

  // Normalize various backend shapes into our KYC state shape
  // Backend examples:
  // { status: 'pending_kyc', kyc_status: { status: 'submitted', submitted_at: '...', verified_at: null } }
  // { kycStatus: 'PENDING', submittedAt: '...' }
  const result: any = {
    kycStatus: 'NOT_SUBMITTED',
    submittedAt: null,
    reviewedAt: null,
    rejectionReason: null,
    raw: data,
  };

  if (!data) return result;

  // Prefer nested kyc_status if provided
  const nested = data.kyc_status || data.kycStatus || null;
  if (nested && typeof nested === 'object') {
    const s = (nested.status || nested.state || '') as string;
    if (/submitted|pending/i.test(s)) result.kycStatus = 'PENDING';
    else if (/verified|completed/i.test(s)) result.kycStatus = 'VERIFIED';
    else if (/rejected|denied|declined/i.test(s)) result.kycStatus = 'REJECTED';

    result.submittedAt = nested.submitted_at ?? nested.submittedAt ?? null;
    result.reviewedAt = nested.verified_at ?? nested.reviewedAt ?? null;
    result.rejectionReason = nested.rejection_reason ?? nested.rejectionReason ?? null;
    return result;
  }

  // Top-level status mapping
  const top = (data.status || data.kycStatus || '').toString();
  if (/pending|pending_kyc|submitted/i.test(top)) result.kycStatus = 'PENDING';
  else if (/verified|kyc_verified|complete|completed/i.test(top)) result.kycStatus = 'VERIFIED';
  else if (/rejected|denied|declined/i.test(top)) result.kycStatus = 'REJECTED';

  result.submittedAt = data.submitted_at ?? data.submittedAt ?? null;
  result.reviewedAt = data.verified_at ?? data.reviewedAt ?? null;
  result.rejectionReason = data.rejection_reason ?? data.rejectionReason ?? null;

  return result; // shape: { kycStatus, submittedAt, reviewedAt, rejectionReason, raw }
}

// --- Password Reset Functions (These were missing) ---

export async function requestPasswordReset(email: string) {
  const API_URL = `${BASE_URL}/auth/password/reset/request/`;
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
}

export async function confirmPasswordReset(email: string, otp: string, newPassword: string) {
  const API_URL = `${BASE_URL}/auth/password/reset/confirm/`;
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp_code: otp, new_password: newPassword }),
  });
  let data = null;
  try { data = await response.json(); } catch(e) {}
  return {
    ok: response.ok,
    status: response.status,
    data: data
  };
}

// Resend OTP for various purposes
export async function resendOtp({ email, purpose }: { email?: string; purpose: string }) {
  const API_URL = `${BASE_URL}/auth/resend-otp/`;
  const payload: any = { purpose };
  if (email) payload.email = email;
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}