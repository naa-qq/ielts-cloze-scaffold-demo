import { useEffect, useState } from 'react';

export default function WrongList(){
  const [list, setList] = useState([]);
  useEffect(()=>{ load(); }, []);
  async function load(){
    const res = await fetch('/api/user/wronglist');
    const j = await res.json();
    setList(j.items||[]);
  }
  return (
    <div className="container">
      <h2>错题本（按错误率排序）</h2>
      {list.length===0 && <p>暂无错题。去 <a href="/practice">练习</a> 收集错题。</p>}
      <ul>
        {list.map(it=>(
          <li key={it.clozeId} style={{marginBottom:12,background:'#fff',padding:10,borderRadius:6}}>
            <div><strong>{it.cloze.clozeText}</strong></div>
            <div>目标词： {it.cloze.targetWord} | attempts: {it.attempts} | wrong: {it.wrongCount} | wrongRate: {(it.wrongRate*100).toFixed(0)}%</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
