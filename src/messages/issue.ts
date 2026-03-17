import * as github from '@actions/github'
import { GoogleChatPayload } from '../api.js'

export function buildIssueMessage(): GoogleChatPayload {
  const { repo, actor, payload } = github.context

  const issue = payload.issue
  if (!issue) {
    throw new Error('Payload does not contain issue data')
  }

  const action = payload.action || 'updated'
  const title = issue.title
  const url = issue.html_url
  const state = issue.state

  const cardsV2 = [
    {
      cardId: 'issue',
      card: {
        header: {
          title: `Issue ${action}`,
          subtitle: `${repo.owner}/${repo.repo}#${issue.number}`,
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
                    text: 'View Issue',
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
