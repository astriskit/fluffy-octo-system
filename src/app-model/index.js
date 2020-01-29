import { types, flow } from "mobx-state-tree";
import RegulationList from "./regulation-list";
import QuestionList from "./question-list";
import appService from "../app.service";
import { escape } from "../utils";

const AppModel = types
  .model("AppModal", {
    _token: types.maybe(types.string),
    _loading: false,
    _regulations: types.optional(types.maybe(RegulationList), {
      all: [],
      selected: [],
      selectedFuns: []
    }),
    _questions: types.optional(types.maybe(QuestionList), { all: [] }),
    _mainClass: ""
  })
  .actions(self => ({
    setMainClass: cls => (self._mainClass = cls),
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
    getRegs: flow(function*() {
      try {
        self.setLoading(true);
        let items = yield appService.getRegulationsFunctionsMapping(
          self._token
        );
        self._regulations.all = items;
      } catch (error) {
        throw error;
      } finally {
        self.setLoading(false);
      }
    }),
    getQues: flow(function*() {
      try {
        const regulations = self._regulations.selected.map(
          ({ regulation }) => regulation
        );
        const functions = self._regulations.selectedFuns;
        if (!regulations.length || !functions.length) {
          throw new Error("EMPTY_REGS_FUNCS");
        }
        self.setLoading(true);
        let resultArr = yield appService.getRegulationsQuestionsMapping({
          regulations: JSON.stringify(regulations, escape),
          functions: JSON.stringify(functions),
          token: self._token
        });
        resultArr = resultArr
          .map(({ questions }) => questions)
          .flat()
          .reduce((acc, cur) => {
            if (acc.findIndex(({ id }) => cur.id === id) < 0) {
              return [...acc, cur];
            }
            return acc;
          }, []);
        self._questions.all = resultArr;
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
    },
    get isQuestionable() {
      return (
        Boolean(self._regulations.selectedFuns.length) &&
        Boolean(self._regulations.selected.length)
      );
    }
  }));

export default AppModel;
