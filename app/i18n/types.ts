export type Language = "zh" | "en";

export interface TranslationDict {
  common: {
    confirm: string;
    cancel: string;
    close: string;
    save: string;
    delete: string;
    remove: string;
    edit: string;
    add: string;
    copy: string;
    copied: string;
    search: string;
    loading: string;
    status: string;
    actions: string;
    enabled: string;
    disabled: string;
    enable: string;
    disable: string;
    online: string;
    offline: string;
    expired: string;
    all: string;
    learnMore: string;
    clear: string;
    name: string;
    user: string;
    role: string;
    lastLogin: string;
    createdAt: string;
    required: string;
    optional: string;
  };
  header: {
    machines: string;
    users: string;
    acls: string;
    dns: string;
    settings: string;
    language: string;
    langZh: string;
    langEn: string;
    colorScheme: string;
    colorSystem: string;
    colorLight: string;
    colorDark: string;
    logout: string;
    docs: string;
    headscale: string;
    download: string;
    apiKey: string;
  };
  footer: {
    docs: string;
    github: string;
  };
  home: {
    linkedNotice: string;
    title: string;
    description: string;
    viewSource: string;
    unlinkedWarning: string;
    needAccess: string;
  };
  machines: {
    title: string;
    desc: string;
    searchPlaceholder: string;
    showingCount: string;
    totalCount: string;
    colName: string;
    colAddress: string;
    colVersion: string;
    colLastSeen: string;
    never: string;
    tagOwned: string;
    newMachine: string;
    filters: {
      filterByUser: string;
      filterByTag: string;
      filterByStatus: string;
      filterByRoute: string;
      allUsers: string;
      allTags: string;
      allStatuses: string;
      allRoutes: string;
      exitNode: string;
      subnet: string;
      clearFilters: string;
    };
    menu: {
      settings: string;
      rename: string;
      enableExpiry: string;
      disableExpiry: string;
      routes: string;
      tags: string;
      changeOwner: string;
      expire: string;
      remove: string;
      ssh: string;
    };
    dialogs: {
      renameTitle: string;
      renameDesc: string;
      machineName: string;
      renameHint: string;
      renameCurrentHint: string;
      deleteTitle: string;
      deleteDesc: string;
      expireTitle: string;
      expireDesc: string;
      moveTitle: string;
      moveDesc: string;
      selectUser: string;
      newTitle: string;
      newDesc: string;
      preAuthKey: string;
      manualRegister: string;
      routesTitle: string;
      routesDesc: string;
      tagsTitle: string;
      tagsDesc: string;
    };
  };
  users: {
    title: string;
    desc: string;
    headplaneUsers: string;
    noHeadplaneUsers: string;
    unlinkedUsers: string;
    unlinkedDesc: string;
    roles: {
      owner: string;
      admin: string;
      member: string;
    };
    actions: {
      linkHeadscale: string;
      editGroups: string;
      changeRole: string;
      deleteUser: string;
    };
    invite: string;
  };
  acls: {
    title: string;
    desc: string;
    structuredEditor: string;
    rawEditor: string;
    savePolicy: string;
    discardChanges: string;
    rules: string;
    groups: string;
    tags: string;
    hosts: string;
    ssh: string;
    readOnlyNotice: string;
  };
  dns: {
    title: string;
    desc: string;
    magicDns: string;
    magicDnsDesc: string;
    baseDomain: string;
    nameservers: string;
    addNameserver: string;
    extraRecords: string;
    addRecord: string;
  };
  settings: {
    title: string;
    desc: string;
    tabs: {
      overview: string;
      authKeys: string;
      restrictions: string;
      agent: string;
    };
    authKeys: {
      title: string;
      desc: string;
      createKey: string;
      key: string;
      user: string;
      expires: string;
      reusable: string;
      ephemeral: string;
      preAuth: string;
    };
    agent: {
      title: string;
      desc: string;
      status: string;
      connected: string;
      disconnected: string;
    };
  };
  login: {
    title: string;
    welcome: string;
    loginWithOidc: string;
    apiKeyPrompt: string;
    apiKeyPlaceholder: string;
    submit: string;
  };
}
