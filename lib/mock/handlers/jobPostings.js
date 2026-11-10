import { failure, invalid, notFound } from "../mockResponse.js";
import { MATCHING_SAMPLE } from "../matching.js";
import { mentionsCompetency } from "../matchingKeywords.js";
import { newId, text } from "../projectModel.js";

// 36~39. 자소서 매칭: 공고 저장·역량 찾기, 문항별 답 초안, 고친 답 저장, 매칭 결과 조회.
// AI 대신 낱말로 역량을 찾고(matchingKeywords.js), 카드에 있는 내용만 이어 붙여 초안을 만든다.
// 카드에 없는 상황·행동·이유·결과·배운 점은 지어내지 않고 빈칸으로 남긴다(M-10).
const POSTING_TEXT_FIELDS = ["postingText", "jd", "preferredQualification", "companyInfo"];
const MAX_QUESTION_COMPETENCIES = 3;

// 빈칸 안내 문구다. 결과 문구는 기능명세서(M-10) 예시를 따른다.
const BLANK_HINTS = {
  situation: "상황 · 어떤 상황이었는지 채워 주세요",
  action: "행동 · 내가 한 일을 채워 주세요",
  reason: "이유 · 왜 그렇게 했는지 채워 주세요",
  result: "결과 · 숫자나 받은 반응을 채워 주세요",
  learned: "배운 점 · 이 경험으로 배운 것을 채워 주세요",
};
const STORY_SLOTS = ["situation", "action", "reason", "result"];

// 고친 답의 글자 수다. 화면처럼 [빈칸]은 빼고 센다(M-11).
export const countAnswerCharacters = (value) => value.replace(/\[[^\]]*\]/g, "").length;

const publishedCards = (state) => Object.values(state.cards).filter((card) => card.status === "PUBLISHED");
const cardsWith = (state, competencyId) => publishedCards(state).filter((card) => card.competencies.some(({ id }) => id === competencyId));

// 공고 문장을 줄 단위로 나눈다. '- ' 같은 머리표와 '[주요 업무]' 같은 제목 줄은 뺀다.
function postingLines(values) {
  return values.join("\n").split("\n")
    .map((line) => line.replace(/^[\s\-•*·]+/, "").trim())
    .filter((line) => line && !/^\[[^\]]*\]$/.test(line));
}

// 공고에서 찾은 역량(M-06): 고정 목록 순서대로, 처음 나온 문장을 근거로 붙인다. 카드 수는 공개된 카드만 센다.
function findPostingCompetencies(state, tags, lines) {
  return tags.flatMap(({ id, name }) => {
    const quote = lines.find((line) => mentionsCompetency(line, name));
    return quote ? [{ competencyId: id, name, evidenceQuote: quote, cardCount: cardsWith(state, id).length }] : [];
  });
}

// 문항이 묻는 역량: 문항 문장에서 찾고, 못 찾으면 공고 역량 앞의 2개를 쓴다.
function findQuestionCompetencies(tags, content, postingCompetencies) {
  const found = tags.filter(({ name }) => mentionsCompetency(content, name)).map(({ id }) => id);
  return (found.length ? found : postingCompetencies.slice(0, 2).map(({ competencyId }) => competencyId)).slice(0, MAX_QUESTION_COMPETENCIES);
}

// 문항 역량과 태그가 많이 겹치는 카드 먼저, 같으면 채워진 칸이 많은 카드, 최근 카드 순이다(M-08, H-22).
function rankCards(state, competencyIds) {
  const filled = (card) => [...STORY_SLOTS, "learned"].filter((key) => text(card[key])).length;
  return publishedCards(state)
    .map((card) => ({ card, overlap: card.competencies.filter(({ id }) => competencyIds.includes(id)).length }))
    .filter(({ overlap }) => overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || filled(b.card) - filled(a.card) || (b.card.weekNumber ?? 99) - (a.card.weekNumber ?? 99))
    .map(({ card }) => card);
}

