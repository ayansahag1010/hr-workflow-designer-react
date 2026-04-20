import type {
  AutomationAction,
  SimulationResult,
  SimulationLog,
  SerializedWorkflow,
} from '@/types/workflow.types';

// ─── Mock Automation Actions Database ───────────────────────────────────────

const MOCK_AUTOMATIONS: AutomationAction[] = [
  {
    id: 'send_email',
    name: 'Send Email',
    description: 'Send an automated email notification',
    category: 'Communication',
    fields: [
      {
        name: 'to',
        label: 'Recipient Email',
        type: 'email',
        required: true,
        placeholder: 'user@company.com',
      },
      {
        name: 'subject',
        label: 'Subject Line',
        type: 'text',
        required: true,
        placeholder: 'Welcome to the team!',
      },
      {
        name: 'template',
        label: 'Email Template',
        type: 'select',
        required: true,
        options: ['Welcome', 'Onboarding', 'Reminder', 'Completion'],
      },
      {
        name: 'cc',
        label: 'CC',
        type: 'email',
        required: false,
        placeholder: 'manager@company.com',
      },
    ],
  },
  {
    id: 'create_account',
    name: 'Create Account',
    description: 'Provision a new user account in the system',
    category: 'IT',
    fields: [
      {
        name: 'username',
        label: 'Username',
        type: 'text',
        required: true,
        placeholder: 'john.doe',
      },
      {
        name: 'department',
        label: 'Department',
        type: 'select',
        required: true,
        options: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'],
      },
      {
        name: 'accessLevel',
        label: 'Access Level',
        type: 'select',
        required: true,
        options: ['Basic', 'Standard', 'Admin'],
        defaultValue: 'Standard',
      },
    ],
  },
  {
    id: 'assign_equipment',
    name: 'Assign Equipment',
    description: 'Assign hardware and equipment to new employee',
    category: 'IT',
    fields: [
      {
        name: 'laptop',
        label: 'Laptop Model',
        type: 'select',
        required: true,
        options: ['MacBook Pro 14"', 'MacBook Pro 16"', 'ThinkPad X1', 'Dell XPS 15'],
      },
      {
        name: 'monitor',
        label: 'Monitor',
        type: 'select',
        required: false,
        options: ['27" 4K', '32" 4K', 'Ultrawide 34"', 'None'],
      },
      {
        name: 'peripherals',
        label: 'Include Peripherals',
        type: 'boolean',
        required: false,
        defaultValue: 'true',
      },
    ],
  },
  {
    id: 'schedule_meeting',
    name: 'Schedule Meeting',
    description: 'Automatically schedule a meeting on the calendar',
    category: 'Calendar',
    fields: [
      {
        name: 'title',
        label: 'Meeting Title',
        type: 'text',
        required: true,
        placeholder: 'Orientation Session',
      },
      {
        name: 'duration',
        label: 'Duration (minutes)',
        type: 'number',
        required: true,
        placeholder: '60',
        defaultValue: '60',
      },
      {
        name: 'attendees',
        label: 'Attendees',
        type: 'text',
        required: true,
        placeholder: 'team@company.com',
      },
    ],
  },
  {
    id: 'update_hris',
    name: 'Update HRIS',
    description: 'Update Human Resource Information System records',
    category: 'HR',
    fields: [
      {
        name: 'employeeId',
        label: 'Employee ID',
        type: 'text',
        required: true,
        placeholder: 'EMP-001',
      },
      {
        name: 'status',
        label: 'Employment Status',
        type: 'select',
        required: true,
        options: ['Active', 'Probation', 'On Leave', 'Terminated'],
        defaultValue: 'Active',
      },
      {
        name: 'sendNotification',
        label: 'Send Notification',
        type: 'boolean',
        required: false,
        defaultValue: 'true',
      },
    ],
  },
  {
    id: 'slack_notification',
    name: 'Slack Notification',
    description: 'Send a Slack message to a channel or user',
    category: 'Communication',
    fields: [
      {
        name: 'channel',
        label: 'Channel',
        type: 'text',
        required: true,
        placeholder: '#general',
      },
      {
        name: 'message',
        label: 'Message',
        type: 'text',
        required: true,
        placeholder: 'Welcome our new team member!',
      },
    ],
  },
];

