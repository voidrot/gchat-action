# Release Notes – v1.0.0

Initial release of **Google Chat Action** — a GitHub Action for sending
feature-rich messages to Google Chat spaces.

## ✨ Features

### Multiple Message Types

Six built-in message formats, each rendering as a rich Google Chat Card:

| Message Type        | Description                                                     |
| ------------------- | --------------------------------------------------------------- |
| `auto`              | Automatically selects the best format based on the GitHub event |
| `workflow_status`   | Workflow name, status, repo, branch, actor, and run link        |
| `deployment_status` | Deployment environment, status, and deployer                    |
| `pull_request`      | PR title, state, author, and link                               |
| `issue`             | Issue title, state, author, and link                            |
| `custom`            | User-defined text, card fields, or raw Cards v2 JSON            |

### Easy Custom Cards

Build Google Chat Cards v2 from simple inputs — no JSON required:

```yaml
- uses: voidrot/gchat-action@v1
  with:
    webhook_url: ${{ secrets.GCHAT_WEBHOOK_URL }}
    message_type: 'custom'
    card_title: 'Deployment Complete'
    card_subtitle: 'Production'
    card_text: 'All services are healthy.'
    card_button_text: 'View Dashboard'
    card_button_url: 'https://dashboard.example.com'
```

For advanced use cases, raw Cards v2 JSON is also supported via
`custom_cards_v2`.

### Custom Text on Any Message Type

The `custom_text` input works with **all** message types, allowing you to add
extra context alongside any card:

```yaml
- uses: voidrot/gchat-action@v1
  with:
    webhook_url: ${{ secrets.GCHAT_WEBHOOK_URL }}
    message_type: 'workflow_status'
    status: ${{ job.status }}
    custom_text:
      'Triggered by ${{ github.event_name }} on ${{ github.ref_name }}'
```

### Automatic Threading

Messages from the same workflow run are automatically grouped into a thread
using the run ID. You can override the thread key or disable threading entirely:

```yaml
- uses: voidrot/gchat-action@v1
  with:
    webhook_url: ${{ secrets.GCHAT_WEBHOOK_URL }}
    message_type: 'workflow_status'
    status: ${{ job.status }}
    thread_key: 'my-custom-thread' # Override
    disable_threading: 'true' # Or disable entirely
```

## 📋 Inputs

| Name                | Description                                                                       | Required | Default |
| ------------------- | --------------------------------------------------------------------------------- | -------- | ------- |
| `webhook_url`       | Google Chat space webhook URL                                                     | Yes      | —       |
| `message_type`      | `auto`, `workflow_status`, `deployment_status`, `pull_request`, `issue`, `custom` | Yes      | `auto`  |
| `status`            | Status string (e.g. `success`, `failure`, `cancelled`)                            | No       | —       |
| `custom_text`       | Additional text (works with all message types)                                    | No       | —       |
| `custom_cards_v2`   | Raw Cards v2 JSON (`custom` type only)                                            | No       | —       |
| `card_title`        | Card header title (`custom` type)                                                 | No       | —       |
| `card_subtitle`     | Card header subtitle (`custom` type)                                              | No       | —       |
| `card_image_url`    | Card header image URL (`custom` type)                                             | No       | —       |
| `card_text`         | Card body text paragraph (`custom` type)                                          | No       | —       |
| `card_button_text`  | Card button label (`custom` type)                                                 | No       | —       |
| `card_button_url`   | Card button URL (`custom` type)                                                   | No       | —       |
| `thread_key`        | Thread key override (defaults to run ID)                                          | No       | Run ID  |
| `disable_threading` | Disable threading entirely                                                        | No       | `false` |

## 📤 Outputs

| Name   | Description                         |
| ------ | ----------------------------------- |
| `time` | Timestamp when the message was sent |

## 🚀 Quick Start

1. Create a webhook in your Google Chat space
   ([docs](https://developers.google.com/workspace/chat/create-webhooks))
2. Add the webhook URL as a repository secret (`GCHAT_WEBHOOK_URL`)
3. Add to your workflow:

```yaml
- name: Notify Google Chat
  if: always()
  uses: voidrot/gchat-action@v1
  with:
    webhook_url: ${{ secrets.GCHAT_WEBHOOK_URL }}
    message_type: 'auto'
    status: ${{ job.status }}
```
