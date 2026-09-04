const SUPABASE_URL = 'https://fqhqmbtexxeblbnxfvzn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_o4_UwkZbcd2tM6hVyoMRyQ_yza9Ffzs';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const loadingScreen = document.getElementById('loadingScreen');
const adminDashboard = document.getElementById('adminDashboard');
const logoutButton = document.getElementById('logoutButton');


// =====================================================
// ADMIN ACCESS
// =====================================================

async function checkAdminAccess() {
  const {
    data: { session },
    error: sessionError
  } = await supabaseClient.auth.getSession();

  if (sessionError || !session) {
    window.location.href = 'admin.html';
    return;
  }

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

  loadingScreen.style.display = 'none';
  adminDashboard.style.display = 'block';

  await loadServicesEditor();
}


// =====================================================
// LOGOUT
// =====================================================

if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = 'admin.html';
  });
}


// =====================================================
// HELPERS
// =====================================================

function escapeAdminHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function editorCardStyle() {
  return `
    background:#fff;
    border:1px solid #e4e9ef;
    border-radius:14px;
    padding:22px;
    margin-bottom:18px;
  `;
}

function fieldStyle() {
  return `
    width:100%;
    padding:12px;
    margin:8px 0 16px;
    border:1px solid #d8dee6;
    border-radius:8px;
    font:inherit;
  `;
}

function stripHtml(html) {
  const temp = document.createElement('div');

  temp.innerHTML = html || '';

  return (
    temp.textContent ||
    temp.innerText ||
    ''
  ).trim();
}

function setImagePreview(
  containerId,
  url,
  width = 180,
  height = 140
) {
  const preview =
    document.getElementById(containerId);

  if (!preview) return;

  if (!url) {
    preview.innerHTML = '';
    return;
  }

  preview.innerHTML = `
    <img
      src="${escapeAdminHtml(url)}"
      alt="Preview"
      style="
        width:${width}px;
        height:${height}px;
        object-fit:cover;
        border-radius:12px;
        margin-top:14px;
      "
    >
  `;
}


// =====================================================
// SECTION NAVIGATION
// =====================================================

window.openAdminSection = async function(section) {

  const sections = {
    services: 'servicesEditor',
    doctors: 'doctorsEditor',
    about: 'aboutEditor',
    news: 'newsEditor',
    settings: 'settingsEditor'
  };

  Object.values(sections).forEach(id => {
    const el = document.getElementById(id);

    if (el) {
      el.style.display = 'none';
    }
  });

  [
    'servicesButton',
    'doctorsButton',
    'aboutButton',
    'newsButton',
    'settingsButton'
  ].forEach(id => {

    document
      .getElementById(id)
      ?.classList.remove('active');

  });

  const cards =
    document.getElementById('dashboardCards');

  if (cards) {
    cards.style.display = 'none';
  }

  const targetId = sections[section];

  const target =
    targetId
      ? document.getElementById(targetId)
      : null;

  if (target) {
    target.style.display = 'block';
  }

  document
    .getElementById(section + 'Button')
    ?.classList.add('active');

  if (section === 'services') {
    await loadServicesEditor();
  }

  if (section === 'doctors') {
    await loadDoctorsEditor();
  }

  if (section === 'about') {
    await loadAboutEditor();
  }

  if (section === 'news') {
    await loadNewsEditor();
  }

  if (section === 'settings') {
    await loadSettingsEditor();
  }
};


// =====================================================
// SERVICES
// =====================================================

