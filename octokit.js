const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({auth: process.env.GITHUB_TOKEN});

async function main () {
    const { data: diff } = await octokit.pulls.get({
        owner: "bbc",
        repo: "bigscreen-player",
        pull_number: 1,
        mediaType: {
          format: "diff",
        },
    });
    console.log(diff);
}

main().catch((error) => {console.log(error)});
