"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import ShapeCharacter from "@/components/ui/ShapeCharacter";
import TextField from "@/components/ui/TextField";
import TextLink from "@/components/ui/TextLink";

const ROLES = ["PM", "기획", "디자인", "프론트엔드", "백엔드"];

export default function NewProjectForm({ titleId, onCancel, onCreate }) {
  const [role, setRole] = useState("기획");

  function handleSubmit(event) {
    event.preventDefault();
    const name = new FormData(event.currentTarget).get("name").trim();

    if (name) {
      onCreate({ name, role });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <ShapeCharacter shape="pentagon" color="blue" size={40} />
        <h2 id={titleId} className="text-heading tracking-[-0.44px]">
          새 프로젝트
        </h2>
      </div>
      <TextField
        label="프로젝트 이름"
        name="name"
        placeholder="예) 아이디어톤 · 캠퍼스 중고마켓"
        required
      />
      <div role="group" aria-labelledby="new-project-role" className="flex flex-col gap-1.5">
        <span id="new-project-role" className="text-label text-ink-muted">
          내 역할
        </span>
        <div className="flex flex-wrap gap-1.5">
          {ROLES.map((item) => (
            <Chip key={item} selected={item === role} onClick={() => setRole(item)}>
              {item}
            </Chip>
          ))}
        </div>
      </div>
      <p className="text-label leading-[19.5px] text-ink-subtle">
        나머지는 진행하면서 기록으로 채워요.
      </p>
      <div className="flex items-center justify-between gap-3.5 pt-1">
        <TextLink onClick={onCancel}>취소</TextLink>
        <Button type="submit">만들기</Button>
      </div>
    </form>
  );
}
