import { types } from "mobx-state-tree";

const Regulation = types.model("Regulation", {
  regulation: types.maybe(types.string),
  functionsMapping: types.maybe(types.array(types.string)),
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
    selectFunc: name => {
      if (!self.isSelectedFunc(name)) {
        self.selectedFuns.push(name);
      }
    },
    deSelectFunc: name => {
      if (self.isSelectedFunc(name)) {
        self.selectedFuns = self.selectedFuns.filter(fname => fname !== name);
      }
    },
    deSelectReg: ({ id }) => {
      if (self.isSelectedReg(id)) {
        self.selected = self.selected.filter(({ id: sid }) => sid !== id);
      }
    },
    clearFuncs: () => {
      self.selectedFuns = [];
    },
    clearRegs: () => {
      self.selected = [];
    }
  }))
  .views(self => ({
    isSelectedReg: id => {
      if (self.selected.findIndex(({ id: sid }) => id === sid) >= 0) {
        return true;
      }
      return false;
    },
    isSelectedFunc: name => {
      return self.selectedFuns.findIndex(fname => name === fname) >= 0;
    },
    get allNotSelectedRegs() {
      const notSelected = self.all.filter(({ id }) => {
        if (
          self.selected.length &&
          self.selected.map(({ id }) => id).includes(id)
        ) {
          return false;
        }
        return true;
      });
      return notSelected;
    },
    get allSelectedRegs() {
      return self.selected;
    },
    getRegs: (regQuery = "") => {
      if (!regQuery) return self.all;
      return self.all.filter(({ regulation }) =>
        regulation.toLowerCase().includes(regQuery.toLowerCase())
      );
    },
    _uniqFunNames: (regs, funQuery) => {
      let funNames = regs
        .map(({ functionsMapping }) => functionsMapping)
        .flat()
        .filter(name =>
          funQuery ? name.toLowerCase().includes(funQuery.toLowerCase()) : true
        );
      let uniqFunNames = [...new Set(funNames)];
      return uniqFunNames;
    },
    getFuncs: (funQuery = "") => {
      const regs = self.allSelectedRegs;
      if (!funQuery) return self._uniqFunNames(regs);
      return self._uniqFunNames(regs, funQuery);
    }
  }));

export default RegulationList;
