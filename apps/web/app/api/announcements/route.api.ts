import { Octokit } from 'octokit';

export const runtime = 'edge';
export const revalidate = 60 * 10;

const token = process.env.DISCUSSION_TOKEN;
const repo = process.env.DISCUSSION_REPOSITORY;
const octokit = new Octokit({
  auth: token
});

export async function GET() {
  if (!repo || !token) {
    return Response.json(
      { error: 'DISCUSSION_REPOSITORY and DISCUSSION_TOKEN must be set' },
      { status: 400 }
    );
  }

  try {
    const discussions = await octokit.graphql<{
      search: {
        nodes: { __typename: string; url: string; title: string; id: string }[];
      };
    }>(
      `
    query ($searchQuery: String!) {
  search(type: DISCUSSION, query: $searchQuery, first: 5) {
    nodes {
      __typename
      ... on Discussion {
        url
        title
        id
      }
    }
  }
}
    `,
      {
        searchQuery: `repo:${repo} is:open label:pinned category:announcements`
      }
    );

    return Response.json(discussions.search.nodes);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: 'Failed to fetch discussions' },
      { status: 500 }
    );
  }
}
