import { getPostData, getAllPostIds } from '@/lib/posts';
import '@/styles/globals.css';

type Params = {
  params: {
    id: string;
  };
};

export async function generateStaticParams() {
  const paths = getAllPostIds();
  return paths.map(path => ({ params: { id: path.id } }));
}

type Props = {
  params: { id: string };
};

export default async function Post({ params }: Props) {
  const postData = await getPostData(params.id);

  return (
    <div className="container">
      <article>
        <h1>{postData.title}</h1>
        <div>{postData.date}</div>
        <div className="article-content" dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </div>
  );
}
