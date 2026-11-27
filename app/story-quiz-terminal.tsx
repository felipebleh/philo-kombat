"use client";

import { useEffect, useRef } from "react";
import { createStoryQuiz } from "./story-quiz.mjs";

type Quiz = ReturnType<typeof createStoryQuiz>;
export function StoryQuizTerminal({ quiz, philosopherName, onAnswer, onContinue }: {
  quiz: Quiz;
  philosopherName: string;
  onAnswer: (choice: number) => void;
  onContinue: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const question = quiz.questions[quiz.index];
  const answered = quiz.status !== "question";
  const failed = quiz.status === "failed";
  const doctor = quiz.campaign === "doctor";
  const grand = quiz.campaign === "grand";
  const total = quiz.questions.length;
  const last = quiz.index === total - 1;
  useEffect(() => { heading.current?.focus(); }, [question.id, quiz.status]);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      const number = Number(event.key);
      if (!answered && number >= 1 && number <= 4) {
        event.preventDefault();
        onAnswer(question.choices[number - 1].id);
      } else if (answered && event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) {
        event.preventDefault();
        onContinue();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [answered, question, onAnswer, onContinue]);

  return (
    <section className="story-quiz-terminal" aria-label="Desafio da Superinteligência">
      <div className="quiz-terminal-screen">
        <header className="quiz-terminal-header"><span>PHILO OS</span><span>SUPERINTELIGÊNCIA / TESTE DE ACESSO</span></header>
        <p className="quiz-command">C:\PENSAMENTO&gt; recuperar --filosofos{grand ? " --nivel=grande-filosofo" : doctor ? " --nivel=doutor" : ""}</p>
        <div className="quiz-terminal-progress" aria-label={`Pergunta ${quiz.index + 1} de ${total}`}>
          <span>PERGUNTA {quiz.index + 1}/{total}</span><span>{quiz.index + (quiz.status === "correct" ? 1 : 0)}/{total} ACERTOS</span>
        </div>
        <h2 ref={heading} tabIndex={-1}>{question.prompt}</h2>
        <p className="quiz-terminal-instructions">{grand ? "Acerte as cinco para liberar o confronto final do Grande Filósofo." : doctor ? "Acerte as quatro para concluir o teste do Doutor." : "Acerte as três para liberar a luta final."} Use 1–4 ou clique na resposta.</p>
        <div className="quiz-terminal-options">
          {question.choices.map((choice, index) => (
            <button type="button" key={choice.id} disabled={answered} onClick={() => onAnswer(choice.id)}
              className={answered ? choice.id === 0 ? "is-correct" : choice.id === quiz.selected ? "is-wrong" : "" : ""}>
              <span>[{index + 1}]</span><span>{choice.text}{answered && choice.id === 0 ? " · CORRETA" : answered && choice.id === quiz.selected ? " · SUA RESPOSTA" : ""}</span>
            </button>
          ))}
        </div>
        {answered && <div className={`quiz-terminal-feedback ${failed ? "is-failed" : ""}`} role="status">
          <strong>{failed ? "ACESSO NEGADO" : last ? `${doctor ? "TESTE CONCLUÍDO" : "ACESSO AUTORIZADO"} · ${total}/${total} ACERTOS` : "PENSAMENTO RECUPERADO"}</strong>
          {failed && <p>“Você venceu o filósofo… mas ainda não recuperou seu pensamento.”</p>}
          <p>{question.explanation}</p>
          {failed && <p>{grand ? "Reveja a explicação e tente um novo desafio com cinco questões sorteadas." : doctor ? "Reveja a explicação e tente um novo desafio com quatro questões sorteadas." : `Enfrente ${philosopherName} novamente e reveja seu pensamento. Depois, tente um novo quiz.`}</p>}
          <button type="button" onClick={onContinue}>{failed ? (doctor || grand) ? "TENTAR NOVO DESAFIO" : `VOLTAR A ${philosopherName.toUpperCase()}` : last ? doctor ? "CONTINUAR" : "ENFRENTAR A SUPERINTELIGÊNCIA" : "PRÓXIMA PERGUNTA"}</button>
        </div>}
        <footer>C:\PENSAMENTO&gt; <span className="quiz-terminal-cursor" aria-hidden="true">_</span></footer>
      </div>
    </section>
  );
}
