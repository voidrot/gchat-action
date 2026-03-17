import * as core from '@actions/core'

export interface GoogleChatPayload {
  text?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cardsV2?: any[]
}

export async function sendMessage(
  webhookUrl: string,
  payload: GoogleChatPayload,
  threadKey?: string,
  disableThreading?: boolean
): Promise<void> {
  const url = new URL(webhookUrl)

  if (!disableThreading && threadKey) {
    url.searchParams.append(
      'messageReplyOption',
      'REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD'
    )
    url.searchParams.append('threadKey', threadKey)
  }

  core.debug(`Sending message to Google Chat threadKey: ${threadKey}`)

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `Failed to send message: ${response.status} ${response.statusText} - ${errorBody}`
    )
  }
}