async function loadServicesEditor() {

  const list =
    document.getElementById('servicesList');

  if (!list) return;

  list.textContent =
    'Мэдээлэл ачаалж байна...';

  const { data, error } =
    await supabaseClient
      .from('services')
      .select('*')
      .order('sort_order');

  if (error) {
    list.textContent =
      'Алдаа: ' + error.message;

    return;
  }

  list.innerHTML = '';

  data.forEach(service => {

    const item =
      document.createElement('div');

    item.style.cssText =
      editorCardStyle();

    item.innerHTML = `

      <h3>
        ${escapeAdminHtml(service.name)}
      </h3>

      <label>
        Тодосгогчгүй тайлбар
      </label>

      <textarea
        id="without-description-${service.id}"
        rows="5"
        style="${fieldStyle()}"
      >${escapeAdminHtml(
        service.without_contrast_description
      )}</textarea>

      <label>
        Тодосгогчгүй үнэ
      </label>

      <input
        type="number"
        id="without-price-${service.id}"
        value="${service.without_contrast_price ?? ''}"
        placeholder="Үнэ оруулах"
        style="${fieldStyle()}"
      >

      <label>
        Тодосгогчтой тайлбар
      </label>

      <textarea
        id="with-description-${service.id}"
        rows="5"
        style="${fieldStyle()}"
      >${escapeAdminHtml(
        service.with_contrast_description
      )}</textarea>

      <label>
        Тодосгогчтой үнэ
      </label>

      <input
        type="number"
        id="with-price-${service.id}"
        value="${service.with_contrast_price ?? ''}"
        placeholder="Үнэ оруулах"
        style="${fieldStyle()}"
      >

      <button
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

    list.appendChild(item);
  });
}


window.saveService =
async function(serviceId, button) {

  const withoutDescription =
    document
      .getElementById(
        `without-description-${serviceId}`
      )
      .value
      .trim();

  const withDescription =
    document
      .getElementById(
        `with-description-${serviceId}`
      )
      .value
      .trim();

  const withoutPrice =
    document
      .getElementById(
        `without-price-${serviceId}`
      )
      .value
      .trim();

  const withPrice =
    document
      .getElementById(
        `with-price-${serviceId}`
      )
      .value
      .trim();

  button.disabled = true;
  button.textContent =
    'Хадгалж байна...';

  const { error } =
    await supabaseClient
      .from('services')
      .update({

        without_contrast_description:
          withoutDescription,

        with_contrast_description:
          withDescription,

        without_contrast_price:
          withoutPrice === ''
            ? null
            : Number(withoutPrice),

        with_contrast_price:
          withPrice === ''
            ? null
            : Number(withPrice),

        updated_at:
          new Date().toISOString()

      })
      .eq('id', serviceId);

  button.disabled = false;

  if (error) {
    console.error(error);

    button.textContent =
      'Алдаа';

    return;
  }

  button.textContent =
    '✓ Хадгалагдлаа';

  setTimeout(() => {
    button.textContent =
      'Хадгалах';
  }, 1500);
};


// =====================================================
// DOCTORS
// =====================================================

async function loadDoctorsEditor() {

  const list =
    document.getElementById('doctorsList');

  if (!list) return;

  list.textContent =
    'Мэдээлэл ачаалж байна...';

  const { data, error } =
    await supabaseClient
      .from('doctors')
      .select('*')
      .order('sort_order');

  if (error) {

    list.textContent =
      'Алдаа: ' + error.message;

    return;
  }

  list.innerHTML = '';

  data.forEach(doctor => {

    const item =
      document.createElement('div');

    item.style.cssText =
      editorCardStyle();

    item.innerHTML = `

      <h3>
        ${doctor.sort_order}-р эмч
      </h3>

      <label>
        Нэр
      </label>

      <input
        id="doctor-name-${doctor.id}"
        value="${escapeAdminHtml(
          doctor.name
        )}"
        style="${fieldStyle()}"
      >

      <label>
        Мэргэжил
      </label>

      <input
        id="doctor-specialty-${doctor.id}"
        value="${escapeAdminHtml(
          doctor.specialty
        )}"
        style="${fieldStyle()}"
      >

      <label>
        Туршлага
      </label>

      <input
        id="doctor-experience-${doctor.id}"
        value="${escapeAdminHtml(
          doctor.experience
        )}"
        style="${fieldStyle()}"
      >

      <label>
        Танилцуулга
      </label>

      <textarea
        id="doctor-bio-${doctor.id}"
        rows="6"
        style="${fieldStyle()}"
      >${escapeAdminHtml(
        doctor.bio
      )}</textarea>

      <label>
        Зургийн URL
      </label>

      <input
        id="doctor-image-${doctor.id}"
        value="${escapeAdminHtml(
          doctor.image_url
        )}"
        placeholder="https://..."
        style="${fieldStyle()}"
      >

      <button
        onclick="saveDoctor(${doctor.id}, this)"
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

    list.appendChild(item);
  });
}


