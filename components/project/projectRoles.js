// 프로젝트에서 맡은 역할 목록이다(H-10). 여러 개를 고를 수 있고, 화면에는 'PM·기획'처럼 이어서 보여 준다.
export const PROJECT_ROLES = ["PM", "기획", "디자인", "프론트엔드", "백엔드"];

export function formatRoles(roles) {
  return roles.join("·");
}
