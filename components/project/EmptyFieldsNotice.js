import BlankFieldsNotice from "@/components/ui/BlankFieldsNotice";
import { RECORD_FIELDS } from "./recordFields";

// fieldKeys를 주면 그 칸만 살핀다. 칸을 채우면 안내에서 바로 빠지도록 입력값으로 계산한다(H-14).
export default function EmptyFieldsNotice({ fields, fieldKeys }) {
  const emptyLabels = RECORD_FIELDS
    .filter(({ key }) => (!fieldKeys || fieldKeys.includes(key)) && !fields[key]?.trim())
    .map(({ formLabel }) => formLabel);

  return <BlankFieldsNotice labels={emptyLabels} />;
}
