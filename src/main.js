import "./style.css";
import {
  addMemo,
  removeMemo,
  sortByUpdatedAt,
  updateMemo,
  validateMemoInput,
} from "./memos/memo.js";
import { STORAGE_KEY, loadMemos, saveMemos } from "./memos/storage.js";
import { renderMemoList } from "./memos/view.js";

const form = document.querySelector("#memo-form");
const formHeading = document.querySelector("#form-heading");
const titleInput = document.querySelector("#memo-title");
const bodyInput = document.querySelector("#memo-body");
const submitButton = document.querySelector("#submit-button");
const cancelButton = document.querySelector("#cancel-button");
const status = document.querySelector("#status");
const list = document.querySelector("#memo-list");
const count = document.querySelector("#memo-count");
const emptyMessage = document.querySelector("#empty-message");

// プライベートブラウズやブラウザの設定によっては、localStorage に触れるだけで例外になる
const storage = getStorage();

let memos = [];
let editingId = null;

function getStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function load() {
  if (!storage) {
    showStatus("このブラウザではメモを保存できません。", "error");
    return;
  }
  const result = loadMemos(storage);
  memos = result.memos;
  if (result.error) {
    showStatus(result.error, "error");
  } else if (result.dropped > 0) {
    showStatus(`読み込めないメモが${result.dropped}件ありました。`, "error");
  }
}

function persist(nextMemos) {
  if (storage && !saveMemos(storage, nextMemos)) {
    showStatus(
      "保存できませんでした。容量がいっぱいの可能性があります。",
      "error",
    );
    return false;
  }
  memos = nextMemos;
  return true;
}

function render() {
  const sorted = sortByUpdatedAt(memos);
  renderMemoList(list, sorted);
  count.textContent = `（${memos.length}件）`;
  emptyMessage.hidden = memos.length > 0;
}

function showStatus(message, type = "info") {
  status.textContent = message;
  status.dataset.type = type;
}

function startEditing(id) {
  const memo = memos.find((m) => m.id === id);
  if (!memo) {
    return;
  }
  editingId = id;
  titleInput.value = memo.title;
  bodyInput.value = memo.body;
  formHeading.textContent = "メモを編集";
  submitButton.textContent = "更新";
  cancelButton.hidden = false;
  showStatus("");
  titleInput.focus();
}

function resetForm() {
  editingId = null;
  form.reset();
  formHeading.textContent = "新しいメモ";
  submitButton.textContent = "追加";
  cancelButton.hidden = true;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const result = validateMemoInput({
    title: titleInput.value,
    body: bodyInput.value,
  });
  if (!result.ok) {
    showStatus(result.error, "error");
    titleInput.focus();
    return;
  }

  const isEditing = editingId !== null;
  const nextMemos = isEditing
    ? updateMemo(memos, editingId, result.value)
    : addMemo(memos, result.value);

  if (persist(nextMemos)) {
    resetForm();
    render();
    showStatus(isEditing ? "メモを更新しました。" : "メモを追加しました。");
  }
});

cancelButton.addEventListener("click", () => {
  resetForm();
  showStatus("");
});

// ボタンごとにイベントを付けず、一覧でまとめて受け取る（イベント委譲）
list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const { action, id } = button.dataset;
  if (action === "edit") {
    startEditing(id);
  } else if (action === "delete") {
    const memo = memos.find((m) => m.id === id);
    if (!memo || !window.confirm(`「${memo.title}」を削除しますか？`)) {
      return;
    }
    if (persist(removeMemo(memos, id))) {
      if (editingId === id) {
        resetForm();
      }
      render();
      showStatus("メモを削除しました。");
    }
  }
});

// 別のタブで変更されたら読み込み直す
window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY) {
    return;
  }
  load();
  if (editingId !== null && !memos.some((m) => m.id === editingId)) {
    resetForm();
  }
  render();
});

load();
render();
