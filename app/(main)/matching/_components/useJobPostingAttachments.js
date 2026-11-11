"use client";

import { useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import useAttachmentPolling from "@/components/ui/useAttachmentPolling";
import { createFileAttachment, createLinkAttachment, deleteAttachment, isSupportedAttachmentFile } from "@/lib/attachmentApi";
import { getRequestErrorMessage } from "@/lib/requestErrorMessage";

const CATEGORY = "JOB_POSTING";
// 공고 PDF·캡처(M-02). 첨부 API가 받는 형식 중 PDF·PNG·JPG만 고른다.
export const JOB_POSTING_ACCEPT = ".pdf,.png,.jpg,.jpeg";
const JOB_POSTING_FILE = /\.(pdf|png|jpe?g)$/i;

// 첨부 API 응답(7·8번)을 칩 하나로 바꾼다.
function toChipItem(data) {
  const isLink = data.type === "LINK";
  const name = isLink ? data.url : data.name;
  return {
    attachmentId: data.attachmentId,
    type: data.type,
    kind: isLink ? "link" : name.toLowerCase().endsWith(".pdf") ? "pdf" : "image",
    name,
    extractStatus: data.extractStatus,
  };
}

function uploadErrorMessage(failure) {
  if (failure.code === "FILE_TOO_LARGE") return "20MB 이하 파일만 올릴 수 있어요.";
  if (failure.code === "UNSUPPORTED_FILE") return "PDF, PNG, JPG 파일을 선택해 주세요.";
  return getRequestErrorMessage(failure, "파일을 올리지 못했어요. 잠시 후 다시 시도해 주세요.");
}

// 채용 공고 첨부(M-02, API 7~10). 고르면 바로 올리고, 서버가 본문을 읽는 동안 상태(API 9)를 확인한다.
// 링크를 읽지 못했으면 onLinkUnreadable을 부른다. 공고 저장(36번) 때 attachmentIds로 보낸다.
// upload·addLink·remove는 성공하면 "", 실패하면 안내 문구를 돌려준다.
export default function useJobPostingAttachments({ onLinkUnreadable } = {}) {
  const { authenticatedRequest } = useAuth();
  const [items, setItems] = useState([]);
  const [isBusy, setIsBusy] = useState(false);
  const options = { request: authenticatedRequest };

  const polling = useAttachmentPolling(items, (results) => {
    setItems((previous) => previous.map((item) => {
      const result = results.find(({ attachmentId }) => attachmentId === item.attachmentId);
      return result ? { ...item, extractStatus: result.extractStatus } : item;
    }));
    if (results.some(({ type, extractStatus }) => type === "LINK" && extractStatus === "FAILED")) onLinkUnreadable?.();
  }, options);

  // 요청 하나를 보내는 동안 다른 첨부 조작을 막는다. 로그인이 풀린 경우(401)는 화면이 로그인으로 바뀌므로 안내하지 않는다.
  async function run(action, toMessage) {
    setIsBusy(true);
    try {
      await action();
      return "";
    } catch (failure) {
      return failure.status === 401 ? "" : toMessage(failure);
    } finally {
      setIsBusy(false);
    }
  }

  async function upload(files) {
    const validFiles = files.filter((file) => isSupportedAttachmentFile(file) && JOB_POSTING_FILE.test(file.name));
    const skipped = !validFiles.length ? "PDF, PNG, JPG 파일을 20MB 이하로 선택해 주세요."
      : validFiles.length !== files.length ? "PDF, PNG, JPG가 아니거나 20MB가 넘는 파일은 빼고 올렸어요." : "";
    if (!validFiles.length) return skipped;
    const message = await run(async () => {
      for (const file of validFiles) {
        const item = toChipItem(await createFileAttachment(file, CATEGORY, options));
        setItems((previous) => [...previous, item]);
      }
    }, uploadErrorMessage);
    return message || skipped;
  }

  async function addLink(url) {
    if (items.some((item) => item.type === "LINK" && item.name === url)) return "이미 추가한 링크예요.";
    return run(async () => {
      const item = toChipItem(await createLinkAttachment(url, CATEGORY, options));
      setItems((previous) => [...previous, item]);
    }, (failure) => getRequestErrorMessage(failure, "링크를 추가하지 못했어요. 잠시 후 다시 시도해 주세요."));
  }

  async function remove(attachmentId) {
    return run(async () => {
      try {
        await deleteAttachment(attachmentId, options);
      } catch (failure) {
        // 이미 지워진 첨부(404)는 칩만 빼면 된다.
        if (failure.status !== 404) throw failure;
      }
      setItems((previous) => previous.filter((item) => item.attachmentId !== attachmentId));
    }, (failure) => getRequestErrorMessage(failure, "첨부를 빼지 못했어요. 잠시 후 다시 시도해 주세요."));
  }

  return {
    items,
    isBusy,
    upload,
    addLink,
    remove,
    pollingError: polling.error,
    retryPolling: polling.retry,
  };
}
