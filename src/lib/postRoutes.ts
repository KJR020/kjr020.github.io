type PostRouteEntry = {
  id: string;
  data: {
    draft?: boolean;
  };
};

export function createPublishedPostStaticPaths<TPost extends PostRouteEntry>(posts: TPost[]) {
  return posts
    .filter((post) => !post.data.draft)
    .map((post) => ({
      params: { slug: post.id },
      props: { post },
    }));
}