window.saveDoctor =
async function(id, button) {

  button.disabled = true;

  button.textContent =
    'Хадгалж байна...';

  const { error } =
    await supabaseClient
      .from('doctors')
      .update({

        name:
          document
            .getElementById(
              `doctor-name-${id}`
            )
            .value
            .trim(),

        specialty:
          document
            .getElementById(
              `doctor-specialty-${id}`
            )
            .value
            .trim(),

        experience:
          document
            .getElementById(
              `doctor-experience-${id}`
            )
            .value
            .trim(),

        bio:
          document
            .getElementById(
              `doctor-bio-${id}`
            )
            .value
            .trim(),

        image_url:
          document
            .getElementById(
              `doctor-image-${id}`
            )
            .value
            .trim(),

        updated_at:
          new Date().toISOString()

      })
      .eq('id', id);

  button.disabled = false;

  if (error) {
    console.error(error);

    button.textContent =
      'Алдаа';

    return;
  }

  button.textContent =
    '✓ Хадгалагдлаа';

  setTimeout(() => {
    button.textContent =
      'Хадгалах';
  }, 1500);
};


// =====================================================
// ABOUT
// =====================================================

let aboutImageUrl = '';
let aboutSettingsId = null;


async function loadAboutEditor() {

  const content =
    document.getElementById(
      'aboutContent'
    );

  const preview =
    document.getElementById(
      'aboutImagePreview'
    );

  if (!content) return;

  const { data, error } =
    await supabaseClient
      .from('settings')
      .select(
        'id, about_content, about_image_url'
      )
      .order('id')
      .limit(1);

  if (
    error ||
    !data ||
    !data.length
  ) {

    content.innerHTML = '';

    if (preview) {
      preview.innerHTML = '';
    }

    return;
  }

  const s = data[0];

  aboutSettingsId = s.id;

  content.innerHTML =
    s.about_content || '';

  aboutImageUrl =
    s.about_image_url || '';

  setImagePreview(
    'aboutImagePreview',
    aboutImageUrl
  );
}


window.formatAboutText =
function(command, value = null) {

  const editor =
    document.getElementById(
      'aboutContent'
    );

  if (!editor) return;

  editor.focus();

  document.execCommand(
    command,
    false,
    value
  );
};


window.addAboutLink =
function() {

  const editor =
    document.getElementById(
      'aboutContent'
    );

  if (!editor) return;

  const url =
    prompt('Линк оруулна уу:');

  if (!url) return;

  editor.focus();

  document.execCommand(
    'createLink',
    false,
    url
  );
};


window.saveAboutSettings =
async function() {

  const content =
    document
      .getElementById(
        'aboutContent'
      )
      ?.innerHTML
      .trim() || '';

  if (!aboutSettingsId) {

    const { data, error } =
      await supabaseClient
        .from('settings')
        .select('id')
        .order('id')
        .limit(1);

    if (
      error ||
      !data ||
      !data.length
    ) {

      alert(
        'Тохиргооны мөр олдсонгүй.'
      );

      return;
    }

    aboutSettingsId =
      data[0].id;
  }

  const { error } =
    await supabaseClient
      .from('settings')
      .update({

        about_content:
          content,

        about_image_url:
          aboutImageUrl || null,

        updated_at:
          new Date().toISOString()

      })
      .eq(
        'id',
        aboutSettingsId
      );

  if (error) {

    alert(
      'Хадгалахад алдаа: ' +
      error.message
    );

    return;
  }

  alert(
    'Бидний тухай мэдээлэл хадгалагдлаа.'
  );
};


