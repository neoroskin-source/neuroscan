const SUPABASE_URL = 'https://fqhqmbtexxeblbnxfvzn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_o4_UwkZbcd2tM6hVyoMRyQ_yza9Ffzs';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const loadingScreen = document.getElementById('loadingScreen');
const adminDashboard = document.getElementById('adminDashboard');
const logoutButton = document.getElementById('logoutButton');

async function checkAdminAccess() {
  // 1. Login хийсэн session байгаа эсэх
  const {
    data: { session },
    error: sessionError
  } = await supabaseClient.auth.getSession();

  if (sessionError || !session) {
    window.location.href = 'admin.html';
    return;
  }

  // 2. Энэ хэрэглэгч admin_users хүснэгтэд байгаа эсэх
  const { data: adminData, error: adminError } = await supabaseClient
    .from('admin_users')
    .select('user_id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (adminError || !adminData) {
    await supabaseClient.auth.signOut();
    window.location.href = 'admin.html';
    return;
  }

  // 3. Админ бол dashboard харуулна
  loadingScreen.style.display = 'none';
  adminDashboard.style.display = 'block';
}

logoutButton.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  window.location.href = 'admin.html';
});
const servicesButton =
  document.getElementById('servicesButton');

const servicesEditor =
  document.getElementById('servicesEditor');

servicesButton.addEventListener('click', async () => {
  servicesEditor.style.display = 'block';
  await loadServicesEditor();
});
async function loadServicesEditor() {
  const servicesList = document.getElementById('servicesList');

  servicesList.textContent = 'Мэдээлэл ачаалж байна...';

  const { data, error } = await supabaseClient
    .from('services')
    .select('*')
    .order('sort_order');

  if (error) {
    servicesList.textContent =
      'Мэдээлэл ачаалахад алдаа гарлаа: ' + error.message;
    return;
  }

  servicesList.innerHTML = '';

  data.forEach(service => {
    const item = document.createElement('div');

    item.style.background = '#fff';
    item.style.border = '1px solid #e4e9ef';
    item.style.borderRadius = '14px';
    item.style.padding = '20px';
    item.style.marginBottom = '16px';

    item.innerHTML = `
      <h3>${service.name}</h3>

      <p><strong>Тодосгогчгүй үнэ:</strong>
      ${
        service.without_contrast_price !== null
          ? Number(service.without_contrast_price).toLocaleString() + ' ₮'
          : 'Үнэ оруулаагүй'
      }</p>

      <p><strong>Тодосгогчтой үнэ:</strong>
      ${
        service.with_contrast_price !== null
          ? Number(service.with_contrast_price).toLocaleString() + ' ₮'
          : 'Үнэ оруулаагүй'
      }</p>
    `;

    servicesList.appendChild(item);
  });
}
checkAdminAccess();
