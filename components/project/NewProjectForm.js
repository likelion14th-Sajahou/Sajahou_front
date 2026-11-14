"use client";

import { useState } from "react";
import ChoiceChip from "@/components/ui/ChoiceChip";
import { FormDialogActions } from "@/components/ui/FormDialog";
import MarkedSection from "@/components/ui/MarkedSection";
import TextField from "@/components/ui/TextField";
import { PROJECT_ROLES } from "@/components/project/projectRoles";

// 프로젝트 종류(Figma 11/15). 백엔드 필드·값이 아직 정해지지 않아 화면에서만 고르고 서버로 보내지 않는다.
// 그래서 고르지 않아도 만들 수 있다. 필드가 정해지면 onCreate 값에 넣고 필수 검사를 더한다.
const PROJECT_TYPES = ["아이디어톤", "중앙해커톤", "중커톤"];
const DEFAULT_ROLES = ["기획"];

export default function NewProjectForm({ onCancel, onCreate, busy = false }) {
  const [projectType, setProjectType] = useState(null);
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [nameError, setNameError] = useState("");
  const [roleError, setRoleError] = useState("");

  // 역할은 여러 개 고를 수 있고, 목록 순서대로 저장한다(H-10).
  function toggleRole(role) {
    setRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : PROJECT_ROLES.filter((item) => item === role || current.includes(item)),
    );
    setRoleError("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    const name = new FormData(event.currentTarget).get("name").trim();

    setNameError(name ? "" : "프로젝트 이름을 입력해 주세요");
    setRoleError(roles.length ? "" : "역할을 하나 이상 골라 주세요");
    if (!name) {
      event.currentTarget.elements.namedItem("name").focus();
      return;
    }
    if (roles.length === 0) return;
    // 11/15 디자인에서 부제목 칸이 빠졌다. 이름이 예전 부제목 자리(예: 캠퍼스 중고마켓)를 맡는다.
    onCreate({ name, subtitle: null, roles });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
      <MarkedSection id="new-project-type" title="프로젝트 종류">
        <div role="radiogroup" aria-labelledby="new-project-type" className="flex gap-2">
          {PROJECT_TYPES.map((type) => (
            <ChoiceChip key={type} name="projectType" value={type} checked={projectType === type} onChange={() => setProjectType(type)} className="flex-1">
              {type}
            </ChoiceChip>
          ))}
        </div>
      </MarkedSection>
      <MarkedSection id="new-project-name" title="프로젝트 이름">
        <div className="flex flex-col gap-2">
          <TextField
            name="name"
            aria-labelledby="new-project-name"
            placeholder="예) 캠퍼스 중고마켓"
            required
            error={nameError}
            className="font-input"
            onChange={(event) => { if (event.target.value.trim()) setNameError(""); }}
          />
          {nameError && <p id="name-error" className="text-caption leading-5 text-error">{nameError}</p>}
        </div>
      </MarkedSection>
      <MarkedSection id="new-project-role" title="내 역할" note="· 중복 선택 가능">
        <div role="group" aria-labelledby="new-project-role" className="flex flex-wrap gap-2">
          {PROJECT_ROLES.map((role) => (
            <ChoiceChip key={role} type="checkbox" name="roles" value={role} checked={roles.includes(role)} onChange={() => toggleRole(role)} className="flex-auto">
              {role}
            </ChoiceChip>
          ))}
        </div>
        {roleError && <p role="alert" className="-mt-2 text-caption leading-5 text-error">{roleError}</p>}
      </MarkedSection>
      <FormDialogActions submitLabel="만들기" busy={busy} busyLabel="만드는 중…" onCancel={onCancel} />
    </form>
  );
}