async function uploadAboutImage(file) {

  if (!file) return;

  const allowed = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (
    !allowed.includes(file.type)
  ) {

    alert(
      'JPG, PNG эсвэл WEBP зураг оруулна уу.'
    );

    return;
  }

  if (
    file.size >
    5 * 1024 * 1024
  ) {

    alert(
      'Зураг 5MB-аас бага байх ёстой.'
    );

    return;
  }

  const ext =
    file.name
      .split('.')
      .pop()
      .toLowerCase();

  const fileName =
    `about/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

  const { error } =
    await supabaseClient
      .storage
      .from('site-media')
      .upload(
        fileName,
        file
      );

  if (error) {

    alert(
      'Зураг upload хийхэд алдаа: ' +
      error.message
    );

    return;
  }

  const { data } =
    supabaseClient
      .storage
      .from('site-media')
      .getPublicUrl(
        fileName
      );

  aboutImageUrl =
    data.publicUrl;

  setImagePreview(
    'aboutImagePreview',
    aboutImageUrl
  );
}


function setupAboutUploader() {

  const box =
    document.getElementById(
      'aboutUploadBox'
    );

  const input =
    document.getElementById(
      'aboutImageFile'
    );

  if (!box || !input) return;

  box.addEventListener(
    'click',
    () => {
      input.click();
    }
  );

  input.addEventListener(
    'change',
    () => {

      const file =
        input.files?.[0];

      if (file) {
        uploadAboutImage(file);
      }
    }
  );

  box.addEventListener(
    'dragover',
    event => {

      event.preventDefault();

      box.style.background =
        '#f1f5f9';
    }
  );

  box.addEventListener(
    'dragleave',
    () => {

      box.style.background =
        '#fafcff';
    }
  );

  box.addEventListener(
    'drop',
    event => {

      event.preventDefault();

      box.style.background =
        '#fafcff';

      const file =
        event.dataTransfer
          .files?.[0];

      if (file) {
        uploadAboutImage(file);
      }
    }
  );
}


// =====================================================
// NEWS
// =====================================================

async function loadNewsEditor() {

  const list =
    document.getElementById(
      'newsList'
    );

  if (!list) return;

  list.textContent =
    'Мэдээлэл ачаалж байна...';

  const { data, error } =
    await supabaseClient
      .from('news')
      .select('*')
      .order(
        'created_at',
        {
          ascending: false
        }
      );

  if (error) {

    list.textContent =
      'Алдаа: ' +
      error.message;

    return;
  }

  list.innerHTML = `
    <button
      onclick="createNews()"
      style="
        padding:12px 18px;
        margin-bottom:20px;
        background:#17212b;
        color:#fff;
        border:0;
        border-radius:8px;
        cursor:pointer;
      "
    >
      + Шинэ мэдээ
    </button>
  `;

  if (!data.length) {

    list.innerHTML +=
      '<p>Одоогоор мэдээ байхгүй.</p>';

    return;
  }

  data.forEach(news => {

    const item =
      document.createElement(
        'div'
      );

    item.style.cssText =
      editorCardStyle();

    item.innerHTML = `

      <label>
        Гарчиг
      </label>

      <input
        id="news-title-${news.id}"
        value="${escapeAdminHtml(
          news.title
        )}"
        style="${fieldStyle()}"
      >

      <label>
        Товч тайлбар
      </label>

      <textarea
        id="news-excerpt-${news.id}"
        rows="3"
        style="${fieldStyle()}"
      >${escapeAdminHtml(
        news.excerpt
      )}</textarea>

      <label>
        Мэдээний агуулга
      </label>

      <textarea
        id="news-content-${news.id}"
        rows="8"
        style="${fieldStyle()}"
      >${escapeAdminHtml(
        news.content
      )}</textarea>

      <label>
        Зургийн URL
      </label>

      <input
        id="news-image-${news.id}"
        value="${escapeAdminHtml(
          news.image_url
        )}"
        placeholder="https://..."
        style="${fieldStyle()}"
      >

      <label>
        YouTube линк
      </label>

      <input
        id="news-youtube-${news.id}"
        value="${escapeAdminHtml(
          news.youtube_url
        )}"
        placeholder="https://youtube.com/..."
        style="${fieldStyle()}"
      >

      <label
        style="
          display:block;
          margin-bottom:18px;
        "
      >

        <input
          type="checkbox"
          id="news-published-${news.id}"
          ${news.published ? 'checked' : ''}
        >

        Нийтлэх
      </label>

      <button
        onclick="saveNews(${news.id}, this)"
        style="
          padding:11px 18px;
          background:#17212b;
          color:#fff;
          border:0;
          border-radius:8px;
          cursor:pointer;
        "
      >
        Хадгалах
      </button>

      <button
        onclick="deleteNews(${news.id})"
        style="
          padding:11px 18px;
          margin-left:8px;
          background:#fff;
          border:1px solid #ccc;
          border-radius:8px;
          cursor:pointer;
        "
      >
        Устгах
      </button>
    `;

    list.appendChild(item);
  });
}


window.createNews =
async function() {

  const { error } =
    await supabaseClient
      .from('news')
      .insert({

        title:
          'Шинэ мэдээ',

        excerpt:
          '',

        content:
          '',

        image_url:
          '',

        youtube_url:
          '',

        published:
          false,

        updated_at:
          new Date().toISOString()

      });

  if (error) {

    alert(
      'Мэдээ үүсгэхэд алдаа гарлаа: ' +
      error.message
    );

    return;
  }

  await loadNewsEditor();
};


window.saveNews =
async function(id, button) {

  button.disabled = true;

  button.textContent =
    'Хадгалж байна...';

  const { error } =
    await supabaseClient
      .from('news')
      .update({

        title:
          document
            .getElementById(
              `news-title-${id}`
            )
            .value
            .trim(),

        excerpt:
          document
            .getElementById(
              `news-excerpt-${id}`
            )
            .value
            .trim(),

        content:
          document
            .getElementById(
              `news-content-${id}`
            )
            .value
            .trim(),

        image_url:
          document
            .getElementById(
              `news-image-${id}`
            )
            .value
            .trim(),

        youtube_url:
          document
            .getElementById(
              `news-youtube-${id}`
            )
            .value
            .trim(),

        published:
          document
            .getElementById(
              `news-published-${id}`
            )
            .checked,

        updated_at:
          new Date().toISOString()

      })
      .eq('id', id);

  button.disabled = false;

  if (error) {

    console.error(error);

    button.textContent =
      'Алдаа';

    return;
  }

  button.textContent =
    '✓ Хадгалагдлаа';

  setTimeout(() => {

    button.textContent =
      'Хадгалах';

  }, 1500);
};


window.deleteNews =
async function(id) {

  if (
    !confirm(
      'Энэ мэдээг устгах уу?'
    )
  ) {
    return;
  }

  const { error } =
    await supabaseClient
      .from('news')
      .delete()
      .eq('id', id);

  if (error) {

    alert(
      'Алдаа: ' +
      error.message
    );

    return;
  }

  await loadNewsEditor();
};


// =====================================================
// NEW NEWS IMAGE
// =====================================================

let newNewsImageUrl = '';


async function uploadNewsImage(file) {

  if (!file) return;

  const allowed = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (
    !allowed.includes(file.type)
  ) {

    alert(
      'JPG, PNG эсвэл WEBP зураг оруулна уу.'
    );

    return;
  }

  if (
    file.size >
    5 * 1024 * 1024
  ) {

    alert(
      'Зураг 5MB-аас бага байх ёстой.'
    );

    return;
  }

  const ext =
    file.name
      .split('.')
      .pop()
      .toLowerCase();

  const fileName =
    `news/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

  const {
    error: uploadError
  } =
    await supabaseClient
      .storage
      .from('site-media')
      .upload(
        fileName,
        file
      );

  if (uploadError) {

    alert(
      'Зураг upload хийхэд алдаа: ' +
      uploadError.message
    );

    return;
  }

  const { data } =
    supabaseClient
      .storage
      .from('site-media')
      .getPublicUrl(
        fileName
      );

  newNewsImageUrl =
    data.publicUrl;

  setImagePreview(
    'newsImagePreview',
    newNewsImageUrl,
    140,
    140
  );
}


