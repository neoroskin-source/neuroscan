const SUPABASE_URL = 'https://fqhqmbtexxeblbnxfvzn.supabase.co/rest/v1/';
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
    // 1. Email + password-аар нэвтрэх
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    // 2. Энэ хэрэглэгч admin_users хүснэгтэд байгаа эсэхийг шалгах
    const { data: adminData, error: adminError } = await supabaseClient
      .from('admin_users')
      .select('user_id')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (adminError) {
      throw adminError;
    }

    // 3. Админ биш бол буцааж logout хийх
    if (!adminData) {
      await supabaseClient.auth.signOut();

      loginMessage.textContent =
        'Энэ хэрэглэгч админ эрхгүй байна.';

      return;
    }

    // 4. Админ бол
    loginMessage.textContent =
      'Амжилттай нэвтэрлээ.';

  } catch (error) {
    console.error(error);

    loginMessage.textContent =
      'И-мэйл эсвэл нууц үг буруу байна.';
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = 'Нэвтрэх';
  }
});
