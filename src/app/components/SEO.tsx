import { useEffect } from "react";

type SEOProps = {
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
  image?: string;
  lang?: string;
};

const DEFAULTS: Required<SEOProps> = {
  title: "MediCare AI — Nền tảng khám và tư vấn y tế thông minh",
  description:
    "MediCare AI: đặt lịch khám, tư vấn online, hội chẩn chuyên gia và quản lý hồ sơ bệnh án thông minh tại Việt Nam. Hỗ trợ AI sàng lọc triệu chứng và nhắc lịch tự động.",
  keywords:
    "đặt lịch khám, tư vấn bác sĩ online, hội chẩn chuyên gia, hồ sơ bệnh án điện tử, AI y tế, MediCare, telemedicine Việt Nam",
  url: typeof window !== "undefined" ? window.location.href : "",
  image: "",
  lang: "vi",
};

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  if (!href) return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(id: string, data: object) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function SEO(props: SEOProps = {}) {
  const meta = { ...DEFAULTS, ...props };

  useEffect(() => {
    document.documentElement.lang = meta.lang;
    document.title = meta.title;

    upsertMeta("name", "description", meta.description);
    upsertMeta("name", "keywords", meta.keywords);
    upsertMeta("name", "robots", "index, follow");
    upsertMeta("name", "viewport", "width=device-width, initial-scale=1");
    upsertMeta("name", "theme-color", "#0ea5e9");
    upsertMeta("name", "author", "MediCare AI");

    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:title", meta.title);
    upsertMeta("property", "og:description", meta.description);
    upsertMeta("property", "og:locale", "vi_VN");
    upsertMeta("property", "og:site_name", "MediCare AI");
    if (meta.url) upsertMeta("property", "og:url", meta.url);
    if (meta.image) upsertMeta("property", "og:image", meta.image);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", meta.title);
    upsertMeta("name", "twitter:description", meta.description);
    if (meta.image) upsertMeta("name", "twitter:image", meta.image);

    if (meta.url) upsertLink("canonical", meta.url);

    upsertJsonLd("ld-org", {
      "@context": "https://schema.org",
      "@type": "MedicalOrganization",
      name: "MediCare AI",
      url: meta.url || undefined,
      description: meta.description,
      areaServed: "VN",
      medicalSpecialty: [
        "Cardiovascular",
        "Dermatology",
        "Pediatric",
        "Otolaryngologic",
        "Internal",
      ],
    });

    upsertJsonLd("ld-website", {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "MediCare AI",
      url: meta.url || undefined,
      inLanguage: "vi-VN",
    });
  }, [meta.title, meta.description, meta.keywords, meta.url, meta.image, meta.lang]);

  return null;
}