window.removeNewNewsImage =
function() {

  newNewsImageUrl = '';

  setImagePreview(
    'newsImagePreview',
    ''
  );

  const input =
    document.getElementById(
      'newsImageFile'
    );

  if (input) {
    input.value = '';
  }
};


function setupNewsUploader() {

  const box =
    document.getElementById(
      'newsUploadBox'
    );

  const input =
    document.getElementById(
      'newsImageFile'
    );

  if (!box || !input) return;

  box.addEventListener(
    'click',
    () => {
      input.click();
    }
  );

  input.addEventListener(
    'change',
    () => {

      const file =
        input.files?.[0];

      if (file) {
        uploadNewsImage(file);
      }
    }
  );

  box.addEventListener(
    'dragover',
    event => {

      event.preventDefault();

      box.style.background =
        '#f1f5f9';
    }
  );

  box.addEventListener(
    'dragleave',
    () => {

      box.style.background =
        '';
    }
  );

  box.addEventListener(
    'drop',
    event => {

      event.preventDefault();

      box.style.background =
        '';

      const file =
        event.dataTransfer
          .files?.[0];

      if (file) {
        uploadNewsImage(file);
      }
    }
  );
}


// =====================================================
// CREATE NEWS FROM RICH EDITOR
// =====================================================

window.createNewsFromEditor =
async function() {

  const title =
    document
      .getElementById(
        'newNewsTitle'
      )
      ?.value
      .trim() || '';

  const contentEditor =
    document.getElementById(
      'newNewsContent'
    );

  const content =
    contentEditor
      ?.innerHTML
      .trim() || '';

  const youtube =
    document
      .getElementById(
        'newNewsYoutube'
      )
      ?.value
      .trim() || '';

  const published =
    document
      .getElementById(
        'newNewsPublished'
      )
      ?.checked || false;

  if (!title) {

    alert(
      'Гарчиг оруулна уу.'
    );

    return;
  }

  const excerpt =
    stripHtml(content)
      .slice(0, 180);

  const { error } =
    await supabaseClient
      .from('news')
      .insert({

        title,

        excerpt,

        content,

        image_url:
          newNewsImageUrl || null,

        youtube_url:
          youtube || null,

        published,

        updated_at:
          new Date().toISOString()

      });

  if (error) {

    alert(
      'Мэдээ хадгалахад алдаа: ' +
      error.message
    );

    return;
  }

  document
    .getElementById(
      'newNewsTitle'
    )
    .value = '';

  document
    .getElementById(
      'newNewsContent'
    )
    .innerHTML = '';

  document
    .getElementById(
      'newNewsYoutube'
    )
    .value = '';

  document
    .getElementById(
      'newNewsPublished'
    )
    .checked = false;

  newNewsImageUrl = '';

  setImagePreview(
    'newsImagePreview',
    ''
  );

  alert(
    'Мэдээ амжилттай хадгалагдлаа.'
  );

  await loadNewsEditor();
};


