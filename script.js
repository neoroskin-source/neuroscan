const SUPABASE_URL = 'https://fqhqmbtexxeblbnxfvzn.supabase.co/rest/v1/';

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_o4_UwkZbcd2tM6hVyoMRyQ_yza9Ffzs';

const supabaseClient = window.supabase
  ? window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    )
  : null;

const BOOKING_URL = 'appointment.html';
document.querySelectorAll('[data-booking-link]').forEach(a => a.href = BOOKING_URL);

const menuBtn = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');
menuBtn?.addEventListener('click', () => mobileNav?.classList.toggle('open'));

document.querySelectorAll('[data-mobile-target]').forEach(btn => {
  btn.addEventListener('click', () => document.getElementById(btn.dataset.mobileTarget)?.classList.toggle('open'));
});

document.querySelectorAll('.drop-toggle').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    const item = btn.closest('.nav-item');
    document.querySelectorAll('.nav-item.open').forEach(x => { if (x !== item) x.classList.remove('open'); });
    item?.classList.toggle('open');
  });
});
document.addEventListener('click', () => document.querySelectorAll('.nav-item.open').forEach(x => x.classList.remove('open')));

// Services page: left sidebar -> nested contrast option -> right-side detail/price panel.
(() => {
  const explorer = document.getElementById('serviceExplorer');
  if (!explorer) return;

  const serviceData = {
    head: {
      title: 'Толгой MRI',
      plain: {
        badge: 'Тодосгогчгүй',
        description: 'Толгой, тархины бүтцийг MRI технологиор олон хавтгайд өндөр нарийвчлалтай дүрслэн үнэлэх шинжилгээ. Шинжилгээний протоколыг эмчийн заалт, тухайн хүний зовиур болон өмнөх шинжилгээний мэдээлэлд тулгуурлан сонгоно.',
        about: 'Тархины анатомийн бүтэц болон зөөлөн эдийн өөрчлөлтийг үнэлэхэд ашиглагдана.',
        contrast: 'Энэ сонголтод тодосгогч бодис хэрэглэхгүй.',
        price: 'Үнэ оруулна'
      },
      contrast: {
        badge: 'Тодосгогчтой',
        description: 'Толгой, тархины MRI шинжилгээнд эмчийн заалтаар тодосгогч бодис хэрэглэн тодорхой бүтэц болон өөрчлөлтийг илүү дэлгэрэнгүй үнэлэх хувилбар.',
        about: 'Тодорхой эмгэг өөрчлөлтийн шинж чанар, тархалт болон ялган оношилгоонд нэмэлт мэдээлэл шаардлагатай үед сонгож болно.',
        contrast: 'Тодосгогч бодисыг зөвхөн эмчийн заалт, аюулгүй байдлын үнэлгээний дараа хэрэглэнэ.',
        price: 'Үнэ оруулна'
      }
    },
    spine: {
      title: 'Нуруу MRI',
      plain: {
        badge: 'Тодосгогчгүй',
        description: 'Нурууны нугалам, диск, нугас болон орчмын зөөлөн эдийн бүтцийг MRI-аар үнэлэх шинжилгээ.',
        about: 'Нурууны өвдөлт, диск болон нугасны бүтцийн өөрчлөлтийг дүрслэн үнэлэхэд ашиглагдана.',
        contrast: 'Энэ сонголтод тодосгогч бодис хэрэглэхгүй.',
        price: 'Үнэ оруулна'
      },
      contrast: {
        badge: 'Тодосгогчтой',
        description: 'Нурууны MRI шинжилгээнд эмчийн заалтаар тодосгогч бодис хэрэглэн зөөлөн эд болон тодорхой эмгэг өөрчлөлтийг нэмэлтээр үнэлэх хувилбар.',
        about: 'Мэс заслын дараах өөрчлөлт, үрэвсэл эсвэл бусад тодорхой заалтын үед эмч нэмэлт тодосгогч шинжилгээ сонгож болно.',
        contrast: 'Тодосгогч бодисын хэрэглээг эмч тус бүрийн заалт, эрсдэлийн үнэлгээнд үндэслэн шийднэ.',
        price: 'Үнэ оруулна'
      }
    },
    liver: {
      title: 'Элэг цөс MRI',
      plain: {
        badge: 'Тодосгогчгүй',
        description: 'Элэг, цөсний зам болон орчмын бүтцийг MRI протоколоор дүрслэн үнэлэх шинжилгээ.',
        about: 'Элэг, цөсний бүтэц болон цөсний замын өөрчлөлтийг үнэлэхэд зориулагдсан MRI шинжилгээ.',
        contrast: 'Энэ сонголтод тодосгогч бодис хэрэглэхгүй.',
        price: 'Үнэ оруулна'
      },
      contrast: {
        badge: 'Тодосгогчтой',
        description: 'Элэг, цөсний MRI шинжилгээнд эмчийн заалтаар тодосгогч бодис хэрэглэн өөрчлөлтийн шинж чанарыг илүү дэлгэрэнгүй үнэлэх хувилбар.',
        about: 'Тодорхой голомт, бүтэц болон эмгэг өөрчлөлтийн шинж чанарыг ялган үнэлэхэд нэмэлт мэдээлэл өгөх боломжтой.',
        contrast: 'Тодосгогч бодис хэрэглэх эсэхийг эмч заалт болон аюулгүй байдлын үнэлгээгээр шийднэ.',
        price: 'Үнэ оруулна'
      }
    },
    abdomen: {
      title: 'Хэвлий MRI',
      plain: {
        badge: 'Тодосгогчгүй',
        description: 'Хэвлийн хөндийн эрхтэн болон зөөлөн эдийг MRI технологиор олон хавтгайд дүрслэн үнэлэх шинжилгээ.',
        about: 'Хэвлийн эрхтнүүдийн анатомийн бүтэц, зөөлөн эдийн ялгарал болон өөрчлөлтийг үнэлнэ.',
        contrast: 'Энэ сонголтод тодосгогч бодис хэрэглэхгүй.',
        price: 'Үнэ оруулна'
      },
      contrast: {
        badge: 'Тодосгогчтой',
        description: 'Хэвлийн MRI шинжилгээнд эмчийн заалтаар тодосгогч бодис ашиглан тодорхой эрхтэн, өөрчлөлтийн шинж чанарыг нэмэлтээр үнэлэх хувилбар.',
        about: 'Зарим өөрчлөлтийн бүтэц, тархалт болон ялган оношилгоонд илүү дэлгэрэнгүй мэдээлэл шаардлагатай үед хэрэглэж болно.',
        contrast: 'Тодосгогч бодисыг заалттай тохиолдолд аюулгүй байдлын үнэлгээний дараа хэрэглэнэ.',
        price: 'Үнэ оруулна'
      }
    },
    pelvis: {
      title: 'Бага аарцгийн MRI',
      plain: {
        badge: 'Тодосгогчгүй',
        description: 'Бага аарцгийн эрхтэн, зөөлөн эд болон орчмын бүтцийг MRI-аар нарийвчлан дүрслэх шинжилгээ.',
        about: 'Бага аарцгийн анатомийн бүтэц болон зөөлөн эдийн өөрчлөлтийг олон хавтгайд үнэлэх боломжтой.',
        contrast: 'Энэ сонголтод тодосгогч бодис хэрэглэхгүй.',
        price: 'Үнэ оруулна'
      },
      contrast: {
        badge: 'Тодосгогчтой',
        description: 'Бага аарцгийн MRI-д эмчийн заалтаар тодосгогч бодис хэрэглэн тодорхой бүтэц, өөрчлөлтийг нэмэлтээр үнэлэх хувилбар.',
        about: 'Тодорхой эмгэг өөрчлөлтийн ялган оношилгоо, хүрээ болон шинж чанарыг үнэлэхэд нэмэлт мэдээлэл өгч болно.',
        contrast: 'Тодосгогч бодис хэрэглэх эсэхийг эмч клиникийн заалт, аюулгүй байдлын үнэлгээнд үндэслэн шийднэ.',
        price: 'Үнэ оруулна'
      }
    },
    knee: {
      title: 'Өвдөгний MRI',
      plain: {
        badge: 'Тодосгогчгүй',
        description: 'Өвдөгний үе, мөгөөрс, холбоос, мениск болон орчмын зөөлөн эдийг MRI технологиор дүрслэн үнэлэх шинжилгээ.',
        about: 'Үе, холбоос, мениск болон зөөлөн эдийн бүтцийн өөрчлөлтийг үнэлэхэд өргөн ашиглагдана.',
        contrast: 'Энэ сонголтод тодосгогч бодис хэрэглэхгүй.',
        price: 'Үнэ оруулна'
      },
      contrast: {
        badge: 'Тодосгогчтой',
        description: 'Өвдөгний MRI шинжилгээнд тодорхой эмчийн заалтаар тодосгогч бодис хэрэглэн үе болон зөөлөн эдийн өөрчлөлтийг нэмэлтээр үнэлэх хувилбар.',
        about: 'Зарим үрэвсэл, мэс заслын дараах өөрчлөлт эсвэл бусад тусгай заалтын үед нэмэлт мэдээлэл авах зорилгоор сонгож болно.',
        contrast: 'Тодосгогч бодис хэрэглэх эсэхийг эмч тухайн хүний заалт, эрсдэлийн үнэлгээнд үндэслэн шийднэ.',
        price: 'Үнэ оруулна'
      }
    }
  };
async function loadServicesFromSupabase() {
  if (!supabaseClient) return;

  const { data, error } = await supabaseClient
    .from('services')
    .select(`
      slug,
      name,
      without_contrast_description,
      without_contrast_about,
      without_contrast_note,
      without_contrast_price,
      with_contrast_description,
      with_contrast_about,
      with_contrast_note,
      with_contrast_price
    `)
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    console.error('Supabase services error:', error);
    return;
  }

  data.forEach(row => {
    const key = row.slug.replace('-mri', '');

    if (!serviceData[key]) return;

    serviceData[key].title =
      row.name || serviceData[key].title;

    serviceData[key].plain.description =
      row.without_contrast_description ||
      serviceData[key].plain.description;

    serviceData[key].plain.about =
      row.without_contrast_about ||
      serviceData[key].plain.about;

    serviceData[key].plain.contrast =
      row.without_contrast_note ||
      serviceData[key].plain.contrast;

    if (row.without_contrast_price !== null) {
      serviceData[key].plain.price =
        Number(row.without_contrast_price).toLocaleString('mn-MN') + ' ₮';
    }

    serviceData[key].contrast.description =
      row.with_contrast_description ||
      serviceData[key].contrast.description;

    serviceData[key].contrast.about =
      row.with_contrast_about ||
      serviceData[key].contrast.about;

    serviceData[key].contrast.contrast =
      row.with_contrast_note ||
      serviceData[key].contrast.contrast;

    if (row.with_contrast_price !== null) {
      serviceData[key].contrast.price =
        Number(row.with_contrast_price).toLocaleString('mn-MN') + ' ₮';
    }
  });
}
  const els = {
    title: document.getElementById('serviceDetailTitle'),
    label: document.getElementById('serviceDetailLabel'),
    description: document.getElementById('serviceDetailDescription'),
    badge: document.getElementById('serviceDetailBadge'),
    about: document.getElementById('serviceDetailAbout'),
    contrast: document.getElementById('serviceDetailContrast'),
    price: document.getElementById('serviceDetailPrice'),
    priceNote: document.getElementById('servicePriceNote')
  };

  function render(serviceKey, variantKey, shouldScroll = false) {
    const service = serviceData[serviceKey];
    const variant = service?.[variantKey];
    if (!service || !variant) return;

    document.querySelectorAll('.service-nav-main').forEach(x => x.classList.toggle('active', x.dataset.serviceToggle === serviceKey));
    document.querySelectorAll('.service-nav-item').forEach(item => {
      const isOpen = item.dataset.service === serviceKey;
      item.classList.toggle('open', isOpen);
      item.querySelector('.service-variants')?.classList.toggle('open', isOpen);
      item.querySelector('.service-nav-main')?.setAttribute('aria-expanded', String(isOpen));
    });
    document.querySelectorAll('.service-variant').forEach(x => x.classList.toggle('active', x.dataset.service === serviceKey && x.dataset.variant === variantKey));

    els.title.textContent = service.title;
    els.label.textContent = `MRI ҮЙЛЧИЛГЭЭ · ${variant.badge.toUpperCase()}`;
    els.description.textContent = variant.description;
    els.badge.textContent = variant.badge;
    els.about.textContent = variant.about;
    els.contrast.textContent = variant.contrast;
    els.price.textContent = variant.price;
    els.priceNote.textContent = `${variant.badge} ${service.title}`;

    history.replaceState(null, '', `#${serviceKey === 'head' ? 'head-mri' : serviceKey + '-mri'}`);
    if (shouldScroll && window.innerWidth < 821) document.querySelector('.service-detail-panel')?.scrollIntoView({behavior:'smooth', block:'start'});
  }

  document.querySelectorAll('[data-service-toggle]').forEach(btn => {
    btn.addEventListener('click', () => render(btn.dataset.serviceToggle, 'plain', true));
  });
  document.querySelectorAll('.service-variant').forEach(btn => {
    btn.addEventListener('click', () => render(btn.dataset.service, btn.dataset.variant, true));
  });

  const hashMap = {
    '#head-mri': 'head', '#spine-mri': 'spine', '#liver-mri': 'liver',
    '#abdomen-mri': 'abdomen', '#pelvis-mri': 'pelvis', '#knee-mri': 'knee'
  };
  const initial = hashMap[window.location.hash] || 'head';
  loadServicesFromSupabase().then(() => {
  render(initial, 'plain', false);
});
})();
// Load public Supabase data
if (!document.querySelector('script[src*="public-data.js"]')) {
  const publicDataScript = document.createElement('script');
  publicDataScript.src = 'public-data.js?v=533';
  document.body.appendChild(publicDataScript);
}
