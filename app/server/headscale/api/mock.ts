import type { TransportRequest } from "./transport";

export interface MockDataState {
  users: Array<{
    id: string;
    name: string;
    createdAt: string;
    displayName?: string;
    email?: string;
  }>;
  nodes: Array<{
    id: string;
    machineKey: string;
    nodeKey: string;
    discoKey: string;
    ipAddresses: string[];
    name: string;
    givenName: string;
    user: { id: string; name: string; createdAt: string };
    lastSeen: string;
    expiry: string | null;
    createdAt: string;
    registerMethod: "REGISTER_METHOD_AUTH_KEY" | "REGISTER_METHOD_CLI" | "REGISTER_METHOD_OIDC";
    tags: string[];
    forcedTags: string[];
    validTags: string[];
    invalidTags: string[];
    online: boolean;
    approvedRoutes: string[];
    availableRoutes: string[];
    subnetRoutes: string[];
    endpoints?: string[];
  }>;
  policy: string;
  policyUpdatedAt: string;
  apiKeys: Array<{
    id: string;
    prefix: string;
    expiration: string;
    createdAt: string;
    lastSeen: string;
  }>;
  preAuthKeys: Array<{
    id: string;
    key: string;
    user: { id: string; name: string; createdAt: string } | null;
    reusable: boolean;
    ephemeral: boolean;
    used: boolean;
    expiration: string;
    createdAt: string;
    aclTags: string[];
  }>;
}

const DEFAULT_USERS: MockDataState["users"] = [
  {
    id: "1",
    name: "admin",
    displayName: "系统管理员",
    email: "admin@example.com",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "developer",
    displayName: "开发工程师",
    email: "dev@example.com",
    createdAt: "2026-02-01T00:00:00Z",
  },
  {
    id: "3",
    name: "visitor",
    displayName: "访客测试",
    email: "visitor@example.com",
    createdAt: "2026-03-01T00:00:00Z",
  },
];

const DEFAULT_NODES: MockDataState["nodes"] = [
  {
    id: "1",
    machineKey: "mkey:0000000000000001",
    nodeKey: "nodekey:macbookpro0000000001",
    discoKey: "discokey:0000000001",
    ipAddresses: ["100.64.0.1", "fd7a:115c:a1e0::1"],
    name: "macbook-pro",
    givenName: "macbook-pro",
    user: DEFAULT_USERS[0],
    lastSeen: new Date().toISOString(),
    expiry: new Date(Date.now() + 86400000 * 90).toISOString(),
    createdAt: "2026-01-10T08:00:00Z",
    registerMethod: "REGISTER_METHOD_AUTH_KEY",
    tags: ["tag:dev", "tag:mac"],
    forcedTags: ["tag:dev", "tag:mac"],
    validTags: ["tag:dev", "tag:mac"],
    invalidTags: [],
    online: true,
    approvedRoutes: [],
    availableRoutes: [],
    subnetRoutes: [],
    endpoints: ["192.168.1.100:41641"],
  },
  {
    id: "2",
    machineKey: "mkey:0000000000000002",
    nodeKey: "nodekey:ubuntugateway000002",
    discoKey: "discokey:0000000002",
    ipAddresses: ["100.64.0.2", "fd7a:115c:a1e0::2"],
    name: "ubuntu-gateway",
    givenName: "ubuntu-gateway",
    user: DEFAULT_USERS[0],
    lastSeen: new Date().toISOString(),
    expiry: new Date(Date.now() + 86400000 * 180).toISOString(),
    createdAt: "2026-01-12T09:30:00Z",
    registerMethod: "REGISTER_METHOD_CLI",
    tags: ["tag:server", "tag:exit-node"],
    forcedTags: ["tag:server", "tag:exit-node"],
    validTags: ["tag:server", "tag:exit-node"],
    invalidTags: [],
    online: true,
    approvedRoutes: ["192.168.10.0/24", "0.0.0.0/0"],
    availableRoutes: ["192.168.10.0/24", "0.0.0.0/0"],
    subnetRoutes: ["192.168.10.0/24", "0.0.0.0/0"],
    endpoints: ["1.2.3.4:41641"],
  },
  {
    id: "3",
    machineKey: "mkey:0000000000000003",
    nodeKey: "nodekey:iphone150000000003",
    discoKey: "discokey:0000000003",
    ipAddresses: ["100.64.0.3", "fd7a:115c:a1e0::3"],
    name: "iphone-15",
    givenName: "iphone-15",
    user: DEFAULT_USERS[1],
    lastSeen: new Date(Date.now() - 3600000 * 5).toISOString(),
    expiry: new Date(Date.now() + 86400000 * 30).toISOString(),
    createdAt: "2026-02-01T14:20:00Z",
    registerMethod: "REGISTER_METHOD_OIDC",
    tags: [],
    forcedTags: [],
    validTags: [],
    invalidTags: [],
    online: false,
    approvedRoutes: [],
    availableRoutes: [],
    subnetRoutes: [],
  },
  {
    id: "4",
    machineKey: "mkey:0000000000000004",
    nodeKey: "nodekey:windows11workstation4",
    discoKey: "discokey:0000000004",
    ipAddresses: ["100.64.0.4", "fd7a:115c:a1e0::4"],
    name: "windows-workstation",
    givenName: "windows-workstation",
    user: DEFAULT_USERS[1],
    lastSeen: new Date().toISOString(),
    expiry: new Date(Date.now() + 86400000 * 60).toISOString(),
    createdAt: "2026-02-15T11:00:00Z",
    registerMethod: "REGISTER_METHOD_AUTH_KEY",
    tags: ["tag:windows"],
    forcedTags: ["tag:windows"],
    validTags: ["tag:windows"],
    invalidTags: [],
    online: true,
    approvedRoutes: [],
    availableRoutes: [],
    subnetRoutes: [],
    endpoints: ["192.168.1.150:41641"],
  },
  {
    id: "5",
    machineKey: "mkey:0000000000000005",
    nodeKey: "nodekey:nassynology00000005",
    discoKey: "discokey:0000000005",
    ipAddresses: ["100.64.0.5", "fd7a:115c:a1e0::5"],
    name: "nas-synology",
    givenName: "nas-synology",
    user: DEFAULT_USERS[0],
    lastSeen: new Date().toISOString(),
    expiry: new Date(Date.now() + 86400000 * 365).toISOString(),
    createdAt: "2026-02-20T16:45:00Z",
    registerMethod: "REGISTER_METHOD_AUTH_KEY",
    tags: ["tag:server", "tag:storage"],
    forcedTags: ["tag:server", "tag:storage"],
    validTags: ["tag:server", "tag:storage"],
    invalidTags: [],
    online: true,
    approvedRoutes: ["192.168.1.0/24"],
    availableRoutes: ["192.168.1.0/24"],
    subnetRoutes: ["192.168.1.0/24"],
    endpoints: ["192.168.1.200:41641"],
  },
];

