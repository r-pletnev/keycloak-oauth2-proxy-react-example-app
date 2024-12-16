interface UserInfo {
  user: string;
  email: string;
  groups: string[];
  preferredUsername: string;
}

type CacheEntry = {
  timestamp: number;
  value: UserInfo;
};

const EMAIL_HEADER = "X-Auth-Request-Email";
const PREFERRED_USERNAME_HEADER = "X-Auth-Request-Preferred-Username";
const GROUPS_HEADER = "X-Auth-Request-Groups";
const USER_ID_HEADER = "X-Auth-Request-User";

type UserInfoHeaderNames = {
  email: string;
  preferredUsername: string;
  groups: string;
  user: string;
};

export class OAUTH2ProxyService {
  cache: Map<string, CacheEntry>;
  cacheTtl = 1 * 60 * 1000; // 1 minute
  loginUrl: string;
  userInfoUrl: string;
  logoutUrl: string;
  keycloakLogoutUrl =
    "http%3A%2F%2Fkeycloak.localtest.me%3A9080%2Frealms%2Foauth2-proxy%2Fprotocol%2Fopenid-connect%2Flogout";
  headerNames: UserInfoHeaderNames = {
    email: EMAIL_HEADER,
    preferredUsername: PREFERRED_USERNAME_HEADER,
    groups: GROUPS_HEADER,
    user: USER_ID_HEADER,
  };

  constructor({
    headerNames,
    cacheTtl,
    proxyUrl,
  }: {
    cacheTtl?: number;
    headerNames?: UserInfoHeaderNames;
    proxyUrl: string;
  }) {
    this.cache = new Map();

    this.loginUrl = `${proxyUrl}/oauth2/start`;
    this.userInfoUrl = `${proxyUrl}/oauth2/userinfo`;
    this.logoutUrl = `${proxyUrl}/oauth2/sign_out?rd=${this.keycloakLogoutUrl}`;

    if (headerNames) {
      this.headerNames = headerNames;
    }
    if (cacheTtl) {
      this.cacheTtl = cacheTtl;
    }
  }

  private async memorize(url: string, fn: (url: string) => Promise<UserInfo>) {
    const cacheEntry = this.cache.get(url);
    if (cacheEntry && Date.now() - cacheEntry.timestamp < this.cacheTtl) {
      return cacheEntry.value;
    }

    const userInfo = await fn(url);
    this.cache.set(url, {
      timestamp: Date.now(),
      value: userInfo,
    });
    return userInfo;
  }

  public async getUserInfoFromAPI(): Promise<UserInfo> {
    return this.memorize(this.userInfoUrl, async (url) => {
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return await response.json();
    });
  }

  public async getUserInfoFromHeaders(): Promise<UserInfo> {
    return this.memorize(document.location.origin, async (url) => {
      const response = await fetch(url, { method: "HEAD" });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const responseHeaders = new Headers(response.headers);
      const userInfo = {};
      for (const header of [
        this.headerNames.email,
        this.headerNames.preferredUsername,
        this.headerNames.user,
      ]) {
        if (!responseHeaders.has(header)) {
          throw new Error(`Missing header: ${header}`);
        }
        userInfo[header] = responseHeaders.get(header);
      }

      const groupsHeader = responseHeaders.get(this.headerNames.groups);
      const groups = groupsHeader ? groupsHeader.split(",") : [];
      userInfo["groups"] = groups;
      return userInfo as UserInfo;
    });
  }

  getLogoutUrl() {
    return this.logoutUrl;
  }

  getLoginUrl() {
    return this.loginUrl;
  }
}
