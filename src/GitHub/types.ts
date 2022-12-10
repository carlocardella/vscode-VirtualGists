export enum ContentType {
    "dir" = "dir",
    "file" = "file",
    "symlink" = "symlink",
    "submodule" = "submodule",
}

export type TGitHubUser = {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string | null;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
    name: string | null;
    company: string | null;
    blog: string | null;
    location: string | null;
    email: string | null;
    hireable: boolean | null;
    bio: string | null;
    twitter_username?: string | null | undefined;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
};

export type TContent =
    | {
          content?: string | undefined | null;
          download_url?: string | undefined;
          encoding?: string | undefined;
          git_url?: string | undefined;
          html_url?: string | undefined;
          mode?: string | undefined;
          name?: string | undefined;
          path?: string | undefined;
          sha?: string | undefined;
          size?: number | undefined;
          type?: string | undefined;
          url?: string | undefined;
          _links?: {
              self: string;
              git: string;
              html: string;
          };
      }
    | undefined;

export type TBranch = {
    name: string;
    commit: {
        sha: string;
        url: string;
    };
    protected?: boolean | undefined;
    protection?:
        | {
              url?: string | undefined;
              enabled?: boolean | undefined;
              required_status_checks?: {
                  url?: string | undefined;
                  enforcement_level?: string | undefined;
                  contexts: string[];
                  checks: {
                      context: string;
                      app_id: number | null;
                  }[];
              };
              contexts_url?: string | undefined;
              strict?: boolean | undefined;
          }
        | undefined;
    protection_url?: string | undefined;
};

export type TUser = {
    login: string;
    id: number;
    node_id?: string | null | undefined;
    avatar_url: string;
    gravatar_id?: string | null | undefined;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
};

export type TRef = {
    ref: string;
    node_id: string;
    url: string;
    object: {
        type: string;
        sha: string;
        url: string;
    };
};

export type TGist = {
    url?: string | undefined;
    forks_url?: string | undefined;
    commits_url?: string | undefined;
    id?: string | undefined;
    node_id?: string | undefined;
    git_pull_url?: string | undefined;
    git_push_url?: string | undefined;
    html_url?: string | undefined;
    files?: TGistFile | undefined | null;
    history?: TGistHistory[] | undefined | null | unknown;
    public?: boolean | undefined;
    created_at?: string | undefined;
    updated_at?: string | undefined;
    description?: string | null | undefined;
    comments?: number | undefined;
    user?: TUser | string | null | undefined;
    comments_url?: string | undefined;
    owner?: TUser | null | undefined;
    truncated?: boolean | undefined;
    starred?: boolean;
    forks?: TForks[] | unknown | undefined;
};

export type TGistFile = {
    [key: string]: {
        filename?: string | undefined;
        type?: string | undefined;
        language?: string | undefined;
        raw_url?: string | undefined;
        size?: number | undefined;
        truncated?: boolean | undefined;
        content?: string | undefined | null;
    } | null;
};

export type TGistFileNoKey = {
    filename?: string | undefined;
    type?: string | undefined;
    language?: string | undefined;
    raw_url?: string | undefined;
    size?: number | undefined;
    truncated?: boolean | undefined;
    content?: string | undefined | null;
};

export type TGistHistory = {
    user?: TUser | null | undefined;
    version?: string | undefined | null;
    committed_at?: string | null | undefined;
    change_status?: TGistChangeStatus | null | undefined;
    url?: string | null | undefined;
};

export type TGistChangeStatus =
    | {
          total?: number | undefined;
          additions?: number | undefined;
          deletions?: number | undefined;
      }
    | undefined;

export type TForks = {
    id: string;
    url: string;
    user: TUser;
    created_at: string;
    updated_at: string;
};

export type TFileToDelete = {
    [key: string]: any;
};
