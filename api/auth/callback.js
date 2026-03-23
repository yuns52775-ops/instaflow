export default async function handler(req, res) {
  const { code, error, error_reason } = req.query;
  const { IG_APP_ID, IG_APP_SECRET, BASE_URL } = process.env;
  const redirectUri = `${BASE_URL}/api/auth/callback`;

  // 사용자가 로그인 취소
  if (error || !code) {
    const msg = error_reason || error || 'cancelled';
    return res.redirect(`/?error=${encodeURIComponent(msg)}`);
  }

  try {
    // 1. 인증 코드 → 단기 토큰 교환
    const form = new URLSearchParams({
      client_id: IG_APP_ID,
      client_secret: IG_APP_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    });

    const shortRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    const shortData = await shortRes.json();

    if (shortData.error_type || !shortData.access_token) {
      const msg = shortData.error_message || 'token_exchange_failed';
      console.error('[InstaFlow] 단기 토큰 오류:', shortData);
      return res.redirect(`/?error=${encodeURIComponent(msg)}`);
    }

    // 2. 단기 토큰 → 장기 토큰 (60일 유효)
    const longRes = await fetch(
      `https://graph.instagram.com/access_token` +
      `?grant_type=ig_exchange_token` +
      `&client_id=${IG_APP_ID}` +
      `&client_secret=${IG_APP_SECRET}` +
      `&access_token=${shortData.access_token}`
    );
    const longData = await longRes.json();

    if (longData.error) {
      console.error('[InstaFlow] 장기 토큰 오류:', longData.error);
      // 장기 토큰 실패 시 단기 토큰이라도 사용
    }

    const finalToken = longData.access_token || shortData.access_token;

    // 3. 대시보드로 리다이렉트 (토큰은 URL 해시로 전달 — 서버 로그에 남지 않음)
    res.redirect(`/dashboard#token=${encodeURIComponent(finalToken)}`);

  } catch (e) {
    console.error('[InstaFlow] 콜백 오류:', e);
    res.redirect('/?error=server_error');
  }
}
