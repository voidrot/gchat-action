import { describe, expect, it, beforeEach } from '@jest/globals'
import * as github from '@actions/github'
import { buildDeploymentStatusMessage } from '../src/messages/deployment.js'

describe('deployment message builder', () => {
  beforeEach(() => {
    process.env.GITHUB_REPOSITORY = 'voidrot/gchat-action'
    github.context.actor = 'voidrot'
    github.context.serverUrl = 'https://github.com'
    github.context.payload = {
      deployment: { environment: 'production' },
      deployment_status: {
        state: 'success',
        environment_url: 'https://example.com'
      }
    }
  })

  it('builds message with explicit status', () => {
    const res = buildDeploymentStatusMessage('SUCCESS')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const card = res.cardsV2![0].card as any
    expect(card.header.subtitle).toBe('Status: SUCCESS')
    expect(card.header.title).toBe('Deployment: production')
    expect(card.sections[0].widgets[1].decoratedText.text).toBe(
      'https://example.com'
    )
  })

  it('builds message relying on payload status', () => {
    const res = buildDeploymentStatusMessage()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const card = res.cardsV2![0].card as any
    expect(card.header.subtitle).toBe('Status: SUCCESS')
  })

  it('builds message with missing environment_url and deployment environment', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(github as any).context.payload = {
      deployment_status: { state: 'success' },
      deployment: {}
    }
    const res = buildDeploymentStatusMessage()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const card = res.cardsV2![0].card as any
    expect(card.header.title).toBe('Deployment: Unknown')
    expect(card.sections[0].widgets[1].decoratedText.text).toBe(
      'Unknown Environment'
    )
  })

  it('builds message with completely missing payload', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(github as any).context.payload = {}
    const res = buildDeploymentStatusMessage()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const card = res.cardsV2![0].card as any
    expect(card.header.subtitle).toBe('Status: UNKNOWN')
  })
})
