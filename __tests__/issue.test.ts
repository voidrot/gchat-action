import { describe, expect, it, beforeEach } from '@jest/globals'
import * as github from '@actions/github'
import { buildIssueMessage } from '../src/messages/issue.js'

describe('issue message builder', () => {
  beforeEach(() => {
    process.env.GITHUB_REPOSITORY = 'voidrot/gchat-action'
    github.context.actor = 'voidrot'
    github.context.payload = {
      action: 'closed',
      issue: {
        number: 1,
        title: 'Bug',
        html_url: 'https://github.com/voidrot/gchat-action/issues/1',
        state: 'closed'
      }
    }
  })

  it('builds message', () => {
    const res = buildIssueMessage()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const card = res.cardsV2![0].card as any
    expect(card.header.title).toBe('Issue closed')
    expect(card.header.subtitle).toBe('voidrot/gchat-action#1')
    expect(card.sections[0].widgets[0].decoratedText.text).toBe('Bug')
  })

  it('builds message when action is omitted (defaults to updated)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (github.context.payload as any).action
    const res = buildIssueMessage()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const card = res.cardsV2![0].card as any
    expect(card.header.title).toBe('Issue updated')
  })

  it('throws without issue payload', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(github as any).context.payload = {}
    expect(() => buildIssueMessage()).toThrow(
      /Payload does not contain issue data/
    )
  })
})
