import { types, flow } from "mobx-state-tree";
import RegulationList from "./regulation-list";
import QuestionList from "./question-list";
import appService from "../app.service";
import { escape } from "../utils";

const AppModel = types
  .model("AppModal", {
    _token: types.maybe(types.string),
    _booting: false,
    _loading: false, // page-wide loading
    _regulations: types.optional(types.maybe(RegulationList), {
      all: [],
      selected: [],
      selectedFuns: []
    }),
    _questions: types.optional(types.maybe(QuestionList), { all: [] }),
    _mainClass: "", // [ui]
    _userId: "",
    _userDet: types.model({
      username: "",
      email: "",
      emailVerified: false,
      role: ""
    })
  })
  .actions(self => ({
    setMainClass: cls => (self._mainClass = cls), // todo: obsolete/remove
    setLoading: loading => {
      self._loading = loading;
    },
    setCredentials: ({
      id: token = "",
      userId = "",
      username,
      email,
      emailVerified,
      role = ""
    } = {}) => {
      self._token = token;
      self._userId = userId;
      self._userDet = { username, email, emailVerified, role };
      localStorage.setItem("_token", token);
      localStorage.setItem("_userId", userId);
      localStorage.setItem("_userDet", JSON.stringify(self._userDet));
    },
    login: flow(function*(email, password) {
      try {
        self.setLoading(true);
        let creds = yield appService.login(email, password);
        let userDets = yield appService.getUser({
          token: creds.id,
          userId: creds.userId
        });
        if (!userDets.role) {
          throw new Error("Role is not assigned. Contact Admin.");
        }
        self._regulations.selected = [];
        self.setCredentials({ ...userDets, ...creds });
        return userDets.role;
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
        self.setCredentials({});
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
        let selected = yield appService.getUserRegulations(
          self._userId,
          self._token
        );
        let selectedRegs = selected.filter(({ archived = false }) => !archived);
        if (
          selectedRegs.length ||
          (self._userDet && self._userDet.role === "Delegatee")
        ) {
          let selectedFuns = selectedRegs.reduce((acc, { functions }) => {
            if (!acc.length) {
              return functions || [];
            }
            return [...new Set([...functions, ...acc])];
          }, []);
          selectedRegs
            .map(({ regulation }) => regulation)
            .map(self._regulations.selectRegByName);
          self._regulations.selectedFuns = selectedFuns;
          return true;
        }
        return false;
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
        if (
          self._userDet &&
          self._userDet.role === "CSO" &&
          (!regulations.length || !functions.length)
        ) {
          throw new Error("EMPTY_REGS_FUNCS");
        }
        self.setLoading(true);
        let resultArr = yield appService.getRegulationsQuestionsMapping({
          regulations: regulations.length
            ? JSON.stringify(regulations, escape)
            : null,
          functions: functions.length ? JSON.stringify(functions) : null,
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
    }),
    saveAns: flow(function*(r) {
      try {
        return yield appService.updateResponse(r, self._token);
      } catch (error) {
        throw error;
      }
    }),
    getAns: flow(function*() {
      try {
        return yield appService.getUserResponses({
          token: self._token,
          userId: self._userId
        });
      } catch (error) {
        throw error;
      }
    }),
    getUsers: flow(function*() {
      return yield appService.getUsers({ token: self._token });
    }),
    assignBlock: flow(function*(functionGroup, userId) {
      return yield appService.assignQueBlock({
        token: self._token,
        functionGroup,
        userId
      });
    }),
    signUp: flow(function*(info) {
      return yield appService.signUp(info);
    }),
    boot: () => {},
    shut: () => {}
  }))
  .views(self => ({
    get isLoggedIn() {
      return self._token && self._userId && self._userDet && self._userDet.role
        ? true
        : false;
    },
    get isLoading() {
      return self._loading;
    },
    get isQuestionable() {
      return (
        Boolean(self._regulations.selectedFuns.length) &&
        Boolean(self._regulations.selected.length)
      );
    },
    get isBooting() {
      return self._booting;
    }
  }));

export default AppModel;
