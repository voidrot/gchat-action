import * as github from '@actions/github'
import { GoogleChatPayload } from '../api.js'

export function buildPullRequestMessage(): GoogleChatPayload {
  const { repo, actor, payload } = github.context

  const pr = payload.pull_request
  if (!pr) {
    throw new Error('Payload does not contain pull_request data')
  }

  const action = payload.action || 'updated'
  const title = pr.title
  const url = pr.html_url
  const state = pr.state

  const cardsV2 = [
    {
      cardId: 'pull_request',
      card: {
        header: {
          title: `Pull Request ${action}`,
          subtitle: `${repo.owner}/${repo.repo}#${pr.number}`,
          imageUrl:
            'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
          imageType: 'CIRCLE'
        },
        sections: [
          {
            widgets: [
              {
                decoratedText: {
                  topLabel: 'Title',
                  text: String(title),
                  button: {
                    text: 'View PR',
                    onClick: {
                      openLink: {
                        url: String(url)
                      }
                    }
                  }
                }
              },
              {
                decoratedText: {
                  topLabel: 'State',
                  text: String(state)
                }
              },
              {
                decoratedText: {
                  topLabel: 'Author',
                  text: String(actor)
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
