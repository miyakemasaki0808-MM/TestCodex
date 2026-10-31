import { BODY_MAX_LENGTH, TITLE_MAX_LENGTH } from "./memo.js";

export const STORAGE_KEY = "testcodex.memos";
const SCHEMA_VERSION = 1;
const ID_MAX_LENGTH = 100;

/**
 * 保存されていた文字列からメモ一覧を復元する。
 *
 * localStorage の中身は、拡張機能や開発者ツールで誰でも書き換えられる。
 * そのため「自分が保存したデータ」でも信用せず、形を確かめてから使う。
 */
export function parseStoredMemos(raw) {
  if (raw === null) {
    return { memos: [], dropped: 0 };
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return {
      memos: [],
      dropped: 0,
      error: "保存データを読み込めませんでした。",
    };
  }

  if (
    typeof data !== "object" ||
    data === null ||
    data.version !== SCHEMA_VERSION ||
    !Array.isArray(data.memos)
  ) {
    return {
      memos: [],
      dropped: 0,
      error: "保存データの形式が正しくありません。",
    };
  }

  const memos = data.memos.map(toMemo).filter((memo) => memo !== null);
  return { memos, dropped: data.memos.length - memos.length };
}

/**
 * 1件分のデータを検証し、知っている項目だけを取り出した新しいオブジェクトを返す。
 * 余計な項目（__proto__ など）は持ち込まない。
 */
function toMemo(item) {
  if (typeof item !== "object" || item === null) {
    return null;
  }

  const { id, title, body, createdAt, updatedAt } = item;
  const isValid =
    isStringWithin(id, 1, ID_MAX_LENGTH) &&
    isStringWithin(title, 1, TITLE_MAX_LENGTH) &&
    isStringWithin(body, 0, BODY_MAX_LENGTH) &&
    Number.isFinite(createdAt) &&
    Number.isFinite(updatedAt);

  return isValid ? { id, title, body, createdAt, updatedAt } : null;
}

function isStringWithin(value, min, max) {
  return (
    typeof value === "string" && value.length >= min && value.length <= max
  );
}

export function loadMemos(storage) {
  let raw;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return {
      memos: [],
      dropped: 0,
      error: "保存データにアクセスできませんでした。",
    };
  }
  return parseStoredMemos(raw);
}

/** 保存に成功したら true。容量不足やブラウザの設定で失敗したら false。 */
export function saveMemos(storage, memos) {
  try {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: SCHEMA_VERSION, memos }),
    );
    return true;
  } catch {
    return false;
  }
}
