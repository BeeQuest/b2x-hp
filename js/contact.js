/* =========================================================
   B2X お問い合わせフォーム（Apps Script エンドポイントへ送信）
   ========================================================= */
(() => {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const CONTACT_MAIL = "info@b2x.co.jp";

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

      submitContactForm(form);
    });
  };

  const submitContactForm = async (form) => {
    const statusEl = $("#form-status", form);
    const button = $("input[type=submit], button[type=submit]", form);
    const endpoint = (form.dataset.endpoint || "").trim();

    const setStatus = (text, state) => {
      if (!statusEl) return;
      statusEl.textContent = text;
      statusEl.className = "form-status" + (state ? " is-" + state : "");
    };

    // 送信先が未設定のときに成功したように見せるのは、問い合わせの取りこぼしに直結する。
    // 事実を伝えてメールへ誘導する。
    if (!endpoint) {
      setStatus(
        "現在フォームからの送信を準備中です。お手数ですが " + CONTACT_MAIL + " 宛にメールでご連絡ください。",
        "error"
      );
      return;
    }

    const payload = {};
    new FormData(form).forEach((value, key) => {
      if (key !== "agree") payload[key] = value;
    });

    if (button) {
      button.disabled = true;
      button.dataset.label = button.value || button.innerHTML;
      if (button.tagName === "INPUT") button.value = "送信中…";
      else button.textContent = "送信中…";
    }
    setStatus("送信しています…", "pending");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        // Apps Script の Web アプリはプリフライトを受け付けないため text/plain で送る
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
      const result = await res.json().catch(() => ({ ok: false }));

      if (res.ok && result.ok) {
        setStatus("お問い合わせを受け付けました。担当者よりご連絡いたします。", "success");
        form.reset();
      } else {
        setStatus(
          (result.error || "送信に失敗しました。") +
            " お手数ですが " + CONTACT_MAIL + " 宛にメールでご連絡ください。",
          "error"
        );
      }
    } catch (err) {
      setStatus(
        "送信に失敗しました。通信環境をご確認いただくか、" + CONTACT_MAIL + " 宛にメールでご連絡ください。",
        "error"
      );
    } finally {
      if (button) {
        button.disabled = false;
        if (button.dataset.label) {
          if (button.tagName === "INPUT") button.value = button.dataset.label;
          else button.innerHTML = button.dataset.label;
        }
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContactForm, { once: true });
  } else {
    initContactForm();
  }
})();
