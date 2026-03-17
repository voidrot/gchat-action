import {
  describe,
  expect,
  it,
  beforeEach,
  jest,
  afterEach
} from '@jest/globals'
import { run } from '../src/main.js'
import * as github from '@actions/github'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let fetchSpy: any

describe('main action', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stdoutSpy: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Clear all inputs
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith('INPUT_')) delete process.env[key]
    })

    process.env['INPUT_WEBHOOK_URL'] = 'https://example.com'
    process.env['INPUT_MESSAGE_TYPE'] = 'custom'
    process.env['INPUT_CUSTOM_TEXT'] = 'hello'

    process.env['GITHUB_REPOSITORY'] = 'voidrot/gchat-action'
    github.context.runId = 1234
    github.context.ref = 'refs/heads/main'
    github.context.workflow = 'CI'
    github.context.serverUrl = 'https://github.com'

    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(async () => {
      return { ok: true } as Response
    })

    stdoutSpy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    process.exitCode = 0
  })

  it('runs custom message successfully and sets time output', async () => {
    await run()
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://example.com/?messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD&threadKey=1234',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ text: 'hello' })
      })
    )
    expect(process.exitCode).toBeFalsy()
  })

  it('handles invalid message_type', async () => {
    process.env['INPUT_MESSAGE_TYPE'] = 'invalid'

    await run()
    expect(stdoutSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unsupported message_type: invalid')
    )
    expect(process.exitCode).toBe(1)
  })

  it('handles error from sendMessage', async () => {
    fetchSpy.mockRejectedValue(new Error('Network error'))

    await run()
    expect(stdoutSpy).toHaveBeenCalledWith(
      expect.stringContaining('Network error')
    )
    expect(process.exitCode).toBe(1)
  })

  it('handles non-Error thrown from sendMessage', async () => {
    fetchSpy.mockRejectedValue('String error')

    await run()
    expect(stdoutSpy).toHaveBeenCalledWith(
      expect.stringContaining('String error')
    )
    expect(process.exitCode).toBe(1)
  })

  const types = [
    'workflow_status',
    'deployment_status',
    'pull_request',
    'issue',
    'auto'
  ]

  types.forEach((type) => {
    it(`handles ${type} message_type`, async () => {
      process.env['INPUT_MESSAGE_TYPE'] = type
      if (type === 'pull_request') {
        github.context.payload = {
          pull_request: {
            number: 1,
            title: 'test',
            html_url: 'http',
            state: 'open'
          }
        }
      } else if (type === 'issue') {
        github.context.payload = {
          issue: { number: 1, title: 'test', html_url: 'http', state: 'open' }
        }
      } else {
        github.context.payload = {}
      }

      await run()
      expect(process.exitCode).toBeFalsy()
    })
  })

  it('handles disable_threading and custom thread_key', async () => {
    process.env['INPUT_MESSAGE_TYPE'] = 'custom'
    process.env['INPUT_DISABLE_THREADING'] = 'true'
    process.env['INPUT_THREAD_KEY'] = 'custom-thread-key'
    await run()
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://example.com/',
      expect.anything()
    )
  })

  it('builds card from card field inputs', async () => {
    delete process.env['INPUT_CUSTOM_TEXT']
    process.env['INPUT_MESSAGE_TYPE'] = 'custom'
    process.env['INPUT_CARD_TITLE'] = 'Deploy'
    process.env['INPUT_CARD_SUBTITLE'] = 'Production'
    process.env['INPUT_CARD_TEXT'] = 'Deployed successfully'
    process.env['INPUT_CARD_BUTTON_TEXT'] = 'View'
    process.env['INPUT_CARD_BUTTON_URL'] = 'https://example.com'

    await run()
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"cardId":"custom_card"')
      })
    )
    expect(process.exitCode).toBeFalsy()
  })

  it('includes custom_text with workflow_status message', async () => {
    process.env['INPUT_MESSAGE_TYPE'] = 'workflow_status'
    process.env['INPUT_CUSTOM_TEXT'] = 'Build triggered by cron schedule'
    process.env['INPUT_STATUS'] = 'success'
    github.context.payload = {}

    await run()
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body)
    expect(body.text).toBeUndefined()
    const firstSection = body.cardsV2[0].card.sections[0]
    expect(firstSection.widgets[0].textParagraph.text).toBe(
      'Build triggered by cron schedule'
    )
    expect(process.exitCode).toBeFalsy()
  })

  it('includes custom_text with pull_request message', async () => {
    process.env['INPUT_MESSAGE_TYPE'] = 'pull_request'
    process.env['INPUT_CUSTOM_TEXT'] = 'Needs urgent review'
    github.context.payload = {
      pull_request: {
        number: 42,
        title: 'Fix bug',
        html_url: 'https://github.com/test/pr/42',
        state: 'open'
      }
    }

    await run()
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body)
    expect(body.text).toBeUndefined()
    const firstSection = body.cardsV2[0].card.sections[0]
    expect(firstSection.widgets[0].textParagraph.text).toBe(
      'Needs urgent review'
    )
    expect(process.exitCode).toBeFalsy()
  })
})
