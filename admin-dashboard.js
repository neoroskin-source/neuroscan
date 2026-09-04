const SUPABASE_URL =
  'https://fqhqmbtexxeblbnxfvzn.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_o4_UwkZbcd2tM6hVyoMRyQ_yza9Ffzs';


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


const loadingScreen =
  document.getElementById(
    'loadingScreen'
  );

const adminDashboard =
  document.getElementById(
    'adminDashboard'
  );

const logoutButton =
  document.getElementById(
    'logoutButton'
  );


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
    box-sizing:border-box;
  `;
}


function stripHtml(html) {

  const temp =
    document.createElement('div');

  temp.innerHTML =
    html || '';

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
    document.getElementById(
      containerId
    );

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


function setButtonSaved(button) {

  if (!button) return;

  button.disabled =
    false;

  button.textContent =
    '✓ Хадгалагдлаа';


  setTimeout(() => {

    button.textContent =
      'Хадгалах';

  }, 1500);
}


// =====================================================
// ADMIN ACCESS
// =====================================================

async function checkAdminAccess() {

  const {
    data: { session },
    error: sessionError
  } =
    await supabaseClient
      .auth
      .getSession();


  if (
    sessionError ||
    !session
  ) {

    window.location.href =
      'admin.html';

    return;
  }


  const {
    data: adminData,
    error: adminError
  } =
    await supabaseClient
      .from('admin_users')
      .select('user_id')
      .eq(
        'user_id',
        session.user.id
      )
      .maybeSingle();


  if (
    adminError ||
    !adminData
  ) {

    await supabaseClient
      .auth
      .signOut();

    window.location.href =
      'admin.html';

    return;
  }


  if (loadingScreen) {

    loadingScreen.style.display =
      'none';
  }


  if (adminDashboard) {

    adminDashboard.style.display =
      'block';
  }


  await loadServicesEditor();

}


// =====================================================
// LOGOUT
// =====================================================

if (logoutButton) {

  logoutButton.addEventListener(
    'click',
    async () => {

      await supabaseClient
        .auth
        .signOut();

      window.location.href =
        'admin.html';

    }
  );
}


// =====================================================
// SECTION NAVIGATION
// =====================================================

window.openAdminSection =
async function(section) {

  const sections = {

    services:
      'servicesEditor',

    doctors:
      'doctorsEditor',

    about:
      'aboutEditor',

    news:
      'newsEditor',

    settings:
      'settingsEditor'

  };


  Object
    .values(sections)
    .forEach(id => {

      const el =
        document.getElementById(
          id
        );

      if (el) {

        el.style.display =
          'none';
      }

    });


  [
    'servicesButton',
    'doctorsButton',
    'aboutButton',
    'newsButton',
    'settingsButton'
  ]
  .forEach(id => {

    document
      .getElementById(id)
      ?.classList
      .remove('active');

  });


  const cards =
    document.getElementById(
      'dashboardCards'
    );


  if (cards) {

    cards.style.display =
      'none';
  }


  const targetId =
    sections[section];


  const target =
    targetId
      ? document.getElementById(
          targetId
        )
      : null;


  if (target) {

    target.style.display =
      'block';
  }


  document
    .getElementById(
      section + 'Button'
    )
    ?.classList
    .add('active');


  if (
    section === 'services'
  ) {

    await loadServicesEditor();
  }


  if (
    section === 'doctors'
  ) {

    await loadDoctorsEditor();
  }


  if (
    section === 'about'
  ) {

    await loadAboutEditor();
  }


  if (
    section === 'news'
  ) {

    await loadNewsEditor();
  }


  if (
    section === 'settings'
  ) {

    await loadSettingsEditor();
  }


  /*
    Үйлчилгээнээс өөр menu рүү
    ороход submenu-г хаана.
  */

  if (
    section !== 'services'
  ) {

    const submenu =
      document.getElementById(
        'servicesSubmenu'
      );

    const arrow =
      document.getElementById(
        'servicesArrow'
      );


    if (submenu) {

      submenu.style.display =
        'none';
    }


    if (arrow) {

      arrow.textContent =
        '⌄';
    }
  }

};


// =====================================================
// SERVICES SIDEBAR TOGGLE
// =====================================================

window.toggleServicesMenu =
async function() {

  const submenu =
    document.getElementById(
      'servicesSubmenu'
    );


  const arrow =
    document.getElementById(
      'servicesArrow'
    );


  if (!submenu) return;


  const isOpen =
    submenu.style.display ===
    'block';


  /*
    Нээлттэй байвал хаана.
  */

  if (isOpen) {

    submenu.style.display =
      'none';


    if (arrow) {

      arrow.textContent =
        '⌄';
    }


    return;
  }


  /*
    Хаалттай байвал нээнэ.
  */

  submenu.style.display =
    'block';


  if (arrow) {

    arrow.textContent =
      '⌃';
  }


  await openAdminSection(
    'services'
  );

};


// =====================================================
// SERVICES
// =====================================================

let adminServices = [];

let selectedServiceId =
  null;


// -----------------------------------------------------
// LOAD SERVICES
// -----------------------------------------------------

async function loadServicesEditor() {

  const list =
    document.getElementById(
      'servicesList'
    );


  const submenu =
    document.getElementById(
      'servicesSubmenu'
    );


  if (
    !list ||
    !submenu
  ) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from('services')
      .select('*')
      .order('sort_order');


  if (error) {

    list.textContent =
      'Алдаа: ' +
      error.message;

    return;
  }


  adminServices =
    data || [];


  /*
    Sidebar submenu
  */

  submenu.innerHTML =
    '';


  adminServices
    .forEach(service => {

      const button =
        document.createElement(
          'button'
        );


      button.type =
        'button';


      button.className =
        'service-submenu-button';


      button.id =
        `service-menu-${service.id}`;


      button.textContent =
        service.name;


      button.onclick =
      () => {

        openServiceEditor(
          service.id
        );

      };


      submenu.appendChild(
        button
      );

    });


  /*
    Анх нээгдэхэд эхний MRI-г сонгоно.
  */

  if (
    adminServices.length &&
    !selectedServiceId
  ) {

    selectedServiceId =
      adminServices[0].id;
  }


  /*
    Өмнө сонгосон service байвал
    тэрийгээ буцааж нээнэ.
  */

  const selectedStillExists =
    adminServices.some(
      service =>
        String(service.id) ===
        String(selectedServiceId)
    );


  if (
    !selectedStillExists &&
    adminServices.length
  ) {

    selectedServiceId =
      adminServices[0].id;
  }


  if (selectedServiceId) {

    openServiceEditor(
      selectedServiceId
    );

  } else {

    list.innerHTML =
      '<p>Үйлчилгээний мэдээлэл байхгүй байна.</p>';
  }

}


// -----------------------------------------------------
// OPEN ONE SERVICE
// -----------------------------------------------------

window.openServiceEditor =
function(serviceId) {

  selectedServiceId =
    serviceId;


  const service =
    adminServices.find(
      item =>
        String(item.id) ===
        String(serviceId)
    );


  if (!service) return;


  const list =
    document.getElementById(
      'servicesList'
    );


  if (!list) return;


  /*
    Sidebar active state
  */

  document
    .querySelectorAll(
      '.service-submenu-button'
    )
    .forEach(button => {

      button.classList.remove(
        'active'
      );

    });


  document
    .getElementById(
      `service-menu-${serviceId}`
    )
    ?.classList
    .add('active');


  /*
    Баруун талд зөвхөн
    сонгосон MRI-г харуулна.
  */

  list.innerHTML = `

    <div
      style="${editorCardStyle()}"
    >

      <h2
        style="
          margin-top:0;
          margin-bottom:24px;
        "
      >
        ${escapeAdminHtml(
          service.name
        )}
      </h2>


      <label>
        Тодосгогчгүй тайлбар
      </label>

      <textarea
        id="without-description-${service.id}"
        rows="5"
        style="${fieldStyle()}"
      >${escapeAdminHtml(
        service.without_contrast_description
        || ''
      )}</textarea>


      <label>
        Тодосгогчгүй үнэ
      </label>

      <input
        type="number"
        id="without-price-${service.id}"
        value="${
          service.without_contrast_price
          ?? ''
        }"
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
        || ''
      )}</textarea>


      <label>
        Тодосгогчтой үнэ
      </label>

      <input
        type="number"
        id="with-price-${service.id}"
        value="${
          service.with_contrast_price
          ?? ''
        }"
        placeholder="Үнэ оруулах"
        style="${fieldStyle()}"
      >


      <button
        type="button"
        onclick="
          saveService(
            ${service.id},
            this
          )
        "
        style="
          padding:11px 18px;
          border:0;
          border-radius:8px;
          background:#17212b;
          color:#ffffff;
          font-weight:700;
          cursor:pointer;
        "
      >
        Хадгалах
      </button>

    </div>

  `;

};


// -----------------------------------------------------
// SAVE SERVICE
// -----------------------------------------------------

window.saveService =
async function(
  serviceId,
  button
) {

  const withoutDescription =
    document
      .getElementById(
        `without-description-${serviceId}`
      )
      ?.value
      .trim()
    || '';


  const withDescription =
    document
      .getElementById(
        `with-description-${serviceId}`
      )
      ?.value
      .trim()
    || '';


  const withoutPrice =
    document
      .getElementById(
        `without-price-${serviceId}`
      )
      ?.value
      .trim()
    || '';


  const withPrice =
    document
      .getElementById(
        `with-price-${serviceId}`
      )
      ?.value
      .trim()
    || '';


  button.disabled =
    true;


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
            : Number(
                withoutPrice
              ),

        with_contrast_price:
          withPrice === ''
            ? null
            : Number(
                withPrice
              ),

        updated_at:
          new Date()
            .toISOString()

      })
      .eq(
        'id',
        serviceId
      );


  if (error) {

    console.error(error);


    button.disabled =
      false;


    button.textContent =
      'Алдаа';


    alert(
      'Үйлчилгээ хадгалахад алдаа: ' +
      error.message
    );


    return;
  }


  /*
    Local data-г мөн шинэчилнэ.
  */

  const service =
    adminServices.find(
      item =>
        String(item.id) ===
        String(serviceId)
    );


  if (service) {

    service
      .without_contrast_description =
        withoutDescription;


    service
      .with_contrast_description =
        withDescription;


    service
      .without_contrast_price =
        withoutPrice === ''
          ? null
          : Number(
              withoutPrice
            );


    service
      .with_contrast_price =
        withPrice === ''
          ? null
          : Number(
              withPrice
            );
  }


  setButtonSaved(
    button
  );


  /*
    Preview нээлттэй байвал
    хадгалсны дараа refresh.
  */

  if (
    document
      .getElementById(
        'livePreviewPanel'
      )
      ?.style
      .display ===
      'block'
  ) {

    refreshLivePreview();

  }

};


// =====================================================
// DOCTORS
// =====================================================

async function loadDoctorsEditor() {

  const list =
    document.getElementById(
      'doctorsList'
    );

  if (!list) return;


  list.textContent =
    'Мэдээлэл ачаалж байна...';


  const {
    data,
    error
  } =
    await supabaseClient
      .from('doctors')
      .select('*')
      .order('sort_order');


  if (error) {

    console.error(
      'Doctors load error:',
      error
    );

    list.textContent =
      'Алдаа: ' +
      error.message;

    return;
  }


  list.innerHTML = '';


  if (
    !data ||
    !data.length
  ) {

    list.innerHTML =
      '<p>Эмчийн мэдээлэл байхгүй байна.</p>';

    return;
  }


  data.forEach(
    doctor => {

      const item =
        document.createElement(
          'div'
        );


      item.style.cssText =
        editorCardStyle();


      const doctorImage =
        doctor.image_url || '';


      item.innerHTML = `

        <h3
          style="
            margin-top:0;
            margin-bottom:24px;
          "
        >
          ${escapeAdminHtml(
            doctor.sort_order
          )}-р эмч
        </h3>


        <!-- =========================
             NAME
             ========================= -->

        <label>
          Нэр
        </label>

        <input
          id="doctor-name-${doctor.id}"
          type="text"
          value="${escapeAdminHtml(
            doctor.name || ''
          )}"
          style="${fieldStyle()}"
        >


        <!-- =========================
             SPECIALTY
             ========================= -->

        <label>
          Мэргэжил
        </label>

        <input
          id="doctor-specialty-${doctor.id}"
          type="text"
          value="${escapeAdminHtml(
            doctor.specialty || ''
          )}"
          style="${fieldStyle()}"
        >


        <!-- =========================
             EXPERIENCE
             ========================= -->

        <label>
          Туршлага
        </label>

        <input
          id="doctor-experience-${doctor.id}"
          type="text"
          value="${escapeAdminHtml(
            doctor.experience || ''
          )}"
          style="${fieldStyle()}"
        >


        <!-- =========================
             BIO
             ========================= -->

        <label>
          Танилцуулга
        </label>

        <textarea
          id="doctor-bio-${doctor.id}"
          rows="6"
          style="${fieldStyle()}"
        >${escapeAdminHtml(
          doctor.bio || ''
        )}</textarea>


        <!-- =========================
             DOCTOR IMAGE
             ========================= -->

        <label
          style="
            display:block;
            margin-top:8px;
            margin-bottom:8px;
          "
        >
          Эмчийн зураг
        </label>


        <div
          id="doctor-upload-box-${doctor.id}"
          onclick="
            document
              .getElementById(
                'doctor-image-file-${doctor.id}'
              )
              .click()
          "
          style="
            width:100%;
            min-height:140px;
            border:2px dashed #cbd5e1;
            border-radius:14px;
            display:flex;
            align-items:center;
            justify-content:center;
            text-align:center;
            cursor:pointer;
            background:#fafcff;
            color:#64748b;
            padding:24px;
            box-sizing:border-box;
            margin-bottom:12px;
          "
        >
          Энд дарж эмчийн зураг сонгоно уу
        </div>


        <input
          id="doctor-image-file-${doctor.id}"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style="display:none;"
          onchange="
            uploadDoctorImage(
              this.files?.[0],
              ${doctor.id}
            )
          "
        >


        <!--
          image_url-г энэ hidden input-д хадгална.
          saveDoctor() энэ value-г Supabase руу явуулна.
        -->

        <input
          id="doctor-image-${doctor.id}"
          type="hidden"
          value="${escapeAdminHtml(
            doctorImage
          )}"
        >


        <div
          id="doctor-image-preview-${doctor.id}"
          style="
            margin-bottom:18px;
          "
        >
          ${
            doctorImage
              ? `
                <div
                  style="
                    display:flex;
                    align-items:flex-start;
                    gap:14px;
                    flex-wrap:wrap;
                  "
                >

                  <img
                    src="${escapeAdminHtml(
                      doctorImage
                    )}"
                    alt="Doctor preview"
                    style="
                      width:150px;
                      height:180px;
                      object-fit:cover;
                      border-radius:14px;
                      border:1px solid #e4e9ef;
                      background:#fff;
                    "
                  >

                  <button
                    type="button"
                    onclick="
                      removeDoctorImage(
                        ${doctor.id}
                      )
                    "
                    style="
                      padding:9px 14px;
                      background:#fff;
                      border:1px solid #d8dee6;
                      border-radius:8px;
                      cursor:pointer;
                    "
                  >
                    Зураг арилгах
                  </button>

                </div>
              `
              : ''
          }
        </div>


        <!-- =========================
             SAVE
             ========================= -->

        <button
          type="button"
          onclick="
            saveDoctor(
              ${doctor.id},
              this
            )
          "
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


      list.appendChild(
        item
      );

    }
  );

}


