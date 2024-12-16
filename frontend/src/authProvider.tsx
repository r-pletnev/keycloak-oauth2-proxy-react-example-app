import { AuthProvider } from "react-admin";
import { OAUTH2ProxyService } from "./oauth2ProxyService";
import { MockUserDBService } from "./MockUserDBService";

const ApiService = new OAUTH2ProxyService({
  proxyUrl: "http://oauth2-proxy.oauth2-proxy.localhost",
});

const accessControlStrategies = {
  admin: () => {
    return true;
  },
  user: ({ resource, action }) => {
    const deniedResources = ["posts.authors", "users.role", "users.id"];
    const deniedActions = ["batch_create"];
    return (
      !deniedResources.includes(resource) && !deniedActions.includes(action)
    );
  },
  default: ({ resource, action }) => {
    const deniedResources = [
      "users",
      "posts.authors",
      "users.role",
      "users.id",
    ];
    const deniedActions = ["batch_create"];
    return (
      !deniedResources.includes(resource) && !deniedActions.includes(action)
    );
  },
};

const throwRedirectError = () => {
  const error = new Error();
  //@ts-ignore
  error.redirectTo = ApiService.getLogoutUrl();
  throw error;
};

// Authenticated by default
const authProvider: AuthProvider = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login: ({ username, password }) => {
    const user = MockUserDBService.getUserByUsername(username);
    if (user !== undefined) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => setTimeout(reject, 1000));
  },
  logout: () => {
    localStorage.setItem("not_authorized", "true");
    return Promise.resolve(ApiService.getLogoutUrl());
  },
  checkError: ({ status }) => {
    return status === 401 || status === 403
      ? Promise.reject()
      : Promise.resolve();
  },
  checkAuth: async () => {
    const userInfo = await ApiService.getUserInfoFromAPI();
    if (!userInfo) {
      throwRedirectError();
    }
    const user = MockUserDBService.getUserByEmail(userInfo.email);
    if (user) {
      return Promise.resolve();
    }
    throwRedirectError();
  },
  getIdentity: async () => {
    const userInfo = await ApiService.getUserInfoFromAPI();
    if (!userInfo) {
      // todo redirect to oauth2-proxy login page
      return Promise.reject();
    }
    const user = MockUserDBService.getUserByEmail(userInfo.email);
    if (user) {
      return Promise.resolve(user);
    }
    return Promise.reject();
  },
  canAccess: async ({ resource, action }) => {
    const role = localStorage.getItem("role") || "default";
    return accessControlStrategies[role]({ resource, action });
  },
};

export default authProvider;
