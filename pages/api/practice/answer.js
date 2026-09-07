import prisma from '../../../lib/prisma';

function normalize(s){
  return (s||'').toLowerCase().trim().replace(/[^\w\s']/g,'');
}

function levenshtein(a,b){
  if (!a) return b.length;
  if (!b) return a.length;
  const dp = Array.from({length:a.length+1},()=>[]);
  for (let i=0;i<=a.length;i++) dp[i][0]=i;
  for (let j=0;j<=b.length;j++) dp[0][j]=j;
  for (let i=1;i<=a.length;i++){
    for (let j=1;j<=b.length;j++){
      if (a[i-1]===b[j-1]) dp[i][j]=dp[i-1][j-1];
      else dp[i][j]=Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+1);
    }
  }
  return dp[a.length][b.length];
}

export default async function handler(req,res){
  if (req.method !== 'POST') return res.status(405).end();
  const { clozeId, answer } = req.body || {};
  if (!clozeId) return res.status(400).json({ error:'clozeId required' });
  const cloze = await prisma.cloze.findUnique({ where:{ id: Number(clozeId) }, include:{ sentence:true }});
  if (!cloze) return res.status(404).json({ error:'cloze not found' });

  const normAns = normalize(answer);
  const normTarget = normalize(cloze.targetWord);

  const dist = levenshtein(normAns, normTarget);
  const isCorrect = (normAns === normTarget) || (dist <= 1);

  // For now we use a single "global" progress (userId null). Find or create
  let progress = await prisma.userClozeProgress.findFirst({ where: { clozeId: cloze.id }});
  if (!progress){
    progress = await prisma.userClozeProgress.create({ data: { clozeId: cloze.id, attempts:0, correctCount:0, wrongCount:0 }});
  }
  const attempts = progress.attempts + 1;
  const correctCount = progress.correctCount + (isCorrect?1:0);
  const wrongCount = progress.wrongCount + (isCorrect?0:1);
  const lastReviewed = new Date();
  // simple scheduling: if correct increase intervalDays by ease (2.5 default), else set next due asap
  let ease = progress.ease || 2.5;
  let intervalDays = progress.intervalDays || 0;
  if (isCorrect){
    // bump repetitions & interval
    const reps = (progress.repetitions||0) + 1;
    intervalDays = Math.max(1, Math.round((intervalDays || 1) * ease));
    await prisma.userClozeProgress.update({
      where:{ id: progress.id },
      data:{ attempts, correctCount, wrongCount, lastReviewed, repetitions: reps, intervalDays, nextDue: new Date(Date.now()+intervalDays*24*3600*1000) }
    });
  } else {
    // wrong: reset interval and make nextDue soon
    await prisma.userClozeProgress.update({
      where:{ id: progress.id },
      data:{ attempts, correctCount, wrongCount, lastReviewed, repetitions: 0, intervalDays: 0, nextDue: new Date() }
    });
  }

  await prisma.reviewLog.create({
    data: {
      clozeId: cloze.id,
      userAnswer: answer || '',
      isCorrect,
      score: isCorrect?1:0
    }
  });

  // return feedback with updated stats
  const updated = await prisma.userClozeProgress.findUnique({ where:{ id: progress.id }});
  res.json({
    isCorrect,
    correct: cloze.targetWord,
    attempts: updated.attempts,
    correctCount: updated.correctCount,
    wrongCount: updated.wrongCount
  });
}