// =====================================================
// NEWS RICH TEXT
// =====================================================

window.formatNewsText =
function(
  command,
  value = null
) {

  const editor =
    document.getElementById(
      'newNewsContent'
    );

  if (!editor) return;

  editor.focus();

  document.execCommand(
    command,
    false,
    value
  );
};


window.addNewsLink =
function() {

  const editor =
    document.getElementById(
      'newNewsContent'
    );

  if (!editor) return;

  const url =
    prompt(
      'Линк оруулна уу:'
    );

  if (!url) return;

  editor.focus();

  document.execCommand(
    'createLink',
    false,
    url
  );
};


// =====================================================
// SETTINGS
// =====================================================

async function loadSettingsEditor() {

  const container =
    document.getElementById(
      'settingsForm'
    );

  if (!container) return;

  container.textContent =
    'Мэдээлэл ачаалж байна...';

  const { data, error } =
    await supabaseClient
      .from('settings')
      .select('*')
      .order('id')
      .limit(1);

  if (
    error ||
    !data.length
  ) {

    container.textContent =
      'Тохиргоо ачаалахад алдаа гарлаа.';

    return;
  }

  const s = data[0];

  container.innerHTML = `

    <div
      style="${editorCardStyle()}"
    >

      <label>
        Email
      </label>

      <input
        id="setting-email"
        value="${escapeAdminHtml(
          s.email
        )}"
        style="${fieldStyle()}"
      >

      <label>
        Ерөнхий утас
      </label>

      <input
        id="setting-general-phone"
        value="${escapeAdminHtml(
          s.general_phone
        )}"
        style="${fieldStyle()}"
      >

      <label>
        Утас 1
      </label>

      <input
        id="setting-phone1"
        value="${escapeAdminHtml(
          s.phone_1
        )}"
        style="${fieldStyle()}"
      >

      <label>
        Утас 2
      </label>

      <input
        id="setting-phone2"
        value="${escapeAdminHtml(
          s.phone_2
        )}"
        style="${fieldStyle()}"
      >

      <label>
        Хаяг
      </label>

      <textarea
        id="setting-address"
        rows="3"
        style="${fieldStyle()}"
      >${escapeAdminHtml(
        s.address
      )}</textarea>

      <label>
        MRI төхөөрөмж
      </label>

      <input
        id="setting-machine"
        value="${escapeAdminHtml(
          s.machine_info
        )}"
        style="${fieldStyle()}"
      >

      <label>
        Цаг захиалгын Google Form URL
      </label>

      <input
        id="setting-booking"
        value="${escapeAdminHtml(
          s.booking_url
        )}"
        placeholder="https://..."
        style="${fieldStyle()}"
      >

      <button
        onclick="saveSettings(${s.id}, this)"
        style="
          padding:11px 18px;
          background:#17212b;
          color:#fff;
          border:0;
          border-radius:8px;
          cursor:pointer;
        "
      >
        Хадгалах
      </button>

    </div>
  `;
}


