import * as core from '@actions/core'
import * as github from '@actions/github'
import { sendMessage, GoogleChatPayload } from './api.js'
import { buildCustomMessage } from './messages/custom.js'

import { buildWorkflowStatusMessage } from './messages/workflow.js'
import { buildDeploymentStatusMessage } from './messages/deployment.js'
import { buildPullRequestMessage } from './messages/pull_request.js'
import { buildIssueMessage } from './messages/issue.js'
import { buildAutoMessage } from './messages/auto.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const webhookUrl: string = core.getInput('webhook_url', { required: true })
    const messageType: string = core.getInput('message_type', {
      required: true
    })
    const status: string = core.getInput('status')
    const customText: string = core.getInput('custom_text')
    const customCardsV2: string = core.getInput('custom_cards_v2')
    const cardTitle: string = core.getInput('card_title')
    const cardSubtitle: string = core.getInput('card_subtitle')
    const cardImageUrl: string = core.getInput('card_image_url')
    const cardText: string = core.getInput('card_text')
    const cardButtonText: string = core.getInput('card_button_text')
    const cardButtonUrl: string = core.getInput('card_button_url')
    const disableThreadingInput: string = core.getInput('disable_threading')
    const disableThreading = disableThreadingInput === 'true'

    let threadKey: string | undefined = core.getInput('thread_key')
    if (!threadKey) {
      // By default use runId so successive stages in same workflow thread together
      threadKey = github.context.runId.toString()
    }

    let payload: GoogleChatPayload

    switch (messageType) {
      case 'auto':
        payload = buildAutoMessage(status)
        break
      case 'workflow_status':
        payload = buildWorkflowStatusMessage(status)
        break
      case 'deployment_status':
        payload = buildDeploymentStatusMessage(status)
        break
      case 'pull_request':
        payload = buildPullRequestMessage()
        break
      case 'issue':
        payload = buildIssueMessage()
        break
      case 'custom':
        payload = buildCustomMessage(customText, customCardsV2, {
          title: cardTitle || undefined,
          subtitle: cardSubtitle || undefined,
          imageUrl: cardImageUrl || undefined,
          text: cardText || undefined,
          buttonText: cardButtonText || undefined,
          buttonUrl: cardButtonUrl || undefined
        })
        break
      default:
        throw new Error(`Unsupported message_type: ${messageType}`)
    }

    // Allow custom_text on any message type (custom type handles it internally)
    // Google Chat webhooks ignore top-level `text` when cardsV2 is present,
    // so we inject it as a textParagraph widget inside the card.
    if (customText && messageType !== 'custom' && payload.cardsV2?.length) {
      const card = payload.cardsV2[0].card
      const customSection = {
        widgets: [{ textParagraph: { text: customText } }]
      }
      card.sections = [customSection, ...(card.sections || [])]
    }

    await sendMessage(webhookUrl, payload, threadKey, disableThreading)
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(String(error))
    }
  }
}
