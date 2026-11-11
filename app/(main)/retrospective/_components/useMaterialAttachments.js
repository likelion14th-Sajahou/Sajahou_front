"use client";

import { useState } from "react";
import { useAuth } from "@/components/layout/AuthProvider";
import useAttachmentPolling from "@/components/ui/useAttachmentPolling";
import { createFileAttachment, createLinkAttachment, deleteAttachment, isSupportedAttachmentFile } from "@/lib/attachmentApi";
import { getRequestErrorMessage } from "./RetrospectivePreview";

// 자료 칸마다 첨부 종류(category)와 고를 수 있는 파일이다. 첨부 API가 받는 형식 안에서 명세의 자료 종류만 고른다.
// 세션 PDF(R-08), 실습 노션 ZIP·캡처(R-09), 과제 노션 ZIP·MD·PDF·이미지(R-11)
export const ATTACHMENT_FIELDS = {
  sessionFiles: { category: "SESSION_PDF", accept: ".pdf" },
  practiceFiles: { category: "PRACTICE", accept: ".zip,.png,.jpg,.jpeg" },
  assignmentFiles: { category: "ASSIGNMENT", accept: ".zip,.md,.pdf,.png,.jpg,.jpeg" },
};
const FIELDS = Object.keys(ATTACHMENT_FIELDS);

// 노션에서 내보낸 ZIP·MD는 '노션 MD' 칩으로 보여 준다.
function getFileKind(fileName) {
  const name = fileName.toLowerCase();
  if (name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".zip") || name.endsWith(".md")) return "notion";
  return "image";
}

// 첨부 API 응답(7·8·13번)을 칩 하나로 바꾼다.
export function toAttachmentItem(data) {
  const name = data.name ?? data.url;
  return {
    id: String(data.attachmentId),
    attachmentId: data.attachmentId,
    category: data.category,
    name,
    kind: data.type === "LINK" ? "link" : getFileKind(name),
    extractStatus: data.extractStatus,
  };
}

// 저장된 첨부(13번 attachments)를 자료 칸별로 나눈다.
export function splitAttachments(attachments = []) {
  return Object.fromEntries(FIELDS.map((field) => [
    field,
    attachments.filter(({ category }) => category === ATTACHMENT_FIELDS[field].category).map(toAttachmentItem),
  ]));
}

function uploadErrorMessage(failure) {
  if (failure.code === "FILE_TOO_LARGE") return "20MB 이하 파일만 올릴 수 있어요.";
  if (failure.code === "UNSUPPORTED_FILE") return "지원하지 않는 파일 형식이에요.";
  return getRequestErrorMessage(failure, "파일을 올리지 못했어요. 잠시 후 다시 시도해 주세요.");
}

// 회고 자료의 첨부(R-08·09·11, API 7~10). 고르면 바로 올리고, 읽기 상태를 칩에 보여 준다.
// 저장(14번)할 때 attachmentIds로 회고에 연결하고, 다시 들어오면 13번의 attachments로 칩을 되살린다.
// 모든 함수는 성공하면 "", 실패하면 안내 문구를 돌려준다.
export default function useMaterialAttachments({ materials, setMaterials }) {
  const { authenticatedRequest } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const items = FIELDS.flatMap((field) => materials[field]);
  const options = { request: authenticatedRequest };

  const polling = useAttachmentPolling(items, (results) => {
    setMaterials((previous) => ({
      ...previous,
      ...Object.fromEntries(FIELDS.map((field) => [field, previous[field].map((item) => {
        const result = results.find(({ attachmentId }) => attachmentId === item.attachmentId);
        return result ? { ...item, extractStatus: result.extractStatus } : item;
      })])),
    }));
  }, options);

  const addItem = (field, item) => setMaterials((previous) => ({ ...previous, [field]: [...previous[field], item] }));

  async function upload(field, files) {
    const extensions = ATTACHMENT_FIELDS[field].accept.split(",");
    const validFiles = files.filter((file) => isSupportedAttachmentFile(file) && extensions.some((extension) => file.name.toLowerCase().endsWith(extension)));
    const skipped = !validFiles.length ? "올릴 수 없는 파일이에요. 업로드 버튼에 표시된 형식을 20MB 이하로 골라 주세요."
      : validFiles.length !== files.length ? "지원하지 않는 형식이나 20MB가 넘는 파일은 빼고 올렸어요." : "";
    setIsUploading(true);
    try {
      for (const file of validFiles) {
        addItem(field, toAttachmentItem(await createFileAttachment(file, ATTACHMENT_FIELDS[field].category, options)));
      }
      return skipped;
    } catch (failure) {
      return failure.status === 401 ? "" : uploadErrorMessage(failure);
    } finally {
      setIsUploading(false);
    }
  }

  async function addLink(url) {
    setIsUploading(true);
    try {
      addItem("assignmentFiles", toAttachmentItem(await createLinkAttachment(url, ATTACHMENT_FIELDS.assignmentFiles.category, options)));
      return "";
    } catch (failure) {
      return failure.status === 401 ? "" : getRequestErrorMessage(failure, "링크를 추가하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsUploading(false);
    }
  }

  async function remove(field, id) {
    const item = materials[field].find((file) => file.id === id);
    if (item?.attachmentId) {
      setIsUploading(true);
      try {
        await deleteAttachment(item.attachmentId, options);
      } catch (failure) {
        // 이미 지워진 첨부(404)는 칩만 빼면 된다.
        if (failure.status !== 404) return failure.status === 401 ? "" : getRequestErrorMessage(failure, "첨부를 빼지 못했어요. 잠시 후 다시 시도해 주세요.");
      } finally {
        setIsUploading(false);
      }
    }
    setMaterials((previous) => ({ ...previous, [field]: previous[field].filter((file) => file.id !== id) }));
    return "";
  }

  return {
    isUploading,
    upload,
    addLink,
    remove,
    attachmentIds: items.map(({ attachmentId }) => attachmentId).filter((attachmentId) => attachmentId !== undefined),
    pollingError: polling.error,
    retryPolling: polling.retry,
  };
}