const cardSummary = (card, no) => ({
  no, role: no === 1 ? "MAIN" : "SUB", cardId: card.cardId, type: card.type, title: card.title,
  weekNumber: card.weekNumber ?? null, projectName: card.projectName ?? null,
});

// 37번 응답. 한 줄 소개 → 상황 → 행동 → 이유 → 결과 → 다른 경험 연결 → 배운 점 → 지원 회사 연결(M-08).
function buildAnswer(state, question, posting, tags) {
  const [main, sub] = rankCards(state, question.competencyIds);
  const missingCompetencies = question.competencyIds
    .filter((id) => !cardsWith(state, id).length)
    .map((id) => ({ competencyId: id, name: tags.find((tag) => tag.id === id)?.name ?? "" }));
  if (!main) {
    return { questionId: question.questionId, segments: [], charCount: 0, blankCount: 0, cards: [], usesJobPosting: false, missingCompetencies, noMatchingCard: true };
  }
  const fromCard = (card, key, source) => (text(card[key]) ? { type: "text", text: text(card[key]), source } : { type: "blank", slot: key, hint: BLANK_HINTS[key] });
  const segments = [
    { type: "text", text: `'${main.title}' 경험을 말씀드리겠습니다.`, source: 1 },
    ...STORY_SLOTS.map((key) => fromCard(main, key, 1)),
    ...(sub ? [{ type: "text", text: `'${sub.title}'에서도 비슷한 경험을 했습니다.${text(sub.action) ? ` ${text(sub.action)}` : ""}`, source: 2 }] : []),
    fromCard(main, "learned", 1),
  ];
  const company = posting.company ?? "지원 회사";
  const usesJobPosting = POSTING_TEXT_FIELDS.some((key) => posting[key]) || posting.attachmentIds.length > 0;
  if (usesJobPosting) segments.push({ type: "text", text: `${company}에서 ${posting.department ?? "이 직무"} 업무를 맡게 된다면 이 경험을 바탕으로 기여하겠습니다.`, source: 3 });
  const texts = segments.filter(({ type }) => type === "text").map(({ text: value }) => value);
  return {
    questionId: question.questionId, segments,
    charCount: texts.join(" ").length, blankCount: segments.length - texts.length,
    cards: [main, sub].filter(Boolean).map((card, index) => cardSummary(card, index + 1)),
    usesJobPosting, missingCompetencies, noMatchingCard: false,
  };
}

function validQuestions(questions) {
  return Array.isArray(questions) && questions.length > 0 && questions.every((question) => question && typeof question === "object" &&
    text(question.content) && (question.charLimit === undefined || question.charLimit === null || (Number.isInteger(question.charLimit) && question.charLimit > 0)));
}

// 39번 응답. 지운 카드는 '이 답에 쓴 기록'에서 뺀다(카드를 지우면 추천 연결도 함께 지워짐).
function publicPosting(state, posting) {
  return {
    jobPostingId: posting.jobPostingId,
    ...Object.fromEntries(["company", "department", ...POSTING_TEXT_FIELDS].map((key) => [key, posting[key]])),
    attachments: posting.attachmentIds.map((attachmentId) => state.attachments[attachmentId]?.data).filter(Boolean)
      .map(({ attachmentId, type, name, url, extractStatus }) => ({ attachmentId, type, ...(type === "LINK" ? { url } : { name }), extractStatus })),
    competencies: posting.competencies.map((item) => ({ ...item, cardCount: cardsWith(state, item.competencyId).length })),
    questions: posting.questionIds.map((questionId) => {
      const { seq, content, charLimit, competencyIds, answer, editedAnswer } = state.coverLetterQuestions[questionId];
      return { questionId, seq, content, charLimit, competencyIds, editedAnswer,
        answer: answer && { ...answer, cards: answer.cards.filter(({ cardId }) => state.cards[cardId]) } };
    }),
  };
}

