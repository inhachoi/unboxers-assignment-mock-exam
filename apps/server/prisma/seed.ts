import { AnswerType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const mockExamQuestions = [
  { answerType: AnswerType.objective, number: 1, correctAnswer: 3, score: 2 },
  { answerType: AnswerType.objective, number: 2, correctAnswer: 3, score: 2 },
  { answerType: AnswerType.objective, number: 3, correctAnswer: 4, score: 2.5 },
  { answerType: AnswerType.objective, number: 4, correctAnswer: 5, score: 2.5 },
  { answerType: AnswerType.objective, number: 5, correctAnswer: 3, score: 2.5 },
  { answerType: AnswerType.objective, number: 6, correctAnswer: 5, score: 2.5 },
  { answerType: AnswerType.objective, number: 7, correctAnswer: 5, score: 3 },
  { answerType: AnswerType.objective, number: 8, correctAnswer: 2, score: 3 },
  { answerType: AnswerType.objective, number: 9, correctAnswer: 3, score: 3.5 },
  { answerType: AnswerType.objective, number: 10, correctAnswer: 4, score: 3.5 },
  { answerType: AnswerType.objective, number: 11, correctAnswer: 5, score: 4 },
  { answerType: AnswerType.objective, number: 12, correctAnswer: 5, score: 4 },
  { answerType: AnswerType.objective, number: 13, correctAnswer: 2, score: 4.5 },
  { answerType: AnswerType.objective, number: 14, correctAnswer: 4, score: 5.5 },
  { answerType: AnswerType.subjective, number: 1, correctAnswer: 6, score: 3 },
  { answerType: AnswerType.subjective, number: 2, correctAnswer: 2, score: 4 },
  { answerType: AnswerType.subjective, number: 3, correctAnswer: 21, score: 4 },
  { answerType: AnswerType.subjective, number: 4, correctAnswer: 32, score: 4 },
  { answerType: AnswerType.subjective, number: 5, correctAnswer: 2, score: 4 },
  { answerType: AnswerType.subjective, number: 6, correctAnswer: 9, score: 4.5 },
  { answerType: AnswerType.subjective, number: 7, correctAnswer: 24, score: 4.5 },
  { answerType: AnswerType.subjective, number: 8, correctAnswer: 11, score: 5 },
  { answerType: AnswerType.subjective, number: 9, correctAnswer: 12, score: 6 },
  { answerType: AnswerType.subjective, number: 10, correctAnswer: 1, score: 8 },
  { answerType: AnswerType.subjective, number: 11, correctAnswer: 104, score: 8 }
];

async function main() {
  await prisma.question.deleteMany();
  await prisma.exam.deleteMany();

  await prisma.exam.create({
    data: {
      title: "모의고사 응시 테스트",
      description: "모의고사 웹앱 과제용으로 구성한 시험입니다.",
      supervisorName: "배이수",
      questions: {
        create: mockExamQuestions.map((question) => ({
          answerType: question.answerType,
          number: question.number,
          correctAnswer: question.correctAnswer,
          score: question.score
        }))
      }
    }
  });

  console.log("Seeded mock exam");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
