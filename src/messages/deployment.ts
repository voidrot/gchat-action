import * as github from '@actions/github'
import { GoogleChatPayload } from '../api.js'

export function buildDeploymentStatusMessage(
  statusInput?: string
): GoogleChatPayload {
  const { repo, actor, serverUrl, payload } = github.context

  const status =
    statusInput?.toUpperCase() ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (payload.deployment_status as any)?.state?.toUpperCase() ||
    'UNKNOWN'

  const envUrl =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (payload.deployment_status as any)?.environment_url ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (payload.deployment as any)?.environment ||
    'Unknown Environment'

  const cardsV2 = [
    {
      cardId: 'deployment_status',
      card: {
        header: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          title: `Deployment: ${(payload.deployment as any)?.environment || 'Unknown'}`,
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
                  topLabel: 'Environment URL',
                  text: String(envUrl)
                }
              },
              {
                decoratedText: {
                  topLabel: 'Deployer',
                  text: actor
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
