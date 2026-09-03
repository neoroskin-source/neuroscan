(async function () {
  const SUPABASE_URL = 'https://fqhqmbtexxeblbnxfvzn.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_o4_UwkZbcd2tM6hVyoMRyQ_yza9Ffzs';

  async function ensureSupabase() {
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

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function tel(value) {
    return String(value ?? '')
      .replace(/[^\d+]/g, '');
  }

  try {
    await ensureSupabase();

    const client = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );


    // ====================================
    // SETTINGS
    // ====================================

    const {
      data: settingsRows,
      error: settingsError
    } = await client
      .from('settings')
      .select('*')
      .order('id')
      .limit(1);

    if (!settingsError && settingsRows?.length) {
      const s = settingsRows[0];


      // -------------------------------
      // BOOKING LINKS
      // -------------------------------

      if (s.booking_url) {
        document
          .querySelectorAll('[data-booking-link]')
          .forEach(link => {
            link.href = s.booking_url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
          });
      }


      // -------------------------------
      // CONTACT PAGE
      // -------------------------------

      const contactList =
        document.querySelector('.contact-list');

      if (contactList) {
        contactList.innerHTML = `
          <div class="contact-item">
            <b>Үндсэн утас</b>

            <a href="tel:${tel(s.phone_1)}">
              ${esc(s.phone_1)}
            </a>

            <span>|</span>

            <a href="tel:${tel(s.phone_2)}">
              ${esc(s.phone_2)}
            </a>
          </div>

          <div class="contact-item">
            <b>Ерөнхий</b>

            <a href="tel:${tel(s.general_phone)}">
              ${esc(s.general_phone)}
            </a>
          </div>

          <div class="contact-item">
            <b>Имэйл</b>

            <a href="mailto:${esc(s.email)}">
              ${esc(s.email)}
            </a>
          </div>

          <div class="contact-item">
            <b>Хаяг</b>
            <span>${esc(s.address)}</span>
          </div>

          <div class="contact-item">
            <b>Яаралтай тусламж</b>
            <span>${esc(s.emergency_text)}</span>
          </div>
        `;
      }

      const machineBadge =
        document.querySelector('.contact-panel .badge');

      if (machineBadge && s.machine_info) {
        machineBadge.textContent =
          s.machine_info;
      }

      const mapAddress =
        document.querySelector(
          '.map-placeholder strong'
        );

      if (mapAddress && s.address) {
        mapAddress.textContent = s.address;
      }


      // -------------------------------
      // APPOINTMENT PAGE
      // -------------------------------

      const bookingDetail =
        document.querySelector('.booking-detail');

      if (bookingDetail) {
        bookingDetail.innerHTML = `
          <div>
            <b>Утас</b>
            <span>
              ${esc(s.phone_1)} | ${esc(s.phone_2)}
            </span>
          </div>

          <div>
            <b>Хаяг</b>
            <span>${esc(s.address)}</span>
          </div>

          <div>
            <b>MRI</b>
            <span>${esc(s.machine_info)}</span>
          </div>
        `;
      }

      const bookingButton =
        document.querySelector(
          '.booking-box .primary-btn'
        );

      if (bookingButton && s.booking_url) {
        bookingButton.href = s.booking_url;
        bookingButton.target = '_blank';
        bookingButton.rel = 'noopener noreferrer';
        bookingButton.textContent =
          'Google Form нээх →';
      }


      // -------------------------------
      // FOOTER CONTACT
      // -------------------------------

      const footerCols =
        document.querySelectorAll('.footer-col');

      footerCols.forEach(col => {
        const title = col.querySelector('h4');

        if (
          title &&
          title.textContent.trim() ===
            'Холбоо барих'
        ) {
          col.innerHTML = `
            <h4>Холбоо барих</h4>

            <a href="tel:${tel(s.phone_1)}">
              ${esc(s.phone_1)}
            </a>

            <a href="tel:${tel(s.phone_2)}">
              ${esc(s.phone_2)}
            </a>

            <span>${esc(s.address)}</span>
            <span>${esc(s.machine_info)}</span>
          `;
        }
      });

      const footerContact =
        document.querySelector(
          '.footer-contact .container'
        );

      if (footerContact) {
        footerContact.innerHTML = `
          <a href="mailto:${esc(s.email)}">
            ✉ ${esc(s.email)}
          </a>

          <a href="tel:${tel(s.general_phone)}">
            ☎ Ерөнхий: ${esc(s.general_phone)}
          </a>

          <span>
            🚑 Яаралтай тусламж:
            ${esc(s.emergency_text)}
          </span>
        `;
      }
    }


    // ====================================
    // NEWS
    // ====================================

    const newsGrid =
      document.querySelector(
        'main .news-grid'
      );

    if (newsGrid) {
      const {
        data: news,
        error: newsError
      } = await client
        .from('news')
        .select('*')
        .eq('published', true)
        .order(
          'created_at',
          { ascending: false }
        );

      if (!newsError) {
        if (!news?.length) {
          newsGrid.innerHTML = `
            <p>
              Одоогоор нийтлэгдсэн мэдээ байхгүй.
            </p>
          `;
        } else {
          newsGrid.innerHTML =
            news.map(item => {
              const date =
                item.created_at
                  ? new Date(
                      item.created_at
                    ).toLocaleDateString(
                      'mn-MN'
                    )
                  : '';

              const image =
                item.image_url
                  ? `
                    <img
                      src="${esc(item.image_url)}"
                      alt="${esc(item.title)}"
                      style="
                        width:100%;
                        height:100%;
                        object-fit:cover;
                      "
                    >
                  `
                  : 'MRI';

              const details =
                item.content
                  ? `
                    <details
                      style="margin-top:14px;"
                    >
                      <summary
                        class="text-link"
                        style="cursor:pointer;"
                      >
                        Дэлгэрэнгүй →
                      </summary>

                      <p
                        style="
                          margin-top:12px;
                          white-space:pre-line;
                        "
                      >
                        ${esc(item.content)}
                      </p>
                    </details>
                  `
                  : '';

              return `
                <article class="news-card">

                  <div class="news-thumb">
                    ${image}
                  </div>

                  <div class="news-body">

                    <div class="news-meta">
                      ${esc(date)}
                    </div>

                    <h3>
                      ${esc(item.title)}
                    </h3>

                    <p>
                      ${esc(item.excerpt)}
                    </p>

                    ${details}

                  </div>

                </article>
              `;
            }).join('');
        }
      }
    }

  } catch (error) {
    console.error(
      'Public data error:',
      error
    );
  }
})();
