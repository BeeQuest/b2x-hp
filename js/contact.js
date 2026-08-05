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

  /** 送信ごとに一意な ID。二重送信の判定にサーバ側で使う */
  const newSubmissionId = () => {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  };

  /**
   * 応答が読めなかった場合だけ再送する。
   * submissionId により、サーバ側で重複はメール送信されない。
   */
  const postWithRetry = async (endpoint, payload, attempts) => {
    let last = { ok: false };
    for (let i = 0; i < attempts; i++) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          // Apps Script の Web アプリはプリフライトを受け付けないため text/plain で送る
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        });
        const result = await res.json().catch(() => null);
        if (res.ok && result && result.ok) return result;
        // サーバが明示的にエラー内容を返した場合は入力の問題なので再送しない
        if (result && result.error) return result;
        last = { ok: false };
      } catch (err) {
        last = { ok: false };
      }
      if (i < attempts - 1) await new Promise(r => setTimeout(r, 800 * (i + 1)));
    }
    return last;
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

    // Apps Script の /exec は 302 で googleusercontent へ飛ぶが、
    // その応答が JSON にならず読み取れないことがある（実測で数回に1回）。
    // リトライしても二重送信にならないよう、送信ごとに一意な ID を付ける。
    // サーバ側は同じ ID を受け取ったら再送せず ok を返す。
    payload.submissionId = newSubmissionId();

    if (button) {
      button.disabled = true;
      button.dataset.label = button.value || button.innerHTML;
      if (button.tagName === "INPUT") button.value = "送信中…";
      else button.textContent = "送信中…";
    }
    setStatus("送信しています…", "pending");

    try {
      const result = await postWithRetry(endpoint, payload, 3);

      if (result.ok) {
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
