"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import { PROJECT_ROLES } from "@/components/project/projectRoles";

const DEFAULT_ROLES = ["기획"];

export default function NewProjectForm({ titleId, onCancel, onCreate }) {
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
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name").trim();
    const subtitle = formData.get("subtitle").trim();

    setNameError(name ? "" : "프로젝트 이름을 입력해 주세요");
    setRoleError(roles.length ? "" : "역할을 하나 이상 골라 주세요");
    if (!name) {
      event.currentTarget.elements.namedItem("name").focus();
      return;
    }
    if (roles.length === 0) return;
    onCreate({ name, subtitle: subtitle || null, roles });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <ShapeCharacter shape="pentagon" color="blue" size={40} />
        <h2 id={titleId} className="text-heading tracking-[-0.44px]">
          새 프로젝트
        </h2>
      </div>
      <TextField
        label="프로젝트 이름"
        name="name"
        placeholder="예) 아이디어톤"
        required
        error={nameError}
        onChange={(event) => { if (event.target.value.trim()) setNameError(""); }}
      />
      <TextField
        label={<>부제목 <span className="text-ink-subtle">· 선택</span></>}
        name="subtitle"
        placeholder="예) 캠퍼스 중고마켓"
      />
      <div role="group" aria-labelledby="new-project-role" className="flex flex-col gap-1.5">
        <span id="new-project-role" className="text-label text-ink-muted">
          내 역할 <span className="text-ink-subtle">· 여러 개 고를 수 있어요</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PROJECT_ROLES.map((item) => (
            <Chip key={item} selected={roles.includes(item)} onClick={() => toggleRole(item)}>
              {item}
            </Chip>
          ))}
        </div>
        {roleError && (
          <p role="alert" className="pt-0.5 text-label text-tint-red-ink">
            {roleError}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-3.5 pt-1">
        <TextLink onClick={onCancel}>취소</TextLink>
        <Button type="submit">만들기</Button>
      </div>
    </form>
  );
}
