import { describe, expect, it } from "vitest";
import {
  BODY_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  addMemo,
  createMemo,
  removeMemo,
  sortByUpdatedAt,
  updateMemo,
  validateMemoInput,
} from "./memo.js";

describe("validateMemoInput", () => {
  it("前後の空白を取り除く", () => {
    expect(
      validateMemoInput({ title: "  買い物  ", body: "\n牛乳\n" }),
    ).toEqual({
      ok: true,
      value: { title: "買い物", body: "牛乳" },
    });
  });

  it("タイトルが空白だけならエラー", () => {
    const result = validateMemoInput({ title: "   ", body: "本文" });
    expect(result.ok).toBe(false);
  });

  it("本文は空でもよい", () => {
    expect(validateMemoInput({ title: "タイトル", body: "" }).ok).toBe(true);
  });

  it("文字数の上限ちょうどは通し、超えたらエラー", () => {
    expect(
      validateMemoInput({ title: "a".repeat(TITLE_MAX_LENGTH), body: "" }).ok,
    ).toBe(true);
    expect(
      validateMemoInput({ title: "a".repeat(TITLE_MAX_LENGTH + 1), body: "" })
        .ok,
    ).toBe(false);
    expect(
      validateMemoInput({ title: "t", body: "a".repeat(BODY_MAX_LENGTH + 1) })
        .ok,
    ).toBe(false);
  });

  it("undefined や null が来ても例外にしない", () => {
    expect(validateMemoInput({ title: undefined, body: null }).ok).toBe(false);
  });
});

describe("メモ一覧の操作", () => {
  const first = createMemo(
    { title: "1件目", body: "" },
    { now: 1000, id: "a" },
  );
  const second = createMemo(
    { title: "2件目", body: "" },
    { now: 2000, id: "b" },
  );

  it("createMemo は作成日時と更新日時を同じにする", () => {
    expect(first).toEqual({
      id: "a",
      title: "1件目",
      body: "",
      createdAt: 1000,
      updatedAt: 1000,
    });
  });

  it("addMemo は先頭に追加し、元の配列を変えない", () => {
    const memos = [first];
    const result = addMemo(
      memos,
      { title: "新規", body: "" },
      { now: 3000, id: "c" },
    );
    expect(result.map((m) => m.id)).toEqual(["c", "a"]);
    expect(memos).toEqual([first]);
  });

  it("updateMemo は対象だけを書き換え、作成日時は残す", () => {
    const result = updateMemo(
      [first, second],
      "a",
      { title: "変更", body: "本文" },
      { now: 5000 },
    );
    expect(result[0]).toEqual({
      id: "a",
      title: "変更",
      body: "本文",
      createdAt: 1000,
      updatedAt: 5000,
    });
    expect(result[1]).toBe(second);
  });

  it("removeMemo は対象だけを消す", () => {
    expect(removeMemo([first, second], "a")).toEqual([second]);
  });

  it("sortByUpdatedAt は新しい順に並べ、元の配列を変えない", () => {
    const memos = [first, second];
    expect(sortByUpdatedAt(memos).map((m) => m.id)).toEqual(["b", "a"]);
    expect(memos).toEqual([first, second]);
  });
});
