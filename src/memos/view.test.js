// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { renderMemoList } from "./view.js";

const baseMemo = {
  id: "a",
  title: "タイトル",
  body: "本文",
  createdAt: 0,
  updatedAt: Date.UTC(2026, 9, 31, 3, 0),
};

describe("renderMemoList", () => {
  let list;

  beforeEach(() => {
    document.body.replaceChildren();
    list = document.createElement("ul");
    document.body.append(list);
  });

  it("メモの数だけ項目を作り、編集と削除のボタンに id を持たせる", () => {
    renderMemoList(list, [baseMemo, { ...baseMemo, id: "b", body: "" }]);

    const items = list.querySelectorAll("li");
    expect(items).toHaveLength(2);
    expect(items[0].querySelector("[data-action='edit']").dataset.id).toBe("a");
    expect(items[0].querySelector("[data-action='delete']").dataset.id).toBe(
      "a",
    );
    // 本文が空のメモには本文の段落を作らない
    expect(items[1].querySelector(".memo-body")).toBeNull();
  });

  it("描画し直すと前の内容は残らない", () => {
    renderMemoList(list, [baseMemo]);
    renderMemoList(list, []);
    expect(list.children).toHaveLength(0);
  });

  it("HTML を含む入力は、HTML ではなく文字としてそのまま表示する", () => {
    const payload = '<img src=x onerror="window.__xss = true">';
    renderMemoList(list, [
      {
        ...baseMemo,
        title: payload,
        body: `<script>window.__xss = true</script>`,
      },
    ]);

    expect(list.querySelector("img")).toBeNull();
    expect(list.querySelector("script")).toBeNull();
    expect(list.querySelector(".memo-title").textContent).toBe(payload);
    expect(window.__xss).toBeUndefined();
  });

  it("ボタンの読み上げ用ラベルにもタイトルを文字として入れる", () => {
    renderMemoList(list, [{ ...baseMemo, title: '"><b>x</b>' }]);
    const button = list.querySelector("[data-action='delete']");
    expect(button.getAttribute("aria-label")).toBe('「"><b>x</b>」を削除');
    expect(list.querySelector("b")).toBeNull();
  });
});
