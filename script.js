/* =========================================================
   B2X Corporate Site - script.js
   ========================================================= */
(() => {
  "use strict";

  /* ---------- Utilities ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // rAF-throttled event binder
  const rafThrottle = (fn) => {
    let ticking = false;
    return (...args) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        fn(...args);
        ticking = false;
      });
    };
  };

  // Focusable elements inside a container (for focus trap)
  const FOCUSABLE_SEL = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  const getFocusable = (container) =>
    $$(FOCUSABLE_SEL, container).filter(el => el.offsetParent !== null || el === document.activeElement);

  /* ---------- Boot ---------- */
  const init = () => {
    initHeaderScroll();
    initHamburger();
    initPricingTabs();
    initPagetop();
    initFadeUp();
    initSmoothAnchors();
    initContactForm();
  };

  /* ---------- Contact form validation ---------- */
  const initContactForm = () => {
    const form = $("#contact-form");
    if (!form) return;

    const setError = (field, message) => {
      field.classList.add("error");
      field.setAttribute("aria-invalid", "true");
      const msgEl = field.parentElement.querySelector(".form-error-msg");
      if (msgEl) {
        msgEl.textContent = message;
        msgEl.classList.add("show");
      }
    };
    const clearError = (field) => {
      field.classList.remove("error");
      field.removeAttribute("aria-invalid");
      const msgEl = field.parentElement.querySelector(".form-error-msg");
      if (msgEl) {
        msgEl.textContent = "";
        msgEl.classList.remove("show");
      }
    };

    $$("input, select, textarea", form).forEach(el => {
      el.addEventListener("input", () => clearError(el));
      el.addEventListener("change", () => clearError(el));
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let firstError = null;
      let valid = true;

      const nameField = $("#f-name", form);
      if (nameField && !nameField.value.trim()) {
        setError(nameField, "お名前を入力してください。");
        valid = false;
        firstError = firstError || nameField;
      }
      const emailField = $("#f-email", form);
      if (emailField) {
        const v = emailField.value.trim();
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!v) {
          setError(emailField, "メールアドレスを入力してください。");
          valid = false;
          firstError = firstError || emailField;
        } else if (!emailRe.test(v)) {
          setError(emailField, "メールアドレスの形式が正しくありません。");
          valid = false;
          firstError = firstError || emailField;
        }
      }
      const msgField = $("#f-message", form);
      if (msgField && !msgField.value.trim()) {
        setError(msgField, "お問い合わせ内容を入力してください。");
        valid = false;
        firstError = firstError || msgField;
      }
      const agreeField = $("#f-agree", form);
      if (agreeField && !agreeField.checked) {
        setError(agreeField, "プライバシーポリシーへの同意が必要です。");
        valid = false;
        firstError = firstError || agreeField;
      }

      if (!valid) {
        if (firstError && typeof firstError.focus === "function") firstError.focus();
        return;
      }

      // 送信バックエンド未接続（Issue #1）。偽の受付完了を出さない。
      const status = $("#form-status", form);
      const message =
        "フォーム送信機能は準備中です。お手数ですが info@b2x.co.jp までメールでご連絡ください。";
      if (status) {
        status.hidden = false;
        status.textContent = message;
        status.classList.add("show");
      } else {
        alert(message);
      }
    });
  };

  /* ---------- Header scroll state ---------- */
  const initHeaderScroll = () => {
    const header = $(".header");
    if (!header) return;
    const SCROLLED_THRESHOLD = 20;
    const onScroll = () => {
      const scrolled = window.scrollY > SCROLLED_THRESHOLD;
      header.classList.toggle("scrolled", scrolled);
    };
    window.addEventListener("scroll", rafThrottle(onScroll), { passive: true });
    onScroll();
  };

  /* ---------- Hamburger menu (a11y + focus trap + scroll lock) ---------- */
  const initHamburger = () => {
    const hamburger = $(".hamburger");
    const gnav = $(".gnav");
    if (!hamburger || !gnav) return;

    // Ensure ids/aria linkage
    if (!gnav.id) gnav.id = "gnav";
    hamburger.setAttribute("aria-controls", gnav.id);
    hamburger.setAttribute("aria-expanded", "false");
    if (!hamburger.hasAttribute("type")) hamburger.setAttribute("type", "button");

    let lastFocused = null;

    const isOpen = () => gnav.classList.contains("open");

    const openMenu = () => {
      if (isOpen()) return;
      lastFocused = document.activeElement;
      hamburger.classList.add("open");
      gnav.classList.add("open");
      hamburger.setAttribute("aria-expanded", "true");
      document.body.classList.add("no-scroll");
      // Move focus to first focusable inside menu
      const focusables = getFocusable(gnav);
      if (focusables.length) focusables[0].focus();
      document.addEventListener("keydown", onKeydown);
    };

    const closeMenu = ({ restoreFocus = true } = {}) => {
      if (!isOpen()) return;
      hamburger.classList.remove("open");
      gnav.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("no-scroll");
      document.removeEventListener("keydown", onKeydown);
      if (restoreFocus && lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    };

    const onKeydown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        return;
      }
      if (e.key === "Tab") {
        const focusables = getFocusable(gnav).concat(hamburger);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    hamburger.addEventListener("click", () => {
      isOpen() ? closeMenu() : openMenu();
    });

    // Close on in-menu link click
    $$("a", gnav).forEach(a => {
      a.addEventListener("click", () => closeMenu({ restoreFocus: false }));
    });

    // Close if viewport upsizes out of mobile
    const mq = window.matchMedia("(min-width: 769px)");
    const mqHandler = (e) => { if (e.matches) closeMenu({ restoreFocus: false }); };
    mq.addEventListener ? mq.addEventListener("change", mqHandler) : mq.addListener(mqHandler);
  };

  /* ---------- Pricing tabs (ARIA tab pattern) ---------- */
  const pricingData = {
    beequest: [
      { name: "導入設計プラン", desc: "育成ゴールの整理と導入設計", features: ["現状ヒアリング・課題整理", "オンボーディング／育成設計", "BeeQuest導入方針の策定", "期間目安: 2〜6週間"], recommended: false },
      { name: "伴走運用プラン", desc: "導入から定着・改善まで伴走", features: ["BeeQuest環境構築・コンテンツ整備", "運用定着・改善サイクル", "評価・次ステップへの接続設計", "長期伴走（成長を見据えた支援）"], recommended: true },
      { name: "継続パートナー", desc: "組織の成長に合わせた継続支援", features: ["定期レビュー・改善提案", "コンテンツ・設計の更新", "今後機能（評価・ROI等）への接続"], recommended: false }
    ],
    si: [
      { name: "ディスカバリー", desc: "目的整理とスコープ設計", features: ["課題・ゴールのヒアリング", "実装方針の提案", "概算レンジの提示", "期間目安: 1〜4週間"], recommended: false },
      { name: "伴走開発", desc: "設計から実装・活用まで一貫支援", features: ["要件整理〜実装計画", "開発・リリース", "活用方法の伴走", "AI活用による効率的な進め方"], recommended: true },
      { name: "運用・改善", desc: "リリース後の継続改善", features: ["運用サポート", "機能改善", "LMS / API連携の拡張"], recommended: false }
    ],
    partners: [
      { name: "会計領域", desc: "提携先と連携した会計支援", features: ["ヒアリング・要件整理", "提携先との連携提案", "エクス会計・エクスフリマ等"], recommended: false },
      { name: "マーケティング", desc: "SEO等を提携企業と連携", features: ["課題整理", "提携先との進め方提案", "HP・マーケ支援も相談可"], recommended: true },
      { name: "その他連携", desc: "採用など（展開準備中）", features: ["人材採用は対応可能な場合あり", "現時点では提携先リンク非掲載", "まずはご相談ください"], recommended: false }
    ]
  };

  const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  const initPricingTabs = () => {
    const tablist = $(".pricing-tabs");
    const panel = $(".pricing-grid");
    if (!tablist || !panel) return;
    const tabs = $$(".tab", tablist);
    if (!tabs.length) return;

    // ARIA scaffolding
    tablist.setAttribute("role", "tablist");
    tablist.setAttribute("aria-label", "料金プラン種別");
    if (!panel.id) panel.id = "pricing-panel";
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("tabindex", "0");

    tabs.forEach((tab, i) => {
      tab.setAttribute("role", "tab");
      tab.setAttribute("type", "button");
      const key = tab.dataset.tab || `tab-${i}`;
      if (!tab.id) tab.id = `pricing-tab-${key}`;
      tab.setAttribute("aria-controls", panel.id);
      const active = tab.classList.contains("active");
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.setAttribute("tabindex", active ? "0" : "-1");
    });

    const render = (key) => {
      const data = pricingData[key];
      if (!data) return;
      panel.innerHTML = data.map(p => {
        const recClass = p.recommended ? " recommended" : "";
        const btnClass = p.recommended ? "btn-primary" : "btn-outline";
        return `
          <div class="price-card${recClass}">
            ${p.recommended ? '<span class="ribbon">おすすめ</span>' : ""}
            <h3>${escapeHTML(p.name)}</h3>
            <p class="price-desc">${escapeHTML(p.desc)}</p>
            <div class="price contact"><strong>お問い合わせ</strong></div>
            <ul class="price-features">
              ${p.features.map(f => `<li><i class="fa-solid fa-check" aria-hidden="true"></i> ${escapeHTML(f)}</li>`).join("")}
            </ul>
            <a href="#" class="btn ${btnClass} btn-block">このパターンで相談する</a>
          </div>
        `;
      }).join("");
      // Re-attach fade-up to freshly rendered cards
      observeFadeUp($$(".price-card", panel));
    };

    const activate = (tab, { focus = true } = {}) => {
      if (!tab) return;
      tabs.forEach(t => {
        const selected = t === tab;
        t.classList.toggle("active", selected);
        t.setAttribute("aria-selected", selected ? "true" : "false");
        t.setAttribute("tabindex", selected ? "0" : "-1");
      });
      panel.setAttribute("aria-labelledby", tab.id);
      render(tab.dataset.tab);
      if (focus) tab.focus();
    };

    tabs.forEach((tab, idx) => {
      tab.addEventListener("click", () => activate(tab, { focus: false }));
      tab.addEventListener("keydown", (e) => {
        let next = null;
        switch (e.key) {
          case "ArrowRight": next = tabs[(idx + 1) % tabs.length]; break;
          case "ArrowLeft":  next = tabs[(idx - 1 + tabs.length) % tabs.length]; break;
          case "Home":       next = tabs[0]; break;
          case "End":        next = tabs[tabs.length - 1]; break;
          default: return;
        }
        e.preventDefault();
        activate(next);
      });
    });

    // If initial active tab exists, ensure panel matches
    const initial = tabs.find(t => t.classList.contains("active")) || tabs[0];
    panel.setAttribute("aria-labelledby", initial.id);
    // Only re-render if initial key differs from static markup (dx is already in DOM)
    if (initial.dataset.tab && initial.dataset.tab !== "dx") {
      render(initial.dataset.tab);
    }
  };

  /* ---------- Pagetop ---------- */
  const initPagetop = () => {
    const pagetop = $(".pagetop");
    if (!pagetop) return;
    if (!pagetop.hasAttribute("type")) pagetop.setAttribute("type", "button");
    const onScroll = () => {
      pagetop.classList.toggle("show", window.scrollY > 400);
    };
    window.addEventListener("scroll", rafThrottle(onScroll), { passive: true });
    onScroll();
    pagetop.addEventListener("click", () => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  };

  /* ---------- Fade-up with IntersectionObserver ---------- */
  let fadeObserver = null;

  const ensureFadeObserver = () => {
    if (fadeObserver) return fadeObserver;
    if (!("IntersectionObserver" in window)) {
      // Fallback: reveal immediately
      fadeObserver = {
        observe: (el) => el.classList.add("visible"),
        unobserve: () => {}
      };
      return fadeObserver;
    }
    fadeObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    return fadeObserver;
  };

  const observeFadeUp = (elements) => {
    const obs = ensureFadeObserver();
    elements.forEach(el => {
      if (!el || el.classList.contains("fade-up")) return;
      el.classList.add("fade-up");
      obs.observe(el);
    });
  };

  const initFadeUp = () => {
    const targets = $$(".service-card, .feature-item, .price-card, .case-card, .section-head");
    observeFadeUp(targets);
  };

  /* ---------- Smooth anchors with header offset ---------- */
  const initSmoothAnchors = () => {
    const header = $(".header");
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || href.length <= 1 || href === "#") return;
        let target;
        try {
          target = document.querySelector(href);
        } catch {
          return; // invalid selector (e.g. "#!/foo")
        }
        if (!target) return;
        e.preventDefault();
        const headerH = header ? header.getBoundingClientRect().height : 0;
        const y = target.getBoundingClientRect().top + window.scrollY - headerH - 10;
        window.scrollTo({ top: y, behavior: prefersReduced.matches ? "auto" : "smooth" });
        // Move focus for a11y
        if (target.hasAttribute("tabindex") === false) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });
  };

  /* ---------- Kickoff ---------- */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
