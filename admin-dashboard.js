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
  Тодосгогчтой тайлбар
</label>

<textarea
  id="with-description-${service.id}"
  rows="5"
  style="
    width:100%;
    padding:12px;
    margin:8px 0 18px;
    border:1px solid #d8dee6;
    border-radius:8px;
    resize:vertical;
  "
>${service.with_contrast_description ?? ''}</textarea>
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
  const withoutDescription =
  document.getElementById(`without-description-${serviceId}`).value.trim();
  const withDescription =
  document.getElementById(`with-description-${serviceId}`).value.trim();
  const withoutPrice =
    document.getElementById(`without-price-${serviceId}`).value.trim();

  const withPrice =
    document.getElementById(`with-price-${serviceId}`).value.trim();

  button.disabled = true;
  button.textContent = 'Хадгалж байна...';

  const { error } = await supabaseClient
    .from('services')
    .update({
  without_contrast_description: withoutDescription,
  with_contrast_description: withDescription,
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
function escapeAdminHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.openAdminSection = async function(section) {
  const sections = {
    services: 'servicesEditor',
    doctors: 'doctorsEditor',
    news: 'newsEditor',
    settings: 'settingsEditor'
  };

  Object.values(sections).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  ['servicesButton', 'doctorsButton', 'newsButton', 'settingsButton']
    .forEach(id => {
      document.getElementById(id)?.classList.remove('active');
    });

  document.getElementById('dashboardCards').style.display = 'none';

  document.getElementById(sections[section]).style.display = 'block';

  document
    .getElementById(section + 'Button')
    ?.classList.add('active');

  if (section === 'services') {
    await loadServicesEditor();
  }

  if (section === 'doctors') {
    await loadDoctorsEditor();
  }

  if (section === 'news') {
    await loadNewsEditor();
  }

  if (section === 'settings') {
    await loadSettingsEditor();
  }
};


// =======================
// DOCTORS
// =======================

async function loadDoctorsEditor() {
  const list = document.getElementById('doctorsList');

  list.textContent = 'Мэдээлэл ачаалж байна...';

  const { data, error } = await supabaseClient
    .from('doctors')
    .select('*')
    .order('sort_order');

  if (error) {
    list.textContent = 'Алдаа: ' + error.message;
    return;
  }

  list.innerHTML = '';

  data.forEach(doctor => {
    const item = document.createElement('div');

    item.style.cssText = `
      background:#fff;
      border:1px solid #e4e9ef;
      border-radius:14px;
      padding:22px;
      margin-bottom:18px;
    `;

    item.innerHTML = `
      <h3>${doctor.sort_order}-р эмч</h3>

      <label>Нэр</label>
      <input
        id="doctor-name-${doctor.id}"
        value="${escapeAdminHtml(doctor.name)}"
        style="width:100%;padding:12px;margin:8px 0 15px;"
      >

      <label>Мэргэжил</label>
      <input
        id="doctor-specialty-${doctor.id}"
        value="${escapeAdminHtml(doctor.specialty)}"
        style="width:100%;padding:12px;margin:8px 0 15px;"
      >

      <label>Туршлага</label>
      <input
        id="doctor-experience-${doctor.id}"
        value="${escapeAdminHtml(doctor.experience)}"
        style="width:100%;padding:12px;margin:8px 0 15px;"
      >

      <label>Танилцуулга</label>
      <textarea
        id="doctor-bio-${doctor.id}"
        rows="6"
        style="width:100%;padding:12px;margin:8px 0 15px;"
      >${escapeAdminHtml(doctor.bio)}</textarea>

      <label>Зургийн URL</label>
      <input
        id="doctor-image-${doctor.id}"
        value="${escapeAdminHtml(doctor.image_url)}"
        style="width:100%;padding:12px;margin:8px 0 15px;"
      >

      <button
        onclick="saveDoctor(${doctor.id}, this)"
        style="padding:11px 18px;background:#17212b;color:white;border:0;border-radius:8px;cursor:pointer;"
      >
        Хадгалах
      </button>
    `;

    list.appendChild(item);
  });
}

window.saveDoctor = async function(id, button) {
  button.disabled = true;
  button.textContent = 'Хадгалж байна...';

  const { error } = await supabaseClient
    .from('doctors')
    .update({
      name: document.getElementById(`doctor-name-${id}`).value.trim(),
      specialty: document.getElementById(`doctor-specialty-${id}`).value.trim(),
      experience: document.getElementById(`doctor-experience-${id}`).value.trim(),
      bio: document.getElementById(`doctor-bio-${id}`).value.trim(),
      image_url: document.getElementById(`doctor-image-${id}`).value.trim(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  button.disabled = false;

  if (error) {
    button.textContent = 'Алдаа';
    console.error(error);
    return;
  }

  button.textContent = '✓ Хадгалагдлаа';

  setTimeout(() => {
    button.textContent = 'Хадгалах';
  }, 1500);
};


// =======================
// NEWS
// =======================

async function loadNewsEditor() {
  const list = document.getElementById('newsList');

  list.textContent = 'Мэдээлэл ачаалж байна...';

  const { data, error } = await supabaseClient
    .from('news')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    list.textContent = 'Алдаа: ' + error.message;
    return;
  }

  list.innerHTML = `
    <button
      onclick="createNews()"
      style="padding:12px 18px;margin-bottom:20px;background:#17212b;color:#fff;border:0;border-radius:8px;cursor:pointer;"
    >
      + Шинэ мэдээ
    </button>
  `;

  if (!data.length) {
    list.innerHTML += '<p>Одоогоор мэдээ байхгүй.</p>';
    return;
  }

  data.forEach(news => {
    const item = document.createElement('div');

    item.style.cssText = `
      background:#fff;
      border:1px solid #e4e9ef;
      border-radius:14px;
      padding:22px;
      margin-bottom:18px;
    `;

    item.innerHTML = `
      <label>Гарчиг</label>
      <input
        id="news-title-${news.id}"
        value="${escapeAdminHtml(news.title)}"
        style="width:100%;padding:12px;margin:8px 0 15px;"
      >

      <label>Товч тайлбар</label>
      <textarea
        id="news-excerpt-${news.id}"
        rows="3"
        style="width:100%;padding:12px;margin:8px 0 15px;"
      >${escapeAdminHtml(news.excerpt)}</textarea>

      <label>Мэдээний агуулга</label>
      <textarea
        id="news-content-${news.id}"
        rows="8"
        style="width:100%;padding:12px;margin:8px 0 15px;"
      >${escapeAdminHtml(news.content)}</textarea>

      <label>Зургийн URL</label>
      <input
        id="news-image-${news.id}"
        value="${escapeAdminHtml(news.image_url)}"
        style="width:100%;padding:12px;margin:8px 0 15px;"
      >

      <label style="display:block;margin-bottom:18px;">
        <input
          type="checkbox"
          id="news-published-${news.id}"
          ${news.published ? 'checked' : ''}
        >
        Нийтлэх
      </label>

      <button
        onclick="saveNews(${news.id}, this)"
        style="padding:11px 18px;background:#17212b;color:#fff;border:0;border-radius:8px;cursor:pointer;"
      >
        Хадгалах
      </button>

      <button
        onclick="deleteNews(${news.id})"
        style="padding:11px 18px;margin-left:8px;background:#fff;border:1px solid #ccc;border-radius:8px;cursor:pointer;"
      >
        Устгах
      </button>
    `;

    list.appendChild(item);
  });
}

window.createNews = async function() {
  const { error } = await supabaseClient
    .from('news')
    .insert({
      title: 'Шинэ мэдээ',
      excerpt: '',
      content: '',
      published: false
    });

  if (error) {
    alert('Алдаа: ' + error.message);
    return;
  }

  await loadNewsEditor();
};

window.saveNews = async function(id, button) {
  button.disabled = true;
  button.textContent = 'Хадгалж байна...';

  const { error } = await supabaseClient
    .from('news')
    .update({
      title: document.getElementById(`news-title-${id}`).value.trim(),
      excerpt: document.getElementById(`news-excerpt-${id}`).value.trim(),
      content: document.getElementById(`news-content-${id}`).value.trim(),
      image_url: document.getElementById(`news-image-${id}`).value.trim(),
      published: document.getElementById(`news-published-${id}`).checked,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  button.disabled = false;

  if (error) {
    button.textContent = 'Алдаа';
    console.error(error);
    return;
  }

  button.textContent = '✓ Хадгалагдлаа';

  setTimeout(() => {
    button.textContent = 'Хадгалах';
  }, 1500);
};

window.deleteNews = async function(id) {
  if (!confirm('Энэ мэдээг устгах уу?')) return;

  const { error } = await supabaseClient
    .from('news')
    .delete()
    .eq('id', id);

  if (error) {
    alert('Алдаа: ' + error.message);
    return;
  }

  await loadNewsEditor();
};


// =======================
// SETTINGS
// =======================

async function loadSettingsEditor() {
  const container = document.getElementById('settingsForm');

  container.textContent = 'Мэдээлэл ачаалж байна...';

  const { data, error } = await supabaseClient
    .from('settings')
    .select('*')
    .order('id')
    .limit(1);

  if (error || !data.length) {
    container.textContent =
      'Тохиргоо ачаалахад алдаа гарлаа.';
    return;
  }

  const s = data[0];

  container.innerHTML = `
    <div style="background:#fff;border:1px solid #e4e9ef;border-radius:14px;padding:22px;">

      <label>Email</label>
      <input id="setting-email"
        value="${escapeAdminHtml(s.email)}"
        style="width:100%;padding:12px;margin:8px 0 15px;">

      <label>Ерөнхий утас</label>
      <input id="setting-general-phone"
        value="${escapeAdminHtml(s.general_phone)}"
        style="width:100%;padding:12px;margin:8px 0 15px;">

      <label>Утас 1</label>
      <input id="setting-phone1"
        value="${escapeAdminHtml(s.phone_1)}"
        style="width:100%;padding:12px;margin:8px 0 15px;">

      <label>Утас 2</label>
      <input id="setting-phone2"
        value="${escapeAdminHtml(s.phone_2)}"
        style="width:100%;padding:12px;margin:8px 0 15px;">

      <label>Яаралтай тусламж</label>
      <input id="setting-emergency"
        value="${escapeAdminHtml(s.emergency_text)}"
        style="width:100%;padding:12px;margin:8px 0 15px;">

      <label>Хаяг</label>
      <textarea id="setting-address"
        rows="3"
        style="width:100%;padding:12px;margin:8px 0 15px;"
      >${escapeAdminHtml(s.address)}</textarea>

      <label>MRI төхөөрөмж</label>
      <input id="setting-machine"
        value="${escapeAdminHtml(s.machine_info)}"
        style="width:100%;padding:12px;margin:8px 0 15px;">

      <label>Цаг захиалгын Google Form URL</label>
      <input id="setting-booking"
        value="${escapeAdminHtml(s.booking_url)}"
        placeholder="https://..."
        style="width:100%;padding:12px;margin:8px 0 15px;">

      <button
        onclick="saveSettings(${s.id}, this)"
        style="padding:11px 18px;background:#17212b;color:white;border:0;border-radius:8px;cursor:pointer;"
      >
        Хадгалах
      </button>

    </div>
  `;
}

window.saveSettings = async function(id, button) {
  button.disabled = true;
  button.textContent = 'Хадгалж байна...';

  const { error } = await supabaseClient
    .from('settings')
    .update({
      email: document.getElementById('setting-email').value.trim(),
      general_phone: document.getElementById('setting-general-phone').value.trim(),
      phone_1: document.getElementById('setting-phone1').value.trim(),
      phone_2: document.getElementById('setting-phone2').value.trim(),
      emergency_text: document.getElementById('setting-emergency').value.trim(),
      address: document.getElementById('setting-address').value.trim(),
      machine_info: document.getElementById('setting-machine').value.trim(),
      booking_url: document.getElementById('setting-booking').value.trim(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  button.disabled = false;

  if (error) {
    button.textContent = 'Алдаа';
    console.error(error);
    return;
  }

  button.textContent = '✓ Хадгалагдлаа';

  setTimeout(() => {
    button.textContent = 'Хадгалах';
  }, 1500);
};
checkAdminAccess();
