import { GoogleChatPayload } from '../api.js'

export interface CardFieldOptions {
  title?: string
  subtitle?: string
  imageUrl?: string
  text?: string
  buttonText?: string
  buttonUrl?: string
}

export function buildCustomMessage(
  text?: string,
  cardsV2?: string,
  cardFields?: CardFieldOptions
): GoogleChatPayload {
  const payload: GoogleChatPayload = {}

  if (text) {
    payload.text = text
  }

  if (cardsV2) {
    try {
      payload.cardsV2 = JSON.parse(cardsV2)
    } catch (e) {
      throw new Error(
        `Failed to parse custom_cards_v2 JSON: ${(e as Error).message}`,
        { cause: e }
      )
    }
    return payload
  }

  if (cardFields && hasAnyCardField(cardFields)) {
    payload.cardsV2 = [buildCardFromFields(cardFields)]
  }

  return payload
}

function hasAnyCardField(fields: CardFieldOptions): boolean {
  return !!(
    fields.title ||
    fields.subtitle ||
    fields.imageUrl ||
    fields.text ||
    fields.buttonText ||
    fields.buttonUrl
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildCardFromFields(fields: CardFieldOptions): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const header: Record<string, any> = {}
  if (fields.title) header.title = fields.title
  if (fields.subtitle) header.subtitle = fields.subtitle
  if (fields.imageUrl) {
    header.imageUrl = fields.imageUrl
    header.imageType = 'CIRCLE'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const widgets: Record<string, any>[] = []

  if (fields.text) {
    widgets.push({ textParagraph: { text: fields.text } })
  }

  if (fields.buttonText && fields.buttonUrl) {
    widgets.push({
      buttonList: {
        buttons: [
          {
            text: fields.buttonText,
            onClick: { openLink: { url: fields.buttonUrl } }
          }
        ]
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const card: Record<string, any> = {}
  if (Object.keys(header).length > 0) card.header = header
  if (widgets.length > 0) card.sections = [{ widgets }]

  return { cardId: 'custom_card', card }
}
