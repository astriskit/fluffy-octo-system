import { types, flow } from "mobx-state-tree";
import RegulationList from "./regulation-list";
import appService from "../app.service";

const AppModel = types
  .model("AppModal", {
    _token: types.maybe(types.string),
    _loading: false,
    _regulations: types.optional(types.maybe(RegulationList), {
      all: [],
      selected: [],
      selectedFuns: []
    })
  })
  .actions(self => ({
    setLoading: loading => {
      self._loading = loading;
    },
    setToken: token => {
      self._token = token;
      localStorage.setItem("_token", token);
    },
    login: flow(function*(email, password) {
      try {
        self.setLoading(true);
        let { id: token } = yield appService.login(email, password);
        self.setToken(token);
      } catch (err) {
        throw err;
      } finally {
        self.setLoading(false);
      }
    }),
    logout: flow(function*() {
      if (!self.isLoggedIn) return;
      try {
        self.setLoading(true);
        yield appService.logout(self._token);
        self.setToken("");
      } catch (err) {
        throw err;
      } finally {
        self.setLoading(false);
      }
    }),
    getRegsAndFuns: flow(function*() {
      try {
        self.setLoading(true);
        self._regulations = yield appService.getRegulationsFunctionsMapping(
          self._token
        );
      } catch (error) {
        throw error;
      } finally {
        self.setLoading(false);
      }
    })
  }))
  .views(self => ({
    get isLoggedIn() {
      return self._token ? true : false;
    },
    get isLoading() {
      return self._loading;
    }
  }));

export default AppModel;