window.saveSettings =
async function(id, button) {

  button.disabled = true;

  button.textContent =
    'Хадгалж байна...';

  const { error } =
    await supabaseClient
      .from('settings')
      .update({

        email:
          document
            .getElementById(
              'setting-email'
            )
            .value
            .trim(),

        general_phone:
          document
            .getElementById(
              'setting-general-phone'
            )
            .value
            .trim(),

        phone_1:
          document
            .getElementById(
              'setting-phone1'
            )
            .value
            .trim(),

        phone_2:
          document
            .getElementById(
              'setting-phone2'
            )
            .value
            .trim(),

        address:
          document
            .getElementById(
              'setting-address'
            )
            .value
            .trim(),

        machine_info:
          document
            .getElementById(
              'setting-machine'
            )
            .value
            .trim(),

        booking_url:
          document
            .getElementById(
              'setting-booking'
            )
            .value
            .trim(),

        updated_at:
          new Date().toISOString()

      })
      .eq(
        'id',
        id
      );

  button.disabled = false;

  if (error) {

    console.error(error);

    button.textContent =
      'Алдаа';

    return;
  }

  button.textContent =
    '✓ Хадгалагдлаа';

  setTimeout(() => {

    button.textContent =
      'Хадгалах';

  }, 1500);
};


// =====================================================
// START
// =====================================================

document.addEventListener(
  'DOMContentLoaded',
  () => {

    setupNewsUploader();
    setupAboutUploader();

  }
);


checkAdminAccess();
