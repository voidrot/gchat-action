import { describe, expect, it } from '@jest/globals'
import { buildCustomMessage } from '../src/messages/custom.js'

describe('custom message builder', () => {
  it('builds text only message', () => {
    const res = buildCustomMessage('Hello world')
    expect(res).toEqual({ text: 'Hello world' })
  })

  it('builds cards v2 only message', () => {
    const res = buildCustomMessage(undefined, '[{"cardId": "test"}]')
    expect(res).toEqual({ cardsV2: [{ cardId: 'test' }] })
  })

  it('builds both text and cards v2', () => {
    const res = buildCustomMessage('Hello', '[{"cardId": "test"}]')
    expect(res).toEqual({ text: 'Hello', cardsV2: [{ cardId: 'test' }] })
  })

  it('throws on invalid JSON', () => {
    expect(() => buildCustomMessage(undefined, 'invalid')).toThrow(
      /Failed to parse custom_cards_v2 JSON/
    )
  })

  describe('card field inputs', () => {
    it('builds card from title only', () => {
      const res = buildCustomMessage(undefined, undefined, {
        title: 'My Title'
      })
      expect(res).toEqual({
        cardsV2: [
          {
            cardId: 'custom_card',
            card: {
              header: { title: 'My Title' }
            }
          }
        ]
      })
    })

    it('builds card with all fields', () => {
      const res = buildCustomMessage(undefined, undefined, {
        title: 'Deploy',
        subtitle: 'Production',
        imageUrl: 'https://example.com/icon.png',
        text: 'Deployed successfully',
        buttonText: 'View',
        buttonUrl: 'https://example.com'
      })
      expect(res).toEqual({
        cardsV2: [
          {
            cardId: 'custom_card',
            card: {
              header: {
                title: 'Deploy',
                subtitle: 'Production',
                imageUrl: 'https://example.com/icon.png',
                imageType: 'CIRCLE'
              },
              sections: [
                {
                  widgets: [
                    { textParagraph: { text: 'Deployed successfully' } },
                    {
                      buttonList: {
                        buttons: [
                          {
                            text: 'View',
                            onClick: {
                              openLink: { url: 'https://example.com' }
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              ]
            }
          }
        ]
      })
    })

    it('builds card with text and button but no header', () => {
      const res = buildCustomMessage(undefined, undefined, {
        text: 'Hello',
        buttonText: 'Click',
        buttonUrl: 'https://example.com'
      })
      expect(res.cardsV2).toHaveLength(1)
      const card = res.cardsV2![0].card
      expect(card.header).toBeUndefined()
      expect(card.sections[0].widgets).toHaveLength(2)
    })

    it('omits button when only buttonText is provided', () => {
      const res = buildCustomMessage(undefined, undefined, {
        title: 'Test',
        buttonText: 'Click'
      })
      const card = res.cardsV2![0].card
      expect(card.sections).toBeUndefined()
    })

    it('combines text message with card fields', () => {
      const res = buildCustomMessage('Hello', undefined, {
        title: 'Card Title'
      })
      expect(res.text).toBe('Hello')
      expect(res.cardsV2).toHaveLength(1)
    })

    it('raw JSON takes priority over card fields', () => {
      const res = buildCustomMessage(
        undefined,
        '[{"cardId": "raw"}]',
        { title: 'Ignored' }
      )
      expect(res.cardsV2).toEqual([{ cardId: 'raw' }])
    })

    it('returns empty payload when no card fields have values', () => {
      const res = buildCustomMessage(undefined, undefined, {})
      expect(res).toEqual({})
    })
  })
})
