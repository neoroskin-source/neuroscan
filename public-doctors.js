const PUBLIC_SUPABASE_URL = 'https://fqhqmbtexxeblbnxfvzn.supabase.co';
const PUBLIC_SUPABASE_KEY = 'sb_publishable_o4_UwkZbcd2tM6hVyoMRyQ_yza9Ffzs';

async function loadSupabaseLibrary() {
  if (window.supabase) return;

  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src =
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

    script.onload = resolve;
    script.onerror = reject;

    document.head.appendChild(script);
  });
}

function escapePublicHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function loadPublicDoctors() {
  await loadSupabaseLibrary();

  const client = window.supabase.createClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_KEY
  );

  const { data, error } = await client
    .from('doctors')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error || !data) {
    console.error('Doctors:', error);
    return;
  }

  const list =
    document.querySelector('.doctor-profile-list');

  if (!list) return;

  list.innerHTML = '';

  data.forEach((doctor, index) => {
    const profile = document.createElement('div');

    profile.className =
      index % 2 === 1
        ? 'doctor-profile reverse'
        : 'doctor-profile';

    const photo = doctor.image_url
      ? `
        <img
          src="${escapePublicHtml(doctor.image_url)}"
          alt="${escapePublicHtml(doctor.name)}"
          style="
            width:100%;
            height:100%;
            object-fit:cover;
            border-radius:inherit;
          "
        >
      `
      : `
        <div>
          <div class="avatar">
            ${String(index + 1).padStart(2, '0')}
          </div>
          <strong>Эмчийн зураг</strong>
        </div>
      `;

    profile.innerHTML = `
      <div class="doctor-photo">
        ${photo}
      </div>

      <article class="doctor-info">

        <div class="eyebrow">
          MRI дүрс оношилгоо
        </div>

        <h2>
          ${escapePublicHtml(
            doctor.name || 'Эмчийн танилцуулга'
          )}
        </h2>

        <div class="doctor-meta">

          <span>
            <strong>Мэргэжил</strong>
            ${escapePublicHtml(
              doctor.specialty || 'Мэдээлэл оруулах'
            )}
          </span>

          <span>
            <strong>Туршлага</strong>
            ${escapePublicHtml(
              doctor.experience || 'Мэдээлэл оруулах'
            )}
          </span>

        </div>

        <p>
          <strong>Танилцуулга:</strong>
          ${escapePublicHtml(
            doctor.bio || 'Мэдээлэл оруулах'
          )}
        </p>

      </article>
    `;

    list.appendChild(profile);
  });
}

loadPublicDoctors();
