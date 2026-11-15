"use client";

import { useState } from "react";
import ChoiceChip from "@/components/ui/ChoiceChip";
import { FormDialogActions } from "@/components/ui/FormDialog";
import MarkedSection from "@/components/ui/MarkedSection";
import TextField from "@/components/ui/TextField";
import { PROJECT_ROLES } from "@/components/project/projectRoles";
import { PROJECT_CATEGORIES } from "@/lib/projectViewModel";

const DEFAULT_ROLES = ["기획"];

// 프로젝트 종류(#73)는 꼭 하나 골라야 한다. 값은 API 코드(IDEATHON·HACKATHON·JUNGKATHON)로 보낸다.
export default function NewProjectForm({ onCreate, busy = false }) {
  const [category, setCategory] = useState(null);
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [categoryError, setCategoryError] = useState("");
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
    const { elements } = event.currentTarget;
    const name = new FormData(event.currentTarget).get("name").trim();

    setCategoryError(category ? "" : "프로젝트 종류를 골라 주세요");
    setNameError(name ? "" : "프로젝트 이름을 입력해 주세요");
    setRoleError(roles.length ? "" : "역할을 하나 이상 골라 주세요");
    // 위에서부터 처음 비어 있는 칸으로 포커스를 옮긴다.
    if (!category) {
      elements.namedItem("category")[0].focus();
      return;
    }
    if (!name) {
      elements.namedItem("name").focus();
      return;
    }
    if (roles.length === 0) return;
    // 11/15 디자인에서 부제목 칸이 빠졌다. 종류가 예전 이름 자리, 이름이 예전 부제목 자리(예: 캠퍼스 중고마켓)를 맡는다.
    onCreate({ category, name, subtitle: null, roles });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
      <MarkedSection id="new-project-type" title="프로젝트 종류">
        <div
          role="radiogroup"
          aria-labelledby="new-project-type"
          aria-invalid={categoryError ? true : undefined}
          aria-describedby={categoryError ? "category-error" : undefined}
          className="flex gap-2"
        >
          {PROJECT_CATEGORIES.map(({ code, name }) => (
            <ChoiceChip key={code} name="category" value={code} checked={category === code} onChange={() => { setCategory(code); setCategoryError(""); }} className="flex-1">
              {name}
            </ChoiceChip>
          ))}
        </div>
        {categoryError && <p id="category-error" role="alert" className="-mt-2 text-caption leading-5 text-error">{categoryError}</p>}
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
      <FormDialogActions submitLabel="만들기" busy={busy} busyLabel="만드는 중…" />
    </form>
  );
}
