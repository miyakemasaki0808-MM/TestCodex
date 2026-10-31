const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "medium",
  timeStyle: "short",
});

/**
 * メモ一覧を描画する。
 *
 * ユーザーが入力した文字列は必ず textContent で入れる。
 * innerHTML に入れると、<img src=x onerror=...> のような入力がそのまま
 * HTML として解釈され、スクリプトが実行されてしまう（XSS）。
 */
export function renderMemoList(listElement, memos) {
  listElement.replaceChildren(...memos.map(createMemoItem));
}

function createMemoItem(memo) {
  const item = document.createElement("li");
  item.className = "memo";

  const title = document.createElement("h3");
  title.className = "memo-title";
  title.textContent = memo.title;

  const body = document.createElement("p");
  body.className = "memo-body";
  body.textContent = memo.body;

  const updatedAt = document.createElement("time");
  updatedAt.className = "memo-date";
  updatedAt.dateTime = new Date(memo.updatedAt).toISOString();
  updatedAt.textContent = `更新: ${dateFormatter.format(memo.updatedAt)}`;

  const actions = document.createElement("div");
  actions.className = "memo-actions";
  actions.append(
    createActionButton("edit", "編集", memo),
    createActionButton("delete", "削除", memo),
  );

  item.append(title);
  if (memo.body) {
    item.append(body);
  }
  item.append(updatedAt, actions);
  return item;
}

function createActionButton(action, label, memo) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `button-${action}`;
  button.dataset.action = action;
  button.dataset.id = memo.id;
  button.textContent = label;
  button.setAttribute("aria-label", `「${memo.title}」を${label}`);
  return button;
}
