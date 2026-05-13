'use client';

/**
 * プロ人事 サブサイト用 SNSシェアウィジェット
 *
 * 対応：Next.js (App Router / Pages Router 両対応) + React
 * 配置：両サブサイト共通で `components/ShareWidget.tsx` として配置
 * 使い方：
 *   - App Router の場合：app/layout.tsx の <body> 内末尾に <ShareWidget />
 *   - Pages Router の場合：pages/_app.tsx で <Component /> の隣に <ShareWidget />
 *
 * 仕様：
 *   - 画面右下にフローティングボタン
 *   - クリック/タップで X / LINE / Facebook / URLコピー / Web Share API
 *   - スマホでは Web Share API ボタンも追加表示（→ Instagram等へ）
 *   - SSR 環境でも安全（client side のみで window 参照）
 *   - 既存のCSSと干渉しないようインラインスタイル中心、必要分のみ <style> タグ
 */

import { useEffect, useRef, useState } from 'react';

type Theme = {
  primary?: string;
  primaryDark?: string;
  accent?: string;
};

type Props = {
  /** ハッシュタグ（カンマ区切り。先頭に#は不要） */
  hashtags?: string;
  /** カラーテーマ（任意） */
  theme?: Theme;
};

export default function ShareWidget({
  hashtags = 'プロ人事3段,キャリア,転職,就活',
  theme = {},
}: Props) {
  const primary = theme.primary ?? '#0a66c2';
  const primaryDark = theme.primaryDark ?? '#074a8e';
  const accent = theme.accent ?? '#ffb830';

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareText, setShareText] = useState('');
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // クライアント側でのみ実行
  useEffect(() => {
    setShareUrl(window.location.href);

    const ogTitle = document
      .querySelector('meta[property="og:title"]')
      ?.getAttribute('content');
    const ogDesc = document
      .querySelector('meta[property="og:description"]')
      ?.getAttribute('content');
    const title = ogTitle || document.title || '';
    const desc = ogDesc || '';
    setShareText(desc && desc !== title ? `${title} | ${desc}` : title);

    setHasNativeShare(
      typeof navigator !== 'undefined' && typeof navigator.share === 'function'
    );

    // 外側クリックで閉じる
    const onDocClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // 各SNSへの共有URL
  const enc = encodeURIComponent;
  const urls = {
    x: `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(
      shareUrl
    )}&hashtags=${enc(hashtags)}`,
    line: `https://social-plugins.line.me/lineit/share?url=${enc(
      shareUrl
    )}&text=${enc(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`,
  };

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = shareUrl;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  const triggerNative = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: typeof document !== 'undefined' ? document.title : shareText,
        text: shareText,
        url: shareUrl,
      });
    } catch {
      /* ユーザーキャンセル等 */
    }
  };

  // SSR時はDOMから読めないので何も描画しない（hydration mismatch回避）
  if (!shareUrl) return null;

  return (
    <>
      <style>{`
        .pj-share-wrap{
          position:fixed; bottom:24px; right:24px; z-index:9990;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", "Yu Gothic", sans-serif;
        }
        @media(max-width:600px){
          .pj-share-wrap{ bottom:16px; right:16px; }
        }
        .pj-share-toggle{
          width:56px; height:56px; border-radius:50%;
          background:${primary}; color:#fff; border:none; cursor:pointer;
          box-shadow:0 6px 20px rgba(0,40,80,.28);
          display:flex; align-items:center; justify-content:center;
          transition: transform .2s ease, box-shadow .2s ease, background .2s;
          padding:0;
        }
        .pj-share-toggle:hover{
          transform: translateY(-2px) scale(1.04);
          box-shadow:0 10px 28px rgba(0,40,80,.36);
          background:${primaryDark};
        }
        .pj-share-toggle:active{ transform: translateY(0) scale(.98); }
        .pj-share-toggle svg{ width:24px; height:24px; }

        .pj-share-menu{
          position:absolute; bottom:70px; right:0;
          background:#fff; border-radius:14px;
          box-shadow:0 12px 40px rgba(0,40,80,.22);
          padding:8px; min-width:230px;
          display:flex; flex-direction:column; gap:2px;
          animation: pj-share-pop .18s ease-out;
        }
        @keyframes pj-share-pop{
          from{ opacity:0; transform: translateY(8px) scale(.96); }
          to  { opacity:1; transform: translateY(0)   scale(1); }
        }
        .pj-share-item{
          display:flex; align-items:center; gap:12px;
          padding:11px 14px; border:none; background:transparent;
          border-radius:9px; cursor:pointer;
          font-size:14px; font-weight:600; color:#1a2733;
          text-decoration:none; text-align:left;
          transition: background .15s ease;
          font-family: inherit;
          width:100%; box-sizing:border-box;
        }
        .pj-share-item:hover{ background:#f5f8fb; }
        .pj-share-ico{
          width:30px; height:30px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-size:15px; font-weight:800; color:#fff;
          flex-shrink:0;
        }
      `}</style>

      <div className="pj-share-wrap" ref={wrapperRef} role="region" aria-label="ソーシャルシェア">
        <button
          type="button"
          className="pj-share-toggle"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          aria-label="シェアメニューを開く"
          aria-expanded={open}
        >
          <svg viewBox="0 0 24 24" aria-hidden fill="currentColor">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
          </svg>
        </button>

        {open && (
          <div className="pj-share-menu" role="menu">
            <a
              className="pj-share-item"
              href={urls.x}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
            >
              <span className="pj-share-ico" style={{ background: '#000' }}>
                𝕏
              </span>
              <span>X (Twitter) でシェア</span>
            </a>
            <a
              className="pj-share-item"
              href={urls.line}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
            >
              <span
                className="pj-share-ico"
                style={{ background: '#06c755', fontSize: 14 }}
              >
                L
              </span>
              <span>LINEで送る</span>
            </a>
            <a
              className="pj-share-item"
              href={urls.facebook}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
            >
              <span
                className="pj-share-ico"
                style={{
                  background: '#1877f2',
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'italic',
                }}
              >
                f
              </span>
              <span>Facebookで共有</span>
            </a>
            <button
              type="button"
              className="pj-share-item"
              onClick={copy}
              role="menuitem"
              style={{ color: copied ? '#06c755' : undefined }}
            >
              <span className="pj-share-ico" style={{ background: '#5b6b7a' }}>
                🔗
              </span>
              <span>
                {copied ? 'コピーしました！' : 'URLをコピー（Instagram等に貼付）'}
              </span>
            </button>
            {hasNativeShare && (
              <button
                type="button"
                className="pj-share-item"
                onClick={triggerNative}
                role="menuitem"
              >
                <span className="pj-share-ico" style={{ background: primary }}>
                  📤
                </span>
                <span>他のアプリで共有</span>
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