const DEFAULT_POLICY = `// Headscale ACL 访问控制策略示例
{
  "acls": [
    // 允许所有节点互相直接访问
    {
      "action": "accept",
      "src": ["*"],
      "dst": ["*:*"]
    }
  ],
  "tagOwners": {
    "tag:server": ["admin"],
    "tag:exit-node": ["admin"],
    "tag:dev": ["admin", "developer"],
    "tag:mac": ["admin"],
    "tag:windows": ["developer"],
    "tag:storage": ["admin"]
  },
  "groups": {
    "group:devs": ["admin", "developer"]
  }
}`;

class MockStore {
  private data: MockDataState;

  constructor() {
    this.data = {
      users: [...DEFAULT_USERS],
      nodes: [...DEFAULT_NODES],
      policy: DEFAULT_POLICY,
      policyUpdatedAt: new Date().toISOString(),
      apiKeys: [
        {
          id: "1",
          prefix: "test",
          expiration: "2030-01-01T00:00:00Z",
          createdAt: "2026-01-01T00:00:00Z",
          lastSeen: new Date().toISOString(),
        },
        {
          id: "2",
          prefix: "dev-key",
          expiration: "2030-01-01T00:00:00Z",
          createdAt: "2026-01-01T00:00:00Z",
          lastSeen: new Date().toISOString(),
        },
      ],
      preAuthKeys: [
        {
          id: "1",
          key: "hs-preauth-test-key-123456",
          user: DEFAULT_USERS[0],
          reusable: true,
          ephemeral: false,
          used: false,
          expiration: "2027-01-01T00:00:00Z",
          createdAt: "2026-01-01T00:00:00Z",
          aclTags: ["tag:server"],
        },
      ],
    };
  }

  isMockEnabled(apiKey?: string): boolean {
    if (process.env.HEADPLANE_DEV_MOCK === "true") return true;
    if (!apiKey) return false;
    const lower = apiKey.toLowerCase();
    return (
      lower === "test" ||
      lower === "admin" ||
      lower === "dev" ||
      lower.startsWith("test-") ||
      lower.startsWith("dev-") ||
      lower.includes("mock")
    );
  }

  handlePublic(path: string): unknown {
    if (path === "/version") {
      return { version: "0.28.0" };
    }
    if (path === "/health") {
      return { status: "ok" };
    }
    return { ok: true };
  }

