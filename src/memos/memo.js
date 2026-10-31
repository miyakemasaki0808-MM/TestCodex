export const TITLE_MAX_LENGTH = 100;
export const BODY_MAX_LENGTH = 10000;

/**
 * フォームの入力値を検証し、保存できる形に整える。
 * @returns {{ ok: true, value: { title: string, body: string } } | { ok: false, error: string }}
 */
export function validateMemoInput({ title, body }) {
  const normalizedTitle = String(title ?? "").trim();
  const normalizedBody = String(body ?? "").trim();

  if (normalizedTitle.length === 0) {
    return { ok: false, error: "タイトルを入力してください。" };
  }
  if (normalizedTitle.length > TITLE_MAX_LENGTH) {
    return {
      ok: false,
      error: `タイトルは${TITLE_MAX_LENGTH}文字以内にしてください。`,
    };
  }
  if (normalizedBody.length > BODY_MAX_LENGTH) {
    return {
      ok: false,
      error: `本文は${BODY_MAX_LENGTH}文字以内にしてください。`,
    };
  }

  return { ok: true, value: { title: normalizedTitle, body: normalizedBody } };
}

/** 検証済みの入力からメモを作る。 */
export function createMemo(
  { title, body },
  { now = Date.now(), id = crypto.randomUUID() } = {},
) {
  return { id, title, body, createdAt: now, updatedAt: now };
}

/** メモ一覧の先頭に新しいメモを足した、新しい配列を返す。 */
export function addMemo(memos, input, options) {
  return [createMemo(input, options), ...memos];
}

/** 指定したメモだけを書き換えた、新しい配列を返す。 */
export function updateMemo(
  memos,
  id,
  { title, body },
  { now = Date.now() } = {},
) {
  return memos.map((memo) =>
    memo.id === id ? { ...memo, title, body, updatedAt: now } : memo,
  );
}

/** 指定したメモを除いた、新しい配列を返す。 */
export function removeMemo(memos, id) {
  return memos.filter((memo) => memo.id !== id);
}

/** 更新日時の新しい順に並べた、新しい配列を返す。 */
export function sortByUpdatedAt(memos) {
  return [...memos].sort((a, b) => b.updatedAt - a.updatedAt);
}
