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

servicesButton.addEventListener('click', () => {
  servicesEditor.style.display = 'block';
});
checkAdminAccess();
