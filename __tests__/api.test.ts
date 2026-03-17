import { describe, expect, it, afterEach, jest } from '@jest/globals'
import { sendMessage } from '../src/api.js'

describe('api client', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('sends message and appends threadKey successfully', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockImplementation(async () => {
        return { ok: true } as Response
      })

    await sendMessage(
      'https://example.com/webhook',
      { text: 'hello' },
      'thread-123'
    )

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://example.com/webhook?messageReplyOption=REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD&threadKey=thread-123',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ text: 'hello' })
      })
    )
  })

  it('sends message without threading parameter if disableThreading is true', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockImplementation(async () => {
        return { ok: true } as Response
      })

    await sendMessage(
      'https://example.com/webhook',
      { text: 'hello' },
      'thread-123',
      true
    )

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://example.com/webhook',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ text: 'hello' })
      })
    )
  })

  it('throws an error when not ok', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(async () => {
      return {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Invalid payload'
      } as Response
    })

    await expect(
      sendMessage('https://example.com/webhook', { text: 'hello' })
    ).rejects.toThrow(
      'Failed to send message: 400 Bad Request - Invalid payload'
    )
  })
})
