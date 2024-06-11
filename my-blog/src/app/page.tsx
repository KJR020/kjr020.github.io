import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';

// データフェッチ関数
async function fetchPostsData() {
  const allPostsData = getSortedPostsData();
  return allPostsData;
}

export default async function Home() {
  const allPostsData = await fetchPostsData();

  return (
    <div>
      <h1>Blog</h1>
      <ul>
        {allPostsData.map(({ id, date, title }) => (
          <li key={id}>
            <Link href={`/posts/${id}`}>
              {title}
            </Link>
            <br />
            <small>{date}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
