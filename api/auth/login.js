export default function handler(req, res) {
  const { IG_APP_ID, BASE_URL } = process.env;

  if (!IG_APP_ID) {
    return res.status(500).send('IG_APP_ID 환경변수가 설정되지 않았습니다.');
  }

  const redirectUri = encodeURIComponent(`${BASE_URL}/api/auth/callback`);
  const scope = [
    'instagram_business_basic',
    'instagram_business_manage_insights',
  ].join(',');

  const url =
    `https://www.instagram.com/oauth/authorize` +
    `?client_id=${IG_APP_ID}` +
    `&redirect_uri=${redirectUri}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&response_type=code`;

  // JS 리다이렉트: 서버 리다이렉트 대신 JS로 이동해 iOS 유니버설 링크 인터셉션 방지
  res.setHeader('Content-Type', 'text/html');
  res.end(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>로그인 중...</title></head><body><script>window.location.replace(${JSON.stringify(url)});</script></body></html>`);
}
