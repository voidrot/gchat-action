import { describe, expect, it, beforeEach } from '@jest/globals'
import * as github from '@actions/github'
import { buildWorkflowStatusMessage } from '../src/messages/workflow.js'

describe('workflow message builder', () => {
  beforeEach(() => {
    process.env.GITHUB_REPOSITORY = 'voidrot/gchat-action'
    github.context.actor = 'voidrot'
    github.context.serverUrl = 'https://github.com'
    github.context.ref = 'refs/heads/main'
    github.context.runId = 1234
    github.context.workflow = 'CI'
  })

  it('builds success message', () => {
    const res = buildWorkflowStatusMessage('SUCCESS')
    expect(res.cardsV2).toBeDefined()
    const card = res.cardsV2![0].card as any // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(card.header.subtitle).toBe('Status: SUCCESS')
    expect(card.header.title).toBe('Workflow: CI')
    expect(card.sections[0].widgets[1].decoratedText.text).toBe('main')
  })

  it('handles empty status', () => {
    const res = buildWorkflowStatusMessage()
    const card = res.cardsV2![0].card as any // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(card.header.subtitle).toBe('Status: UNKNOWN')
  })
})
