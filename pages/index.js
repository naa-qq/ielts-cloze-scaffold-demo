import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <h1>IELTS Cloze Practice - 骨架</h1>
      <p>快捷入口：</p>
      <ul>
        <li><Link href="/admin/import">管理员导入页</Link></li>
        <li><Link href="/practice">练习页</Link></li>
        <li><Link href="/wronglist">错题本</Link></li>
      </ul>
      <p>说明：/admin/import 可粘贴 JSON 批量导入句子。练习页使用浏览器内建 TTS 播放整句。</p>
    </div>
  );
}