export function handleJobPostings({ split, id, method, body, state, save, tags, resolveAttachments, pending, pendingError }) {
  if (split[0] === "job-postings") {
    // 36. 공고 저장·역량 찾기 🤖
    if (split.length === 1 && method === "POST") {
      const attachmentIds = body.attachmentIds ?? [];
      if (!validQuestions(body.questions)) return invalid({ questions: "자소서 문항을 하나 이상 넣어 주세요." });
      if (!resolveAttachments(attachmentIds) || attachmentIds.some((aid) => state.attachments[aid].data.category !== "JOB_POSTING")) {
        return invalid({ attachmentIds: "공고 첨부를 확인해 주세요." });
      }
      if (pending(attachmentIds)) return pendingError();
      const posting = {
        company: text(body.company), department: text(body.department),
        ...Object.fromEntries(POSTING_TEXT_FIELDS.map((key) => [key, text(body[key])])),
        attachmentIds,
      };
      // 본문을 읽은 첨부(DONE)만 공고 내용으로 친다. 읽지 못한 링크만 있으면 실행하지 않는다(M-02, M-05).
      const readable = attachmentIds.filter((aid) => state.attachments[aid].data.extractStatus === "DONE");
      if (!POSTING_TEXT_FIELDS.some((key) => posting[key]) && !readable.length) {
        return failure(400, "EMPTY_MATERIAL", "공고 내용을 붙여 넣거나 본문을 읽을 수 있는 파일·링크를 올려 주세요.");
      }
      // mock은 첨부 본문을 읽지 않으므로, 읽은 첨부는 예시 공고 내용이 들어 있는 것으로 본다.
      const sample = readable.length ? [MATCHING_SAMPLE.jd, MATCHING_SAMPLE.preferences, MATCHING_SAMPLE.companyInfo] : [];
      const lines = postingLines([...POSTING_TEXT_FIELDS.map((key) => posting[key] ?? ""), ...sample]);
      const competencies = findPostingCompetencies(state, tags, lines);
      const jobPostingId = newId(state);
      const questions = body.questions.map((question, index) => {
        const item = {
          questionId: newId(state), jobPostingId, seq: index + 1, content: text(question.content), charLimit: question.charLimit ?? null,
          competencyIds: findQuestionCompetencies(tags, question.content, competencies), answer: null, editedAnswer: null,
        };
        state.coverLetterQuestions[item.questionId] = item;
        return item;
      });
      state.jobPostings[jobPostingId] = { jobPostingId, ...posting, competencies: competencies.map(({ cardCount, ...item }) => item), questionIds: questions.map(({ questionId }) => questionId) };
      return save({
        jobPostingId, competencies, noCompetencyFound: competencies.length === 0,
        questions: questions.map(({ questionId, seq, content, charLimit, competencyIds }) => ({ questionId, seq, content, charLimit, competencyIds })),
      }, 201);
    }
    // 39. 매칭 결과 조회
    if (split.length === 2 && method === "GET") {
      const posting = state.jobPostings[id];
      return posting ? save(publicPosting(state, posting)) : notFound();
    }
    return undefined;
  }

  if (split[0] !== "cover-letter-questions") return undefined;
  const question = state.coverLetterQuestions[id];
  if (!question) return split.length <= 3 ? notFound() : undefined;
  // 37. 문항별 답 초안 만들기 🤖. 다시 부르면 초안을 새로 만들고 직접 고친 답은 비운다.
  if (split.length === 3 && split[2] === "answer" && method === "POST") {
    question.answer = buildAnswer(state, question, state.jobPostings[question.jobPostingId], tags);
    question.editedAnswer = null;
    return save(question.answer);
  }
  // 38. 고친 답 저장. null이면 AI 초안으로 되돌린다.
  if (split.length === 2 && method === "PATCH") {
    const { editedAnswer } = body;
    if (editedAnswer !== null && !text(editedAnswer)) return invalid({ editedAnswer: "고친 답을 입력하거나 null로 되돌려 주세요." });
    if (!question.answer) return failure(409, "INVALID_STATE", "답 초안을 먼저 만들어 주세요.");
    question.editedAnswer = editedAnswer;
    const charCount = editedAnswer === null ? question.answer.charCount : countAnswerCharacters(editedAnswer);
    return save({ questionId: question.questionId, editedAnswer, charCount });
  }
  return undefined;
}
