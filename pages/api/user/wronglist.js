import prisma from '../../../lib/prisma';

export default async function handler(req,res){
  // Return clozes sorted by wrongRate desc
  const progresses = await prisma.userClozeProgress.findMany({
    include: { cloze: { include: { sentence: true } } },
    orderBy: { wrongCount: 'desc' },
    take: 200
  });

  const items = progresses.map(p=>({
    clozeId: p.clozeId,
    attempts: p.attempts,
    wrongCount: p.wrongCount,
    correctCount: p.correctCount,
    wrongRate: p.attempts ? p.wrongCount / p.attempts : 0,
    cloze: { clozeText: p.cloze.clozeText, targetWord: p.cloze.targetWord, sentence: p.cloze.sentence.sentence }
  }));

  res.json({ items });
}