// ─── Simulated API delay ────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── GET /automations ───────────────────────────────────────────────────────

export async function getAutomations(): Promise<AutomationAction[]> {
  await delay(300);
  return [...MOCK_AUTOMATIONS];
}

export async function getAutomationById(
  id: string
): Promise<AutomationAction | undefined> {
  await delay(100);
  return MOCK_AUTOMATIONS.find((a) => a.id === id);
}

// ─── POST /simulate ─────────────────────────────────────────────────────────

export async function simulateWorkflow(
  workflow: SerializedWorkflow
): Promise<SimulationResult> {
  await delay(500);

  const logs: SimulationLog[] = [];
  const startTime = Date.now();

  // Find start node
  const startNode = workflow.nodes.find((n) => n.type === 'start');
  if (!startNode) {
    return {
      success: false,
      logs: [
        {
          timestamp: Date.now(),
          level: 'error',
          message: 'No Start node found. Cannot simulate.',
        },
      ],
      duration: 0,
      nodesExecuted: 0,
    };
  }

  // Build adjacency for traversal
  const adj = new Map<string, string[]>();
  workflow.nodes.forEach((n) => adj.set(n.id, []));
  workflow.edges.forEach((e) => {
    const list = adj.get(e.source);
    if (list) list.push(e.target);
  });

  const nodeMap = new Map(workflow.nodes.map((n) => [n.id, n]));
  const visited = new Set<string>();
  const queue = [startNode.id];
  let nodesExecuted = 0;

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const node = nodeMap.get(currentId);
    if (!node) continue;

    nodesExecuted++;
    const ts = Date.now();

    switch (node.type) {
      case 'start':
        logs.push({
          timestamp: ts,
          level: 'success',
          nodeId: node.id,
          nodeType: 'start',
          message: `[START] Workflow "${node.data.label}" initiated`,
        });
        break;

      case 'task':
        logs.push({
          timestamp: ts,
          level: 'info',
          nodeId: node.id,
          nodeType: 'task',
          message: `[TASK] "${node.data.label}" — ${
            node.data.type === 'task' && node.data.assignee
              ? `Assigned to ${node.data.assignee}`
              : 'Unassigned'
          }`,
        });
        break;

      case 'approval':
        {
          const approved = Math.random() > 0.2; // 80% approval rate
          logs.push({
            timestamp: ts,
            level: approved ? 'success' : 'warning',
            nodeId: node.id,
            nodeType: 'approval',
            message: `[APPROVAL] "${node.data.label}" — ${
              approved ? '✓ Approved' : '⚠ Rejected (simulated)'
            }`,
          });
          if (!approved) {
            logs.push({
              timestamp: ts + 1,
              level: 'warning',
              nodeId: node.id,
              nodeType: 'approval',
              message: `[APPROVAL] Workflow paused at approval step (simulated rejection)`,
            });
          }
        }
        break;

      case 'automated':
        {
          const actionId = node.data.type === 'automated' ? node.data.actionId : '';
          const actionName = actionId
              ? MOCK_AUTOMATIONS.find((a) => a.id === actionId)?.name || node.data.label
              : node.data.label;
          logs.push({
            timestamp: ts,
            level: 'info',
            nodeId: node.id,
            nodeType: 'automated',
            message: `[ACTION] "${actionName}" executed successfully`,
          });
        }
        break;

      case 'end':
        logs.push({
          timestamp: ts,
          level: 'success',
          nodeId: node.id,
          nodeType: 'end',
          message: `[END] Workflow completed — Status: ${
            node.data.type === 'end' ? node.data.status || 'completed' : 'completed'
          }`,
        });
        break;
    }

    // Enqueue neighbors
    const neighbors = adj.get(currentId) || [];
    neighbors.forEach((nId) => {
      if (!visited.has(nId)) queue.push(nId);
    });
  }

  const duration = Date.now() - startTime;

  return {
    success: true,
    logs,
    duration,
    nodesExecuted,
  };
}
