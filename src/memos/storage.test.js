import { describe, expect, it } from "vitest";
import {
  STORAGE_KEY,
  loadMemos,
  parseStoredMemos,
  saveMemos,
} from "./storage.js";

function createFakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  };
}

const validMemo = {
  id: "a",
  title: "タイトル",
  body: "本文",
  createdAt: 1000,
  updatedAt: 2000,
};

describe("parseStoredMemos", () => {
  it("何も保存されていなければ空の一覧", () => {
    expect(parseStoredMemos(null)).toEqual({ memos: [], dropped: 0 });
  });

  it("壊れた JSON でも例外にせず、エラーを返す", () => {
    const result = parseStoredMemos("{not json");
    expect(result.memos).toEqual([]);
    expect(result.error).toBeDefined();
  });

  it("バージョンが違う、または形が違うデータは使わない", () => {
    expect(
      parseStoredMemos(JSON.stringify({ version: 99, memos: [] })).error,
    ).toBeDefined();
    expect(parseStoredMemos(JSON.stringify([validMemo])).error).toBeDefined();
    expect(parseStoredMemos("null").error).toBeDefined();
  });

  it("形の正しくないメモだけを取り除き、取り除いた件数を返す", () => {
    const raw = JSON.stringify({
      version: 1,
      memos: [
        validMemo,
        { ...validMemo, id: "" },
        { ...validMemo, title: 123 },
        { ...validMemo, title: "a".repeat(101) },
        { ...validMemo, createdAt: "昨日" },
        null,
        "文字列",
      ],
    });
    expect(parseStoredMemos(raw)).toEqual({ memos: [validMemo], dropped: 6 });
  });

  it("知らない項目は取り込まない（__proto__ を含む）", () => {
    const raw = `{"version":1,"memos":[{"id":"a","title":"t","body":"","createdAt":1,"updatedAt":1,"isAdmin":true,"__proto__":{"polluted":true}}]}`;
    const [memo] = parseStoredMemos(raw).memos;
    expect(Object.keys(memo)).toEqual([
      "id",
      "title",
      "body",
      "createdAt",
      "updatedAt",
    ]);
    expect(Object.getPrototypeOf(memo)).toBe(Object.prototype);
    expect({}.polluted).toBeUndefined();
  });
});

describe("loadMemos / saveMemos", () => {
  it("保存したものを読み込める", () => {
    const storage = createFakeStorage();
    expect(saveMemos(storage, [validMemo])).toBe(true);
    expect(loadMemos(storage).memos).toEqual([validMemo]);
  });

  it("保存形式にバージョン番号を含める", () => {
    const storage = createFakeStorage();
    saveMemos(storage, []);
    expect(JSON.parse(storage.getItem(STORAGE_KEY))).toEqual({
      version: 1,
      memos: [],
    });
  });

  it("容量不足などで保存できなければ false", () => {
    const storage = {
      setItem: () => {
        throw new DOMException("quota", "QuotaExceededError");
      },
    };
    expect(saveMemos(storage, [validMemo])).toBe(false);
  });

  it("ストレージ自体に触れなければエラーを返す", () => {
    const storage = {
      getItem: () => {
        throw new DOMException("denied", "SecurityError");
      },
    };
    const result = loadMemos(storage);
    expect(result.memos).toEqual([]);
    expect(result.error).toBeDefined();
  });
});
