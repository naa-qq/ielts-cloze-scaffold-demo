import { useState } from 'react';
import { useRouter } from 'next/router';

export default function ImportPage() {
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const router = useRouter();

  async function handleImport() {
    try {
      const data = JSON.parse(text);
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({items: data})
      });
      const j = await res.json();
      setMsg(`导入完成： inserted=${j.inserted} skipped=${j.skipped} errors=${j.errors?.length||0}`);
    } catch (e) {
      setMsg('JSON 解析失败：' + e.message);
    }
  }

  return (
    <div className="container">
      <h2>导入句子（JSON 数组）</h2>
      <p>示例字段：sentence, targetWord, occurrenceIndex (optional), translation, tags (array or comma string), audioUrl (optional), id/externalId (optional)</p>
      <textarea rows="14" style={{width:'100%'}} value={text} onChange={e=>setText(e.target.value)} placeholder='粘贴 JSON 数组，例如 [{"sentence":"...","targetWord":"..."}]'/>
      <div style={{marginTop:8}}>
        <button onClick={handleImport}>开始导入</button>
        <button style={{marginLeft:8}} onClick={()=>{ setText(''); setMsg(''); }}>清空</button>
      </div>
      <p>{msg}</p>
    </div>
  );
}
