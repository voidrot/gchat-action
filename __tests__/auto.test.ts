import { describe, expect, it, beforeEach } from '@jest/globals'
import * as github from '@actions/github'
import { buildAutoMessage } from '../src/messages/auto.js'

describe('auto message builder', () => {
  beforeEach(() => {
    process.env.GITHUB_REPOSITORY = 'voidrot/gchat-action'
    github.context.actor = 'voidrot'
    github.context.serverUrl = 'https://github.com'
    github.context.ref = 'refs/heads/main'
    github.context.runId = 1
    github.context.workflow = 'CI'
  })

  it('routes to deployment', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(github as any).context.eventName = 'deployment'
    github.context.payload = {
      deployment_status: { state: 'success' },
      deployment: { environment: 'production' }
    }
    const res = buildAutoMessage('SUCCESS')
    expect(res.cardsV2).toBeDefined()
    expect(res.cardsV2![0].cardId).toBe('deployment_status')
  })

  it('routes to pr', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(github as any).context.eventName = 'pull_request'
    github.context.payload = {
      action: 'opened',
      pull_request: {
        number: 42,
        title: 'Add new feature',
        html_url: 'https://github.com/voidrot/gchat-action/pull/42',
        state: 'open'
      }
    }
    const res = buildAutoMessage('SUCCESS')
    expect(res.cardsV2).toBeDefined()
    expect(res.cardsV2![0].cardId).toBe('pull_request')
  })

  it('routes to issue', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(github as any).context.eventName = 'issues'
    github.context.payload = {
      action: 'opened',
      issue: {
        number: 1,
        title: 'Bug report',
        html_url: 'https://github.com/voidrot/gchat-action/issues/1',
        state: 'open'
      }
    }
    const res = buildAutoMessage()
    expect(res.cardsV2).toBeDefined()
    expect(res.cardsV2![0].cardId).toBe('issue')
  })

  it('routes to workflow status by default', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(github as any).context.eventName = 'push'
    github.context.payload = {}
    const res = buildAutoMessage('FAILURE')
    expect(res.cardsV2).toBeDefined()
    expect(res.cardsV2![0].cardId).toBe('workflow_status')
  })
})
