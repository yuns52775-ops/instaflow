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

  res.redirect(url);
}
