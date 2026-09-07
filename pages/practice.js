import { useEffect, useState } from 'react';

function normalize(str){
  return (str||'').toLowerCase().trim().replace(/[^\w\s']/g,'');
}

export default function Practice() {
  const [cloze, setCloze] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  useEffect(()=>{ fetchNext(); }, []);

  async function fetchNext(){
    setFeedback(null);
    const res = await fetch('/api/practice/today');
    const j = await res.json();
    setCloze(j.cloze || null);
    setAnswer('');
  }

  function playText(text){
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  async function submit(){
    if (!cloze) return;
    const res = await fetch('/api/practice/answer', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ clozeId: cloze.id, answer })
    });
    const j = await res.json();
    setFeedback(j);
    // 等 1.2s 自动跳下一题（如果正确或错误均下题）
    setTimeout(fetchNext, 1200);
  }

  if (!cloze) return <div className="container"><p>加载题目中，或题库为空。去 <a href="/admin/import">导入</a> 句子。</p></div>;

  return (
    <div className="container">
      <h2>听写练习</h2>
      <div style={{marginBottom:12}}>
        <button onClick={()=>playText(cloze.sentence)}>播放整句</button>
        <button onClick={()=>playText(cloze.targetWord)} style={{marginLeft:8}}>播放目标词</button>
      </div>

      <div style={{background:'#fff',padding:12,borderRadius:8}}>
        <p><strong>句子：</strong>{cloze.clozeText}</p>
        <p><em>（目标词长度：{cloze.targetWord.length}）</em></p>
        <div style={{marginTop:8}}>
          <input value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="输入要填的词"/>
          <button onClick={submit} style={{marginLeft:8}}>提交</button>
        </div>
        {feedback && (
          <div style={{marginTop:12}}>
            <div>结果： {feedback.isCorrect ? '正确 ✅' : '错误 ❌'}</div>
            <div>正确答案： {feedback.correct}</div>
            <div>当前统计： attempts={feedback.attempts} wrong={feedback.wrongCount} correct={feedback.correctCount}</div>
          </div>
        )}
      </div>
    </div>
  );
}
