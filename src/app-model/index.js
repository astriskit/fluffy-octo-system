import { types, flow } from "mobx-state-tree";
import appService from "./app.service";

const AppModel = types
  .model({
    _token: "",
    _loading: false,
    _regulations: types.maybe(RegulationList)
  })
  .actions(self => ({
    setLoading: loading => {
      self._loading = loading;
    },
    setToken: token => {
      self._token = token;
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
        throw err;
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
      return _loading;
    }
  }));

export default AppModel;
