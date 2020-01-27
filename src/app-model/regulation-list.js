import { types } from "mobx-state-tree";

const Regulation = types.model("Regulation", {
  regulation: types.maybe(types.string),
  functions: types.maybe(types.array(types.string)),
  id: types.identifier
});

const RegulationList = types
  .model("RegulationList", {
    all: types.maybe(types.array(Regulation)),
    selected: types.maybe(types.array(types.reference(Regulation))),
    selectedFuns: types.maybe(types.array(types.string))
  })
  .actions(self => ({
    selectReg: ({ id }) => {
      if (!self.isSelectedReg(id)) {
        self.selected.push(id);
      }
    },
    selectFun: name => {
      if (!self.isSelectedFun(name)) {
        self.selectedFuns.push(name);
      }
    },
    deSelectFun: name => {
      if (self.isSelectedFun(name)) {
        self.selectedFuns = self.selectedFuns.filter(fname => fname !== name);
      }
    },
    deSelectReg: ({ id }) => {
      if (self.isSelectedReg(id)) {
        self.selected = self.selected.filter(sid => sid !== id);
      }
    }
  }))
  .views(self => ({
    isSelectedReg: id => {
      if (self.selected.findIndex(sid => id === sid) >= 0) {
        return true;
      }
      return false;
    },
    isSelectedFun: name => {
      return self.selectedFuns.findIndex(fname => name === fname) >= 0;
    },
    getRegs: (regQuery = "") => {
      const removeSel = self.all.filter(({ id }) => {
        if (self.selected.length && self.selected.includes(id)) {
          return false;
        }
        return true;
      });
      if (!regQuery) return removeSel;
      return removeSel.filter(({ regulation }) =>
        regulation.toLowerCase().includes(regQuery.toLowerCase())
      );
    },
    uniqFunNames: regs => {
      let funNames = regs
        .map(({ functions }) => functions)
        .flat()
        .filter(name => !self.selectedFuns.includes(name));
      let uniqFunNames = [...new Set(...funNames)];
      return uniqFunNames;
    },
    getFuns: (regQuery, funQuery = "") => {
      if (!regQuery || !funQuery) return self.uniqFunNames(self.all);
      return self.uniqFunNames(
        self
          .getRegs(regQuery)
          .filter(({ functions }) =>
            functions.some(name =>
              name.toLowerCase().includes(funQuery.toLowerCase())
            )
          )
      );
    }
  }));

export default RegulationList;
