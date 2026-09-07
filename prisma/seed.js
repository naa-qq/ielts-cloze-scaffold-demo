/**
 * 简单 seed 脚本（可选运行）
 * node prisma/seed.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const data = [
  { externalId:'s001', sentence: 'The research indicates a significant increase in renewable energy usage.', targetWord:'increase', translation:'增加', tags:'ielts,energy' },
  { externalId:'s002', sentence: 'She displayed remarkable resilience after the difficult exams.', targetWord:'resilience', translation:'韧性；恢复力', tags:'ielts,emotion' },
  { externalId:'s003', sentence: 'It is essential to maintain a balanced diet for long-term health.', targetWord:'maintain', translation:'保持', tags:'ielts,health' },
  { externalId:'s004', sentence: 'The committee will evaluate the proposals next week.', targetWord:'evaluate', translation:'评估', tags:'ielts,academic' },
  { externalId:'s005', sentence: 'Rapid urbanization has transformed the landscape of many cities.', targetWord:'urbanization', translation:'城市化', tags:'ielts,society' },
  { externalId:'s006', sentence: 'He attempted to clarify the misunderstanding during the meeting.', targetWord:'clarify', translation:'澄清', tags:'ielts,communication' },
  { externalId:'s007', sentence: 'Learning a second language can broaden cognitive abilities.', targetWord:'broaden', translation:'拓宽', tags:'ielts,education' },
  { externalId:'s008', sentence: 'The economy showed signs of recovery after the recession.', targetWord:'recovery', translation:'复苏', tags:'ielts,economy' },
  { externalId:'s009', sentence: 'Students should prioritize time management during exam season.', targetWord:'prioritize', translation:'优先考虑', tags:'ielts,study' },
  { externalId:'s010', sentence: 'The documentary highlighted the diversity of local cultures.', targetWord:'diversity', translation:'多样性', tags:'ielts,culture' }
];

async function main(){
  for (const it of data){
    const s = await prisma.sentence.upsert({
      where: { externalId: it.externalId },
      update: {},
      create: {
        externalId: it.externalId,
        sentence: it.sentence,
        translation: it.translation,
        tags: it.tags
      }
    });
    // create cloze if not exists for this sentence + target
    const exists = await prisma.cloze.findFirst({ where: { sentenceId: s.id, targetWord: it.targetWord } });
    if (!exists) {
      const target = it.targetWord;
      let count = 0;
      const regex = new RegExp(target, 'ig');
      const clozeText = it.sentence.replace(regex, (m)=>{
        count++;
        return (count === 1) ? '_____' : m;
      });
      await prisma.cloze.create({
        data: { sentenceId: s.id, targetWord: it.targetWord, clozeText, occurrenceIndex: 1 }
      });
    }
  }
  console.log('seed completed');
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=>prisma.$disconnect());
