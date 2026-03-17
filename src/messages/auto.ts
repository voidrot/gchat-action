import * as github from '@actions/github'
import { GoogleChatPayload } from '../api.js'
import { buildWorkflowStatusMessage } from './workflow.js'
import { buildDeploymentStatusMessage } from './deployment.js'
import { buildPullRequestMessage } from './pull_request.js'
import { buildIssueMessage } from './issue.js'

export function buildAutoMessage(statusInput?: string): GoogleChatPayload {
  const eventName = github.context.eventName

  switch (eventName) {
    case 'deployment':
    case 'deployment_status':
      return buildDeploymentStatusMessage(statusInput)
    case 'pull_request':
    case 'pull_request_target':
    case 'pull_request_review':
    case 'pull_request_review_comment':
      return buildPullRequestMessage()
    case 'issues':
    case 'issue_comment':
      return buildIssueMessage()
    default:
      return buildWorkflowStatusMessage(statusInput)
  }
}
