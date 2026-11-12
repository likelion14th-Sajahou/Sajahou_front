"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";
import { PROJECT_ROLES } from "@/components/project/projectRoles";

const DEFAULT_ROLES = ["기획"];

export default function NewProjectForm({ titleId, onCancel, onCreate, busy = false }) {
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
    <form noValidate onSubmit={handleSubmit} className="new-project-form flex flex-col gap-6">
      <div className="flex items-center gap-3.5">
        <Image src="/images/stars/star-03.png" alt="" width={44} height={44} className="shrink-0" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 id={titleId} className="font-display text-[24px] leading-[34px] tracking-[-0.48px]">
            새 프로젝트
          </h2>
          <p className="text-body leading-6 text-ink-subtle">이름과 역할만 정해요. 나머지는 진행하면서 기록으로 채워요.</p>
        </div>
      </div>
      <div className="new-project-fields flex flex-col gap-5">
        <TextField
          label="프로젝트 이름"
          name="name"
          placeholder="예) 아이디어톤"
          required
          error={nameError}
          onChange={(event) => { if (event.target.value.trim()) setNameError(""); }}
        />
        <TextField
          label="부제목 (선택)"
          name="subtitle"
          placeholder="예) 캠퍼스 중고마켓"
        />
        <div role="group" aria-labelledby="new-project-role" className="flex flex-col gap-2">
          <span id="new-project-role" className="text-label leading-[21px] font-bold text-ink-subtle">
            내 역할 (여러 개 가능)
          </span>
          <div className="flex min-h-[39px] flex-wrap items-center gap-1.5">
            {PROJECT_ROLES.map((item) => (
              <Chip key={item} className="border-[1.5px]" selected={roles.includes(item)} onClick={() => toggleRole(item)}>
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
      </div>
      <div className="flex items-center justify-between gap-3.5 pt-2">
        <TextLink variant="underline" className="font-display text-ink" onClick={onCancel}>취소</TextLink>
        <Button type="submit" className="h-[46px]! border-2! border-ink! bg-ink! px-6! text-white!">{busy ? "만드는 중…" : "만들기"}</Button>
      </div>
    </form>
  );
}
