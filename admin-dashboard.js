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
  
  await loadServicesEditor();
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
<label>
  Тодосгогчгүй тайлбар
</label>

<textarea
  id="without-description-${service.id}"
  rows="5"
  style="
    width:100%;
    padding:12px;
    margin:8px 0 18px;
    border:1px solid #d8dee6;
    border-radius:8px;
    resize:vertical;
  "
>${service.without_contrast_description ?? ''}</textarea>
  <label>
    Тодосгогчгүй үнэ
  </label>

  <input
    type="number"
    id="without-price-${service.id}"
    value="${service.without_contrast_price ?? ''}"
    placeholder="Үнэ оруулах"
    style="
      width:100%;
      padding:12px;
      margin:8px 0 18px;
      border:1px solid #d8dee6;
      border-radius:8px;
    "
  >

  <label>
    Тодосгогчтой үнэ
  </label>

  <input
    type="number"
    id="with-price-${service.id}"
    value="${service.with_contrast_price ?? ''}"
    placeholder="Үнэ оруулах"
    style="
      width:100%;
      padding:12px;
      margin:8px 0 18px;
      border:1px solid #d8dee6;
      border-radius:8px;
    "
  >

  <button
  type="button"
  onclick="saveService(${service.id}, this)"
  style="
    padding:11px 18px;
    border:0;
    border-radius:8px;
    background:#17212b;
    color:#fff;
    font-weight:700;
    cursor:pointer;
  "
>
  Хадгалах
</button>
`;
    servicesList.appendChild(item);
});
}
window.saveService = async function(serviceId, button) {
  const withoutPrice =
    document.getElementById(`without-price-${serviceId}`).value.trim();

  const withPrice =
    document.getElementById(`with-price-${serviceId}`).value.trim();

  button.disabled = true;
  button.textContent = 'Хадгалж байна...';

  const { error } = await supabaseClient
    .from('services')
    .update({
      without_contrast_price:
        withoutPrice === '' ? null : Number(withoutPrice),

      with_contrast_price:
        withPrice === '' ? null : Number(withPrice),

      updated_at: new Date().toISOString()
    })
    .eq('id', serviceId);

  if (error) {
    console.error(error);
    button.textContent = 'Алдаа гарлаа';
    button.disabled = false;
    return;
  }

  button.textContent = '✓ Хадгалагдлаа';

  setTimeout(() => {
    button.textContent = 'Хадгалах';
    button.disabled = false;
  }, 1500);
};
checkAdminAccess();
