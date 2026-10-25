import assert from "node:assert/strict";
import test from "node:test";
import { DOCTOR_QUIZ_BANK } from "../app/doctor-quiz.mjs";
import { STORY_QUIZ_BANK, createStoryQuiz, answerStoryQuiz, advanceStoryQuiz } from "../app/story-quiz.mjs";

test("banco Doutor contém dez questões distintas e explicações", () => {
  assert.equal(DOCTOR_QUIZ_BANK.length, 10);
  assert.equal(new Set(DOCTOR_QUIZ_BANK.map(q => q.id)).size, 10);
  for (const q of DOCTOR_QUIZ_BANK) {
    assert.equal(new Set(q.options).size, 4);
    assert.ok(q.explanation.length > 60);
    assert.ok(!STORY_QUIZ_BANK.some(old => old.id === q.id));
  }
  assert.equal(DOCTOR_QUIZ_BANK[0].options[0], "Cinismo");
  assert.equal(DOCTOR_QUIZ_BANK[9].options[0], "Ego");
});

test("quatro sorteadas sem repetição, posições variáveis e gabarito preservado", () => {
  let seed = 3921;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
  const sets = new Set(), seen = new Set(), correctSlots = new Set();
  for (let attempt = 0; attempt < 100; attempt++) {
    const quiz = createStoryQuiz(random, "doctor");
    assert.equal(quiz.questions.length, 4);
    assert.equal(new Set(quiz.questions.map(q => q.id)).size, 4);
    sets.add(quiz.questions.map(q => q.id).join(","));
    for (const q of quiz.questions) {
      seen.add(q.id);
      correctSlots.add(q.choices.findIndex(c => c.id === 0));
      assert.equal(q.choices.find(c => c.id === 0).text, q.options[0]);
      assert.equal(new Set(q.choices.map(c => c.id)).size, 4);
    }
  }
  assert.equal(seen.size, 10);
  assert.equal(correctSlots.size, 4);
  assert.ok(sets.size > 60);
  assert.equal(createStoryQuiz(random).questions.length, 3);
});

test("erro em qualquer uma das quatro interrompe o teste; quatro acertos o concluem", () => {
  for (let failAt = 0; failAt < 4; failAt++) {
    let quiz = createStoryQuiz(() => .4, "doctor");
    for (let i = 0; i < failAt; i++) quiz = advanceStoryQuiz(answerStoryQuiz(quiz, 0));
    quiz = answerStoryQuiz(quiz, 2);
    assert.equal(quiz.status, "failed");
    assert.equal(advanceStoryQuiz(quiz), quiz);
  }
  let quiz = createStoryQuiz(() => .4, "doctor");
  for (let i = 0; i < 4; i++) {
    assert.equal(quiz.status, "question");
    quiz = advanceStoryQuiz(answerStoryQuiz(quiz, 0));
    assert.equal(quiz.status, i === 3 ? "passed" : "question");
  }
});
