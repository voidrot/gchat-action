import { describe, expect, it, beforeEach } from '@jest/globals'
import * as github from '@actions/github'
import { buildPullRequestMessage } from '../src/messages/pull_request.js'

describe('pr message builder', () => {
  beforeEach(() => {
    process.env.GITHUB_REPOSITORY = 'voidrot/gchat-action'
    github.context.actor = 'voidrot'
    github.context.payload = {
      action: 'opened',
      pull_request: {
        number: 42,
        title: 'Add new feature',
        html_url: 'https://github.com/voidrot/gchat-action/pull/42',
        state: 'open'
      }
    }
  })

  it('builds message', () => {
    const res = buildPullRequestMessage()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const card = res.cardsV2![0].card as any
    expect(card.header.title).toBe('Pull Request opened')
    expect(card.header.subtitle).toBe('voidrot/gchat-action#42')
    expect(card.sections[0].widgets[0].decoratedText.text).toBe(
      'Add new feature'
    )
  })

  it('builds message when action is omitted (defaults to updated)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (github.context.payload as any).action
    const res = buildPullRequestMessage()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const card = res.cardsV2![0].card as any
    expect(card.header.title).toBe('Pull Request updated')
  })

  it('throws without pr payload', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(github as any).context.payload = {}
    expect(() => buildPullRequestMessage()).toThrow(
      /Payload does not contain pull_request data/
    )
  })
})