  handleRequest(req: TransportRequest): unknown {
    const { method, path, body } = req;

    // 1. API Keys
    if (path === "v1/apikey") {
      return { apiKeys: this.data.apiKeys };
    }

    // 2. Users
    if (path === "v1/user") {
      if (method === "GET") {
        return { users: this.data.users };
      }
      if (method === "POST" && body) {
        const newUser = {
          id: String(this.data.users.length + 1),
          name: String(body.name || "user"),
          displayName: body.displayName ? String(body.displayName) : undefined,
          email: body.email ? String(body.email) : undefined,
          createdAt: new Date().toISOString(),
        };
        this.data.users.push(newUser);
        return { user: newUser };
      }
    }

    if (path.startsWith("v1/user/")) {
      const rest = path.slice("v1/user/".length);
      const parts = rest.split("/");
      const userId = parts[0];
      const action = parts[1];

      if (action === "rename" && body) {
        const u = this.data.users.find((user) => user.id === userId || user.name === userId);
        if (u && body.newName) {
          u.name = String(body.newName);
        }
        return {};
      }

      if (method === "DELETE") {
        this.data.users = this.data.users.filter(
          (user) => user.id !== userId && user.name !== userId,
        );
        return {};
      }
    }

    // 3. Nodes (Machines)
    if (path === "v1/node") {
      if (method === "GET") {
        return { nodes: this.data.nodes };
      }
    }

    if (path.startsWith("v1/node/")) {
      const rest = path.slice("v1/node/".length);
      const parts = rest.split("/");
      const nodeId = parts[0];
      const action = parts[1];

      if (nodeId === "register" && method === "POST") {
        const userStr = String(body?.user || "admin");
        const foundUser =
          this.data.users.find((u) => u.name === userStr || u.id === userStr) || this.data.users[0];
        const newNode: MockDataState["nodes"][0] = {
          id: String(this.data.nodes.length + 1),
          machineKey: `mkey:${Date.now()}`,
          nodeKey: `nodekey:${Date.now()}`,
          discoKey: `discokey:${Date.now()}`,
          ipAddresses: [`100.64.0.${this.data.nodes.length + 10}`],
          name: `new-machine-${this.data.nodes.length + 1}`,
          givenName: `new-machine-${this.data.nodes.length + 1}`,
          user: foundUser,
          lastSeen: new Date().toISOString(),
          expiry: new Date(Date.now() + 86400000 * 90).toISOString(),
          createdAt: new Date().toISOString(),
          registerMethod: "REGISTER_METHOD_AUTH_KEY",
          tags: [],
          forcedTags: [],
          validTags: [],
          invalidTags: [],
          online: true,
          approvedRoutes: [],
          availableRoutes: [],
          subnetRoutes: [],
        };
        this.data.nodes.push(newNode);
        return { node: newNode };
      }

      const node = this.data.nodes.find((n) => n.id === nodeId || n.name === nodeId);

      if (!action) {
        if (method === "GET") {
          if (!node) {
            return { node: this.data.nodes[0] };
          }
          return { node };
        }
        if (method === "DELETE") {
          this.data.nodes = this.data.nodes.filter((n) => n.id !== nodeId && n.name !== nodeId);
          return {};
        }
      }

      if (action === "rename" && body && node) {
        const newName = String(body.name || body.newName || "");
        if (newName) {
          node.givenName = newName;
          node.name = newName;
        }
        return { node };
      }

      if (action === "tags" && body && node) {
        const tags = Array.isArray(body.tags) ? body.tags.map(String) : [];
        node.tags = tags;
        node.forcedTags = tags;
        node.validTags = tags;
        return { node };
      }

      if (action === "expire" && node) {
        node.expiry = new Date(Date.now() - 1000).toISOString();
        node.online = false;
        return { node };
      }

      if (action === "routes" && body && node) {
        if (Array.isArray(body.routes)) {
          node.approvedRoutes = body.routes.map(String);
        }
        return { node };
      }

      if (action === "user" && body && node) {
        const targetUserName = String(body.user || "");
        const targetUser = this.data.users.find(
          (u) => u.name === targetUserName || u.id === targetUserName,
        );
        if (targetUser) {
          node.user = targetUser;
        }
        return { node };
      }
    }

    // 4. Policy
    if (path === "v1/policy") {
      if (method === "GET") {
        return {
          policy: this.data.policy,
          updatedAt: this.data.policyUpdatedAt,
        };
      }
      if (method === "PUT" && body?.policy) {
        this.data.policy = String(body.policy);
        this.data.policyUpdatedAt = new Date().toISOString();
        return {
          policy: this.data.policy,
          updatedAt: this.data.policyUpdatedAt,
        };
      }
    }

    // 5. Pre-Auth Keys
    if (path === "v1/preauthkey") {
      if (method === "GET") {
        return { preAuthKeys: this.data.preAuthKeys };
      }
      if (method === "POST" && body) {
        const userStr = body.user ? String(body.user) : null;
        const targetUser = userStr
          ? this.data.users.find((u) => u.name === userStr || u.id === userStr) || null
          : null;
        const newKey = {
          id: String(this.data.preAuthKeys.length + 1),
          key: `hs-preauth-${Date.now()}`,
          user: targetUser,
          reusable: Boolean(body.reusable),
          ephemeral: Boolean(body.ephemeral),
          used: false,
          expiration: body.expiration
            ? String(body.expiration)
            : new Date(Date.now() + 86400000 * 90).toISOString(),
          createdAt: new Date().toISOString(),
          aclTags: Array.isArray(body.aclTags) ? body.aclTags.map(String) : [],
        };
        this.data.preAuthKeys.push(newKey);
        return { preAuthKey: newKey };
      }
    }

    if (path === "v1/auth/approve") {
      return {};
    }

    return {};
  }
}

export const mockStore = new MockStore();
