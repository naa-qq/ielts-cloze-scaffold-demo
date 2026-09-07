import prisma from '../../lib/prisma';

/**
 * POST body: { items: [ { externalId?, sentence, targetWord, occurrenceIndex?, translation?, tags?, audioUrl? } ] }
 */
export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).end();
  const { items } = req.body || {};
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items must be array' });

  const inserted = [];
  const skipped = [];
  const errors = [];

  for (const it of items){
    try {
      if (!it.sentence || !it.targetWord) { errors.push({it, reason:'missing sentence or targetWord'}); continue; }
      // ensure targetWord exists in sentence (simple check)
      const occ = it.occurrenceIndex ? Number(it.occurrenceIndex) : 1;
      const lower = it.sentence.toLowerCase();
      const target = it.targetWord.toLowerCase();
      const idx = [...lower.matchAll(new RegExp(target, 'g'))][occ-1];
      if (!idx) {
        errors.push({it, reason:'targetWord not found at occurrenceIndex'});
        continue;
      }
      // check duplicate by externalId or exact sentence+target
      const whereClause = it.externalId ? { externalId: it.externalId } : { sentence: it.sentence, targetWord: it.targetWord };
      const exists = await prisma.sentence.findFirst({
        where: it.externalId ? { externalId: it.externalId } : { sentence: it.sentence },
      });
      if (exists && it.externalId) { skipped.push(it); continue; }

      // create sentence (if not exists)
      let sentenceRec = exists;
      if (!sentenceRec) {
        sentenceRec = await prisma.sentence.create({
          data: {
            externalId: it.externalId,
            sentence: it.sentence,
            translation: it.translation || null,
            tags: Array.isArray(it.tags) ? it.tags.join(',') : (it.tags || null),
            audioUrl: it.audioUrl || null
          }
        });
      }

      // build clozeText
      const targetWord = it.targetWord;
      const occurrenceIndex = occ;
      // naive replace only the nth occurrence with underscores
      let clozeText = it.sentence;
      let count = 0;
      clozeText = clozeText.replace(new RegExp(targetWord, 'ig'), (m)=>{
        count++;
        if (count === occurrenceIndex) return '_____';
        return m;
      });

      await prisma.cloze.create({
        data: {
          sentenceId: sentenceRec.id,
          targetWord: targetWord,
          occurrenceIndex: occurrenceIndex,
          clozeText: clozeText
        }
      });

      inserted.push(it);
    } catch (e) {
      errors.push({it, reason: e.message});
    }
  }

  res.json({ inserted: inserted.length, skipped: skipped.length, errors });
}
