const SUPABASE_URL = 'https://fqhqmbtexxeblbnxfvzn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_o4_UwkZbcd2tM6hVyoMRyQ_yza9Ffzs';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const loginForm = document.getElementById('adminLoginForm');
const loginButton = document.getElementById('loginButton');
const loginMessage = document.getElementById('loginMessage');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;

  loginButton.disabled = true;
  loginButton.textContent = 'Нэвтэрч байна...';
  loginMessage.textContent = '';

  try {
    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      loginMessage.textContent = 'LOGIN ERROR: ' + error.message;
      return;
    }

    const { data: adminData, error: adminError } =
      await supabaseClient
        .from('admin_users')
        .select('user_id')
        .eq('user_id', data.user.id)
        .maybeSingle();

    if (adminError) {
      loginMessage.textContent =
        'ADMIN CHECK ERROR: ' + adminError.message;
      return;
    }

    if (!adminData) {
      await supabaseClient.auth.signOut();

      loginMessage.textContent =
        'Энэ хэрэглэгч админ эрхгүй байна.';
      return;
    }

    loginMessage.textContent =
      window.location.href = 'admin-dashboard.html';

  } catch (error) {
    console.error(error);
    loginMessage.textContent =
      'ERROR: ' + error.message;

  } finally {
    loginButton.disabled = false;
    loginButton.textContent = 'Нэвтрэх';
  }
});
