import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import prism from 'remark-prism';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export function getSortedPostsData() {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map(fileName => {
    const id = fileName.replace(/\.md$/, '');

    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const matterResult = matter(fileContents);

    return {
      id,
      ...(matterResult.data as { date: string; title: string })
    };
  });
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map(fileName => {
    return {
      id: fileName.replace(/\.md$/, '')
    };
  });
}

export async function getPostData(id: string) {
  const decodedId = decodeURIComponent(id);
  const fullPath = path.join(postsDirectory, `${decodedId}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .use(prism)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    id: decodedId,
    contentHtml,
    ...(matterResult.data as { date: string; title: string })
  };
}
