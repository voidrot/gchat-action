import * as github from '@actions/github'
import { GoogleChatPayload } from '../api.js'

export function buildWorkflowStatusMessage(
  statusInput?: string
): GoogleChatPayload {
  const { repo, workflow, runId, actor, serverUrl, ref } = github.context
  const refName = ref.replace('refs/heads/', '').replace('refs/tags/', '')
  const runUrl = `${serverUrl}/${repo.owner}/${repo.repo}/actions/runs/${runId}`

  const status = statusInput?.toUpperCase() || 'UNKNOWN'

  const cardsV2 = [
    {
      cardId: 'workflow_status',
      card: {
        header: {
          title: `Workflow: ${workflow}`,
          subtitle: `Status: ${status}`,
          imageUrl:
            'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
          imageType: 'CIRCLE'
        },
        sections: [
          {
            widgets: [
              {
                decoratedText: {
                  topLabel: 'Repository',
                  text: `${repo.owner}/${repo.repo}`,
                  button: {
                    text: 'View Repo',
                    onClick: {
                      openLink: {
                        url: `${serverUrl}/${repo.owner}/${repo.repo}`
                      }
                    }
                  }
                }
              },
              {
                decoratedText: {
                  topLabel: 'Branch / Ref',
                  text: refName
                }
              },
              {
                decoratedText: {
                  topLabel: 'Triggered By',
                  text: actor
                }
              },
              {
                buttonList: {
                  buttons: [
                    {
                      text: 'View Run',
                      onClick: {
                        openLink: {
                          url: runUrl
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    }
  ]

  return { cardsV2 }
}
