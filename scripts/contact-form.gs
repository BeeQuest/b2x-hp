/**
 * B2X コーポレートサイト お問い合わせフォームの受信エンドポイント（Google Apps Script）
 *
 * なぜ Apps Script か:
 *   サイトは Firebase Hosting の Spark プラン（請求先リンクなし）で動いており
 *   Cloud Functions が使えない。個人情報を第三者のフォームサービスに渡さず
 *   B2X の Google Workspace 内で完結させるため、Apps Script の Web アプリで受ける。
 *
 * デプロイ手順:
 *   1. https://script.google.com/ を info@b2x.co.jp を管理できるアカウントで開く
 *   2. 新しいプロジェクトを作成し、このファイルの内容を貼り付ける
 *   3. [デプロイ] > [新しいデプロイ] > 種類「ウェブアプリ」
 *        次のユーザーとして実行: 自分
 *        アクセスできるユーザー: 全員
 *   4. 発行された /exec の URL を contact.html の data-endpoint に設定する
 *
 * 注意:
 *   「アクセスできるユーザー: 全員」は必須（サイト訪問者は未ログインのため）。
 *   スパム対策として honeypot と最低限のレート制限を入れてある。
 */

var MAIL_TO = 'info@b2x.co.jp';
var SITE_ORIGIN = 'https://b2x.co.jp';

var LABELS = {
  name: 'お名前',
  company: '会社名',
  title: '部署・役職',
  email: 'メールアドレス',
  tel: '電話番号',
  type: 'お問い合わせ種別',
  message: 'お問い合わせ内容'
};

var TYPE_LABELS = {
  beequest: 'BeeQuestについて',
  lms: 'LMS・教育プロダクト開発',
  accounting: '会計教育プログラム',
  ax: 'AX・教育DX支援',
  si: '受託開発・SI',
  recruit: '採用について',
  other: 'その他'
};

function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // honeypot: 人間は絶対に埋めない隠しフィールド。埋まっていれば bot として黙って捨てる
    if (data.website) {
      return json({ ok: true });
    }

    var name = trim(data.name);
    var email = trim(data.email);
    var message = trim(data.message);

    if (!name || !email || !message) {
      return json({ ok: false, error: '必須項目が入力されていません。' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: 'メールアドレスの形式が正しくありません。' });
    }
    if (message.length > 5000) {
      return json({ ok: false, error: 'お問い合わせ内容が長すぎます。' });
    }

    if (isRateLimited()) {
      return json({ ok: false, error: '送信が集中しています。しばらくしてからお試しください。' });
    }

    var typeLabel = TYPE_LABELS[data.type] || data.type || '（未選択）';
    var lines = [
      'コーポレートサイトのお問い合わせフォームから送信がありました。',
      '',
      LABELS.name + ': ' + name,
      LABELS.company + ': ' + (trim(data.company) || '（未入力）'),
      LABELS.title + ': ' + (trim(data.title) || '（未入力）'),
      LABELS.email + ': ' + email,
      LABELS.tel + ': ' + (trim(data.tel) || '（未入力）'),
      LABELS.type + ': ' + typeLabel,
      '',
      LABELS.message + ':',
      message,
      '',
      '---',
      '送信日時: ' + Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss') + ' (JST)',
      '送信元: ' + SITE_ORIGIN + '/contact'
    ];

    MailApp.sendEmail({
      to: MAIL_TO,
      subject: '【B2X HP】お問い合わせ: ' + name + '様（' + typeLabel + '）',
      body: lines.join('\n'),
      replyTo: email,
      name: 'B2X コーポレートサイト'
    });

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: '送信処理でエラーが発生しました。' });
  }
}

/** 疎通確認用。ブラウザで /exec を開くと状態が見える */
function doGet() {
  return json({ ok: true, service: 'b2x-contact-form' });
}

function trim(v) {
  return (typeof v === 'string' ? v : '').trim();
}

/** 1分あたり10件までに制限（同一スクリプト全体でのざっくりした上限） */
function isRateLimited() {
  var cache = CacheService.getScriptCache();
  var key = 'rate_' + Math.floor(Date.now() / 60000);
  var count = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(count), 120);
  return count > 10;
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
