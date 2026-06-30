# سایت Armila Design Studio

سایت استاتیک پورتفولیوی استودیو معماری Armila Design — ساخته‌شده با Tailwind CSS v3 و یک پایپ‌لاین ساده‌ی Node.js برای ترکیب partial ها.

## ساختار پروژه

```
armila-site/
├── pages/                 ← فایل‌های منبع HTML (همیشه اینجا ویرایش کن، نه فایل‌های ریشه)
│   ├── index.src.html
│   ├── about.src.html
│   ├── projects.src.html
│   ├── villa-design.src.html
│   ├── interior-design.src.html
│   ├── commercial-design.src.html
│   ├── residential-design.src.html
│   ├── office-retail-design.src.html
│   ├── landscape-design.src.html
│   └── contact.src.html
├── partials/               ← navbar و footer مشترک (یک‌بار ویرایش، در همه صفحات اعمال می‌شود)
│   ├── navbar.html
│   └── footer.html
├── css/
│   ├── input.css           ← فایل منبع Tailwind + استایل‌های سفارشی (اینجا استایل اضافه کن)
│   └── style.css           ← خروجی build شده (دست نزن، خودکار ساخته می‌شود)
├── js/
│   ├── main.js              ← تمام منطق تعامل (اسکرول نرم، ترنزیشن صفحات، منوی موبایل، فرم‌ها...)
│   └── vendor/lenis.min.js  ← کتابخانه‌ی اسکرول نرم Lenis
├── images/                  ← همه‌ی عکس‌های واقعی سایت
├── build.js                 ← اسکریپت ساخت HTML از partials
├── tailwind.config.js       ← تنظیمات رنگ/فونت/spacing
├── netlify.toml / vercel.json ← تنظیمات هاست (هرکدام را که استفاده کردی نگه دار)
└── *.html                    ← فایل‌های نهایی (خودکار ساخته می‌شوند، دست نزن)
```

**نکته مهم:** فایل‌های `index.html`, `about.html` و غیره در ریشه‌ی پروژه خودکار از `pages/*.src.html` ساخته می‌شوند. اگر مستقیماً آن‌ها را ویرایش کنی، با اجرای دوباره‌ی build از بین می‌رود.

## Build و توسعه‌ی محلی

```bash
npm install
npm run build        # هم HTML را می‌سازد، هم Tailwind CSS را کامپایل می‌کند
npx serve .           # پیش‌نمایش محلی
```

اگر فقط CSS را تغییر دادی:
```bash
npx tailwindcss -i ./css/input.css -o ./css/style.css --minify
```

اگر فقط یک `pages/*.src.html` یا partial را تغییر دادی:
```bash
node build.js
```

## دیپلوی — توصیه‌شده: Netlify

سایت برای Netlify آماده است (`netlify.toml` موجود است). برای دیپلوی:
1. ریپازیتوری را به Netlify وصل کن (یا پوشه را مستقیم drag-and-drop کن).
2. Build command و publish directory از `netlify.toml` خودکار خوانده می‌شوند.

### تنظیم ایمیل فرم تماس (یک قدم دستی، فقط یک‌بار)

فرم‌های تماس سایت (صفحه‌ی Contact و فرم کوچک صفحه‌ی Home) با **Netlify Forms** کار می‌کنند — یعنی بدون نیاز به سرویس بیرونی یا API key، خود Netlify فرم‌ها را در زمان build شناسایی و مدیریت می‌کند. تنها کاری که باید **خودت یک‌بار در داشبورد Netlify** انجام بدی:

1. وارد سایت در داشبورد Netlify شو.
2. برو به **Site configuration → Forms → Form notifications**.
3. یک «Email notification» اضافه کن و آدرس **armila.design16@gmail.com** را وارد کن.

از این به بعد، هر پیامی که از فرم تماس سایت ارسال بشه، مستقیم به همین ایمیل می‌رسه. این مرحله را من از طریق کد نمی‌توانم انجام بدهم چون نیاز به دسترسی به اکانت Netlify خودت دارد.

اگر به‌جای Netlify از Vercel یا هاست دیگری استفاده کنی، Netlify Forms کار نخواهد کرد و باید فرم را به یک سرویس دیگر (مثل Formspree) وصل کنیم.

## مدیریت عکس‌ها

تمام عکس‌های پروژه از قبل بهینه‌سازی شده‌اند (resize به حداکثر ۱۶۰۰px + فشرده‌سازی webp/jpg، بدون crop). برای افزودن پروژه‌ی جدید:
- عکس‌ها را داخل `images/projects/{category}-{شماره}-{اسم}/img-01.jpg` و معادل `.webp` قرار بده.
- از همان روش resize/compress استفاده‌شده در پروژه‌های موجود پیروی کن تا حجم سایت پایین بماند.
