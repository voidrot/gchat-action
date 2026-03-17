# Google Chat Action

[![CI](https://github.com/voidrot/gchat-action/actions/workflows/ci.yml/badge.svg)](https://github.com/voidrot/gchat-action/actions/workflows/ci.yml)
[![Check dist/](https://github.com/voidrot/gchat-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/voidrot/gchat-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/voidrot/gchat-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/voidrot/gchat-action/actions/workflows/codeql-analysis.yml)
[![Linter](https://github.com/voidrot/gchat-action/actions/workflows/linter.yml/badge.svg)](https://github.com/voidrot/gchat-action/actions/workflows/linter.yml)
![Coverage](./badges/coverage.svg)

Send feature-rich messages to Google Chat spaces from GitHub Actions. Supports
multiple message types including workflow status, deployment status, pull
request, issue, and custom messages — all with automatic threading.

## Usage

```yaml
steps:
  - name: Notify Google Chat
    uses: voidrot/gchat-action@v1
    with:
      webhook_url: ${{ secrets.GCHAT_WEBHOOK_URL }}
      message_type: 'auto'
      status: ${{ job.status }}
```

### Workflow Status Notification

Send a rich card with workflow name, status, repository, branch, actor, and a
link to the run:

```yaml
- name: Notify Chat – Workflow
  if: always()
  uses: voidrot/gchat-action@v1
  with:
    webhook_url: ${{ secrets.GCHAT_WEBHOOK_URL }}
    message_type: 'workflow_status'
    status: ${{ job.status }}
```

### Deployment Status Notification

Send deployment status with environment info, automatically extracted from the
GitHub event payload:

```yaml
- name: Notify Chat – Deploy
  uses: voidrot/gchat-action@v1
  with:
    webhook_url: ${{ secrets.GCHAT_WEBHOOK_URL }}
    message_type: 'deployment_status'
    status: 'success'
```

### Pull Request Notification

Send pull request details including title, state, author, and a link to the PR:

```yaml
on: [pull_request]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Notify Chat – PR
        uses: voidrot/gchat-action@v1
        with:
          webhook_url: ${{ secrets.GCHAT_WEBHOOK_URL }}
          message_type: 'pull_request'
```

### Issue Notification

Send issue details including title, state, author, and a link to the issue:

```yaml
on: [issues]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Notify Chat – Issue
        uses: voidrot/gchat-action@v1
        with:
          webhook_url: ${{ secrets.GCHAT_WEBHOOK_URL }}
          message_type: 'issue'
```

### Auto Message Type

Automatically selects the best message format based on the triggering GitHub
event:

| Event                                                                                       | Message Type      |
| ------------------------------------------------------------------------------------------- | ----------------- |
| `deployment`, `deployment_status`                                                           | Deployment status |
| `pull_request`, `pull_request_target`, `pull_request_review`, `pull_request_review_comment` | Pull request      |
| `issues`, `issue_comment`                                                                   | Issue             |
| All other events                                                                            | Workflow status   |

```yaml
- name: Notify Chat
  if: always()
  uses: voidrot/gchat-action@v1
  with:
    webhook_url: ${{ secrets.GCHAT_WEBHOOK_URL }}
    message_type: 'auto'
    status: ${{ job.status }}
```

### Custom Message

Send a plain text message:

```yaml
- name: Custom Text
  uses: voidrot/gchat-action@v1
  with:
    webhook_url: ${{ secrets.GCHAT_WEBHOOK_URL }}
    message_type: 'custom'
    custom_text: 'Hello from GitHub Actions! 🚀'
```

Build a rich card using simple field inputs — no JSON required:

```yaml
- name: Custom Card
  uses: voidrot/gchat-action@v1
  with:
    webhook_url: ${{ secrets.GCHAT_WEBHOOK_URL }}
    message_type: 'custom'
    card_title: 'Deployment Complete'
    card_subtitle: 'Production'
    card_text: 'All services are healthy.'
    card_button_text: 'View Dashboard'
    card_button_url: 'https://dashboard.example.com'
```

For full control, pass raw Cards v2 JSON instead:

```yaml
- name: Custom Card (raw JSON)
  uses: voidrot/gchat-action@v1
  with:
    webhook_url: ${{ secrets.GCHAT_WEBHOOK_URL }}
    message_type: 'custom'
    custom_cards_v2: |
      [
        {
          "cardId": "my-card",
          "card": {
            "header": { "title": "Custom Card" },
            "sections": [{ "widgets": [{ "textParagraph": { "text": "Hello!" } }] }]
          }
        }
      ]
```

> [!NOTE]
>
> When both `custom_cards_v2` and `card_*` fields are provided, the raw JSON
> takes priority.

### Threading

By default, messages within the same workflow run are threaded together using
the run ID as the thread key. This keeps related notifications grouped in your
Google Chat space.

```yaml
# Use a custom thread key
- uses: voidrot/gchat-action@v1
  with:
    webhook_url: ${{ secrets.GCHAT_WEBHOOK_URL }}
    message_type: 'workflow_status'
    status: ${{ job.status }}
    thread_key: 'my-deploy-thread'

# Disable threading entirely
- uses: voidrot/gchat-action@v1
  with:
    webhook_url: ${{ secrets.GCHAT_WEBHOOK_URL }}
    message_type: 'workflow_status'
    status: ${{ job.status }}
    disable_threading: 'true'
```

### Adding Custom Text

The `custom_text` input works with **all message types**, not just `custom`. Use
it to add extra context alongside any card message:

```yaml
- name: Notify Chat – Workflow
  if: always()
  uses: voidrot/gchat-action@v1
  with:
    webhook_url: ${{ secrets.GCHAT_WEBHOOK_URL }}
    message_type: 'workflow_status'
    status: ${{ job.status }}
    custom_text:
      'Triggered by ${{ github.event_name }} on ${{ github.ref_name }}'
```

The text appears at the top of the card in the Google Chat message.

## Inputs

| Name                | Description                                                                                        | Required | Default |
| ------------------- | -------------------------------------------------------------------------------------------------- | -------- | ------- |
| `webhook_url`       | Webhook URL from Google Chat space                                                                 | Yes      | —       |
| `message_type`      | Message format (`auto`, `workflow_status`, `deployment_status`, `pull_request`, `issue`, `custom`) | Yes      | `auto`  |
| `status`            | Status string (e.g. `success`, `failure`, `cancelled`)                                             | No       | —       |
| `custom_text`       | Additional text to include with the message (works with all message types)                         | No       | —       |
| `custom_cards_v2`   | Cards v2 JSON string (used with `custom` message type)                                             | No       | —       |
| `card_title`        | Card header title (used with `custom` message type)                                                | No       | —       |
| `card_subtitle`     | Card header subtitle (used with `custom` message type)                                             | No       | —       |
| `card_image_url`    | Card header image URL (used with `custom` message type)                                            | No       | —       |
| `card_text`         | Card body text paragraph (used with `custom` message type)                                         | No       | —       |
| `card_button_text`  | Card button label (used with `custom` message type)                                                | No       | —       |
| `card_button_url`   | Card button URL (used with `custom` message type)                                                  | No       | —       |
| `thread_key`        | Thread key override. Defaults to the workflow run ID                                               | No       | Run ID  |
| `disable_threading` | Set to `'true'` to disable threading entirely                                                      | No       | `false` |

## Outputs

| Name   | Description                   |
| ------ | ----------------------------- |
| `time` | The time the message was sent |

## Setup

1. In your Google Chat space, create an incoming webhook
   ([docs](https://developers.google.com/workspace/chat/create-webhooks))
2. Copy the webhook URL
3. Add the URL as a repository or organization secret (e.g. `GCHAT_WEBHOOK_URL`)
4. Reference the secret in your workflow as shown in the examples above

## License

This project is licensed under the terms of the [MIT License](./LICENSE).
