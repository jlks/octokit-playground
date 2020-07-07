const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({auth: process.env.GITHUB_TOKEN});

async function main (changes) {
  const owner = 'jlks'
  const repo = 'playground-test-repo'
  const base = 'master'
  const head = 'master'

    let response

    if (!base) {
      response = await octokit.repos.get({ owner, repo })
      // tslint:disable-next-line:no-parameter-reassignment
      base = response.data.default_branch
    }
  
    response = await octokit.repos.listCommits({
      owner,
      repo,
      sha: base,
      per_page: 1
    })

    const path = 'package.json'
    var latestCommitSha = response.data[0].sha

    const { data: { sha, content } } = await octokit.repos.getContents({ owner, repo, path })

    const packageData = JSON.parse(Buffer.from(content, 'base64').toString())
    console.log(packageData.version)
    packageData.version = '0.0.2'
    // Do not need to base64 encode data like this!
    // path: base64 encodedcontent - not needed!
    const newContent = Buffer.from(JSON.stringify(packageData, null, 2)).toString('base64')
    const treeSha = response.data[0].commit.tree.sha


    response = await octokit.git.createTree({
      owner,
      repo,
      base_tree: treeSha,
      tree: [{
        path,
        mode: '100644',
        content: JSON.stringify(packageData, null, 2).concat('\n') 
      }]
    })
    const newTreeSha = response.data.sha

    console.log(JSON.stringify(response.data.sha, null, 2))


  response = await octokit.git.createCommit({
    owner,
    repo,
    message: 'update package.json',
    tree: newTreeSha,
    parents: [latestCommitSha]
  })

  latestCommitSha = response.data.sha

  console.log(`New commit sha: ${latestCommitSha}`)

  response = await octokit.git.updateRef({
    owner,
    repo,
    sha: latestCommitSha,
    ref: `heads/${head}`,
    force: true
  })

  console.log('updateRefResponse')
  console.log(JSON.stringify(response))
}

main().catch((error) => {console.log(error)});