// =====================================================
// UPLOAD DOCTOR IMAGE
// =====================================================

window.uploadDoctorImage =
async function(
  file,
  doctorId
) {

  if (!file) return;


  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];


  if (
    !allowedTypes.includes(
      file.type
    )
  ) {

    alert(
      'JPG, PNG эсвэл WEBP зураг сонгоно уу.'
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


  const uploadBox =
    document.getElementById(
      `doctor-upload-box-${doctorId}`
    );


  if (uploadBox) {

    uploadBox.textContent =
      'Зураг upload хийж байна...';

  }


  const extension =
    file.name
      .split('.')
      .pop()
      .toLowerCase();


  const fileName =
    `doctors/${doctorId}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extension}`;


  const {
    error: uploadError
  } =
    await supabaseClient
      .storage
      .from(
        'site-media'
      )
      .upload(
        fileName,
        file
      );


  if (uploadError) {

    console.error(
      'Doctor image upload error:',
      uploadError
    );


    if (uploadBox) {

      uploadBox.textContent =
        'Энд дарж эмчийн зураг сонгоно уу';

    }


    alert(
      'Зураг upload хийхэд алдаа: ' +
      uploadError.message
    );

    return;
  }


  const {
    data
  } =
    supabaseClient
      .storage
      .from(
        'site-media'
      )
      .getPublicUrl(
        fileName
      );


  const publicUrl =
    data.publicUrl;


  const hiddenInput =
    document.getElementById(
      `doctor-image-${doctorId}`
    );


  if (hiddenInput) {

    hiddenInput.value =
      publicUrl;

  }


  showDoctorImagePreview(
    doctorId,
    publicUrl
  );


  if (uploadBox) {

    uploadBox.textContent =
      'Өөр зураг сонгох';

  }

};


// =====================================================
// SHOW DOCTOR IMAGE PREVIEW
// =====================================================

function showDoctorImagePreview(
  doctorId,
  imageUrl
) {

  const preview =
    document.getElementById(
      `doctor-image-preview-${doctorId}`
    );


  if (!preview) return;


  if (!imageUrl) {

    preview.innerHTML =
      '';

    return;
  }


  preview.innerHTML = `

    <div
      style="
        display:flex;
        align-items:flex-start;
        gap:14px;
        flex-wrap:wrap;
      "
    >

      <img
        src="${escapeAdminHtml(
          imageUrl
        )}"
        alt="Doctor preview"
        style="
          width:150px;
          height:180px;
          object-fit:cover;
          border-radius:14px;
          border:1px solid #e4e9ef;
          background:#fff;
        "
      >


      <button
        type="button"
        onclick="
          removeDoctorImage(
            ${doctorId}
          )
        "
        style="
          padding:9px 14px;
          background:#fff;
          border:1px solid #d8dee6;
          border-radius:8px;
          cursor:pointer;
        "
      >
        Зураг арилгах
      </button>

    </div>

  `;

}


// =====================================================
// REMOVE DOCTOR IMAGE
// =====================================================

window.removeDoctorImage =
function(
  doctorId
) {

  const hiddenInput =
    document.getElementById(
      `doctor-image-${doctorId}`
    );


  const fileInput =
    document.getElementById(
      `doctor-image-file-${doctorId}`
    );


  const uploadBox =
    document.getElementById(
      `doctor-upload-box-${doctorId}`
    );


  if (hiddenInput) {

    hiddenInput.value =
      '';

  }


  if (fileInput) {

    fileInput.value =
      '';

  }


  if (uploadBox) {

    uploadBox.textContent =
      'Энд дарж эмчийн зураг сонгоно уу';

  }


  showDoctorImagePreview(
    doctorId,
    ''
  );

};


// =====================================================
// SAVE DOCTOR
// =====================================================

window.saveDoctor =
async function(
  id,
  button
) {

  if (button) {

    button.disabled =
      true;


    button.textContent =
      'Хадгалж байна...';

  }


  const name =
    document
      .getElementById(
        `doctor-name-${id}`
      )
      ?.value
      .trim()
    || '';


  const specialty =
    document
      .getElementById(
        `doctor-specialty-${id}`
      )
      ?.value
      .trim()
    || '';


  const experience =
    document
      .getElementById(
        `doctor-experience-${id}`
      )
      ?.value
      .trim()
    || '';


  const bio =
    document
      .getElementById(
        `doctor-bio-${id}`
      )
      ?.value
      .trim()
    || '';


  const imageUrl =
    document
      .getElementById(
        `doctor-image-${id}`
      )
      ?.value
      .trim()
    || '';


  const {
    error
  } =
    await supabaseClient
      .from('doctors')
      .update({

        name:
          name,

        specialty:
          specialty,

        experience:
          experience,

        bio:
          bio,

        image_url:
          imageUrl ||
          null,

        updated_at:
          new Date()
            .toISOString()

      })
      .eq(
        'id',
        id
      );


  if (error) {

    console.error(
      'Doctor save error:',
      error
    );


    if (button) {

      button.disabled =
        false;


      button.textContent =
        'Алдаа';

    }


    alert(
      'Эмчийн мэдээлэл хадгалахад алдаа: ' +
      error.message
    );


    return;
  }


  setButtonSaved(
    button
  );


  refreshPreviewIfOpen();

};

// =====================================================
// ABOUT
// =====================================================

let aboutImageUrl = '';

let missionIconValue = '';
let visionIconValue = '';
let valuesIconValue = '';

let aboutSettingsId = null;


// =====================================================
// LOAD ABOUT EDITOR
// =====================================================

async function loadAboutEditor() {

  const content =
    document.getElementById(
      'aboutContent'
    );

  const mission =
    document.getElementById(
      'aboutMissionContent'
    );

  const vision =
    document.getElementById(
      'aboutVisionContent'
    );

  const values =
    document.getElementById(
      'aboutValuesContent'
    );

  if (!content) return;


  const {
    data,
    error
  } =
    await supabaseClient
      .from('settings')
      .select(
        `
          id,
          about_content,
          about_image_url,
          mission_content,
          vision_content,
          values_content,
          mission_icon,
          vision_icon,
          values_icon
        `
      )
      .order('id')
      .limit(1);


  if (error) {

    console.error(
      'About load error:',
      error
    );

    alert(
      'Бидний тухай мэдээлэл ачаалахад алдаа гарлаа: ' +
      error.message
    );

    return;
  }


  if (
    !data ||
    !data.length
  ) {

    console.error(
      'Settings row олдсонгүй'
    );

    return;
  }


  const s =
    data[0];


  aboutSettingsId =
    s.id;


  // ---------------------------------
  // ABOUT CONTENT
  // ---------------------------------

  content.innerHTML =
    s.about_content || '';


  // ---------------------------------
  // MISSION
  // ---------------------------------

  if (mission) {

    mission.innerHTML =
      s.mission_content || '';

  }


  // ---------------------------------
  // VISION
  // ---------------------------------

  if (vision) {

    vision.innerHTML =
      s.vision_content || '';

  }


  // ---------------------------------
  // VALUES
  // ---------------------------------

  if (values) {

    values.innerHTML =
      s.values_content || '';

  }


  // ---------------------------------
  // ABOUT IMAGE
  // ---------------------------------

  aboutImageUrl =
    s.about_image_url || '';


  setImagePreview(
    'aboutImagePreview',
    aboutImageUrl
  );


  // ---------------------------------
  // ICON VALUES
  // ---------------------------------

  missionIconValue =
    s.mission_icon || '';

  visionIconValue =
    s.vision_icon || '';

  valuesIconValue =
    s.values_icon || '';


  // ---------------------------------
  // ICON TEXT INPUTS
  // ---------------------------------

  const missionIconInput =
    document.getElementById(
      'missionIconText'
    );

  const visionIconInput =
    document.getElementById(
      'visionIconText'
    );

  const valuesIconInput =
    document.getElementById(
      'valuesIconText'
    );


  if (missionIconInput) {

    missionIconInput.value =
      isAboutIconImage(
        missionIconValue
      )
        ? ''
        : missionIconValue;

  }


  if (visionIconInput) {

    visionIconInput.value =
      isAboutIconImage(
        visionIconValue
      )
        ? ''
        : visionIconValue;

  }


  if (valuesIconInput) {

    valuesIconInput.value =
      isAboutIconImage(
        valuesIconValue
      )
        ? ''
        : valuesIconValue;

  }


  // ---------------------------------
  // ICON PREVIEW
  // ---------------------------------

  showAboutIconPreview(
    'missionIconPreview',
    missionIconValue
  );

  showAboutIconPreview(
    'visionIconPreview',
    visionIconValue
  );

  showAboutIconPreview(
    'valuesIconPreview',
    valuesIconValue
  );


  // ---------------------------------
  // UPLOAD SETUP
  // ---------------------------------

  setupAboutUploader();

  setupAboutIconUploaders();

}


// =====================================================
// ABOUT RICH TEXT
// =====================================================

window.formatAboutText =
function(
  command,
  value = null
) {

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
// ABOUT ICON HELPERS
// =====================================================

function isAboutIconImage(
  value
) {

  if (!value) {
    return false;
  }


  return (
    value.startsWith(
      'http://'
    ) ||
    value.startsWith(
      'https://'
    )
  );

}


// =====================================================
// SHOW ICON PREVIEW
// =====================================================

function showAboutIconPreview(
  containerId,
  value
) {

  const container =
    document.getElementById(
      containerId
    );


  if (!container) return;


  if (!value) {

    container.innerHTML =
      '';

    return;
  }


  // ---------------------------------
  // IMAGE
  // ---------------------------------

  if (
    isAboutIconImage(
      value
    )
  ) {

    container.innerHTML = `

      <div
        style="
          margin-top:12px;
          display:flex;
          align-items:center;
          gap:12px;
        "
      >

        <img
          src="${escapeAdminHtml(
            value
          )}"
          alt="Icon preview"
          style="
            width:64px;
            height:64px;
            object-fit:contain;
            border-radius:12px;
            border:1px solid #e4e9ef;
            background:#fff;
            padding:6px;
            box-sizing:border-box;
          "
        >

        <span
          style="
            font-size:13px;
            color:#64748b;
          "
        >
          Upload хийсэн зураг
        </span>

      </div>

    `;

    return;
  }


  // ---------------------------------
  // EMOJI
  // ---------------------------------

  container.innerHTML = `

    <div
      style="
        margin-top:12px;
        font-size:42px;
        line-height:1;
      "
    >
      ${escapeAdminHtml(
        value
      )}
    </div>

  `;

}


// =====================================================
// UPLOAD ABOUT ICON
// =====================================================

async function uploadAboutIcon(
  file,
  type
) {

  if (!file) return;


  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];


  if (
    !allowedTypes.includes(
      file.type
    )
  ) {

    alert(
      'JPG, PNG эсвэл WEBP зураг сонгоно уу.'
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


  const extension =
    file.name
      .split('.')
      .pop()
      .toLowerCase();


  const fileName =
    `about-icons/${type}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extension}`;


  const {
    error: uploadError
  } =
    await supabaseClient
      .storage
      .from(
        'site-media'
      )
      .upload(
        fileName,
        file
      );


  if (uploadError) {

    console.error(
      uploadError
    );

    alert(
      'Icon upload хийхэд алдаа: ' +
      uploadError.message
    );

    return;
  }


  const {
    data
  } =
    supabaseClient
      .storage
      .from(
        'site-media'
      )
      .getPublicUrl(
        fileName
      );


  const publicUrl =
    data.publicUrl;


  // ---------------------------------
  // MISSION
  // ---------------------------------

  if (
    type === 'mission'
  ) {

    missionIconValue =
      publicUrl;


    const textInput =
      document.getElementById(
        'missionIconText'
      );


    if (textInput) {

      textInput.value =
        '';

    }


    showAboutIconPreview(
      'missionIconPreview',
      missionIconValue
    );

  }


  // ---------------------------------
  // VISION
  // ---------------------------------

  if (
    type === 'vision'
  ) {

    visionIconValue =
      publicUrl;


    const textInput =
      document.getElementById(
        'visionIconText'
      );


    if (textInput) {

      textInput.value =
        '';

    }


    showAboutIconPreview(
      'visionIconPreview',
      visionIconValue
    );

  }


  // ---------------------------------
  // VALUES
  // ---------------------------------

  if (
    type === 'values'
  ) {

    valuesIconValue =
      publicUrl;


    const textInput =
      document.getElementById(
        'valuesIconText'
      );


    if (textInput) {

      textInput.value =
        '';

    }


    showAboutIconPreview(
      'valuesIconPreview',
      valuesIconValue
    );

  }

}


// =====================================================
// SETUP ABOUT ICON UPLOADERS
// =====================================================

function setupAboutIconUploaders() {

  const configs = [

    {
      fileId:
        'missionIconFile',

      textId:
        'missionIconText',

      previewId:
        'missionIconPreview',

      type:
        'mission'
    },


    {
      fileId:
        'visionIconFile',

      textId:
        'visionIconText',

      previewId:
        'visionIconPreview',

      type:
        'vision'
    },


    {
      fileId:
        'valuesIconFile',

      textId:
        'valuesIconText',

      previewId:
        'valuesIconPreview',

      type:
        'values'
    }

  ];


  configs.forEach(
    config => {

      const fileInput =
        document.getElementById(
          config.fileId
        );


      const textInput =
        document.getElementById(
          config.textId
        );


      // -----------------------------
      // IMAGE FILE
      // -----------------------------

      if (fileInput) {

        fileInput.onchange =
        async () => {

          const file =
            fileInput
              .files?.[0];


          if (!file) {
            return;
          }


          await uploadAboutIcon(
            file,
            config.type
          );

        };

      }


      // -----------------------------
      // EMOJI TEXT
      // -----------------------------

      if (textInput) {

        textInput.oninput =
        () => {

          const value =
            textInput
              .value
              .trim();


          if (
            config.type ===
            'mission'
          ) {

            missionIconValue =
              value;

          }


          if (
            config.type ===
            'vision'
          ) {

            visionIconValue =
              value;

          }


          if (
            config.type ===
            'values'
          ) {

            valuesIconValue =
              value;

          }


          showAboutIconPreview(
            config.previewId,
            value
          );

        };

      }

    }
  );

}


// =====================================================
// REMOVE ABOUT ICON
// =====================================================

window.removeAboutIcon =
function(type) {

  if (
    type === 'mission'
  ) {

    missionIconValue =
      '';


    const input =
      document.getElementById(
        'missionIconText'
      );


    if (input) {

      input.value =
        '';

    }


    showAboutIconPreview(
      'missionIconPreview',
      ''
    );

  }


  if (
    type === 'vision'
  ) {

    visionIconValue =
      '';


    const input =
      document.getElementById(
        'visionIconText'
      );


    if (input) {

      input.value =
        '';

    }


    showAboutIconPreview(
      'visionIconPreview',
      ''
    );

  }


  if (
    type === 'values'
  ) {

    valuesIconValue =
      '';


    const input =
      document.getElementById(
        'valuesIconText'
      );


    if (input) {

      input.value =
        '';

    }


    showAboutIconPreview(
      'valuesIconPreview',
      ''
    );

  }

};


// =====================================================
// SAVE ABOUT
// =====================================================

window.saveAboutSettings =
async function() {

  const content =
    document
      .getElementById(
        'aboutContent'
      )
      ?.innerHTML
      .trim()
    || '';


  const missionContent =
    document
      .getElementById(
        'aboutMissionContent'
      )
      ?.innerHTML
      .trim()
    || '';


  const visionContent =
    document
      .getElementById(
        'aboutVisionContent'
      )
      ?.innerHTML
      .trim()
    || '';


  const valuesContent =
    document
      .getElementById(
        'aboutValuesContent'
      )
      ?.innerHTML
      .trim()
    || '';


  const missionIconText =
    document
      .getElementById(
        'missionIconText'
      )
      ?.value
      .trim()
    || '';


  const visionIconText =
    document
      .getElementById(
        'visionIconText'
      )
      ?.value
      .trim()
    || '';


  const valuesIconText =
    document
      .getElementById(
        'valuesIconText'
      )
      ?.value
      .trim()
    || '';


  // Emoji бичсэн байвал emoji-г,
  // зураг upload хийсэн бол URL-г хадгална.

  const missionIcon =
    missionIconText ||
    missionIconValue ||
    null;


  const visionIcon =
    visionIconText ||
    visionIconValue ||
    null;


  const valuesIcon =
    valuesIconText ||
    valuesIconValue ||
    null;


  // ---------------------------------
  // SETTINGS ID
  // ---------------------------------

  if (!aboutSettingsId) {

    const {
      data,
      error
    } =
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

      console.error(
        error
      );


      alert(
        'Settings мэдээлэл олдсонгүй.'
      );


      return;
    }


    aboutSettingsId =
      data[0].id;

  }


  // ---------------------------------
  // SAVE
  // ---------------------------------

  const {
    data,
    error
  } =
    await supabaseClient
      .from('settings')
      .update({

        about_content:
          content ||
          null,

        about_image_url:
          aboutImageUrl ||
          null,

        mission_content:
          missionContent ||
          null,

        mission_icon:
          missionIcon,

        vision_content:
          visionContent ||
          null,

        vision_icon:
          visionIcon,

        values_content:
          valuesContent ||
          null,

        values_icon:
          valuesIcon,

        updated_at:
          new Date()
            .toISOString()

      })
      .eq(
        'id',
        aboutSettingsId
      )
      .select(
        `
          id,
          about_content,
          about_image_url,
          mission_content,
          mission_icon,
          vision_content,
          vision_icon,
          values_content,
          values_icon
        `
      );


  if (error) {

    console.error(
      'About save error:',
      error
    );


    alert(
      'Хадгалахад алдаа: ' +
      error.message
    );


    return;
  }


  if (
    !data ||
    !data.length
  ) {

    alert(
      'Supabase дээр мэдээлэл шинэчлэгдсэнгүй.'
    );


    return;
  }


  // ---------------------------------
  // LOCAL VALUES UPDATE
  // ---------------------------------

  missionIconValue =
    data[0].mission_icon ||
    '';


  visionIconValue =
    data[0].vision_icon ||
    '';


  valuesIconValue =
    data[0].values_icon ||
    '';


  alert(
    'Бидний тухай мэдээлэл хадгалагдлаа.'
  );


  await loadAboutEditor();


  refreshPreviewIfOpen();

};


// =====================================================
// ABOUT MAIN IMAGE UPLOAD
// =====================================================

async function uploadAboutImage(
  file
) {

  if (!file) return;


  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];


  if (
    !allowedTypes.includes(
      file.type
    )
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


  const extension =
    file.name
      .split('.')
      .pop()
      .toLowerCase();


  const fileName =
    `about/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extension}`;


  const {
    error: uploadError
  } =
    await supabaseClient
      .storage
      .from(
        'site-media'
      )
      .upload(
        fileName,
        file
      );


  if (uploadError) {

    console.error(
      uploadError
    );


    alert(
      'Зураг upload хийхэд алдаа: ' +
      uploadError.message
    );


    return;
  }


  const {
    data
  } =
    supabaseClient
      .storage
      .from(
        'site-media'
      )
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


// =====================================================
// SETUP ABOUT MAIN IMAGE
// =====================================================

function setupAboutUploader() {

  const uploadBox =
    document.getElementById(
      'aboutUploadBox'
    );


  const fileInput =
    document.getElementById(
      'aboutImageFile'
    );


  if (
    !uploadBox ||
    !fileInput
  ) {

    return;
  }


  // ---------------------------------
  // CLICK
  // ---------------------------------

  uploadBox.onclick =
  () => {

    fileInput.click();

  };


  // ---------------------------------
  // FILE SELECT
  // ---------------------------------

  fileInput.onchange =
  async () => {

    const file =
      fileInput
        .files?.[0];


    if (file) {

      await uploadAboutImage(
        file
      );

    }

  };


  // ---------------------------------
  // DRAG OVER
  // ---------------------------------

  uploadBox.ondragover =
  event => {

    event.preventDefault();


    uploadBox.style.background =
      '#f1f5f9';

  };


  // ---------------------------------
  // DRAG LEAVE
  // ---------------------------------

  uploadBox.ondragleave =
  () => {

    uploadBox.style.background =
      '#fafcff';

  };


  // ---------------------------------
  // DROP
  // ---------------------------------

  uploadBox.ondrop =
  async event => {

    event.preventDefault();


    uploadBox.style.background =
      '#fafcff';


    const file =
      event
        .dataTransfer
        .files?.[0];


    if (file) {

      await uploadAboutImage(
        file
      );

    }

  };

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


  const {
    data,
    error
  } =
    await supabaseClient
      .from('news')
      .select('*')
      .order(
        'created_at',
        {
          ascending:
            false
        }
      );


  if (error) {

    list.textContent =
      'Алдаа: ' +
      error.message;


    return;
  }


  list.innerHTML =
    '';


  if (
    !data ||
    !data.length
  ) {

    list.innerHTML =
      '<p>Одоогоор мэдээ байхгүй.</p>';


    return;
  }


  data.forEach(
    news => {

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
            || ''
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
          || ''
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
          || ''
        )}</textarea>


        <label>
          Зургийн URL
        </label>

        <input
          id="news-image-${news.id}"
          value="${escapeAdminHtml(
            news.image_url
            || ''
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
            || ''
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
            ${
              news.published
                ? 'checked'
                : ''
            }
          >

          Нийтлэх

        </label>


        <button
          type="button"
          onclick="
            saveNews(
              ${news.id},
              this
            )
          "
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
          type="button"
          onclick="
            deleteNews(
              ${news.id}
            )
          "
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


      list.appendChild(
        item
      );

    }
  );

}


// -----------------------------------------------------
// SIMPLE NEWS CREATE
// -----------------------------------------------------

window.createNews =
async function() {

  const {
    error
  } =
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
          null,

        youtube_url:
          null,

        published:
          false,

        updated_at:
          new Date()
            .toISOString()

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


// -----------------------------------------------------
// SAVE NEWS
// -----------------------------------------------------

window.saveNews =
async function(
  id,
  button
) {

  button.disabled =
    true;


  button.textContent =
    'Хадгалж байна...';


  const {
    error
  } =
    await supabaseClient
      .from('news')
      .update({

        title:
          document
            .getElementById(
              `news-title-${id}`
            )
            ?.value
            .trim()
          || '',


        excerpt:
          document
            .getElementById(
              `news-excerpt-${id}`
            )
            ?.value
            .trim()
          || '',


        content:
          document
            .getElementById(
              `news-content-${id}`
            )
            ?.value
            .trim()
          || '',


        image_url:
          document
            .getElementById(
              `news-image-${id}`
            )
            ?.value
            .trim()
          || null,


        youtube_url:
          document
            .getElementById(
              `news-youtube-${id}`
            )
            ?.value
            .trim()
          || null,


        published:
          document
            .getElementById(
              `news-published-${id}`
            )
            ?.checked
          || false,


        updated_at:
          new Date()
            .toISOString()

      })
      .eq(
        'id',
        id
      );


  if (error) {

    console.error(
      error
    );


    button.disabled =
      false;


    button.textContent =
      'Алдаа';


    return;
  }


  setButtonSaved(
    button
  );


  refreshPreviewIfOpen();

};


// -----------------------------------------------------
// DELETE NEWS
// -----------------------------------------------------

window.deleteNews =
async function(id) {

  if (
    !confirm(
      'Энэ мэдээг устгах уу?'
    )
  ) {

    return;
  }


  const {
    error
  } =
    await supabaseClient
      .from('news')
      .delete()
      .eq(
        'id',
        id
      );


  if (error) {

    alert(
      'Алдаа: ' +
      error.message
    );


    return;
  }


  await loadNewsEditor();


  refreshPreviewIfOpen();

};


// =====================================================
// NEW NEWS IMAGE
// =====================================================

let newNewsImageUrl =
  '';


async function uploadNewsImage(
  file
) {

  if (!file) return;


  const allowed = [

    'image/jpeg',

    'image/png',

    'image/webp'

  ];


  if (
    !allowed.includes(
      file.type
    )
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


  const {
    data
  } =
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

  newNewsImageUrl =
    '';


  setImagePreview(
    'newsImagePreview',
    ''
  );


  const input =
    document.getElementById(
      'newsImageFile'
    );


  if (input) {

    input.value =
      '';
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


  if (
    !box ||
    !input
  ) {

    return;
  }


  box.onclick =
  () => {

    input.click();

  };


  input.onchange =
  () => {

    const file =
      input.files?.[0];


    if (file) {

      uploadNewsImage(
        file
      );
    }

  };


  box.ondragover =
  event => {

    event.preventDefault();


    box.style.background =
      '#f1f5f9';

  };


  box.ondragleave =
  () => {

    box.style.background =
      '';

  };


  box.ondrop =
  event => {

    event.preventDefault();


    box.style.background =
      '';


    const file =
      event
        .dataTransfer
        .files?.[0];


    if (file) {

      uploadNewsImage(
        file
      );
    }

  };

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
      .trim()
    || '';


  const contentEditor =
    document.getElementById(
      'newNewsContent'
    );


  const content =
    contentEditor
      ?.innerHTML
      .trim()
    || '';


  const youtube =
    document
      .getElementById(
        'newNewsYoutube'
      )
      ?.value
      .trim()
    || '';


  const published =
    document
      .getElementById(
        'newNewsPublished'
      )
      ?.checked
    || false;


  if (!title) {

    alert(
      'Гарчиг оруулна уу.'
    );


    return;
  }


  const excerpt =
    stripHtml(
      content
    )
    .slice(
      0,
      180
    );


  const {
    error
  } =
    await supabaseClient
      .from('news')
      .insert({

        title,

        excerpt,

        content,

        image_url:
          newNewsImageUrl
          || null,

        youtube_url:
          youtube
          || null,

        published,

        updated_at:
          new Date()
            .toISOString()

      });


  if (error) {

    alert(
      'Мэдээ хадгалахад алдаа: ' +
      error.message
    );


    return;
  }


  const titleEl =
    document.getElementById(
      'newNewsTitle'
    );


  const contentEl =
    document.getElementById(
      'newNewsContent'
    );


  const youtubeEl =
    document.getElementById(
      'newNewsYoutube'
    );


  const publishedEl =
    document.getElementById(
      'newNewsPublished'
    );


  if (titleEl) {

    titleEl.value =
      '';
  }


  if (contentEl) {

    contentEl.innerHTML =
      '';
  }


  if (youtubeEl) {

    youtubeEl.value =
      '';
  }


  if (publishedEl) {

    publishedEl.checked =
      false;
  }


  newNewsImageUrl =
    '';


  setImagePreview(
    'newsImagePreview',
    ''
  );


  alert(
    'Мэдээ амжилттай хадгалагдлаа.'
  );


  await loadNewsEditor();


  refreshPreviewIfOpen();

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
// LOGO UPLOAD
// =====================================================

let logoImageUrl =
  '';


async function uploadLogoImage(
  file
) {

  if (!file) return;


  const allowed = [

    'image/jpeg',

    'image/png',

    'image/webp'

  ];


  if (
    !allowed.includes(
      file.type
    )
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
      'Logo 5MB-аас бага байх ёстой.'
    );


    return;
  }


  const ext =
    file.name
      .split('.')
      .pop()
      .toLowerCase();


  const fileName =
    `logo/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;


  const {
    error
  } =
    await supabaseClient
      .storage
      .from('site-media')
      .upload(
        fileName,
        file
      );


  if (error) {

    alert(
      'Logo upload хийхэд алдаа: ' +
      error.message
    );


    return;
  }


  const {
    data
  } =
    supabaseClient
      .storage
      .from('site-media')
      .getPublicUrl(
        fileName
      );


  logoImageUrl =
    data.publicUrl;


  showLogoPreview();

}


function showLogoPreview() {

  const preview =
    document.getElementById(
      'logoImagePreview'
    );


  if (!preview) return;


  if (!logoImageUrl) {

    preview.innerHTML =
      '';


    return;
  }


  preview.innerHTML = `

    <div
      style="
        margin-top:14px;
        padding:18px;
        border:1px solid #e4e9ef;
        border-radius:12px;
        background:#fff;
        display:inline-block;
      "
    >

      <img
        src="${escapeAdminHtml(
          logoImageUrl
        )}"
        alt="Logo preview"
        style="
          max-width:220px;
          max-height:90px;
          object-fit:contain;
          display:block;
        "
      >

    </div>

  `;

}


function setupLogoUploader() {

  const box =
    document.getElementById(
      'logoUploadBox'
    );


  const input =
    document.getElementById(
      'logoImageFile'
    );


  if (
    !box ||
    !input
  ) {

    return;
  }


  box.onclick =
  () => {

    input.click();

  };


  input.onchange =
  () => {

    const file =
      input.files?.[0];


    if (file) {

      uploadLogoImage(
        file
      );
    }

  };


  box.ondragover =
  event => {

    event.preventDefault();


    box.style.background =
      '#f1f5f9';

  };


  box.ondragleave =
  () => {

    box.style.background =
      '#fafcff';

  };


  box.ondrop =
  event => {

    event.preventDefault();


    box.style.background =
      '#fafcff';


    const file =
      event
        .dataTransfer
        .files?.[0];


    if (file) {

      uploadLogoImage(
        file
      );
    }

  };

}


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


  const {
    data,
    error
  } =
    await supabaseClient
      .from('settings')
      .select('*')
      .order('id')
      .limit(1);


  if (
    error ||
    !data ||
    !data.length
  ) {

    container.textContent =
      'Тохиргоо ачаалахад алдаа гарлаа.';


    return;
  }


  const s =
    data[0];


  logoImageUrl =
    s.logo_url ||
    '';


  container.innerHTML = `

    <div
      style="${editorCardStyle()}"
    >

      <h3
        style="
          margin-top:0;
          margin-bottom:22px;
        "
      >
        Сайтын үндсэн мэдээлэл
      </h3>


      <label>
        Сайтын нэр
      </label>

      <input
        id="setting-site-name"
        type="text"
        value="${escapeAdminHtml(
          s.site_name
          || ''
        )}"
        placeholder="NEUROSCAN MRI"
        style="${fieldStyle()}"
      >


      <label>
        Сайтын тайлбар
      </label>

      <textarea
        id="setting-site-description"
        rows="4"
        placeholder="Сайтын товч тайлбар"
        style="${fieldStyle()}"
      >${escapeAdminHtml(
        s.site_description
        || ''
      )}</textarea>


      <label>
        Logo
      </label>


      <div
        id="logoUploadBox"
        style="
          width:100%;
          min-height:140px;
          border:2px dashed #cbd5e1;
          border-radius:14px;
          display:flex;
          align-items:center;
          justify-content:center;
          text-align:center;
          cursor:pointer;
          background:#fafcff;
          color:#94a3b8;
          padding:28px;
          margin-bottom:12px;
          box-sizing:border-box;
        "
      >
        Logo зургаа энд дарж эсвэл зөөж оруулна уу
      </div>


      <input
        id="logoImageFile"
        type="file"
        accept="
          image/jpeg,
          image/png,
          image/webp
        "
        style="display:none;"
      >


      <div
        id="logoImagePreview"
      ></div>


      <h3
        style="
          margin-top:28px;
          margin-bottom:12px;
        "
      >
        Theme өнгө
      </h3>


      <p
        style="
          margin-top:0;
          color:#64748b;
          font-size:14px;
        "
      >
        Сайтын үндсэн өнгөний загварыг сонгоно.
      </p>


      <div
        style="
          display:flex;
          gap:12px;
          flex-wrap:wrap;
          margin-bottom:24px;
        "
      >


        <label
          style="
            cursor:pointer;
            display:flex;
            align-items:center;
            gap:8px;
            padding:10px 14px;
            border:1px solid #d8dee6;
            border-radius:10px;
          "
        >

          <input
            type="radio"
            name="themePreset"
            value="blue"
            ${
              s.theme_preset ===
              'blue' ||
              !s.theme_preset
                ? 'checked'
                : ''
            }
          >

          <span
            style="
              width:22px;
              height:22px;
              border-radius:50%;
              background:#2563b8;
              display:inline-block;
            "
          ></span>

          Blue

        </label>


        <label
          style="
            cursor:pointer;
            display:flex;
            align-items:center;
            gap:8px;
            padding:10px 14px;
            border:1px solid #d8dee6;
            border-radius:10px;
          "
        >

          <input
            type="radio"
            name="themePreset"
            value="teal"
            ${
              s.theme_preset ===
              'teal'
                ? 'checked'
                : ''
            }
          >

          <span
            style="
              width:22px;
              height:22px;
              border-radius:50%;
              background:#0f766e;
              display:inline-block;
            "
          ></span>

          Teal

        </label>


        <label
          style="
            cursor:pointer;
            display:flex;
            align-items:center;
            gap:8px;
            padding:10px 14px;
            border:1px solid #d8dee6;
            border-radius:10px;
          "
        >

          <input
            type="radio"
            name="themePreset"
            value="green"
            ${
              s.theme_preset ===
              'green'
                ? 'checked'
                : ''
            }
          >

          <span
            style="
              width:22px;
              height:22px;
              border-radius:50%;
              background:#15803d;
              display:inline-block;
            "
          ></span>

          Green

        </label>


        <label
          style="
            cursor:pointer;
            display:flex;
            align-items:center;
            gap:8px;
            padding:10px 14px;
            border:1px solid #d8dee6;
            border-radius:10px;
          "
        >

          <input
            type="radio"
            name="themePreset"
            value="navy"
            ${
              s.theme_preset ===
              'navy'
                ? 'checked'
                : ''
            }
          >

          <span
            style="
              width:22px;
              height:22px;
              border-radius:50%;
              background:#172554;
              display:inline-block;
            "
          ></span>

          Navy

        </label>

      </div>


      <hr
        style="
          border:0;
          border-top:1px solid #e4e9ef;
          margin:32px 0;
        "
      >


      <h3
        style="
          margin-bottom:22px;
        "
      >
        Холбоо барих мэдээлэл
      </h3>


      <label>
        Email
      </label>

      <input
        id="setting-email"
        type="email"
        value="${escapeAdminHtml(
          s.email
          || ''
        )}"
        placeholder="example@email.com"
        style="${fieldStyle()}"
      >


      <label>
        Ерөнхий утас
      </label>

      <input
        id="setting-general-phone"
        type="text"
        value="${escapeAdminHtml(
          s.general_phone
          || ''
        )}"
        placeholder="(+976) 7700-0011"
        style="${fieldStyle()}"
      >


      <label>
        Утас 1
      </label>

      <input
        id="setting-phone1"
        type="text"
        value="${escapeAdminHtml(
          s.phone_1
          || ''
        )}"
        placeholder="8888-2328"
        style="${fieldStyle()}"
      >


      <label>
        Утас 2
      </label>

      <input
        id="setting-phone2"
        type="text"
        value="${escapeAdminHtml(
          s.phone_2
          || ''
        )}"
        placeholder="8503-8105"
        style="${fieldStyle()}"
      >


      <label>
        Хаяг
      </label>

      <textarea
        id="setting-address"
        rows="3"
        placeholder="Төвийн хаяг"
        style="${fieldStyle()}"
      >${escapeAdminHtml(
        s.address
        || ''
      )}</textarea>


      <label>
        Google Maps линк
      </label>

      <input
        id="setting-maps"
        type="url"
        value="${escapeAdminHtml(
          s.maps_url
          || ''
        )}"
        placeholder="https://maps.google.com/..."
        style="${fieldStyle()}"
      >


      <label>
        Chat линк
      </label>

      <input
        id="setting-chat"
        type="url"
        value="${escapeAdminHtml(
          s.chat_url
          || ''
        )}"
        placeholder="https://m.me/... эсвэл chat линк"
        style="${fieldStyle()}"
      >


      <hr
        style="
          border:0;
          border-top:1px solid #e4e9ef;
          margin:32px 0;
        "
      >


      <h3
        style="
          margin-bottom:22px;
        "
      >
        Social хаягууд
      </h3>


      <label>
        Facebook
      </label>

      <input
        id="setting-facebook"
        type="url"
        value="${escapeAdminHtml(
          s.facebook_url
          || ''
        )}"
        placeholder="https://facebook.com/..."
        style="${fieldStyle()}"
      >


      <label>
        Instagram
      </label>

      <input
        id="setting-instagram"
        type="url"
        value="${escapeAdminHtml(
          s.instagram_url
          || ''
        )}"
        placeholder="https://instagram.com/..."
        style="${fieldStyle()}"
      >


      <label>
        YouTube
      </label>

      <input
        id="setting-youtube"
        type="url"
        value="${escapeAdminHtml(
          s.youtube_url
          || ''
        )}"
        placeholder="https://youtube.com/..."
        style="${fieldStyle()}"
      >


      <hr
        style="
          border:0;
          border-top:1px solid #e4e9ef;
          margin:32px 0;
        "
      >


      <h3
        style="
          margin-bottom:22px;
        "
      >
        Бусад тохиргоо
      </h3>


      <label>
        MRI төхөөрөмж
      </label>

      <input
        id="setting-machine"
        type="text"
        value="${escapeAdminHtml(
          s.machine_info
          || ''
        )}"
        placeholder="ANKE SuperMark 1.5T MRI"
        style="${fieldStyle()}"
      >


      <label>
        Цаг захиалгын Google Form URL
      </label>

      <input
        id="setting-booking"
        type="url"
        value="${escapeAdminHtml(
          s.booking_url
          || ''
        )}"
        placeholder="https://..."
        style="${fieldStyle()}"
      >


      <button
        type="button"
        onclick="
          saveSettings(
            ${s.id},
            this
          )
        "
        style="
          padding:12px 20px;
          background:#17212b;
          color:#fff;
          border:0;
          border-radius:8px;
          cursor:pointer;
          font-weight:700;
          font-size:15px;
        "
      >
        Хадгалах
      </button>

    </div>

  `;


  setupLogoUploader();


  showLogoPreview();

}


// =====================================================
// SAVE SETTINGS
// =====================================================

window.saveSettings =
async function(
  id,
  button
) {

  button.disabled =
    true;


  button.textContent =
    'Хадгалж байна...';


  const siteName =
    document
      .getElementById(
        'setting-site-name'
      )
      ?.value
      .trim()
    || '';


  const siteDescription =
    document
      .getElementById(
        'setting-site-description'
      )
      ?.value
      .trim()
    || '';


  const email =
    document
      .getElementById(
        'setting-email'
      )
      ?.value
      .trim()
    || '';


  const generalPhone =
    document
      .getElementById(
        'setting-general-phone'
      )
      ?.value
      .trim()
    || '';


  const phone1 =
    document
      .getElementById(
        'setting-phone1'
      )
      ?.value
      .trim()
    || '';


  const phone2 =
    document
      .getElementById(
        'setting-phone2'
      )
      ?.value
      .trim()
    || '';


  const address =
    document
      .getElementById(
        'setting-address'
      )
      ?.value
      .trim()
    || '';


  const mapsUrl =
    document
      .getElementById(
        'setting-maps'
      )
      ?.value
      .trim()
    || '';


  const chatUrl =
    document
      .getElementById(
        'setting-chat'
      )
      ?.value
      .trim()
    || '';


  const facebookUrl =
    document
      .getElementById(
        'setting-facebook'
      )
      ?.value
      .trim()
    || '';


  const instagramUrl =
    document
      .getElementById(
        'setting-instagram'
      )
      ?.value
      .trim()
    || '';


  const youtubeUrl =
    document
      .getElementById(
        'setting-youtube'
      )
      ?.value
      .trim()
    || '';


  const machineInfo =
    document
      .getElementById(
        'setting-machine'
      )
      ?.value
      .trim()
    || '';


  const bookingUrl =
    document
      .getElementById(
        'setting-booking'
      )
      ?.value
      .trim()
    || '';


  const themePreset =
    document
      .querySelector(
        'input[name="themePreset"]:checked'
      )
      ?.value
    || 'blue';


  const {
    error
  } =
    await supabaseClient
      .from('settings')
      .update({

        site_name:
          siteName ||
          null,


        site_description:
          siteDescription ||
          null,


        logo_url:
          logoImageUrl ||
          null,


        theme_preset:
          themePreset,


        email:
          email ||
          null,


        general_phone:
          generalPhone ||
          null,


        phone_1:
          phone1 ||
          null,


        phone_2:
          phone2 ||
          null,


        address:
          address ||
          null,


        maps_url:
          mapsUrl ||
          null,


        chat_url:
          chatUrl ||
          null,


        facebook_url:
          facebookUrl ||
          null,


        instagram_url:
          instagramUrl ||
          null,


        youtube_url:
          youtubeUrl ||
          null,


        machine_info:
          machineInfo ||
          null,


        booking_url:
          bookingUrl ||
          null,


        updated_at:
          new Date()
            .toISOString()

      })
      .eq(
        'id',
        id
      );


  if (error) {

    console.error(
      'Settings save error:',
      error
    );


    button.disabled =
      false;


    button.textContent =
      'Алдаа';


    alert(
      'Тохиргоо хадгалахад алдаа: ' +
      error.message
    );


    return;
  }


  setButtonSaved(
    button
  );


  refreshPreviewIfOpen();

};


// =====================================================
// LIVE SITE PREVIEW
// =====================================================

window.toggleLivePreview =
function() {

  const panel =
    document.getElementById(
      'livePreviewPanel'
    );


  const button =
    document.getElementById(
      'previewToggleButton'
    );


  if (!panel) return;


  const isOpen =
    panel.style.display ===
    'block';


  /*
    Нээлттэй байвал хаана.
  */

  if (isOpen) {

    panel.style.display =
      'none';


    if (button) {

      button.textContent =
        '🌐 Live site preview';
    }


    return;
  }


  /*
    Хаалттай байвал нээнэ.
  */

  panel.style.display =
    'block';


  if (button) {

    button.textContent =
      '✕ Preview хаах';
  }


  refreshLivePreview();

};


// -----------------------------------------------------
// REFRESH PREVIEW
// -----------------------------------------------------

window.refreshLivePreview =
function() {

  const frame =
    document.getElementById(
      'livePreviewFrame'
    );


  if (!frame) return;


  const url =
    new URL(
      'index.html',
      window.location.href
    );


  /*
    Cache bypass
  */

  url.searchParams.set(
    'preview',
    Date.now()
  );


  frame.src =
    url.toString();

};


// -----------------------------------------------------
// AUTO REFRESH IF OPEN
// -----------------------------------------------------

function refreshPreviewIfOpen() {

  const panel =
    document.getElementById(
      'livePreviewPanel'
    );


  if (
    panel &&
    panel.style.display ===
    'block'
  ) {

    refreshLivePreview();

  }

}


// =====================================================
// START
// =====================================================

document.addEventListener(
  'DOMContentLoaded',
  () => {

    /*
      News upload
    */

    setupNewsUploader();


    /*
      About image upload
    */

    setupAboutUploader();

  }
);


/*
  Admin authentication
*/

checkAdminAccess();
