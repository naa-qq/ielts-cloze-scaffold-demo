import prisma from '../../../lib/prisma';

export default async function handler(req,res){
  // 简单策略：随机返回一个 Cloze（可升级为 nextDue 策略）
  const cloze = await prisma.cloze.findFirst({
    include: { sentence: true },
    orderBy: { id: 'asc' }
  });
  if (!cloze) return res.json({ cloze: null });
  // return cloze with sentence text and clozeText
  res.json({ cloze: {
    id: cloze.id,
    sentence: cloze.sentence.sentence,
    clozeText: cloze.clozeText,
    targetWord: cloze.targetWord,
    occurrenceIndex: cloze.occurrenceIndex,
    translation: cloze.sentence.translation || null
  }});
}
