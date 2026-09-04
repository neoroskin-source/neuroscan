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

  function sanitizeRichHtml(html) {
    const template =
      document.createElement('template');

    template.innerHTML =
      String(html ?? '');

    const allowedTags = new Set([
      'P',
      'BR',
      'STRONG',
      'B',
      'EM',
      'I',
      'U',
      'S',
      'H2',
      'H3',
      'UL',
      'OL',
      'LI',
      'A',
      'BLOCKQUOTE'
    ]);

    const nodes = [
      ...template.content.querySelectorAll('*')
    ];

    nodes.forEach(node => {
      if (!allowedTags.has(node.tagName)) {
        node.replaceWith(
          ...node.childNodes
        );

        return;
      }

      [...node.attributes].forEach(attr => {
        const name =
          attr.name.toLowerCase();

        if (
          node.tagName === 'A' &&
          name === 'href'
        ) {
          try {
            const url =
              new URL(
                attr.value,
                window.location.href
              );

            if (
              ![
                'http:',
                'https:',
                'mailto:',
                'tel:'
              ].includes(url.protocol)
            ) {
              node.removeAttribute(
                attr.name
              );
            }
          } catch {
            node.removeAttribute(
              attr.name
            );
          }

          return;
        }

        if (
          node.tagName === 'A' &&
          (
            name === 'target' ||
            name === 'rel'
          )
        ) {
          return;
        }

        node.removeAttribute(
          attr.name
        );
      });

      if (
        node.tagName === 'A' &&
        node.getAttribute('href')
      ) {
        node.setAttribute(
          'target',
          '_blank'
        );

        node.setAttribute(
          'rel',
          'noopener noreferrer'
        );
      }
    });

    return template.innerHTML;
  }

  function getYoutubeEmbed(
    urlValue
  ) {
    if (!urlValue) return '';

    try {
      const url =
        new URL(urlValue);

      let videoId = '';

      if (
        url.hostname === 'youtu.be' ||
        url.hostname.endsWith(
          '.youtu.be'
        )
      ) {
        videoId =
          url.pathname
            .split('/')
            .filter(Boolean)[0] || '';

      } else if (
        url.hostname === 'youtube.com' ||
        url.hostname ===
          'www.youtube.com' ||
        url.hostname.endsWith(
          '.youtube.com'
        )
      ) {
        videoId =
          url.searchParams.get('v') || '';

        if (
          !videoId &&
          url.pathname.includes(
            '/embed/'
          )
        ) {
          videoId =
            url.pathname
              .split('/embed/')[1]
              ?.split('/')[0] || '';
        }

        if (
          !videoId &&
          url.pathname.includes(
            '/shorts/'
          )
        ) {
          videoId =
            url.pathname
              .split('/shorts/')[1]
              ?.split('/')[0] || '';
        }
      }

      videoId =
        videoId
          .split('?')[0]
          .split('&')[0]
          .trim();

      if (
        !/^[A-Za-z0-9_-]{6,20}$/
          .test(videoId)
      ) {
        return '';
      }

      return `
        <div
          style="
            position:relative;
            width:100%;
            padding-top:56.25%;
            margin-top:18px;
            border-radius:14px;
            overflow:hidden;
          "
        >

          <iframe
            src="https://www.youtube.com/embed/${videoId}"
            title="YouTube video"
            allow="
              accelerometer;
              autoplay;
              clipboard-write;
              encrypted-media;
              gyroscope;
              picture-in-picture;
              web-share
            "
            allowfullscreen
            style="
              position:absolute;
              inset:0;
              width:100%;
              height:100%;
              border:0;
            "
          ></iframe>

        </div>
      `;

    } catch {
      return '';
    }
  }

  try {
    await ensureSupabase();

    const client =
      window.supabase.createClient(
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

    if (
      !settingsError &&
      settingsRows?.length
    ) {
      const s =
        settingsRows[0];


      // ===================================
      // ABOUT PAGE
      // ===================================

      const aboutContent =
        document.getElementById(
          'publicAboutContent'
        );

      const aboutImage =
        document.getElementById(
          'publicAboutImage'
        );

      if (aboutContent) {
        if (s.about_content) {
          aboutContent.innerHTML =
            sanitizeRichHtml(
              s.about_content
            );
        } else {
          aboutContent.innerHTML = '';
        }
      }

      if (aboutImage) {
        if (s.about_image_url) {

          aboutImage.src =
            s.about_image_url;

          aboutImage.style.display =
            'block';

        } else {
          aboutImage.removeAttribute(
            'src'
          );

          aboutImage.style.display =
            'none';
        }
      }


      // ===================================
      // BOOKING LINKS
      // ===================================

      if (s.booking_url) {
        document
          .querySelectorAll(
            '[data-booking-link]'
          )
          .forEach(link => {
            link.href =
              s.booking_url;

            link.target =
              '_blank';

            link.rel =
              'noopener noreferrer';
          });
      }


      // ===================================
      // CONTACT PAGE
      // ===================================

      const contactList =
        document.querySelector(
          '.contact-list'
        );

      if (contactList) {
        contactList.innerHTML = `

          <div class="contact-item">

            <b>
              Үндсэн утас
            </b>

            <a
              href="tel:${tel(s.phone_1)}"
            >
              ${esc(s.phone_1)}
            </a>

            <span>|</span>

            <a
              href="tel:${tel(s.phone_2)}"
            >
              ${esc(s.phone_2)}
            </a>

          </div>


          <div class="contact-item">

            <b>
              Ерөнхий
            </b>

            <a
              href="tel:${tel(
                s.general_phone
              )}"
            >
              ${esc(
                s.general_phone
              )}
            </a>

          </div>


          <div class="contact-item">

            <b>
              Имэйл
            </b>

            <a
              href="mailto:${esc(
                s.email
              )}"
            >
              ${esc(s.email)}
            </a>

          </div>


          <div class="contact-item">

            <b>
              Хаяг
            </b>

            <span>
              ${esc(s.address)}
            </span>

          </div>
        `;
      }


      const machineBadge =
        document.querySelector(
          '.contact-panel .badge'
        );

      if (
        machineBadge &&
        s.machine_info
      ) {
        machineBadge.textContent =
          s.machine_info;
      }


      const mapAddress =
        document.querySelector(
          '.map-placeholder strong'
        );

      if (
        mapAddress &&
        s.address
      ) {
        mapAddress.textContent =
          s.address;
      }


      // ===================================
      // APPOINTMENT PAGE
      // ===================================

      const bookingDetail =
        document.querySelector(
          '.booking-detail'
        );

      if (bookingDetail) {
        bookingDetail.innerHTML = `

          <div>

            <b>
              Утас
            </b>

            <span>
              ${esc(s.phone_1)}
              |
              ${esc(s.phone_2)}
            </span>

          </div>


          <div>

            <b>
              Хаяг
            </b>

            <span>
              ${esc(s.address)}
            </span>

          </div>


          <div>

            <b>
              MRI
            </b>

            <span>
              ${esc(s.machine_info)}
            </span>

          </div>
        `;
      }


      const bookingButton =
        document.querySelector(
          '.booking-box .primary-btn'
        );

      if (
        bookingButton &&
        s.booking_url
      ) {
        bookingButton.href =
          s.booking_url;

        bookingButton.target =
          '_blank';

        bookingButton.rel =
          'noopener noreferrer';

        bookingButton.textContent =
          'Google Form нээх →';
      }


      // ===================================
      // FOOTER
      // ===================================

      const footerCols =
        document.querySelectorAll(
          '.footer-col'
        );

      footerCols.forEach(col => {

        const title =
          col.querySelector('h4');

        if (
          title &&
          title.textContent.trim() ===
            'Холбоо барих'
        ) {
          col.innerHTML = `

            <h4>
              Холбоо барих
            </h4>

            <a
              href="tel:${tel(s.phone_1)}"
            >
              ${esc(s.phone_1)}
            </a>

            <a
              href="tel:${tel(s.phone_2)}"
            >
              ${esc(s.phone_2)}
            </a>

            <span>
              ${esc(s.address)}
            </span>

            <span>
              ${esc(s.machine_info)}
            </span>
          `;
        }
      });


      const footerContact =
        document.querySelector(
          '.footer-contact .container'
        );

      if (footerContact) {
        footerContact.innerHTML = `

          <a
            href="mailto:${esc(s.email)}"
          >
            ✉ ${esc(s.email)}
          </a>

          <a
            href="tel:${tel(
              s.general_phone
            )}"
          >
            ☎ Ерөнхий:
            ${esc(s.general_phone)}
          </a>
        `;
      }
    }
// ===================================
// SOCIAL / MAPS / CHAT
// ===================================

const footerMain =
  document.querySelector('.footer-main');

if (footerMain) {
  let socialBlock =
    document.getElementById('publicSocialLinks');

  if (!socialBlock) {
    socialBlock =
      document.createElement('div');

    socialBlock.id =
      'publicSocialLinks';

    socialBlock.style.cssText = `
      margin-top:24px;
      display:flex;
      gap:16px;
      flex-wrap:wrap;
      align-items:center;
    `;

    const footerContainer =
      footerMain.querySelector('.container');

    if (footerContainer) {
      footerContainer.appendChild(
        socialBlock
      );
    }
  }

  const socialLinks = [];

  if (s.facebook_url) {
    socialLinks.push(`
      <a
        href="${esc(s.facebook_url)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Facebook
      </a>
    `);
  }

  if (s.instagram_url) {
    socialLinks.push(`
      <a
        href="${esc(s.instagram_url)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Instagram
      </a>
    `);
  }

  if (s.youtube_url) {
    socialLinks.push(`
      <a
        href="${esc(s.youtube_url)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        YouTube
      </a>
    `);
  }

  if (s.chat_url) {
    socialLinks.push(`
      <a
        href="${esc(s.chat_url)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Chat
      </a>
    `);
  }

  if (s.maps_url) {
    socialLinks.push(`
      <a
        href="${esc(s.maps_url)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        Google Maps
      </a>
    `);
  }

  socialBlock.innerHTML =
    socialLinks.join('');
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
        .eq(
          'published',
          true
        )
        .order(
          'created_at',
          {
            ascending: false
          }
        );


      if (!newsError) {

        if (!news?.length) {

          newsGrid.innerHTML = `
            <p>
              Одоогоор нийтлэгдсэн
              мэдээ байхгүй.
            </p>
          `;

        } else {

          newsGrid.innerHTML =
            news.map(item => {

              const date =
                item.created_at
                  ? new Date(
                      item.created_at
                    )
                    .toLocaleDateString(
                      'mn-MN'
                    )
                  : '';


              const image =
                item.image_url
                  ? `
                    <img
                      src="${esc(
                        item.image_url
                      )}"
                      alt="${esc(
                        item.title
                      )}"
                      style="
                        width:100%;
                        height:100%;
                        object-fit:cover;
                      "
                    >
                  `
                  : 'MRI';


              const youtubeEmbed =
                getYoutubeEmbed(
                  item.youtube_url
                );


              const safeContent =
                sanitizeRichHtml(
                  item.content || ''
                );


              const details =
                safeContent ||
                youtubeEmbed
                  ? `
                    <details
                      style="
                        margin-top:14px;
                      "
                    >

                      <summary
                        class="text-link"
                        style="
                          cursor:pointer;
                        "
                      >
                        Дэлгэрэнгүй →
                      </summary>

                      <div
                        class="news-full-content"
                        style="
                          margin-top:14px;
                          line-height:1.75;
                        "
                      >
                        ${safeContent}

                        ${youtubeEmbed}
                      </div>

                    </details>
                  `
                  : '';


              return `
                <article
                  class="news-card"
                >

                  <div
                    class="news-thumb"
                  >
                    ${image}
                  </div>

                  <div
                    class="news-body"
                  >

                    <div
                      class="news-meta"
                    >
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

      } else {
        console.error(
          'News load error:',
          newsError
        );
      }
    }

  } catch (error) {
    console.error(
      'Public data error:',
      error
    );
  }

})();
